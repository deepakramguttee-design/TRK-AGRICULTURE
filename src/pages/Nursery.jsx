import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, Leaf, Sun, Droplets, Layers, MessageCircle, BookOpen } from 'lucide-react'

const GALLERY = [
  { src: '/products/brocoli.jpg',              label: 'Brocoli' },
  { src: '/products/chou-rouge.jpg',           label: 'Chou rouge' },
  { src: '/products/choufleur-cristalboy.jpg', label: 'Chou-fleur' },
  { src: '/products/laitue-tourbillon.jpg',    label: 'Laitue' },
  { src: '/products/pomme-d-amour.jpg',        label: 'Tomate' },
  { src: '/products/petsai-pomme.jpg',         label: 'Petsai' },
  { src: '/products/persil-plat.jpg',          label: 'Persil' },
  { src: '/products/gros-piment.jpg',          label: 'Piment' },
  { src: '/products/oignon.jpg',               label: 'Oignon' },
  { src: '/products/patisson.jpg',             label: 'Pâtisson' },
  { src: '/products/concombre.jpg',            label: 'Concombre' },
  { src: '/products/poireaux.jpg',             label: 'Poireaux' },
]

const CANOPY = '#1E4D2B'
const CREAM  = '#FBF7EF'
const MANGO  = '#E8A13D'

const PLANT_CARE = {
  epices:  { sun: 'full',    water: 'moderate', soil: 'welldrained' },
  salades: { sun: 'partial', water: 'moderate', soil: 'rich' },
  bredes:  { sun: 'partial', water: 'high',     soil: 'rich' },
  legumes: { sun: 'full',    water: 'moderate', soil: 'deep' },
  melons:  { sun: 'full',    water: 'high',     soil: 'rich' },
}

function inferCategory(name) {
  const n = (name || '').toLowerCase()
  if (/piment|poivron|paprika|pili/.test(n)) return 'epices'
  if (/laitue|salade|roquette|cresson/.test(n)) return 'salades'
  if (/bred|songe|brocoli|chou/.test(n)) return 'bredes'
  if (/melon|concombre|courgette|p.tisson|citrouille/.test(n)) return 'melons'
  return 'legumes'
}

function daysElapsed(sownDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.floor((today - new Date(sownDate)) / 86400000)
}

function formatDate(sownDate, extraDays) {
  const d = new Date(sownDate)
  d.setDate(d.getDate() + extraDays)
  return d.toLocaleDateString('fr-MU', { day: 'numeric', month: 'long' })
}

