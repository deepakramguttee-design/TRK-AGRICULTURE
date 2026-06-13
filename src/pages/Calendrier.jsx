import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const CANOPEE = '#1E4D2B'
const CREME   = '#FBF7EF'
const MANGUE  = '#E8A13D'

/* Availability levels per category, indexed 0=Jan … 11=Dec
   Mauritius: hot/rainy Nov–Apr (idx 10,11,0,1,2,3) · cool/dry May–Oct (idx 4–9)
   Values: 'high' | 'medium' | 'low' */
const AVAILABILITY = {
  epices:  ['medium','medium','medium','high','high','high','high','high','high','high','medium','medium'],
  salades: ['low','low','low','medium','high','high','high','high','high','high','low','low'],
  bredes:  ['high','high','high','high','medium','medium','medium','medium','medium','high','high','high'],
  legumes: ['medium','low','low','medium','high','high','high','high','high','high','medium','medium'],
  melons:  ['high','high','high','medium','low','low','low','low','medium','high','high','high'],
}

const CATEGORY_EMOJI = { epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈' }
const CATEGORY_KEYS = ['epices', 'salades', 'bredes', 'legumes', 'melons']

const LEVEL_STYLES = {
  high:   { bg: '#1E4D2B', label: 'text-white', dot: '#fff' },
  medium: { bg: '#E8A13D40', label: 'text-amber-800', dot: MANGUE },
  low:    { bg: '#f1f5f9',   label: 'text-slate-400',  dot: '#cbd5e1' },
}

/* Which months are in hot/rainy season */
const HOT_MONTHS = new Set([10, 11, 0, 1, 2, 3])

export default function Calendrier() {
  const { t } = useTranslation()
  const months = t('calendrier.months', { returnObjects: true }) || []

  return (
    <div className="font-nunito">

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 md:py-20"
        style={{ backgroundColor: CANOPEE }}
      >
        <div className="bg-alveoles absolute inset-0 opacity-40" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: MANGUE }}>
            TRK Agriculture
          </p>
          <h1 className="font-bricolage text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('calendrier.title')}
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(251,247,239,0.85)' }}>
            {t('calendrier.subtitle')}
          </p>
        </div>
      </div>

      {/* Climate banner */}
      <div className="py-4 px-4 text-center text-sm font-medium" style={{ backgroundColor: MANGUE + '22', color: CANOPEE }}>
        🌡️ {t('calendrier.climateNote')}
      </div>

      {/* Calendar grid */}
      <section className="py-12 md:py-16" style={{ backgroundColor: CREME }}>
        <div className="container mx-auto px-4">

          {/* Season headers above months */}
          <div className="overflow-x-auto pb-4">
            <div style={{ minWidth: 680 }}>

              {/* Month season labels */}
              <div className="flex mb-1 pl-[160px]">
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center"
                  >
                    {i === 4 && (
                      <span className="text-[10px] font-semibold text-sky-600 whitespace-nowrap">☁ Saison fraîche</span>
                    )}
                    {i === 10 && (
                      <span className="text-[10px] font-semibold text-amber-600 whitespace-nowrap">☀ Saison chaude</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Month row */}
              <div className="flex items-center mb-3">
                <div style={{ width: 160 }} className="shrink-0" />
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs font-semibold py-1 rounded-sm"
                    style={{
                      color: HOT_MONTHS.has(i) ? MANGUE : '#64748b',
                      backgroundColor: HOT_MONTHS.has(i) ? MANGUE + '18' : '#f1f5f9',
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>

              {/* Category rows */}
              {CATEGORY_KEYS.map(key => {
                const avail = AVAILABILITY[key]
                return (
                  <div
                    key={key}
                    className="flex items-center mb-2 rounded-xl overflow-hidden shadow-sm"
                    style={{ backgroundColor: 'white', border: '1px solid rgba(30,77,43,0.08)' }}
                  >
                    {/* Category label */}
                    <div
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-3 font-semibold text-sm"
                      style={{ width: 160, color: CANOPEE }}
                    >
                      <span className="text-xl">{CATEGORY_EMOJI[key]}</span>
                      <span className="leading-tight">{t(`calendrier.categories.${key}`)}</span>
                    </div>

                    {/* Month cells */}
                    {avail.map((level, mi) => {
                      const s = LEVEL_STYLES[level]
                      return (
                        <div
                          key={mi}
                          className="flex-1 py-3 flex items-center justify-center"
                          style={{ backgroundColor: s.bg }}
                          title={`${months[mi]} — ${t(`calendrier.legend.${level}`)}`}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.dot }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            {['high', 'medium', 'low'].map(level => {
              const s = LEVEL_STYLES[level]
              return (
                <div key={level} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-5 h-5 rounded-md border"
                    style={{ backgroundColor: s.bg, borderColor: 'rgba(0,0,0,0.08)' }}
                  />
                  <span className="text-stone-600">{t(`calendrier.legend.${level}`)}</span>
                </div>
              )
            })}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-stone-500 mt-4 max-w-xl mx-auto">
            {t('calendrier.note')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-12 text-center relative overflow-hidden"
        style={{ backgroundColor: CANOPEE }}
      >
        <div className="bg-alveoles absolute inset-0 opacity-40" />
        <div className="relative z-10">
          <h2 className="font-bricolage text-2xl font-bold text-white mb-2">
            {t('catalogs.title', 'Prêt à commander ?')}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(251,247,239,0.8)' }}>
            {t('process.subtitle')}
          </p>
          <Button
            asChild
            size="lg"
            className="font-bricolage font-semibold text-base px-8 rounded-xl"
            style={{ backgroundColor: MANGUE, color: '#fff', border: 'none' }}
          >
            <Link to="/catalogue">{t('calendrier.orderCta')}</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
