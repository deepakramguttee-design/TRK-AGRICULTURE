import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft, Loader2, User, Building2, ShoppingCart, MapPin,
  Save, MessageSquare, Mail, Percent,
} from 'lucide-react'
import { DISTRICTS } from '@/lib/delivery'
import { useOrderStatusLabels } from '@/hooks/useOrderStatusLabels'

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  preparing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  prepared: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}
function fmtDateTime(d, lang) {
  if (!d) return '—'
  const loc = lang === 'en' ? 'en-GB' : 'fr-FR'
  const dt = new Date(d)
  return dt.toLocaleDateString(loc, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + dt.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
}
function fmtMur(n) { return 'Rs ' + Number(n ?? 0).toLocaleString('en-MU', { maximumFractionDigits: 0 }) }

function Toggle({ on, onClick, label, icon: Icon }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        on ? 'bg-green-50 border-green-300 text-green-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      <span className={`w-9 h-5 rounded-full relative transition-colors ${on ? 'bg-green-500' : 'bg-zinc-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-4' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

export default function AdminClientProfile() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getLabel } = useOrderStatusLabels()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)

  async function load() {
    const { data: c, error } = await supabase.from('customers').select('*').eq('id', id).single()
    if (error || !c) {
      toast({ title: t('adminClients.common.clientNotFound'), variant: 'destructive' })
      navigate('/admin/clients', { replace: true })
      return
    }
    setClient(c)
    setForm({
      first_name: c.first_name ?? '', last_name: c.last_name ?? '',
      phone: c.phone ?? '', email: c.email ?? '',
      company_name: c.company_name ?? '', district: c.district ?? '',
      account_type: c.account_type ?? 'b2c',
      internal_notes: c.internal_notes ?? '',
    })
    const [{ data: ords }, { data: addrs }] = await Promise.all([
      supabase.from('orders')
        .select('id, order_number, created_at, status, fulfillment_type, total_mur, payment_method, payment_status')
        .eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('addresses').select('*').eq('customer_id', id).order('is_default', { ascending: false }),
    ])
    setOrders(ords ?? [])
    setAddresses(addrs ?? [])
    setLoading(false)
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id])

  async function patch(fields, successMsg) {
    setSaving(true)
    const { error } = await supabase.from('customers').update(fields).eq('id', id)
    setSaving(false)
    if (error) { toast({ title: t('adminClients.common.error'), description: error.message, variant: 'destructive' }); return false }
    setClient(c => ({ ...c, ...fields }))
    if (successMsg) toast({ title: successMsg })
    return true
  }

  async function saveInfos() {
    const ok = await patch({
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim().replace(/[\s\-().]/g, '') || null,
      email: form.email.trim().toLowerCase() || null,
      company_name: form.company_name.trim() || null,
      district: form.district || null,
      account_type: form.account_type,
      internal_notes: form.internal_notes.trim() || null,
    }, t('adminClients.profile.profileUpdated'))
    if (ok) load()
  }

  if (loading || !form) {
    return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
  }

  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_mur), 0)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/clients"><ChevronLeft className="h-4 w-4 mr-1" />{t('adminClients.profile.backToClients')}</Link>
        </Button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {client.account_type === 'b2b' ? <Building2 className="h-4.5 w-4.5 text-primary" /> : <User className="h-4.5 w-4.5 text-primary" />}
          </div>
          <h1 className="text-xl font-bold">{client.full_name || t('adminClients.profile.clientNoName')}</h1>
          <span className="font-mono text-xs text-muted-foreground">{client.customer_code}</span>
        </div>
        <Button size="sm" variant={client.is_active ? 'outline' : 'default'}
          onClick={() => patch({ is_active: !client.is_active }, client.is_active ? t('adminClients.profile.deactivated') : t('adminClients.profile.reactivated'))}
          disabled={saving}>
          {client.is_active ? t('adminClients.profile.deactivate') : t('adminClients.profile.reactivate')}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Colonne gauche : coordonnées + marketing */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border p-5 space-y-3">
            <h2 className="font-semibold text-sm border-b pb-2">{t('adminClients.profile.contactInfo')}</h2>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('adminClients.profile.firstName')}><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></Field>
              <Field label={t('adminClients.profile.lastName')}><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></Field>
            </div>
            <Field label={t('adminClients.profile.phone')}><Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label={t('adminClients.profile.email')}><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('adminClients.profile.type')}>
                <select value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm">
                  <option value="b2c">{t('adminClients.common.particulier')}</option>
                  <option value="b2b">{t('adminClients.common.professionnel')}</option>
                </select>
              </Field>
              <Field label={t('adminClients.profile.district')}>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-white px-2 text-sm">
                  <option value="">—</option>
                  {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </Field>
            </div>
            {form.account_type === 'b2b' && (
              <Field label={t('adminClients.profile.company')}><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></Field>
            )}
            <Field label={t('adminClients.profile.internalNotes')}>
              <textarea rows={3} value={form.internal_notes} onChange={e => setForm(f => ({ ...f, internal_notes: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </Field>
            <Button size="sm" onClick={saveInfos} disabled={saving} className="w-full gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{t('adminClients.common.save')}
            </Button>
          </div>

          {/* Marketing */}
          <div className="rounded-lg border p-5 space-y-3">
            <h2 className="font-semibold text-sm border-b pb-2">{t('adminClients.profile.marketing')}</h2>
            <Toggle on={client.sms_opt_in} icon={MessageSquare} label={t('adminClients.profile.smsMarketing')}
              onClick={() => patch({ sms_opt_in: !client.sms_opt_in })} />
            <Toggle on={client.email_opt_in} icon={Mail} label={t('adminClients.profile.emailMarketing')}
              onClick={() => patch({ email_opt_in: !client.email_opt_in })} />
            {client.unsubscribed_at && (
              <p className="text-xs text-muted-foreground">{t('adminClients.profile.unsubscribedOn', { date: fmtDateTime(client.unsubscribed_at, i18n.language) })}</p>
            )}
          </div>

          {/* Remise */}
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold text-sm border-b pb-2 mb-3 flex items-center gap-1.5"><Percent className="h-4 w-4" />{t('adminClients.profile.loyaltyDiscount')}</h2>
            <div className="flex gap-1.5">
              {[0, 5, 10, 15].map(pct => (
                <button key={pct} type="button" disabled={saving}
                  onClick={() => patch({ discount_pct: pct }, t('adminClients.profile.discountApplied', { pct }))}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    (client.discount_pct ?? 0) === pct
                      ? pct === 0 ? 'bg-zinc-100 border-zinc-300' : 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400'}`}>
                  {pct === 0 ? '—' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite : adresses + commandes */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t('adminClients.profile.stats.orders')} value={orders.length} />
            <Stat label={t('adminClients.profile.stats.revenuePaid')} value={fmtMur(revenue)} accent />
            <Stat label={t('adminClients.profile.stats.addresses')} value={addresses.length} />
          </div>

          {addresses.length > 0 && (
            <div className="rounded-lg border">
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /><h2 className="font-semibold text-sm">{t('adminClients.profile.addresses')}</h2>
              </div>
              <div className="divide-y">
                {addresses.map(a => (
                  <div key={a.id} className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.label || t('adminClients.profile.addressDefault')}</span>
                      {a.is_default && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t('adminClients.profile.defaultBadge')}</span>}
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {[a.street_line1, a.street_line2, a.city, a.district].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" /><h2 className="font-semibold text-sm">{t('adminClients.profile.orderHistory')}</h2>
              <span className="ml-auto text-xs text-muted-foreground">{orders.length}</span>
            </div>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">{t('adminClients.profile.noOrders')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {[
                      t('adminClients.profile.cols.number'), t('adminClients.profile.cols.date'),
                      t('adminClients.profile.cols.total'), t('adminClients.profile.cols.payment'),
                      t('adminClients.profile.cols.status'), '',
                    ].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5"><code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{o.order_number}</code></td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{fmtDateTime(o.created_at, i18n.language)}</td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{fmtMur(o.total_mur)}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {o.payment_method === 'juice' ? 'Juice' : o.payment_method?.toUpperCase()}
                        {o.payment_status === 'paid' ? ' ✅' : ' ⏳'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[o.status] ?? 'bg-muted'}`}>
                          {getLabel(o.status, o.fulfillment_type, i18n.language)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button size="sm" variant="ghost" asChild><Link to={`/admin/commandes/${o.order_number}`}>{t('adminClients.common.view')}</Link></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
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
function Stat({ label, value, accent }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-primary' : ''}`}>{value}</p>
    </div>
  )
}
