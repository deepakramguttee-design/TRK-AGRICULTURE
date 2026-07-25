import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft, Loader2, Save, Users, Send, MessageSquare, Mail,
  AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react'
import { DISTRICTS } from '@/lib/delivery'

// Hypothèse tarifaire (documentée) : coût indicatif par segment SMS sortant Maurice.
const SMS_COST_PER_SEGMENT_MUR = 1.5

const STATUS_STYLES = {
  draft: 'bg-zinc-100 text-zinc-600',
  scheduled: 'bg-blue-50 text-blue-700',
  sending: 'bg-amber-50 text-amber-700',
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
}

function smsSegments(text) {
  const len = (text || '').length
  if (len === 0) return 0
  return len <= 160 ? 1 : Math.ceil(len / 153)
}

export default function AdminCampaignDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'nouvelle'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const [templates, setTemplates] = useState([])
  const [breakdown, setBreakdown] = useState(null)   // { sms, email }
  const [failures, setFailures] = useState([])
  const [confirmSend, setConfirmSend] = useState(false)

  const [form, setForm] = useState({
    name: '', channel: 'sms', subject: '', body_text: '', body_html: '',
    account_type: '', district: '', min_orders: '', inactive_days: '',
  })

  useEffect(() => {
    supabase.from('message_templates').select('*').eq('is_active', true).order('name')
      .then(({ data }) => setTemplates(data ?? []))
  }, [])

  async function loadCampaign() {
    const { data: c, error } = await supabase.from('message_campaigns').select('*').eq('id', id).single()
    if (error || !c) {
      toast({ title: t('adminCampaigns.detail.notFound'), variant: 'destructive' })
      navigate('/admin/campagnes', { replace: true })
      return
    }
    setCampaign(c)
    const f = c.audience_filter ?? {}
    setForm({
      name: c.name, channel: c.channel, subject: c.subject ?? '',
      body_text: c.body_text ?? '', body_html: c.body_html ?? '',
      account_type: f.account_type ?? '', district: f.district ?? '',
      min_orders: f.min_orders ?? '', inactive_days: f.inactive_days ?? '',
    })
    await loadStats(c.id)
    setLoading(false)
  }

  async function loadStats(cid) {
    const { data } = await supabase.from('message_recipients')
      .select('channel, status, error_message, destination').eq('campaign_id', cid)
    const rec = data ?? []
    setBreakdown({
      sms: rec.filter(r => r.channel === 'sms').length,
      email: rec.filter(r => r.channel === 'email').length,
    })
    setFailures(rec.filter(r => r.status === 'failed'))
  }

  useEffect(() => { if (!isNew) loadCampaign(); /* eslint-disable-next-line */ }, [id])

  function buildAudienceFilter() {
    const f = {}
    if (form.account_type) f.account_type = form.account_type
    if (form.district) f.district = form.district
    if (form.min_orders !== '' && Number(form.min_orders) > 0) f.min_orders = Number(form.min_orders)
    if (form.inactive_days !== '' && Number(form.inactive_days) > 0) f.inactive_days = Number(form.inactive_days)
    return f
  }

  function payload() {
    return {
      name: form.name.trim(),
      channel: form.channel,
      subject: form.channel === 'sms' ? null : (form.subject.trim() || null),
      body_text: form.body_text,
      body_html: form.channel === 'sms' ? null : (form.body_html.trim() || null),
      audience_filter: buildAudienceFilter(),
    }
  }

  async function save() {
    if (!form.name.trim()) { toast({ title: t('adminCampaigns.detail.nameRequired'), variant: 'destructive' }); return }
    if (!form.body_text.trim()) { toast({ title: t('adminCampaigns.detail.bodyRequired'), variant: 'destructive' }); return }
    setSaving(true)
    if (isNew) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('message_campaigns')
        .insert({ ...payload(), status: 'draft', created_by: user?.id ?? null })
        .select('id').single()
      setSaving(false)
      if (error) { toast({ title: t('adminCampaigns.error'), description: error.message, variant: 'destructive' }); return }
      toast({ title: t('adminCampaigns.detail.campaignCreated') })
      navigate(`/admin/campagnes/${data.id}`, { replace: true })
    } else {
      const { error } = await supabase.from('message_campaigns').update(payload()).eq('id', id)
      setSaving(false)
      if (error) { toast({ title: t('adminCampaigns.error'), description: error.message, variant: 'destructive' }); return }
      toast({ title: t('adminCampaigns.detail.campaignSaved') })
      loadCampaign()
    }
  }

  async function calcAudience() {
    setBusy(true)
    // Sauvegarde d'abord le ciblage courant, puis (re)construit la liste
    const { error: upErr } = await supabase.from('message_campaigns').update(payload()).eq('id', id)
    if (upErr) { setBusy(false); toast({ title: t('adminCampaigns.error'), description: upErr.message, variant: 'destructive' }); return }
    const { data, error } = await supabase.rpc('build_campaign_recipients', { p_campaign_id: id })
    setBusy(false)
    if (error) { toast({ title: t('adminCampaigns.error'), description: error.message, variant: 'destructive' }); return }
    toast({ title: t('adminCampaigns.detail.audienceCalculated', { count: data }) })
    loadCampaign()
  }

  async function doSend() {
    setConfirmSend(false)
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('send-campaign', { body: { campaign_id: id } })
    setBusy(false)
    const errMsg = data?.error ?? error?.message
    if (errMsg) { toast({ title: t('adminCampaigns.detail.sendError'), description: errMsg, variant: 'destructive' }); return }
    toast({ title: t('adminCampaigns.detail.sendDone'), description: t('adminCampaigns.detail.sendDoneDesc', { sent: data.sent, failed: data.failed }) })
    loadCampaign()
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  const editable = isNew || campaign?.status === 'draft' || campaign?.status === 'scheduled'
  const segs = smsSegments(form.body_text)
  const smsCount = breakdown?.sms ?? 0
  const estCost = smsCount * segs * SMS_COST_PER_SEGMENT_MUR
  const stCls = campaign ? (STATUS_STYLES[campaign.status] ?? 'bg-muted') : null
  const stLabel = campaign ? t(`adminCampaigns.status.${campaign.status}`, { defaultValue: campaign.status }) : null
  const recipientsCount = campaign?.recipients_count ?? 0

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/campagnes"><ChevronLeft className="h-4 w-4 mr-1" />{t('adminCampaigns.detail.campaignsBack')}</Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">{isNew ? t('adminCampaigns.detail.newCampaign') : campaign.name}</h1>
        {stCls && <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stCls}`}>{stLabel}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contenu */}
        <div className="rounded-lg border p-5 space-y-3">
          <h2 className="font-semibold text-sm border-b pb-2">{t('adminCampaigns.detail.content')}</h2>
          <Field label={t('adminCampaigns.detail.campaignName')}>
            <Input value={form.name} disabled={!editable} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('adminCampaigns.detail.channel')}>
              <select value={form.channel} disabled={!editable} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm disabled:opacity-60">
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="both">{t('adminCampaigns.detail.channelBoth')}</option>
              </select>
            </Field>
            <Field label={t('adminCampaigns.detail.template')}>
              <select disabled={!editable} defaultValue=""
                onChange={e => {
                  const tpl = templates.find(tp => tp.id === e.target.value)
                  if (tpl) setForm(f => ({ ...f, subject: tpl.subject ?? f.subject, body_text: tpl.body_text, body_html: tpl.body_html ?? f.body_html }))
                }}
                className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm disabled:opacity-60">
                <option value="">{t('adminCampaigns.detail.templateNone')}</option>
                {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
              </select>
            </Field>
          </div>
          {form.channel !== 'sms' && (
            <Field label={t('adminCampaigns.detail.subjectEmail')}>
              <Input value={form.subject} disabled={!editable} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </Field>
          )}
          <Field label={t('adminCampaigns.detail.bodyText')}>
            <textarea rows={4} value={form.body_text} disabled={!editable}
              onChange={e => setForm(f => ({ ...f, body_text: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none disabled:opacity-60"
              placeholder={t('adminCampaigns.detail.bodyTextPlaceholder')} />
          </Field>
          <div className={`text-xs flex items-center gap-1.5 ${segs > 1 ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {segs > 1 && <AlertTriangle className="h-3.5 w-3.5" />}
            {t('adminCampaigns.detail.charsSegments', { chars: form.body_text.length, segments: segs })}{segs > 1 ? t('adminCampaigns.detail.segmentBilled') : ''}
          </div>
          <p className="text-[11px] text-muted-foreground">{t('adminCampaigns.detail.variablesLabel')}{'{{full_name}}'}, {'{{customer_code}}'}, {'{{unsubscribe_url}}'}</p>
          {form.channel !== 'sms' && (
            <Field label={t('adminCampaigns.detail.bodyHtml')}>
              <textarea rows={4} value={form.body_html} disabled={!editable}
                onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none disabled:opacity-60"
                placeholder={t('adminCampaigns.detail.bodyHtmlPlaceholder')} />
            </Field>
          )}
          {editable && (
            <Button size="sm" onClick={save} disabled={saving} className="w-full gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{t('adminCampaigns.detail.save')}
            </Button>
          )}
        </div>

        {/* Ciblage + envoi */}
        <div className="space-y-4">
          <div className="rounded-lg border p-5 space-y-3">
            <h2 className="font-semibold text-sm border-b pb-2 flex items-center gap-1.5"><Users className="h-4 w-4" />{t('adminCampaigns.detail.targeting')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('adminCampaigns.detail.accountType')}>
                <select value={form.account_type} disabled={!editable || isNew} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm disabled:opacity-60">
                  <option value="">{t('adminCampaigns.detail.accountAll')}</option>
                  <option value="b2c">{t('adminCampaigns.detail.accountB2c')}</option>
                  <option value="b2b">{t('adminCampaigns.detail.accountB2b')}</option>
                </select>
              </Field>
              <Field label={t('adminCampaigns.detail.district')}>
                <select value={form.district} disabled={!editable || isNew} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm disabled:opacity-60">
                  <option value="">{t('adminCampaigns.detail.districtAll')}</option>
                  {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </Field>
              <Field label={t('adminCampaigns.detail.minOrders')}>
                <Input type="number" min="0" value={form.min_orders} disabled={!editable || isNew}
                  onChange={e => setForm(f => ({ ...f, min_orders: e.target.value }))} />
              </Field>
              <Field label={t('adminCampaigns.detail.inactiveDays')}>
                <Input type="number" min="0" value={form.inactive_days} disabled={!editable || isNew}
                  onChange={e => setForm(f => ({ ...f, inactive_days: e.target.value }))} />
              </Field>
            </div>
            {isNew ? (
              <p className="text-xs text-muted-foreground">{t('adminCampaigns.detail.saveToCalc')}</p>
            ) : (
              <Button size="sm" variant="outline" onClick={calcAudience} disabled={busy || !editable} className="w-full gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}{t('adminCampaigns.detail.calcAudience')}
              </Button>
            )}
          </div>

          {!isNew && breakdown && (
            <div className="rounded-lg border p-5 space-y-3">
              <h2 className="font-semibold text-sm border-b pb-2">{t('adminCampaigns.detail.audience')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <div><p className="text-lg font-bold">{breakdown.sms}</p><p className="text-xs text-muted-foreground">{t('adminCampaigns.detail.sms')}</p></div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <div><p className="text-lg font-bold">{breakdown.email}</p><p className="text-xs text-muted-foreground">{t('adminCampaigns.detail.email')}</p></div>
                </div>
              </div>
              {smsCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('adminCampaigns.detail.estimatedSmsCost')} <span className="font-semibold text-foreground">Rs {estCost.toFixed(2)}</span>
                  {' '}{t('adminCampaigns.detail.costBreakdown', { count: smsCount, segments: segs, unit: SMS_COST_PER_SEGMENT_MUR })}
                </p>
              )}
              {editable && recipientsCount > 0 && (
                <Button size="sm" onClick={() => setConfirmSend(true)} disabled={busy} className="w-full gap-1.5">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t('adminCampaigns.detail.sendCampaign')}
                </Button>
              )}
            </div>
          )}

          {/* Suivi post-envoi */}
          {!isNew && campaign && (campaign.status === 'sent' || campaign.status === 'sending' || campaign.status === 'failed') && (
            <div className="rounded-lg border p-5 space-y-3">
              <h2 className="font-semibold text-sm border-b pb-2">{t('adminCampaigns.detail.tracking')}</h2>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="h-4 w-4" />{t('adminCampaigns.detail.sentCount', { count: campaign.sent_count })}</span>
                <span className="flex items-center gap-1.5 text-red-500"><XCircle className="h-4 w-4" />{t('adminCampaigns.detail.failedCount', { count: campaign.failed_count })}</span>
                <span className="text-muted-foreground">
                  {t('adminCampaigns.detail.deliveredPct', { pct: recipientsCount > 0 ? Math.round((campaign.sent_count / recipientsCount) * 100) : 0 })}
                </span>
              </div>
              {failures.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{t('adminCampaigns.detail.failures')}</p>
                  <div className="max-h-40 overflow-y-auto rounded border divide-y text-xs">
                    {failures.map((f, i) => (
                      <div key={i} className="px-3 py-1.5 flex justify-between gap-2">
                        <span className="font-mono text-muted-foreground truncate">{f.destination}</span>
                        <span className="text-red-500 truncate">{f.error_message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation d'envoi en deux temps */}
      {confirmSend && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmSend(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <Send className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-base mb-2">{t('adminCampaigns.detail.confirmSendTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-1">
              {t('adminCampaigns.detail.confirmSendRecipients', { count: recipientsCount, sms: breakdown?.sms ?? 0, email: breakdown?.email ?? 0 })}
            </p>
            {smsCount > 0 && <p className="text-sm mb-4">{t('adminCampaigns.detail.confirmSendCost')} <span className="font-bold">Rs {estCost.toFixed(2)}</span></p>}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmSend(false)}>{t('adminCampaigns.detail.cancel')}</Button>
              <Button className="flex-1" onClick={doSend}>{t('adminCampaigns.detail.send')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}
