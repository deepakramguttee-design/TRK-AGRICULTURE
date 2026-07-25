import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft, Loader2, User, Building2, Phone, Globe,
  ShoppingCart, Banknote, Smartphone, Calendar,
} from 'lucide-react'

import { useOrderStatusLabels } from '@/hooks/useOrderStatusLabels'

const STATUS_COLORS = {
  pending:   'bg-orange-100 text-orange-700 border-orange-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  prepared:  'bg-purple-100 text-purple-700 border-purple-200',
  shipped:   'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

function fmtDate(d, lang) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtDateTime(d, lang) {
  if (!d) return '—'
  const loc = lang === 'en' ? 'en-GB' : 'fr-FR'
  const dt = new Date(d)
  return dt.toLocaleDateString(loc, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + dt.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
}
function fmtPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function AdminClientDetail() {
  const { t, i18n } = useTranslation()
  const { getLabel } = useOrderStatusLabels()
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !c) {
        toast({ title: t('adminClients.common.clientNotFound'), variant: 'destructive' })
        navigate('/admin/utilisateurs', { replace: true })
        return
      }
      setClient(c)
      if (c.phone) {
        const { data: ords } = await supabase
          .from('orders')
          .select('id, order_number, created_at, status, fulfillment_type, total_mur, payment_method, payment_status, delivery_fee_mur')
          .eq('guest_phone', c.phone)
          .order('created_at', { ascending: false })
        setOrders(ords ?? [])
      }
      setLoading(false)
    }
    load()
  }, [id, navigate, t])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalSpent = orders.reduce((s, o) => s + Number(o.total_mur), 0)
  const delivered = orders.filter(o => o.status === 'delivered').length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/utilisateurs">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('adminClients.detail.backToUsers')}
          </Link>
        </Button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {client.account_type === 'b2b'
              ? <Building2 className="h-4.5 w-4.5 text-primary" />
              : <User className="h-4.5 w-4.5 text-primary" />}
          </div>
          <h1 className="text-xl font-bold">{client.full_name || t('adminClients.detail.clientNoName')}</h1>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            client.account_type === 'b2b'
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {client.account_type === 'b2b' ? t('adminClients.common.professionnel') : t('adminClients.common.particulier')}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Infos client */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-semibold text-sm border-b pb-2">{t('adminClients.detail.clientInfo')}</h2>
            <InfoRow icon={Phone}    label={t('adminClients.detail.phone')}        value={client.phone} />
            <InfoRow icon={Building2} label={t('adminClients.detail.company')}      value={client.company_name} />
            <InfoRow icon={Globe}    label={t('adminClients.detail.lang')}         value={client.preferred_lang?.toUpperCase()} />
            <InfoRow icon={Calendar} label={t('adminClients.detail.registeredOn')} value={fmtDate(client.created_at, i18n.language)} />
          </div>

          {/* Stats rapides */}
          <div className="rounded-lg border p-5 space-y-3">
            <h2 className="font-semibold text-sm border-b pb-2">{t('adminClients.detail.stats')}</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('adminClients.detail.orders')}</span>
              <span className="font-semibold">{orders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('adminClients.detail.delivered')}</span>
              <span className="font-semibold text-green-600">{delivered}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">{t('adminClients.detail.totalSpent')}</span>
              <span className="font-bold text-primary">{fmtPrice(totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Historique commandes */}
        <div className="md:col-span-2">
          <div className="rounded-lg border">
            <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">{t('adminClients.detail.orderHistory')}</h2>
              <span className="ml-auto text-xs text-muted-foreground">{t('adminClients.detail.ordersCount', { count: orders.length })}</span>
            </div>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">{t('adminClients.detail.noOrders')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t('adminClients.detail.cols.number')}</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t('adminClients.detail.cols.date')}</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">{t('adminClients.detail.cols.total')}</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">{t('adminClients.detail.cols.payment')}</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">{t('adminClients.detail.cols.status')}</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                          {o.order_number}
                        </code>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap text-xs">
                        {fmtDateTime(o.created_at, i18n.language)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{fmtPrice(o.total_mur)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          {o.payment_method === 'juice'
                            ? <><Smartphone className="h-3 w-3" />{t('labels.payment.juice')}</>
                            : <><Banknote className="h-3 w-3" />{t('labels.payment.codShort')}</>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          STATUS_COLORS[o.status] ?? 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {getLabel(o.status, o.fulfillment_type, i18n.language)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/admin/commandes/${o.order_number}`}>{t('adminClients.common.view')}</Link>
                        </Button>
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
