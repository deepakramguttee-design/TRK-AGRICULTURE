import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://trk-agriculture.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
]

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status = 200, req?: Request) {
  const headers = req ? corsHeaders(req) : { 'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}

const UNSUBSCRIBE_BASE = 'https://trk-agriculture.netlify.app/unsubscribe'
const BATCH_SIZE = 50
const MAX_RETRIES = 3

// Convertit un numéro mauricien (brut, quelconque graphie) en E.164 +230XXXXXXXX
function toE164(raw: string | null): string | null {
  if (!raw) return null
  let d = raw.replace(/[^0-9]/g, '')
  if (d.length > 8 && d.startsWith('230')) d = d.slice(-8)
  else if (d.length === 9 && d.startsWith('0')) d = d.slice(-8)
  else if (d.length > 8) d = d.slice(-8)
  if (d.length !== 8) return null
  return `+230${d}`
}

function substitute(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_m, k) => vars[k] ?? '')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Retry avec backoff exponentiel sur 429 / 5xx
async function fetchWithRetry(url: string, opts: RequestInit): Promise<Response> {
  let last: Response | null = null
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, opts)
    if (res.status !== 429 && res.status < 500) return res
    last = res
    if (attempt < MAX_RETRIES) await sleep(500 * 2 ** attempt)
  }
  return last!
}

interface CustomerRef {
  full_name: string | null
  first_name: string | null
  customer_code: string | null
  marketing_token: string | null
}

