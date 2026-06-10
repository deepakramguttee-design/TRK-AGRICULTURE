import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, ShoppingCart, ChevronLeft, Leaf } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard, { CATEGORY_EMOJI } from '@/components/ProductCard'

export default function ProductDetail() {
  const { sku } = useParams()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setSimilar([])
    setQty(1)

    async function fetchAll() {
      const { data: prod, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return
      if (error || !prod) { setNotFound(true); setLoading(false); return }

      setProduct(prod)

      const [{ data: sim }, { data: cats }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('category', prod.category)
          .eq('is_active', true)
          .neq('sku', sku)
          .limit(4),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true),
      ])

      if (cancelled) return
      setSimilar(sim || [])
      setCategories(cats || [])
      setLoading(false)
    }

    fetchAll()
    return () => { cancelled = true }
  }, [sku])

  function handleAddToCart() {
    const name = lang === 'en' ? (product.name_en || product.name_fr) : product.name_fr
    addToCart({ ...product, quantity: qty })
    toast({ title: t('product.added'), description: `${qty} × ${name}`, duration: 3000 })
  }

  if (loading) return <ProductDetailSkeleton />

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Leaf className="h-14 w-14 mx-auto mb-4 opacity-20" />
        <h1 className="text-xl font-bold mb-2">{t('product.notFound')}</h1>
        <p className="text-muted-foreground mb-6">{t('product.notFoundDesc')}</p>
        <Button asChild>
          <Link to="/catalogue">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('product.backToCatalog')}
          </Link>
        </Button>
      </div>
    )
  }

  const name = lang === 'en' ? (product.name_en || product.name_fr) : product.name_fr
  const description = lang === 'en'
    ? (product.description_en || product.description_fr)
    : product.description_fr
  const catLabel = categories.find(c => c.slug === product.category || c.id === product.category)?.[`name_${lang}`] || product.category

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
        <Link to="/catalogue" className="hover:text-foreground transition-colors">
          {t('catalog.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        {/* Colonne gauche — image */}
        <div className="relative aspect-square bg-zinc-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl select-none" aria-hidden>
                {CATEGORY_EMOJI[product.category] || '🌱'}
              </span>
            </div>
          )}
        </div>

        {/* Colonne droite — infos */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-3 text-sm">
            {CATEGORY_EMOJI[product.category]} {catLabel}
          </Badge>

          <h1 className="text-[2rem] font-bold leading-tight mb-3">{name}</h1>

          <p className="text-[1.75rem] font-bold text-primary mb-1">
            Rs {Number(product.price_mur).toFixed(2)}
            <span className="text-base font-normal text-muted-foreground ml-2">
              / {product.unit}
            </span>
          </p>

          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed mt-3 mb-5">
              {description}
            </p>
          )}

          <div className={description ? '' : 'mt-5'}>
            {/* Sélecteur de quantité */}
            <p className="text-sm font-medium mb-2">{t('product.qty')}</p>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                aria-label="Diminuer"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-lg font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Augmenter"
                onClick={() => setQty(q => Math.min(99, q + 1))}
                className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                disabled={qty >= 99}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Bouton principal */}
            <Button
              size="lg"
              className="w-full h-13 text-base gap-2 mb-3"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {t('product.addToCart')}
            </Button>

            {/* Bouton secondaire */}
            <Button variant="outline" size="lg" className="w-full h-13 text-base" asChild>
              <Link to="/catalogue">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('product.backToCatalog')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Section "Vous pourriez aussi aimer" */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-5">{t('product.similar')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similar.map(p => (
              <ProductCard key={p.id} product={p} categories={categories} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-square bg-zinc-100 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-zinc-100 rounded w-24" />
          <div className="h-9 bg-zinc-100 rounded w-3/4" />
          <div className="h-8 bg-zinc-100 rounded w-32" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-zinc-100 rounded" />
            <div className="h-4 bg-zinc-100 rounded w-5/6" />
            <div className="h-4 bg-zinc-100 rounded w-4/6" />
          </div>
          <div className="h-12 bg-zinc-100 rounded mt-6" />
          <div className="h-12 bg-zinc-100 rounded" />
        </div>
      </div>
    </div>
  )
}
