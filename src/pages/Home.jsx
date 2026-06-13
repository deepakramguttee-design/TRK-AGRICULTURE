import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Leaf, Truck, Award, Clock, Sun, ShoppingBag, ArrowRight, Droplets } from 'lucide-react'

const STATS = [
  { value: '100%', label: 'Produits locaux' },
  { value: '9', label: 'Districts livrés' },
  { value: '+50', label: 'Variétés fraîches' },
]

const WHY_ITEMS = [
  {
    icon: Leaf,
    title: 'Cultivé ici',
    desc: "Nos plantes poussent sur l'île Maurice, récoltées le matin même de votre livraison.",
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    desc: 'Commandez en ligne, recevez chez vous. Livraison disponible dans les 9 districts.',
  },
  {
    icon: Award,
    title: 'Qualité garantie',
    desc: 'Sélection rigoureuse à chaque récolte. Sans produits chimiques inutiles.',
  },
  {
    icon: Clock,
    title: 'Toujours de saison',
    desc: 'Notre catalogue évolue avec les saisons pour vous offrir ce qui est à son meilleur.',
  },
]

const SEASONS = [
  {
    label: 'Jan–Mar', tag: '☀️ Été',
    items: ['Brèdes mourongue', 'Laitue', 'Citronnelle'],
    bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500',
  },
  {
    label: 'Avr–Jun', tag: '🌧 Cyclone',
    items: ['Épices robustes', 'Herbes aromatiques', 'Cresson'],
    bg: 'bg-lime-50', border: 'border-lime-200', dot: 'bg-lime-500',
  },
  {
    label: 'Jul–Sep', tag: '💨 Hiver',
    items: ['Brèdes chouchou', 'Laitue boston', 'Thym'],
    bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-500',
  },
  {
    label: 'Oct–Déc', tag: '🌱 Printemps',
    items: ['Salades variées', 'Tomates cerise', 'Basilic'],
    bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500',
  },
]

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[86vh] flex items-center bg-[#f4f1ea] overflow-hidden">

        {/* Dot texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(22,163,74,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Glow blobs */}
        <div aria-hidden className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-green-200/30 blur-[80px] pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-emerald-300/20 blur-[60px] pointer-events-none" />

        {/* Floating leaves */}
        <span aria-hidden className="absolute top-[10%] right-[6%] text-7xl opacity-[0.18] select-none pointer-events-none animate-trk-float">🌿</span>
        <span aria-hidden className="absolute bottom-[20%] right-[22%] text-5xl opacity-[0.12] select-none pointer-events-none animate-trk-float-slow">🍃</span>
        <span aria-hidden className="absolute top-[42%] right-[40%] text-3xl opacity-[0.07] select-none pointer-events-none animate-trk-float-slower hidden md:block">🌱</span>

        <div className="container mx-auto px-4 md:px-10 relative z-10 py-24">
          <div className="max-w-[640px]">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-100 border border-green-200/80 text-green-800 text-xs font-semibold tracking-wider mb-8 animate-trk-fade-up">
              <Leaf className="h-3 w-3" />
              Agriculture locale · Île Maurice
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 leading-[1.08] mb-6 animate-trk-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              {t('home.hero.title')}
            </h1>

            {/* Subtitle */}
            <p
              className="text-base md:text-lg text-stone-600 mb-10 max-w-md leading-relaxed animate-trk-fade-up"
              style={{ animationDelay: '160ms' }}
            >
              {t('home.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3 animate-trk-fade-up"
              style={{ animationDelay: '240ms' }}
            >
              <Button size="lg" asChild className="rounded-full px-7 h-12 text-base shadow-md shadow-green-300/40 gap-2">
                <Link to="/catalogue">
                  {t('home.hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-full px-7 h-12 text-base border-stone-300 bg-white/70">
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
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-green-700">{stat.value}</div>
                <div className="text-[10px] text-stone-500 font-semibold tracking-widest uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI TRK ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-green-600 mb-3">Notre engagement</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">
              Pourquoi choisir TRK ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-green-50 hover:border-green-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700 mb-4 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2 text-sm">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SAISONS ── */}
      <section className="bg-[#f4f1ea] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-amber-600 mb-2">Calendrier des récoltes</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
                Nos produits, au fil des saisons
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
            * Indicatif. Le catalogue est mis à jour selon les récoltes disponibles.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-green-700 py-20 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-xl">
          <Droplets className="h-9 w-9 text-green-300 mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Fraîcheur livrée chez vous
          </h2>
          <p className="text-green-200 text-sm leading-relaxed mb-8">
            Commandez en ligne, recevez vos plantes fraîches directement de nos champs.
            Partout à l'île Maurice.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white text-green-700 hover:bg-green-50 rounded-full px-8 h-12 text-base font-semibold shadow-lg gap-2"
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
