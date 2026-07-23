import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'
import { useCart } from '@/contexts/CartContext'
import { CATEGORY_EMOJI } from '@/components/ProductCard'
import { optimizedSources } from '@/lib/optimizedImages'

const CATEGORY_HUE = {
  epices:  { bg: 'from-amber-50 to-amber-100/70',    chip: 'text-amber-700 bg-amber-50' },
  salades: { bg: 'from-lime-50 to-lime-100/70',       chip: 'text-lime-700 bg-lime-50' },
  bredes:  { bg: 'from-emerald-50 to-emerald-100/70', chip: 'text-emerald-700 bg-emerald-50' },
  legumes: { bg: 'from-orange-50 to-orange-100/70',   chip: 'text-orange-700 bg-orange-50' },
  melons:  { bg: 'from-yellow-50 to-yellow-100/70',   chip: 'text-yellow-700 bg-yellow-50' },
}
const DEFAULT_HUE = { bg: 'from-green-50 to-green-100/70', chip: 'text-green-700 bg-green-50' }

const SKELETON_COUNT = 5

function ProductSlide({ product, lang, t }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const name = lang === 'en' ? (product.name_en || product.name_fr) : product.name_fr
  const hue = CATEGORY_HUE[product.category] || DEFAULT_HUE
  const optimized = optimizedSources(product.sku)

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ ...product, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link
      to={`/produit/${product.sku}`}
      className="group snap-start flex-none w-[192px] sm:w-[214px]"
      aria-label={name}
    >
      <div className="overflow-hidden rounded-2xl border border-forest-800/10 bg-card transition-all duration-300 hover:shadow-leafy hover:-translate-y-1 hover:border-forest-800/20">
        <div className={`relative bg-gradient-to-br ${hue.bg} h-[192px] sm:h-[214px] overflow-hidden`}>
          {optimized ? (
            <picture>
              <source type="image/webp" srcSet={optimized.webp} sizes="214px" />
              <source type="image/jpeg" srcSet={optimized.jpg} sizes="214px" />
              <img src={optimized.fallback} alt={name} loading="lazy" width="800" height="800"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
            </picture>
          ) : product.image_url ? (
            <img src={product.image_url} alt={name} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-35 select-none transition-transform duration-300 group-hover:scale-110" aria-hidden>
                {CATEGORY_EMOJI[product.category] || '🌱'}
              </span>
            </div>
          )}
          <div className={`absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider border border-white/40 bg-white/85 ${hue.chip}`}>
            <span aria-hidden>{CATEGORY_EMOJI[product.category]}</span>
            {product.category}
          </div>
        </div>
        <div className="p-3.5">
          <h3 className="font-display text-[13.5px] font-semibold text-forest-800 leading-snug line-clamp-2 min-h-[34px] mb-2.5">{name}</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-forest-700 text-[15px]">Rs {Math.round(product.price_mur)}</span>
              <span className="text-stone-400 text-[11px] ml-1">/{product.unit}</span>
            </div>
            <button type="button" onClick={handleAdd} aria-label={t('cart.addToCart', { name })}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-200 shrink-0 ${added ? 'bg-leaf scale-90' : 'bg-forest-800 hover:bg-mango hover:text-forest-900 hover:scale-110 active:scale-95'}`}>
              {added ? <CheckCircle className="h-3.5 w-3.5 animate-trk-check-pop" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedProducts() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const { products, loading } = useProducts({ onlyAvailable: true, limit: 12 })
  const featured = products.slice(0, 6)
  if (!loading && featured.length === 0) return null

  return (
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-leaf mb-2">{t('featured.subtitle')}</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-forest-800 leading-tight">{t('featured.title')}</h2>
          </div>
          <Link to="/catalogue" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-mango transition-colors shrink-0 group mb-0.5">
            {t('featured.viewAll')}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="snap-start flex-none w-[192px] sm:w-[214px]">
                  <div className="h-[192px] sm:h-[214px] rounded-t-2xl bg-stone-100 animate-pulse" />
                  <div className="p-3.5 border border-t-0 border-stone-100 rounded-b-2xl space-y-2">
                    <div className="h-3 bg-stone-100 rounded-full w-3/4 animate-pulse" />
                    <div className="h-3 bg-stone-100 rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ))
            : featured.map(p => <ProductSlide key={p.id} product={p} lang={lang} t={t} />)
          }
        </div>
        {!loading && (
          <div className="mt-5 flex justify-center sm:hidden">
            <Button variant="outline" size="sm" asChild className="rounded-full border-stone-200 gap-1.5">
              <Link to="/catalogue">
                {t('featured.viewAllMobile')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
