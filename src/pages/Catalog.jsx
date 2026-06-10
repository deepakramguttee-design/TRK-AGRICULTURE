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
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        <Leaf className="h-10 w-10 mx-auto mb-3 animate-pulse text-primary/40" />
        {t('catalog.loading')}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('catalog.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filtered.length} / {products.length} {lang === 'fr' ? 'produits' : 'products'}
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder={t('catalog.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
            {t('catalog.all')}
          </FilterPill>
          {categories.map(cat => (
            <FilterPill
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              {CATEGORY_EMOJI[cat.id]} {lang === 'en' ? cat.name_en : cat.name_fr}
            </FilterPill>
          ))}
        </div>
      </div>

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
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:border-primary/60'
      }`}
    >
      {children}
    </button>
  )
}
