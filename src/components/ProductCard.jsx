import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const CATEGORY_EMOJI = {
  epices:  '🌿',
  salades: '🥬',
  bredes:  '🍃',
  legumes: '🥕',
  melons:  '🍈',
}

const CATEGORY_STYLES = {
  epices:  { badge: 'bg-amber-100 text-amber-800 border-amber-200',     placeholder: 'from-amber-50 to-amber-100/80' },
  salades: { badge: 'bg-lime-100 text-lime-800 border-lime-200',         placeholder: 'from-lime-50 to-lime-100/80' },
  bredes:  { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', placeholder: 'from-emerald-50 to-emerald-100/80' },
  legumes: { badge: 'bg-orange-100 text-orange-800 border-orange-200',   placeholder: 'from-orange-50 to-orange-100/80' },
  melons:  { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',   placeholder: 'from-yellow-50 to-yellow-100/80' },
}

const DEFAULT_STYLES = {
  badge: 'bg-green-100 text-green-800 border-green-200',
  placeholder: 'from-green-50 to-green-100/80',
}

const STATUS_STYLES = {
  available:    'bg-green-100 text-green-800 border-green-200',
  in_production:'bg-amber-100 text-amber-800 border-amber-200',
  coming_soon:  'bg-sky-100 text-sky-800 border-sky-200',
}

export default function ProductCard({ product, categories = [] }) {
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [qty, setQty] = useState(1)

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const name = lang === 'en' ? (product.name_en || product.name_fr) : product.name_fr
  const catLabel = categories.find(c => c.slug === product.category || c.id === product.category)?.[`name_${lang}`] || product.category
  const styles = CATEGORY_STYLES[product.category] || DEFAULT_STYLES
  const status = product.status || 'available'
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.available

  function stop(e) { e.preventDefault(); e.stopPropagation() }

  function handleAddToCart(e) {
    stop(e)
    addToCart({ ...product, quantity: qty })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  function handleQtyInput(e) {
    stop(e)
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val >= 1) setQty(val)
    else if (e.target.value === '') setQty('')
  }

  function handleQtyBlur() {
    if (!qty || qty < 1) setQty(1)
  }

  function decrement(e) { stop(e); setQty(q => Math.max(1, (q || 1) - 1)) }
  function increment(e) { stop(e); setQty(q => (q || 1) + 1) }

  return (
    <Link to={`/produit/${product.sku}`} className="block group h-full">
      <Card className="flex flex-col overflow-hidden h-full border-border/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-green-200/70">

        {/* Image */}
        <div className={`aspect-square overflow-hidden relative bg-gradient-to-br ${styles.placeholder}`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="text-5xl select-none opacity-70 group-hover:scale-110 transition-transform duration-300"
                aria-hidden
              >
                {CATEGORY_EMOJI[product.category] || '🌱'}
              </span>
            </div>
          )}
        </div>

        {/* Category badge + status */}
        <CardHeader className="p-3 pb-0">
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            <span className={`inline-flex items-center gap-1 w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
              {CATEGORY_EMOJI[product.category]} {catLabel}
            </span>
            <span className={`inline-flex items-center w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}>
              {t(`catalog.status.${status}`)}
            </span>
          </div>
          <CardTitle className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
            {name}
          </CardTitle>
        </CardHeader>

        {/* Price */}
        <CardContent className="px-3 py-1.5 mt-auto">
          <p className="text-base font-bold text-primary">
            Rs {Number(product.price_mur).toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              / {product.unit}
            </span>
          </p>
        </CardContent>

        {/* CTA */}
        <CardFooter className="p-3 pt-0 flex flex-col gap-2">
          {/* Qty selector */}
          <div className="flex items-center gap-1 w-full" onClick={stop}>
            <button
              type="button"
              onClick={decrement}
              className="h-7 w-7 rounded-md border border-border bg-muted hover:bg-muted/80 flex items-center justify-center text-sm font-medium text-foreground transition-colors shrink-0"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={handleQtyInput}
              onBlur={handleQtyBlur}
              onClick={stop}
              className="flex-1 h-7 text-center text-sm font-semibold border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={increment}
              className="h-7 w-7 rounded-md border border-border bg-muted hover:bg-muted/80 flex items-center justify-center text-sm font-medium text-foreground transition-colors shrink-0"
            >
              +
            </button>
          </div>
          <Button
            size="sm"
            className={`w-full text-xs gap-1.5 transition-all duration-300 ${
              justAdded ? 'bg-green-600 hover:bg-green-600 scale-[0.98]' : ''
            }`}
            onClick={handleAddToCart}
          >
            {justAdded ? (
              <CheckCircle className="h-3.5 w-3.5 animate-trk-check-pop" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            {justAdded ? t('catalog.added') : t('catalog.addToCart')}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
