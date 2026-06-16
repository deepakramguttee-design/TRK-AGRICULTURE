import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CACHE_TTL = 5 * 60 * 1000
const cache = new Map()

export function useProducts({ category = null, limit = null, onlyAvailable = false } = {}) {
  const cacheKey = JSON.stringify({ category, limit, onlyAvailable })

  const getFromCache = () => {
    const hit = cache.get(cacheKey)
    return hit && Date.now() - hit.ts < CACHE_TTL ? hit.data : null
  }

  const initial = getFromCache()
  const [products, setProducts] = useState(initial || [])
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState(null)

  useEffect(() => {
    const hit = getFromCache()
    if (hit) {
      setProducts(hit)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    let q = supabase.from('products').select('*').eq('is_active', true)
    if (category) q = q.eq('category', category)
    if (onlyAvailable) q = q.eq('status', 'available')
    q = q.order('category').order('name_fr')
    if (limit) q = q.limit(limit)

    q.then(({ data, error: e }) => {
      if (cancelled) return
      if (e) {
        setError(e.message)
      } else {
        const d = data || []
        cache.set(cacheKey, { data: d, ts: Date.now() })
        setProducts(d)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [cacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { products, loading, error }
}

export function invalidateProductsCache() {
  cache.clear()
}
