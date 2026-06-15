import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  // 1. Vérifier que l'appelant est authentifié
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Non authentifié' }, 401)

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: userErr } = await supabaseAnon.auth.getUser()
  if (userErr || !user) return json({ error: 'Token invalide' }, 401)

  // 2. Vérifier que l'appelant est admin (via client admin pour bypasser RLS)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'admin') return json({ error: 'Réservé aux admins' }, 403)

  // 3. Lire et valider le body
  let body: { email?: string; password?: string; full_name?: string; role?: string }
  try { body = await req.json() } catch { return json({ error: 'Body JSON invalide' }, 400) }

  const { email, password, full_name, role } = body

  if (!email || !password || !full_name) {
    return json({ error: 'Champs manquants : email, password, full_name' }, 400)
  }
  if (!['admin', 'operator'].includes(role ?? '')) {
    return json({ error: 'Rôle invalide — valeurs acceptées : admin, operator' }, 400)
  }

  // 4. Créer l'utilisateur via Admin API (pas de remplacement de session)
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (createErr) {
    const msg = createErr.message.includes('already been registered')
      ? `Un compte existe déjà avec l'adresse ${email}`
      : createErr.message
    return json({ error: msg }, 400)
  }

  const user_id = created.user?.id
  if (!user_id) return json({ error: 'Utilisateur créé mais ID manquant' }, 500)

  // 5. Mettre à jour le profil créé par le trigger on_auth_user_created
  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update({ role, full_name, email })
    .eq('id', user_id)

  if (updateErr) {
    return json({ error: 'Utilisateur créé mais profil non mis à jour : ' + updateErr.message }, 500)
  }

  // 6. Succès
  return json({ success: true, user_id })
})
