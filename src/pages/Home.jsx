import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Leaf, Truck, Award, Clock, Sun, ShoppingBag, ArrowRight, Droplets } from 'lucide-react'
import FeaturedProducts from '@/components/FeaturedProducts'
import { supabase } from '@/lib/supabase'

const STATS_KEYS = [
  { value: '100%', labelKey: 'home.stats.local' },
  { value: '9',    labelKey: 'home.stats.districts' },
  { value: '+50',  labelKey: 'home.stats.varieties' },
]

const WHY_ICON_MAP = [Leaf, Truck, Award, Clock]

const SEASON_KEYS = [
  { key: 'summer',  bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'cyclone', bg: 'bg-lime-50',    border: 'border-lime-200',    dot: 'bg-lime-500' },
  { key: 'winter',  bg: 'bg-sky-50',     border: 'border-sky-200',     dot: 'bg-sky-500' },
  { key: 'spring',  bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
]

export default function Home() {
  const { t } = useTranslation()
  const { isAdmin, isEmployee, loading: authLoading } = useAuth()
  const SEASONS = SEASON_KEYS.map(s => ({
    ...s,
    label: t(`home.seasons.${s.key}.label`),
    tag:   t(`home.seasons.${s.key}.tag`),
    items: t(`home.seasons.${s.key}.items`, { returnObjects: true }),
  }))
  const [readyBatches, setReadyBatches] = useState([])

  useEffect(() => {
    supabase.from('sowing_batches').select('*').then(({ data }) => {
      if (!data) return
      const now = Date.now()
      const ready = data
        .map(b => ({ ...b, remaining: b.estimated_days - Math.floor((now - new Date(b.sown_date)) / 86400000) }))
        .filter(b => b.remaining <= 0)
        .slice(0, 3)
      setReadyBatches(ready)
    })
  }, [])

  // Staff (admin/operator) déjà connecté qui ouvre l'accueil → espace staff.
  // L'admin en session AAL1 sera renvoyé par ProtectedAdminRoute vers
  // /admin/login pour finir son TOTP.
  if (!authLoading && (isAdmin || isEmployee)) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="paper relative min-h-[86vh] flex items-center overflow-hidden">

        {/* Dot texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(22,58,36,0.10) 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Glow blobs */}
        <div aria-hidden className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-leaf/20 blur-[80px] pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-mango/15 blur-[60px] pointer-events-none" />

        {/* Floating leaves */}
        <span aria-hidden className="absolute top-[10%] right-[6%] text-7xl opacity-[0.18] select-none pointer-events-none animate-trk-float">🌿</span>
        <span aria-hidden className="absolute bottom-[20%] right-[22%] text-5xl opacity-[0.12] select-none pointer-events-none animate-trk-float-slow">🍃</span>
        <span aria-hidden className="absolute top-[42%] right-[40%] text-3xl opacity-[0.07] select-none pointer-events-none animate-trk-float-slower hidden md:block">🌱</span>

        <div className="container mx-auto px-4 md:px-10 relative z-10 py-24">
          <div className="max-w-[640px]">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-800/8 border border-forest-800/15 text-forest-800 text-xs font-semibold tracking-wider mb-8 animate-trk-fade-up">
              <Leaf className="h-3 w-3 text-leaf" />
              {t('home.hero.badge')}
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold text-forest-800 leading-[1.05] mb-6 animate-trk-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              {t('home.hero.title')}
            </h1>

            {/* Subtitle */}
            <p
              className="text-base md:text-lg text-forest-700/80 mb-10 max-w-md leading-relaxed animate-trk-fade-up"
              style={{ animationDelay: '160ms' }}
            >
              {t('home.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3 animate-trk-fade-up"
              style={{ animationDelay: '240ms' }}
            >
              <Button size="lg" asChild className="rounded-full px-7 h-12 text-base bg-mango text-forest-900 hover:bg-forest-800 hover:text-cream-50 shadow-sun gap-2">
                <Link to="/catalogue">
                  {t('home.hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-full px-7 h-12 text-base border-forest-800/25 bg-cream-50/70 text-forest-800 hover:bg-forest-800 hover:text-cream-50">
                <Link to="/b2b">{t('nav.b2b')}</Link>
              </Button>
            </div>

          </div>
        </div>

        {/* Wave divider */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 pointer-events-none leading-none">
          <svg viewBox="0 0 1440 64" className="w-full" preserveAspectRatio="none" fill="white">
            <path d="M0,48 C180,16 360,64 540,38 C720,12 900,56 1080,30 C1260,6 1380,46 1440,26 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-white py-10 border-b border-stone-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {STATS_KEYS.map(stat => (
              <div key={stat.labelKey} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-semibold text-forest-700">{stat.value}</div>
                <div className="text-[10px] text-forest-700/60 font-semibold tracking-widest uppercase mt-1">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI TRK ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-leaf mb-3">{t('home.why.tag')}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-800">
              {t('home.why.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_ICON_MAP.map((Icon, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-forest-800/8 bg-cream-100/50 hover:bg-cream-100 hover:border-forest-800/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-leafy"
              >
                <div className="w-11 h-11 rounded-xl bg-forest-800/10 flex items-center justify-center text-forest-800 mb-4 group-hover:bg-forest-800 group-hover:text-lime transition-all duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-forest-800 mb-2 text-sm">{t(`home.why.items.${i}.title`)}</h3>
                <p className="text-sm text-forest-700/70 leading-relaxed">{t(`home.why.items.${i}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUITS VEDETTES ── */}
      <FeaturedProducts />

      {/* ── PÉPINIÈRE EN DIRECT ── */}
      <section className="bg-white py-16 md:py-20 border-t border-stone-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-green-600 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t('nursery.homeSection.tag')}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
                {t('nursery.homeSection.title')}
              </h2>
              <p className="text-stone-500 text-sm mt-2 max-w-md">{t('nursery.homeSection.subtitle')}</p>
            </div>
            <Link
              to="/pepiniere"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
              style={{ backgroundColor: '#1E4D2B' }}
            >
              {t('nursery.homeSection.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {readyBatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {readyBatches.map(b => (
                <Link
                  key={b.id}
                  to="/pepiniere"
                  className="group flex items-center gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8F5E9' }}>
                    <Leaf className="h-5 w-5" style={{ color: '#1E4D2B' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-stone-800 truncate">{b.variety_name}</p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">{t('nursery.readyNow')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-green-600 transition-colors ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-8 text-center">
              <Leaf className="h-8 w-8 mx-auto mb-3 opacity-20" style={{ color: '#1E4D2B' }} />
              <p className="text-sm font-medium text-stone-500">{t('nursery.emptyDesc')}</p>
              <Link to="/pepiniere" className="inline-block mt-4 text-xs font-semibold underline underline-offset-4" style={{ color: '#1E4D2B' }}>
                {t('nursery.homeSection.cta')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── SAISONS ── */}
      <section className="paper py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 mb-2">{t('home.seasons.tag')}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
                {t('home.seasons.title')}
              </h2>
            </div>
            <Sun className="h-8 w-8 text-amber-400 hidden sm:block" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SEASONS.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold tracking-wide text-stone-700 uppercase">{s.label}</p>
                  <span className="text-xs">{s.tag}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {s.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-stone-700">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-stone-400 mt-4 text-center">
            {t('home.seasons.note')}
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-forest-800 py-20 relative overflow-hidden grain-dark">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-mango/15 blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-xl">
          <Droplets className="h-9 w-9 text-lime mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cream-50 mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-cream-100/80 text-sm leading-relaxed mb-8">
            {t('home.cta.desc')}
          </p>
          <Button
            size="lg"
            asChild
            className="bg-mango text-forest-900 hover:bg-cream-50 rounded-full px-8 h-12 text-base font-semibold shadow-sun gap-2"
          >
            <Link to="/catalogue">
              <ShoppingBag className="h-4 w-4" />
              {t('home.hero.cta')}
            </Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
