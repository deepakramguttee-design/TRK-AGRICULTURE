import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DISTRICTS } from '@/lib/delivery'
import { Loader2, Smartphone, Banknote } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  en_route:  'En route',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_COLORS = {
  pending:   'bg-orange-100 text-orange-700 border-orange-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  en_route:  'bg-violet-100 text-violet-700 border-violet-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

function parseNotes(notes) {
  const lines = (notes || '').split('\n')
  const get = prefix => {
    const line = lines.find(l => l.startsWith(prefix + ':'))
    return line ? line.slice(prefix.length + 1).trim() : ''
  }
  return { name: get('Nom'), district: get('District') }
}

function formatDate(d) {
  const dt = new Date(d)
  return (
    dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

const PAYMENT_LABELS = {
  cod:   'COD',
  juice: 'Juice',
}

const PAYMENT_STATUS_LABELS = {
  pending: 'En attente',
  paid:    'Payé',
  failed:  'Échoué',
}

export default function AdminOrdersList() {
  const { isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDistrict, setFilterDistrict] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, order_number, created_at, guest_phone, customer_notes, status, subtotal_mur, delivery_fee_mur, discount_pct, discount_mur, total_mur, payment_method, payment_status, order_items(quantity)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast({ title: 'Erreur chargement', description: error.message, variant: 'destructive' })
        else setOrders(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = orders.filter(o => {
    const parsed = parseNotes(o.customer_notes)
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      (o.order_number || '').toLowerCase().includes(q) ||
      parsed.name.toLowerCase().includes(q)
    const matchStatus  = filterStatus === 'all' || o.status === filterStatus
    const matchDistrict = filterDistrict === 'all' || parsed.district === filterDistrict
    const matchPayment  = filterPayment === 'all' || o.payment_method === filterPayment
    return matchSearch && matchStatus && matchDistrict && matchPayment
  })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {orders.length} commandes — {orders.filter(o => o.payment_method === 'juice' && o.payment_status === 'pending').length} Juice en attente
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="N° commande ou nom client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-56"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDistrict} onValueChange={setFilterDistrict}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les districts</SelectItem>
            {DISTRICTS.map(d => (
              <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="cod">COD</SelectItem>
            <SelectItem value="juice">Juice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">#</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Téléphone</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">District</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Plateaux</th>
              {isAdmin && (
                <>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Paiement</th>
                </>
              )}
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const parsed = parseNotes(order.customer_notes)
              const totalQty = (order.order_items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0)
              return (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                      {order.order_number}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{parsed.name || '—'}</td>
                  <td className="px-4 py-3">{order.guest_phone || '—'}</td>
                  <td className="px-4 py-3">{parsed.district || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {totalQty}
                    </span>
                  </td>
                  {isAdmin && (
                    <>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold">{formatPrice(order.total_mur)}</span>
                        {Number(order.discount_pct) > 0 && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                            −{order.discount_pct}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.payment_method === 'juice' ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            order.payment_status === 'pending'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            <Smartphone className="h-3 w-3" />
                            Juice {order.payment_status === 'paid' ? '✓' : '⏳'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
                            <Banknote className="h-3 w-3" />
                            COD
                          </span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/commandes/${order.order_number}`}>Voir détails</Link>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune commande trouvée</p>
        )}
      </div>
    </div>
  )
}