export default function Nursery() {
  const { t } = useTranslation()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

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

  const readyBatches   = batches.filter(b => b.remaining <= 0)
  const soonBatches    = batches.filter(b => b.remaining > 0 && b.remaining <= 7)
  const growingBatches = batches.filter(b => b.remaining > 7)
  const varieties      = new Set(batches.map(b => b.variety_name)).size

  const filtered = filter === 'ready'   ? readyBatches
                 : filter === 'soon'    ? soonBatches
                 : filter === 'growing' ? growingBatches
                 : batches

  const FILTERS = [
    { key: 'all',     label: t('nursery.filter.all'),     count: batches.length },
    { key: 'ready',   label: t('nursery.filter.ready'),   count: readyBatches.length },
    { key: 'soon',    label: t('nursery.filter.soon'),    count: soonBatches.length },
    { key: 'growing', label: t('nursery.filter.growing'), count: growingBatches.length },
  ]

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '70vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: CANOPY }} className="py-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('nursery.liveBadge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
            {t('nursery.title')}
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {t('nursery.subtitle')}
          </p>

          {!loading && batches.length > 0 && (
            <div className="flex justify-center gap-8 md:gap-12 mt-10">
              {[
                { val: readyBatches.length,                         label: t('nursery.stats.ready') },
                { val: soonBatches.length + growingBatches.length,  label: t('nursery.stats.growing') },
                { val: varieties,                                    label: t('nursery.stats.varieties') },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-4xl font-bold text-white font-display">{val}</div>
                  <div className="text-xs mt-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && !error && batches.length > 0 && (
        <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
              {FILTERS.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={filter === key
                    ? { backgroundColor: CANOPY, color: 'white' }
                    : { backgroundColor: '#F0EBE0', color: '#57534E' }
                  }
                >
                  {label}
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={filter === key
                      ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                      : { backgroundColor: 'rgba(0,0,0,0.1)', color: '#57534E' }
                    }
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batch grid */}
      <div className="container mx-auto px-4 py-10">
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: CANOPY }} />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-red-600 py-10">{error}</p>
        )}

        {!loading && !error && batches.length === 0 && (
          <div className="text-center py-20">
            <Leaf className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: CANOPY }} />
            <p className="text-lg font-semibold text-stone-600">{t('nursery.empty')}</p>
            <p className="text-sm text-stone-400 mt-2">{t('nursery.emptyDesc')}</p>
            <Link
              to="/catalogue"
              className="inline-block mt-6 px-6 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: CANOPY }}
            >
              {t('nursery.cta.catalogue')}
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(b => <BatchCard key={b.id} batch={b} t={t} />)}
          </div>
        )}

        {!loading && !error && batches.length > 0 && filtered.length === 0 && (
          <p className="text-center text-stone-400 py-16 text-sm">{t('nursery.emptyDesc')}</p>
        )}
      </div>

      {/* Gallery */}
      <div className="border-t border-stone-200/60 py-14 px-4" style={{ backgroundColor: '#F4EFE4' }}>
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2" style={{ color: CANOPY }}>
              {t('nursery.gallery.title')}
            </h2>
            <p className="text-sm text-stone-500">{t('nursery.gallery.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GALLERY.map(({ src, label }) => (
              <div key={src} className="group relative aspect-square rounded-xl overflow-hidden bg-stone-200">
                <img
                  src={src}
                  alt={label}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-sm">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ backgroundColor: CANOPY }} className="py-14 px-4">
        <div className="container mx-auto text-center max-w-lg">
          <Leaf className="h-8 w-8 mx-auto mb-4 text-white opacity-50" />
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display mb-3">
            {t('nursery.cta.contact')}
          </h2>
          <p className="text-white/65 mb-8 text-sm">{t('nursery.cta.preorder')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/23057745306"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: MANGO }}
            >
              <MessageCircle className="h-4 w-4" />
              {t('nursery.cta.whatsapp')}
            </a>
            <Link
              to="/catalogue"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              {t('nursery.cta.catalogue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function BatchCard({ batch: b, t }) {
  const isReady = b.remaining <= 0
  const isSoon  = !isReady && b.remaining <= 7

  const category = b.category || inferCategory(b.variety_name)
  const care = PLANT_CARE[category] ?? null

  const harvestDate = b.sown_date
    ? formatDate(b.sown_date, b.estimated_days)
    : null

  const waMsg = encodeURIComponent(`Bonjour, je souhaite précommander: ${b.variety_name}`)

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="h-1.5" style={{ backgroundColor: isReady ? MANGO : isSoon ? '#F59E0B' : CANOPY }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-base text-stone-800 leading-tight">{b.variety_name}</h3>
          {isReady ? (
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              {t('nursery.readyNow')}
            </span>
          ) : isSoon ? (
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEF9C3', color: '#713F12' }}>
              {t('nursery.readyIn', { days: b.remaining })}
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: CANOPY }}>
              {t('nursery.readyIn', { days: b.remaining })}
            </span>
          )}
        </div>

        {/* Dates */}
        <p className="text-xs text-stone-400 mb-1">{t('nursery.sownDaysAgo', { days: b.elapsed })}</p>
        {!isReady && harvestDate && (
          <p className="text-xs text-stone-400 mb-3">{t('nursery.harvestDate', { date: harvestDate })}</p>
        )}
        {(isReady || !harvestDate) && <div className="mb-3" />}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
            <span>{t('nursery.progress')}</span>
            <span>{b.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${b.progress}%`, backgroundColor: isReady ? MANGO : CANOPY }}
            />
          </div>
        </div>

        {/* Care indicators */}
        {care && (
          <div className="flex gap-4 mb-4 pb-4 border-b border-stone-100">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Sun className="h-3.5 w-3.5" style={{ color: MANGO }} />
              {t(`nursery.care.${care.sun}`)}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              {t(`nursery.care.${care.water}`)}
            </span>
          </div>
        )}

        {/* Footer tray count */}
        <div className="mt-auto flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {t('nursery.plateaux', { count: b.quantity_plateaux })}
          </span>
          {b.notes && <span className="italic truncate max-w-[140px] text-stone-300">{b.notes}</span>}
        </div>

        {/* Pre-order CTA */}
        {!isReady && (
          <a
            href={`https://wa.me/23057745306?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={isSoon
              ? { backgroundColor: MANGO, color: 'white' }
              : { backgroundColor: '#EBF5EB', color: CANOPY }
            }
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t('nursery.cta.preorder')}
          </a>
        )}
      </div>
    </div>
  )
}
