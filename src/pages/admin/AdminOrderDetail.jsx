import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2, CheckCircle2, Smartphone, Banknote, ArrowRight, Lock } from 'lucide-react'
import { getProvider } from '@/lib/payments'
import { useAuth } from '@/contexts/AuthContext'
import { useOrderStatusLabels, STATUS_ORDER } from '@/hooks/useOrderStatusLabels'

// Statut suivant dans le cycle : pending → confirmed → preparing → prepared
// → shipped → delivered. Les libellés viennent de order_status_labels, le
// même vocabulaire que celui affiché au client.
function nextStatus(status) {
  const i = STATUS_ORDER.indexOf(status)
  if (i === -1 || i === STATUS_ORDER.length - 1) return null
  return STATUS_ORDER[i + 1]
}

function parseNotes(notes) {
  const lines = (notes || '').split('\n')
  const get = prefix => {
    const line = lines.find(l => l.startsWith(prefix + ':'))
    return line ? line.slice(prefix.length + 1).trim() : ''
  }
  return {
    name:     get('Nom'),
    phone:    get('Tél'),
    district: get('District'),
    address:  get('Adresse'),
    slot:     get('Créneau'),
    notes:    get('Notes'),
  }
}

function formatDate(d, lang) {
  const dt = new Date(d)
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return (
    dt.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  )
}

