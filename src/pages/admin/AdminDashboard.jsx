import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, Clock, Users, TrendingUp } from 'lucide-react'

const STATUS_ORDER_COLORS = {
  pending:   'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  en_route:  'bg-violet-100 text-violet-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_ORDER_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée',
  en_route: 'En route', delivered: 'Livrée', cancelled: 'Annulée',
}
const STATUS_B2B_COLORS = {
  new: 'bg-orange-100 text-orange-700',
  contacted: 'bg-blue-100 text-blue-700',
  quote_sent: 'bg-violet-100 text-violet-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-600',
}
const STATUS_B2B_LABELS = {
  new: 'Nouveau', contacted: 'Contacté',
  quote_sent: 'Devis envoyé', won: 'Gagné', lost: 'Perdu',
}

function parseNotesName(notes) {
  const line = (notes || '').split('\n').find(l => l.startsWith('Nom:'))
  return line ? line.slice(4).trim() : '—'
}

function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeProducts: 0, totalOrders: 0, pendingOrders: 0,
    totalB2B: 0, newB2B: 0,
  })
  const [lastOrders, setLastOrders] = useState([])
  const [lastB2B, setLastB2B] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('b2b_inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('b2b_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase
        .from('orders')
        .select('id, order_number, created_at, customer_notes, total_mur, status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('b2b_inquiries')
        .select('id, created_at, business_name, contact_name, status')
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([
      { count: ap }, { count: to }, { count: po },
      { count: tb }, { count: nb },
      { data: orders }, { data: b2bs },
    ]) => {
      setStats({
        activeProducts: ap ?? 0,
        totalOrders: to ?? 0,
        pendingOrders: po ?? 0,
        totalB2B: tb ?? 0,
        newB2B: nb ?? 0,
      })
      setLastOrders(orders ?? [])
      setLastB2B(b2bs ?? [])
      setLoading(false)
    })
  }, [])

  const kpis = [
    { label: 'Produits actifs',       value: stats.activeProducts, icon: Package,       color: 'text-green-600' },
    { label: 'Commandes totales',      value: stats.totalOrders,    icon: ShoppingCart,  color: 'text-blue-600' },
    { label: 'Commandes en attente',   value: stats.pendingOrders,  icon: Clock,         color: 'text-orange-500' },
    { label: 'Devis B2B total',        value: stats.totalB2B,       icon: Users,         color: 'text-violet-600' },
    { label: 'Nouveaux devis B2B',     value: stats.newB2B,         icon: TrendingUp,    color: 'text-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">{label}</CardTitle>
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? '—' : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mini-tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dernières commandes */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Dernières commandes</h2>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/admin/commandes">Voir tout</Link>
            </Button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {!loading && lastOrders.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-muted-foreground text-xs">
                    Aucune commande
                  </td>
                </tr>
              )}
              {lastOrders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/commandes/${o.order_number}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {o.order_number}
                    </Link>
                    <p className="text-xs text-muted-foreground">{parseNotesName(o.customer_notes)}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold whitespace-nowrap">
                    {formatPrice(o.total_mur)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      STATUS_ORDER_COLORS[o.status] ?? 'bg-muted text-muted-foreground'
                    }`}>
                      {STATUS_ORDER_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Derniers devis B2B */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Derniers devis B2B</h2>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/admin/b2b">Voir tout</Link>
            </Button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {!loading && lastB2B.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-muted-foreground text-xs">
                    Aucun devis B2B
                  </td>
                </tr>
              )}
              {lastB2B.map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/b2b/${b.id}`}
                      className="font-medium text-xs text-primary hover:underline"
                    >
                      {b.business_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{b.contact_name}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      STATUS_B2B_COLORS[b.status] ?? 'bg-muted text-muted-foreground'
                    }`}>
                      {STATUS_B2B_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
