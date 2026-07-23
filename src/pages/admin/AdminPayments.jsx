import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2, Banknote, Smartphone, CreditCard, Landmark, Wallet, HandCoins, CheckCircle2,
} from 'lucide-react'

const PAYMENT_METHODS = {
  cod:           { icon: Banknote,   badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  juice:         { icon: Smartphone, badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  mips_card:     { icon: CreditCard, badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  pop:           { icon: Smartphone, badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  my_t_money:    { icon: Smartphone, badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  bank_transfer: { icon: Landmark,   badge: 'bg-sky-100 text-sky-700 border-sky-200' },
}

function parseNotes(notes) {
  const lines = (notes || '').split('\n')
  const get = prefix => {
    const line = lines.find(l => l.startsWith(prefix + ':'))
    return line ? line.slice(prefix.length + 1).trim() : ''
  }
  return { name: get('Nom') }
}

function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

function formatDate(d, lang) {
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function AdminPayments() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterPayStatus, setFilterPayStatus] = useState('pending')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [confirmOrder, setConfirmOrder] = useState(null) // commande à encaisser
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, order_number, created_at, customer_name, customer_phone, guest_phone, customer_notes, total_mur, payment_method, payment_status')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast({ title: t('payments.loadError'), description: error.message, variant: 'destructive' })
        else setOrders(data ?? [])
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function customerName(o) {
    return o.customer_name || parseNotes(o.customer_notes).name || '—'
  }
  function customerPhone(o) {
    return o.customer_phone || o.guest_phone || '—'
  }

  const matchesMethodAndDate = o =>
    (filterMethod === 'all' || o.payment_method === filterMethod) &&
    (!filterDate || (o.created_at || '').slice(0, 10) === filterDate)

  const filtered = orders.filter(o =>
    matchesMethodAndDate(o) &&
    (filterPayStatus === 'all' || o.payment_status === filterPayStatus)
  )

  // Somme à encaisser : toutes les commandes pending des filtres méthode/date,
  // indépendamment du filtre de statut affiché.
  const pendingTotal = orders
    .filter(o => o.payment_status === 'pending' && matchesMethodAndDate(o))
    .reduce((s, o) => s + Number(o.total_mur || 0), 0)

  async function markPaid() {
    if (!confirmOrder) return
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', confirmOrder.id)
      .eq('payment_status', 'pending')
    setSaving(false)
    if (error) {
      toast({ title: t('payments.collectError'), description: error.message, variant: 'destructive' })
      return
    }
    setOrders(prev => prev.map(o =>
      o.id === confirmOrder.id ? { ...o, payment_status: 'paid' } : o
    ))
    toast({
      title: t('payments.collected'),
      description: `${confirmOrder.order_number} — ${formatPrice(confirmOrder.total_mur)}`,
    })
    setConfirmOrder(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('payments.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('payments.subtitle')}</p>
        </div>
        <div className="rounded-lg border bg-amber-50 border-amber-200 px-4 py-2.5 flex items-center gap-3">
          <Wallet className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">{t('payments.pendingTotal')}</p>
            <p className="text-lg font-bold text-amber-800 leading-tight">{formatPrice(pendingTotal)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filterPayStatus} onValueChange={setFilterPayStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('payments.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{t('payments.status.pending')}</SelectItem>
            <SelectItem value="paid">{t('payments.status.paid')}</SelectItem>
            <SelectItem value="all">{t('payments.allStatuses')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('payments.filterMethod')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('payments.allMethods')}</SelectItem>
            {Object.keys(PAYMENT_METHODS).map(m => (
              <SelectItem key={m} value={m}>{t(`payments.methods.${m}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="w-40"
          aria-label={t('payments.filterDate')}
        />
        {filterDate && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate('')}>
            {t('payments.clearDate')}
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">#</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">{t('payments.date')}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('payments.customer')}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('payments.phone')}</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">{t('payments.amount')}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">{t('payments.method')}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">{t('payments.payStatus')}</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">{t('payments.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const method = PAYMENT_METHODS[order.payment_method] ?? PAYMENT_METHODS.cod
              const MethodIcon = method.icon
              const isPending = order.payment_status === 'pending'
              return (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                      {order.order_number}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(order.created_at, i18n.language)}
                  </td>
                  <td className="px-4 py-3 font-medium">{customerName(order)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{customerPhone(order)}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    {formatPrice(order.total_mur)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${method.badge}`}>
                      <MethodIcon className="h-3 w-3" />
                      {t(`payments.methods.${order.payment_method}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isPending ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-200 whitespace-nowrap">
                        {t('payments.status.pending')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('payments.status.paid')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isPending && (
                      <Button size="sm" onClick={() => setConfirmOrder(order)}>
                        <HandCoins className="h-4 w-4 mr-1.5" />
                        {t('payments.collect')}
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">{t('payments.empty')}</p>
        )}
      </div>

      <Dialog open={!!confirmOrder} onOpenChange={open => { if (!open) setConfirmOrder(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('payments.confirmTitle')}</DialogTitle>
            <DialogDescription>
              {confirmOrder && t('payments.confirmDesc', {
                order: confirmOrder.order_number,
                amount: formatPrice(confirmOrder.total_mur),
              })}
            </DialogDescription>
          </DialogHeader>
          {confirmOrder && (
            <div className="rounded-lg bg-muted/50 border px-4 py-3 text-center">
              <p className="text-2xl font-bold">{formatPrice(confirmOrder.total_mur)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customerName(confirmOrder)} · {t(`payments.methods.${confirmOrder.payment_method}`)}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOrder(null)} disabled={saving}>
              {t('payments.cancel')}
            </Button>
            <Button onClick={markPaid} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('payments.confirmCollect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
