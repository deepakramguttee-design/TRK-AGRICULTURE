import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, Leaf } from 'lucide-react'

const CANOPY = '#1E4D2B'
const CREAM  = '#FBF7EF'
const MANGO  = '#E8A13D'

function daysElapsed(sownDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.floor((today - new Date(sownDate)) / 86400000)
}

export default function Nursery() {
  const { t } = useTranslation()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('sowing_batches').select('*').then(({ data, error }) => {
      if (error) { setError(error.message) }
      else {
        const enriched = (data ?? []).map(b => {
          const elapsed   = daysElapsed(b.sown_date)
          const remaining = b.estimated_days - elapsed
          const progress  = Math.min(100, Math.round((elapsed / b.estimated_days) * 100))
          return { ...b, elapsed, remaining, progress }
        })
        enriched.sort((a, b) => a.remaining - b.remaining)
        setBatches(enriched)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '70vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: CANOPY }} className="py-14 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Leaf className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">
            {t('nursery.title')}
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {t('nursery.subtitle')}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-12">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: CANOPY }} />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-destructive py-8">{error}</p>
        )}

        {!loading && !error && batches.length === 0 && (
          <div className="text-center py-16">
            <Leaf className="h-10 w-10 mx-auto mb-4 opacity-20" style={{ color: CANOPY }} />
            <p className="text-lg font-medium text-stone-600">{t('nursery.empty')}</p>
            <p className="text-sm text-stone-400 mt-1">{t('nursery.emptyDesc')}</p>
            <Link
              to="/catalogue"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: CANOPY }}
            >
              {t('nav.catalog')}
            </Link>
          </div>
        )}

        {!loading && !error && batches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map(b => <BatchCard key={b.id} batch={b} t={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function BatchCard({ batch: b, t }) {
  const isReady = b.remaining <= 0

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-1.5" style={{ backgroundColor: isReady ? MANGO : CANOPY }} />

      <div className="p-5">
        {/* Nom + badge statut */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-base text-stone-800 leading-tight">{b.variety_name}</h3>
          {isReady ? (
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: '#FEF3C7', color: MANGO }}>
              {t('nursery.readyNow')}
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: '#DCFCE7', color: CANOPY }}>
              {t('nursery.readyIn', { days: b.remaining })}
            </span>
          )}
        </div>

        {/* Jours écoulés */}
        <p className="text-xs text-stone-400 mb-3">
          {t('nursery.sownDaysAgo', { days: b.elapsed })}
        </p>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
            <span>{t('nursery.progress')}</span>
            <span>{b.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${b.progress}%`, backgroundColor: isReady ? MANGO : CANOPY }}
            />
          </div>
        </div>

        {/* Pied de carte */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
          <span>{t('nursery.plateaux', { count: b.quantity_plateaux })}</span>
          {b.notes && <span className="italic truncate max-w-[140px] text-stone-300">{b.notes}</span>}
        </div>
      </div>
    </div>
  )
}
