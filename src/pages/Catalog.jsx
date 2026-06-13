import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Leaf } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import ProductCard, { CATEGORY_EMOJI } from '@/components/ProductCard'

export default function Catalog() {
  const { t, i18n } = useTranslation()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: prods, error: pErr }, { data: cats, error: cErr }] = await Promise.all([
          supabase.from('products').select('*').eq('is_active', true).order('category').order('name_fr'),
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        ])
        if (pErr) throw pErr
        if (cErr) throw cErr
        setProducts(prods || [])
        setCategories(cats || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const name = lang === 'en' ? (p.name_en || p.name_fr) : p.name_fr
      return matchCat && (!q || name.toLowerCase().includes(q))
    })
  }, [products, activeCategory, search, lang])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero skeleton */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 animate-pulse">
          <div className="h-3 bg-green-100 rounded-full w-40 mb-4" />
          <div className="h-9 bg-green-100 rounded-xl w-56 mb-2" />
          <div className="h-3 bg-green-100 rounded-full w-24" />
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2 mb-7">
          {[80, 100, 72, 90, 68].map(w => (
            <div key={w} className="h-8 rounded-full bg-stone-100 animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="aspect-square bg-stone-100" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 bg-stone-100 rounded-full w-16" />
                <div className="h-3.5 bg-stone-100 rounded w-full" />
                <div className="h-3.5 bg-stone-100 rounded w-4/5" />
                <div className="h-5 bg-stone-100 rounded w-20 mt-2" />
                <div className="h-8 bg-stone-100 rounded-lg mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-destructive">
        {t('catalog.error')}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Page hero */}
      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50/60 rounded-2xl border border-green-100 px-6 py-8 mb-8 overflow-hidden">
        <div aria-hidden className="absolute top-0 right-0 text-8xl opacity-[0.08] select-none pointer-events-none pr-4 pt-1">🌿</div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600 mb-2">
          {lang === 'fr' ? 'Directement de nos champs' : 'Straight from our fields'}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-1">{t('catalog.title')}</h1>
        <p className="text-stone-500 text-sm">
          {filtered.length} / {products.length} {lang === 'fr' ? 'produits disponibles' : 'products available'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 rounded-full border-stone-200"
            placeholder={t('catalog.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={activeCategory === 'all'}
            onClick={() => { console.log('[FILTER] selectedCategory: all'); setActiveCategory('all') }}
          >
            {t('catalog.all')}
          </FilterPill>
          {categories.map(cat => (
            <FilterPill
              key={cat.slug}
              active={activeCategory === cat.slug}
              onClick={() => {
                console.log('[FILTER] selectedCategory:', cat.slug)
                setActiveCategory(cat.slug)
              }}
            >
              {CATEGORY_EMOJI[cat.slug]} {lang === 'en' ? cat.name_en : cat.name_fr}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Leaf className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p>{t('catalog.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} categories={categories} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-green-200/60'
          : 'bg-background text-foreground border-border hover:border-green-400 hover:text-green-700'
      }`}
    >
      {children}
    </button>
  )
}
