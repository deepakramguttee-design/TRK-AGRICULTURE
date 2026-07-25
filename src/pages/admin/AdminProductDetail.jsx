import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Pencil, Loader2, Image as ImageIcon, Package, ShoppingCart, TrendingUp } from 'lucide-react'

const CATEGORY_EMOJI = { epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈' }

const STATUS_STYLES = {
  available:    'bg-green-100 text-green-800 border-green-200',
  in_production:'bg-amber-100 text-amber-800 border-amber-200',
  coming_soon:  'bg-sky-100 text-sky-800 border-sky-200',
}
function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
}

function formatDate(d, lang) {
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg border p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default function AdminProductDetail() {
  const { t, i18n } = useTranslation()
  const { sku } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ orders: 0, qtySold: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: p, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single()
      if (error || !p) {
        toast({ title: t('adminCatalog.detail.notFound'), variant: 'destructive' })
        navigate('/admin/produits', { replace: true })
        return
      }
      setProduct(p)

      const { data: items } = await supabase
        .from('order_items')
        .select('quantity, line_total_mur, order_id, orders(order_number, created_at, status)')
        .eq('product_sku', sku)
        .order('orders(created_at)', { ascending: false })

      if (items) {
        const qtySold = items.reduce((s, i) => s + i.quantity, 0)
        const revenue = items.reduce((s, i) => s + Number(i.line_total_mur), 0)
        setStats({ orders: items.length, qtySold, revenue })
        setRecentOrders(items.slice(0, 6))
      }
      setLoading(false)
    }
    load()
  }, [sku, navigate, t])

  async function handleToggleActive() {
    setToggling(true)
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('sku', sku)
    if (error) {
      toast({ title: t('adminCatalog.error'), description: error.message, variant: 'destructive' })
    } else {
      setProduct(p => ({ ...p, is_active: !p.is_active }))
      toast({ title: product.is_active ? t('adminCatalog.detail.productDeactivated') : t('adminCatalog.detail.productActivated') })
    }
    setToggling(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statusClass = STATUS_STYLES[product.status] ?? STATUS_STYLES.available

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/produits">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('adminCatalog.detail.productsBack')}
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">{product.name_fr}</h1>
        <Button variant="outline" size="sm" onClick={handleToggleActive} disabled={toggling}>
          {toggling && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          {product.is_active ? t('adminCatalog.detail.deactivate') : t('adminCatalog.detail.activate')}
        </Button>
        <Button size="sm" asChild>
          <Link to={`/admin/produits/${sku}/editer`}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            {t('adminCatalog.detail.modify')}
          </Link>
        </Button>
      </div>

      {/* Image + infos */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Image */}
        <div className="rounded-lg border overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name_fr} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ImageIcon className="h-12 w-12" />
              <span className="text-xs">{t('adminCatalog.detail.noImage')}</span>
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div className="md:col-span-2 rounded-lg border p-5 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-muted text-foreground border-border">
              <code className="font-mono">{product.sku}</code>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-muted">
              {CATEGORY_EMOJI[product.category]} {product.category}
            </span>
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${statusClass}`}>
              {product.status ? t(`adminCatalog.status.${product.status}`, { defaultValue: product.status }) : product.status}
            </span>
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
              product.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {product.is_active ? t('adminCatalog.detail.active') : t('adminCatalog.detail.inactive')}
            </span>
          </div>

          {/* Champs */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.nameFr')}</p>
              <p className="font-semibold">{product.name_fr || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.nameEn')}</p>
              <p className="font-semibold">{product.name_en || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.price')}</p>
              <p className="font-bold text-primary text-base">{formatPrice(product.price_mur)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.unit')}</p>
              <p className="font-semibold">{product.unit || '—'}</p>
            </div>
            {product.description_fr && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.descriptionFr')}</p>
                <p className="text-muted-foreground leading-relaxed">{product.description_fr}</p>
              </div>
            )}
            {product.description_en && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{t('adminCatalog.detail.descriptionEn')}</p>
                <p className="text-muted-foreground leading-relaxed">{product.description_en}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={ShoppingCart} label={t('adminCatalog.detail.orders')} value={stats.orders} />
        <StatCard icon={Package} label={t('adminCatalog.detail.qtySold')} value={stats.qtySold} sub={t('adminCatalog.detail.inUnit', { unit: product.unit || t('adminCatalog.detail.unitFallback') })} />
        <StatCard icon={TrendingUp} label={t('adminCatalog.detail.revenue')} value={formatPrice(stats.revenue)} />
      </div>

      {/* Commandes récentes */}
      {recentOrders.length > 0 && (
        <div className="rounded-lg border">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">{t('adminCatalog.detail.recentOrders')}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t('adminCatalog.detail.orderNumber')}</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{t('adminCatalog.detail.date')}</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">{t('adminCatalog.detail.qty')}</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">{t('adminCatalog.detail.lineTotal')}</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">{t('adminCatalog.detail.orderStatus')}</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((item, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {item.orders?.order_number ?? '—'}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {item.orders?.created_at ? formatDate(item.orders.created_at, i18n.language) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatPrice(item.line_total_mur)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs text-muted-foreground">{item.orders?.status ?? '—'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {item.orders?.order_number && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/admin/commandes/${item.orders.order_number}`}>{t('adminCatalog.detail.view')}</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