interface Recipient {
  id: string
  campaign_id: string
  customer_id: string
  channel: string
  destination: string
  status: string
  customers: CustomerRef | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405, req)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // ── Authentification : admin uniquement ───────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Authentification requise' }, 401, req)

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: { user }, error: authErr } = await supabaseUser.auth.getUser()
  if (authErr || !user) return json({ error: 'Session invalide' }, 401, req)

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return json({ error: 'Accès réservé aux administrateurs' }, 403, req)

  // ── Entrée ────────────────────────────────────────────────────────────
  let body: { campaign_id?: string }
  try { body = await req.json() } catch { return json({ error: 'Body JSON invalide' }, 400, req) }
  const campaignId = body.campaign_id
  if (!campaignId) return json({ error: 'campaign_id requis' }, 400, req)

  const { data: campaign, error: campErr } = await supabaseAdmin
    .from('message_campaigns').select('*').eq('id', campaignId).single()
  if (campErr || !campaign) return json({ error: 'Campagne introuvable' }, 404, req)
  if (campaign.status === 'sent') return json({ error: 'Campagne déjà envoyée' }, 409, req)

  // Secrets providers (peuvent manquer → destinataires du canal marqués failed)
  const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  const TWILIO_FROM = Deno.env.get('TWILIO_FROM')
  const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
  const RESEND_FROM = Deno.env.get('RESEND_FROM')

  // Passe la campagne en statut sending
  await supabaseAdmin.from('message_campaigns')
    .update({ status: 'sending' }).eq('id', campaignId)

  let sentDelta = 0
  let failedDelta = 0

  // ── Traitement par lots de 50 destinataires queued ────────────────────
  // Idempotence : on ne lit QUE les 'queued', jamais un 'sent'/'failed'.
  while (true) {
    const { data: recipients, error: recErr } = await supabaseAdmin
      .from('message_recipients')
      .select('id, campaign_id, customer_id, channel, destination, status, customers(full_name, first_name, customer_code, marketing_token)')
      .eq('campaign_id', campaignId)
      .eq('status', 'queued')
      .limit(BATCH_SIZE)

    if (recErr) return json({ error: recErr.message }, 500, req)
    if (!recipients || recipients.length === 0) break

    for (const r of recipients as unknown as Recipient[]) {
      const cust = r.customers
      const token = cust?.marketing_token ?? ''
      const unsubscribeUrl = `${UNSUBSCRIBE_BASE}?token=${token}`
      const vars = {
        full_name: cust?.full_name || cust?.first_name || 'client',
        customer_code: cust?.customer_code || '',
        unsubscribe_url: unsubscribeUrl,
      }

      let ok = false
      let provider = ''
      let providerMessageId: string | null = null
      let errorMessage: string | null = null

      try {
        if (r.channel === 'sms') {
          provider = 'twilio'
          const to = toE164(r.destination)
          if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
            errorMessage = 'Twilio non configuré'
          } else if (!to) {
            errorMessage = `Numéro invalide : ${r.destination}`
          } else {
            let smsBody = substitute(campaign.body_text, vars)
            const stop = ` STOP: ${unsubscribeUrl}`
            if ((smsBody.length + stop.length) <= 459) smsBody += stop  // ≤ 3 segments
            const form = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: smsBody })
            const res = await fetchWithRetry(
              `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: form.toString(),
              },
            )
            const data = await res.json()
            if (res.ok) { ok = true; providerMessageId = data.sid ?? null }
            else errorMessage = data.message || `Twilio HTTP ${res.status}`
          }
        } else if (r.channel === 'email') {
          provider = 'resend'
          if (!RESEND_KEY || !RESEND_FROM) {
            errorMessage = 'Resend non configuré'
          } else {
            const subject = substitute(campaign.subject || '', vars)
            const baseHtml = campaign.body_html
              ? substitute(campaign.body_html, vars)
              : `<p>${substitute(campaign.body_text, vars).replace(/\n/g, '<br>')}</p>`
            // Lien de désinscription OBLIGATOIRE en pied d'email
            const html = `${baseHtml}
              <hr style='margin:24px 0;border:none;border-top:1px solid #e5e5e5'>
              <p style='font-size:12px;color:#888;text-align:center'>
                TRK Agriculture — Maurice<br>
                <a href='${unsubscribeUrl}' style='color:#888'>Se désinscrire / Unsubscribe</a>
              </p>`
            const text = `${substitute(campaign.body_text, vars)}\n\n---\nSe désinscrire : ${unsubscribeUrl}`
            const res = await fetchWithRetry('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: RESEND_FROM,
                to: r.destination,
                subject: subject || 'TRK Agriculture',
                html,
                text,
                headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
              }),
            })
            const data = await res.json()
            if (res.ok) { ok = true; providerMessageId = data.id ?? null }
            else errorMessage = data.message || data.error?.message || `Resend HTTP ${res.status}`
          }
        } else {
          errorMessage = `Canal inconnu : ${r.channel}`
        }
      } catch (e) {
        errorMessage = e instanceof Error ? e.message : 'Erreur inconnue'
      }

      await supabaseAdmin.from('message_recipients').update({
        status: ok ? 'sent' : 'failed',
        provider: provider || null,
        provider_message_id: providerMessageId,
        error_message: ok ? null : errorMessage,
        sent_at: ok ? new Date().toISOString() : null,
      }).eq('id', r.id).eq('status', 'queued')  // garde-fou idempotence

      if (ok) sentDelta++; else failedDelta++
    }

    // Compteurs cumulés après chaque lot
    await supabaseAdmin.from('message_campaigns').update({
      sent_count: (campaign.sent_count ?? 0) + sentDelta,
      failed_count: (campaign.failed_count ?? 0) + failedDelta,
    }).eq('id', campaignId)
  }

  // ── Statut final ──────────────────────────────────────────────────────
  const finalSent = (campaign.sent_count ?? 0) + sentDelta
  const finalFailed = (campaign.failed_count ?? 0) + failedDelta
  const finalStatus = finalSent === 0 && finalFailed > 0 ? 'failed' : 'sent'

  await supabaseAdmin.from('message_campaigns').update({
    status: finalStatus,
    sent_count: finalSent,
    failed_count: finalFailed,
    sent_at: new Date().toISOString(),
  }).eq('id', campaignId)

  return json({
    campaign_id: campaignId,
    status: finalStatus,
    sent: sentDelta,
    failed: failedDelta,
  }, 200, req)
})