function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function AdminOrderDetail() {
  const { order_number } = useParams()
  const { isAdmin } = useAuth()
  const { t, i18n } = useTranslation()
  const { getLabel } = useOrderStatusLabels()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: o, error: oe } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', order_number)
        .single()
      if (oe) {
        toast({ title: t('adminOrders.detail.error'), description: oe.message, variant: 'destructive' })
        setLoading(false)
        return
      }
      setOrder(o)
      const { data: its } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', o.id)
      setItems(its ?? [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_number])

  async function handleStatusChange(newStatus) {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
    if (error) {
      toast({ title: t('adminOrders.detail.error'), description: error.message, variant: 'destructive' })
    } else {
      setOrder(o => ({ ...o, status: newStatus }))
      toast({ title: t('adminOrders.detail.statusUpdated') })
    }
    setSaving(false)
  }

  async function handleNextStatus() {
    const next = nextStatus(order.status)
    if (!next) return
    setSaving(true)
    const { error } = await supabase.from('orders').update({ status: next }).eq('id', order.id)
    if (error) {
      toast({ title: t('adminOrders.detail.error'), description: error.message, variant: 'destructive' })
    } else {
      setOrder(o => ({ ...o, status: next }))
      toast({ title: t('adminOrders.detail.statusUpdatedTo', { status: getLabel(next, order.fulfillment_type, i18n.language) }) })
    }
    setSaving(false)
  }

  async function handleValidateJuice() {
    setSaving(true)
    const provider = getProvider('juice')
    const { error } = await supabase
      .from('orders')
      .update(provider.markPaidPayload())
      .eq('id', order.id)
    if (error) {
      toast({ title: t('adminOrders.detail.error'), description: error.message, variant: 'destructive' })
    } else {
      setOrder(o => ({ ...o, payment_status: 'paid', paid_at: new Date().toISOString() }))
      toast({ title: t('adminOrders.detail.juicePaymentValidated'), description: t('adminOrders.detail.juicePaymentValidatedDesc') })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return <p className="py-8 text-muted-foreground">{t('adminOrders.detail.notFound')}</p>
  }

  const parsed = parseNotes(order.customer_notes)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/commandes">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('adminOrders.detail.backToList')}
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">{t('adminOrders.detail.orderTitle', { number: order.order_number })}</h1>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {isAdmin ? (
            <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...STATUS_ORDER, 'cancelled'].map(s => (
                  <SelectItem key={s} value={s}>{getLabel(s, order.fulfillment_type, i18n.language)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : order.status === 'delivered' || order.status === 'cancelled' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium bg-muted text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              {getLabel(order.status, order.fulfillment_type, i18n.language)}
            </span>
          ) : nextStatus(order.status) ? (
            <Button
              size="sm"
              onClick={handleNextStatus}
              disabled={saving}
              className="gap-1.5"
            >
              {getLabel(nextStatus(order.status), order.fulfillment_type, i18n.language)}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* 2 colonnes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gauche — Infos client */}
        <div className="rounded-lg border p-5 space-y-2.5">
          <h2 className="font-semibold border-b pb-2 mb-3">{t('adminOrders.detail.customerInfo')}</h2>
          <InfoRow label={t('adminOrders.detail.fieldName')} value={parsed.name} />
          <InfoRow label={t('adminOrders.detail.fieldPhone')} value={order.guest_phone} />
          <InfoRow label={t('adminOrders.detail.fieldEmail')} value={order.guest_email} />
          <InfoRow label={t('adminOrders.detail.fieldDistrict')} value={parsed.district} />
          <InfoRow label={t('adminOrders.detail.fieldAddress')} value={parsed.address} />
          <InfoRow label={t('adminOrders.detail.fieldSlot')} value={parsed.slot} />
          <InfoRow label={t('adminOrders.detail.fieldNotes')} value={parsed.notes} />
          <InfoRow label={t('adminOrders.detail.fieldDate')} value={formatDate(order.created_at, i18n.language)} />
        </div>

        {/* Droite — Articles */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold border-b pb-2 mb-3">{t('adminOrders.detail.items')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">{t('adminOrders.detail.colProduct')}</th>
                  <th className="pb-2 font-medium text-muted-foreground text-center">{t('adminOrders.detail.colQty')}</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">{t('adminOrders.detail.colUnitPrice')}</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">{t('adminOrders.detail.colTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{formatPrice(item.unit_price_mur)}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(item.line_total_mur)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted-foreground text-center text-xs">
                      {t('adminOrders.detail.noItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paiement — admin only */}
      {isAdmin && <div className="mt-6 rounded-lg border p-5">
        <h2 className="font-semibold border-b pb-2 mb-3 flex items-center gap-2">
          {order.payment_method === 'juice'
            ? <><Smartphone className="h-4 w-4 text-green-600" /> {t('adminOrders.detail.paymentJuice')}</>
            : <><Banknote className="h-4 w-4 text-muted-foreground" /> {t('adminOrders.detail.paymentCod')}</>
          }
        </h2>
        <div className="flex flex-wrap gap-6 items-start">
          <div className="space-y-2 text-sm flex-1 min-w-48">
            <InfoRow label={t('adminOrders.detail.fieldMethod')} value={order.payment_method === 'juice' ? t('adminOrders.detail.methodJuice') : t('adminOrders.detail.methodCod')} />
            <InfoRow label={t('adminOrders.detail.fieldPaymentStatus')}
              value={order.payment_status === 'paid' ? t('adminOrders.detail.statusPaid') : order.payment_status === 'pending' ? t('adminOrders.detail.statusPending') : order.payment_status} />
            {order.provider_txn_id && (
              <InfoRow label={t('adminOrders.detail.fieldTxnId')} value={order.provider_txn_id} />
            )}
            {order.paid_at && (
              <InfoRow label={t('adminOrders.detail.fieldPaidAt')} value={formatDate(order.paid_at, i18n.language)} />
            )}
          </div>
          {order.payment_method === 'juice' && order.payment_status === 'pending' && (
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
                <p className="text-sm text-amber-800 font-medium">{t('adminOrders.detail.juicePendingValidation')}</p>
                {order.provider_txn_id ? (
                  <p className="text-xs text-amber-700">
                    {t('adminOrders.detail.juiceClientTxnId')} <code className="font-mono font-semibold">{order.provider_txn_id}</code>
                  </p>
                ) : (
                  <p className="text-xs text-amber-600">{t('adminOrders.detail.juiceNoTxnId')}</p>
                )}
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={handleValidateJuice}
                  disabled={saving}
                >
                  {saving
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> {t('adminOrders.detail.savingJuice')}</>
                    : <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> {t('adminOrders.detail.validateJuice')}</>
                  }
                </Button>
              </div>
            </div>
          )}
          {order.payment_method === 'juice' && order.payment_status === 'paid' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {t('adminOrders.detail.juiceValidated')}
            </div>
          )}
        </div>
      </div>}

      {/* Récap financier — admin only */}
      {isAdmin && <>
      <div className="mt-6 rounded-lg border p-5 max-w-xs ml-auto space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('adminOrders.detail.subtotal')}</span>
          <span>{formatPrice(order.subtotal_mur)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('adminOrders.detail.delivery')}</span>
          <span>
            {Number(order.delivery_fee_mur) === 0
              ? t('adminOrders.detail.deliveryFree')
              : formatPrice(order.delivery_fee_mur)}
          </span>
        </div>
        {Number(order.discount_pct) > 0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span className="font-medium">{t('adminOrders.detail.loyaltyDiscount', { pct: order.discount_pct })}</span>
            <span className="font-medium">− {formatPrice(order.discount_mur)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>{t('adminOrders.detail.total')}</span>
          <span className="text-green-600 text-lg">{formatPrice(order.total_mur)}</span>
        </div>
      </div>
      </>}
    </div>
  )
}
