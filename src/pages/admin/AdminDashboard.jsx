import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  Package, ShoppingCart, Clock, Users, TrendingUp,
  Smartphone, AlertCircle, MapPin, Plus, Banknote,
} from 'lucide-react'

import { useOrderStatusLabels } from '@/hooks/useOrderStatusLabels'

const STATUS_ORDER_COLORS = {
  pending:   'bg-orange-100 text-orange-700 border-orange-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  prepared:  'bg-purple-100 text-purple-700 border-purple-200',
  shipped:   'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

function parseNotesName(notes) {
  const line = (notes || '').split('\n').find(l => l.startsWith('Nom:'))
  return line ? line.slice(4).trim() : '—'
}
function isPickup(notes) {
  return (notes || '').includes('Retrait sur place')
}
function formatDate(d, locale) {
  return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

function KpiCard({ label, value, icon: Icon, color, sub, to, alert }) {
  const inner = (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 transition-colors ${
      alert ? 'border-orange-300 bg-orange-50/60' : 'bg-background hover:bg-muted/30'
    } ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${alert ? 'text-orange-700' : ''}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function RevenueCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const { isAdmin } = useAuth()
  const { getLabel } = useOrderStatusLabels()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const dateLocale = i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  useEffect(() => {
    async function load() {
      const now = new Date()
      const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        { count: activeProducts },
        { count: totalOrders },
        { count: totalClients },
        { count: newB2B },
        { data: recentOrders },
        { data: recentB2B },
        { data: monthOrders },
        { data: todayOrders },
        { data: allOrdersRevenue },
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('b2b_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('orders')
          .select('id, order_number, created_at, customer_notes, total_mur, status, fulfillment_type, payment_method, payment_status')
          .order('created_at', { ascending: false }).limit(6),
        supabase.from('b2b_inquiries')
          .select('id, created_at, business_name, contact_name, status')
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('orders')
          .select('total_mur, status')
          .gte('created_at', startOfMonth)
          .neq('status', 'cancelled'),
        supabase.from('orders')
          .select('total_mur, status')
          .gte('created_at', startOfDay)
          .neq('status', 'cancelled'),
        supabase.from('orders')
          .select('total_mur')
          .neq('status', 'cancelled'),
      ])

      const orders = recentOrders ?? []
      const pendingOrders   = orders.filter(o => o.status === 'pending').length
      const juicePending    = orders.filter(o => o.payment_method === 'juice' && o.payment_status === 'pending').length
      const pickupPending   = orders.filter(o => isPickup(o.customer_notes) && o.status === 'pending').length

      // For accurate counts, query full dataset for juice/pending
      const [{ data: allPending }, { data: allJuice }] = await Promise.all([
        supabase.from('orders').select('id').eq('status', 'pending'),
        supabase.from('orders').select('id').eq('payment_method', 'juice').eq('payment_status', 'pending'),
      ])

      const revenueTotal = (allOrdersRevenue ?? []).reduce((s, o) => s + Number(o.total_mur), 0)
      const revenueMonth = (monthOrders ?? []).reduce((s, o) => s + Number(o.total_mur), 0)
      const revenueToday = (todayOrders ?? []).reduce((s, o) => s + Number(o.total_mur), 0)

      setData({
        activeProducts: activeProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        totalClients: totalClients ?? 0,
        newB2B: newB2B ?? 0,
        pendingOrders: allPending?.length ?? 0,
        juicePending: allJuice?.length ?? 0,
        revenueTotal, revenueMonth, revenueToday,
        recentOrders: orders,
        recentB2B: recentB2B ?? [],
      })
      setLoading(false)
    }
    load()
  }, [])

  const d = data ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('adminCore.dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alertes actives */}
      {!loading && (d.pendingOrders > 0 || d.juicePending > 0) && (
        <div className="flex flex-wrap gap-3">
          {d.pendingOrders > 0 && (
            <Link to="/admin/commandes?status=pending" className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-100 transition-colors">
              <AlertCircle className="h-4 w-4" />
              {t('adminCore.dashboard.alertPendingOrders', { count: d.pendingOrders })}
            </Link>
          )}
          {isAdmin && d.juicePending > 0 && (
            <Link to="/admin/commandes" className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors">
              <Smartphone className="h-4 w-4" />
              {t('adminCore.dashboard.alertJuicePending', { count: d.juicePending })}
            </Link>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isAdmin && (
          <KpiCard label={t('adminCore.dashboard.kpiActiveProducts')}     value={loading ? '—' : d.activeProducts} icon={Package}      color="text-green-600"  to="/admin/produits" />
        )}
        <KpiCard label={t('adminCore.dashboard.kpiTotalOrders')}   value={loading ? '—' : d.totalOrders}    icon={ShoppingCart}  color="text-blue-600"   to="/admin/commandes" />
        <KpiCard label={t('adminCore.dashboard.kpiTotalClients')} value={loading ? '—' : d.totalClients}   icon={Users}         color="text-violet-600" to={isAdmin ? '/admin/utilisateurs' : undefined} />
        <KpiCard label={t('adminCore.dashboard.kpiPendingB2B')} value={loading ? '—' : d.newB2B}        icon={TrendingUp}    color="text-orange-500" to="/admin/b2b" alert={!loading && d.newB2B > 0} />
      </div>

      {/* Revenue — admin uniquement */}
      {isAdmin && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('adminCore.dashboard.revenueTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RevenueCard label={t('adminCore.dashboard.revenueToday')}  value={loading ? '—' : formatPrice(d.revenueToday)}  sub={t('adminCore.dashboard.revenueTodaySub')} />
            <RevenueCard label={t('adminCore.dashboard.revenueMonth')}      value={loading ? '—' : formatPrice(d.revenueMonth)}  sub={new Date().toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })} />
            <RevenueCard label={t('adminCore.dashboard.revenueTotal')} value={loading ? '—' : formatPrice(d.revenueTotal)} sub={t('adminCore.dashboard.revenueTotalSub')} />
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dernières commandes */}
        <div className="rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
            <h2 className="font-semibold text-sm">{t('adminCore.dashboard.recentOrders')}</h2>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/admin/commandes">{t('adminCore.dashboard.viewAll')}</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {!loading && d.recentOrders?.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-muted-foreground text-xs">{t('adminCore.dashboard.noOrders')}</td></tr>
              )}
              {(d.recentOrders ?? []).map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link to={`/admin/commandes/${o.order_number}`} className="font-mono text-xs text-primary hover:underline block">
                      {o.order_number}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted-foreground">{parseNotesName(o.customer_notes)}</span>
                      {isPickup(o.customer_notes) && <MapPin className="h-3 w-3 text-green-500" title={t('adminCore.dashboard.pickupTitle')} />}
                      {o.payment_method === 'juice' && <Smartphone className="h-3 w-3 text-blue-500" title={t('labels.payment.juice')} />}
                      {o.payment_method === 'cod' && <Banknote className="h-3 w-3 text-muted-foreground" title={t('adminCore.dashboard.codTitle')} />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(o.created_at, dateLocale)}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold whitespace-nowrap">{formatPrice(o.total_mur)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      STATUS_ORDER_COLORS[o.status] ?? 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {getLabel(o.status, o.fulfillment_type, i18n.language)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Devis B2B */}
          <div className="rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
              <h2 className="font-semibold text-sm">{t('adminCore.dashboard.recentB2B')}</h2>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link to="/admin/b2b">{t('adminCore.dashboard.viewAll')}</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {!loading && d.recentB2B?.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-muted-foreground text-xs">{t('adminCore.dashboard.noB2B')}</td></tr>
                )}
                {(d.recentB2B ?? []).map(b => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link to={`/admin/b2b/${b.id}`} className="font-medium text-xs text-primary hover:underline block">
                        {b.business_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{b.contact_name}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.created_at, dateLocale)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        b.status === 'new' ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : b.status === 'won' ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {['new', 'contacted', 'quote_sent', 'won'].includes(b.status)
                          ? t(`adminCore.b2bStatus.${b.status}`) : b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold text-sm mb-3">{t('adminCore.dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="justify-start gap-2 h-9 text-xs">
                  <Link to="/admin/produits/nouveau"><Plus className="h-3.5 w-3.5" /> {t('adminCore.dashboard.newProduct')}</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild className="justify-start gap-2 h-9 text-xs">
                <Link to="/admin/commandes"><ShoppingCart className="h-3.5 w-3.5" /> {t('adminCore.dashboard.ordersAction')}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-2 h-9 text-xs">
                <Link to="/admin/semis"><Package className="h-3.5 w-3.5" /> {t('adminCore.dashboard.seedlingsAction')}</Link>
              </Button>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="justify-start gap-2 h-9 text-xs">
                  <Link to="/admin/utilisateurs"><Users className="h-3.5 w-3.5" /> {t('adminCore.dashboard.usersAction')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
