import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Sprout, FlaskConical, Sun, Leaf, TreePine, ShoppingBag, Lightbulb, BookOpen, Users, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CANOPEE = '#1E4D2B'
const CREME   = '#FBF7EF'
const MANGUE  = '#E8A13D'

const STEPS = [
  { key: 'substrat',     Icon: FlaskConical, step: 1 },
  { key: 'semis',        Icon: Sprout,       step: 2 },
  { key: 'germination',  Icon: Sun,          step: 3 },
  { key: 'croissance',   Icon: Leaf,         step: 4 },
  { key: 'durcissement', Icon: TreePine,     step: 5 },
  { key: 'vente',        Icon: ShoppingBag,  step: 6 },
]

const CATEGORY_KEYS = ['epices', 'salades', 'bredes', 'legumes', 'melons']
const CATEGORY_EMOJI = { epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈' }

const IDEAS_ICONS = [BookOpen, BookOpen, Users, Video]
const VARIETY_ICONS = ['🌱', '🌸', '🥬', '🌶️', '🌿']

export default function NosProcess() {
  const { t } = useTranslation()

  return (
    <div className="font-nunito">

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{ backgroundColor: CANOPEE }}
      >
        <div className="bg-alveoles absolute inset-0 opacity-40" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: MANGUE }}>
            TRK Agriculture
          </p>
          <h1
            className="font-bricolage text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
          >
            {t('process.title')}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(251,247,239,0.85)' }}>
            {t('process.subtitle')}
          </p>
        </div>
      </div>

      {/* Culture en plateau */}
      <section className="py-14 md:py-20" style={{ backgroundColor: CREME }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="font-bricolage text-2xl md:text-3xl font-bold mb-4" style={{ color: CANOPEE }}>
              {t('process.plateauTitle')}
            </h2>
            <p className="text-stone-600 leading-relaxed text-[15px]">
              {t('process.plateauDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <PlateauCard
              count={128}
              title={t('process.standard128')}
              desc={t('process.standard128Desc')}
              cols={16}
              rows={8}
            />
            <PlateauCard
              count={98}
              title={t('process.cucu98')}
              desc={t('process.cucu98Desc')}
              cols={14}
              rows={7}
              accent
            />
          </div>
        </div>
      </section>

      {/* Les 6 étapes */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2
            className="font-bricolage text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: CANOPEE }}
          >
            {t('process.stepsTitle')}
          </h2>

          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div
              className="absolute left-8 top-0 bottom-0 w-0.5 hidden sm:block"
              style={{ backgroundColor: 'rgba(30,77,43,0.15)' }}
            />

            <div className="space-y-8">
              {STEPS.map(({ key, Icon, step }) => (
                <div key={key} className="flex gap-5 relative">
                  <div
                    className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: step % 2 === 0 ? CANOPEE : CREME, border: `2px solid ${CANOPEE}` }}
                  >
                    <Icon
                      className="h-7 w-7"
                      style={{ color: step % 2 === 0 ? '#fff' : CANOPEE }}
                    />
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow"
                      style={{ backgroundColor: MANGUE }}
                    >
                      {step}
                    </span>
                  </div>
                  <div className="pt-2 pb-4">
                    <h3
                      className="font-bricolage font-semibold text-base md:text-lg mb-1"
                      style={{ color: CANOPEE }}
                    >
                      {t(`process.steps.${key}.title`)}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {t(`process.steps.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Durées par catégorie */}
      <section className="py-14 md:py-20" style={{ backgroundColor: CREME }}>
        <div className="container mx-auto px-4">
          <h2
            className="font-bricolage text-2xl md:text-3xl font-bold text-center mb-3"
            style={{ color: CANOPEE }}
          >
            {t('process.durationsTitle')}
          </h2>
          <p className="text-center text-sm text-stone-500 mb-10 max-w-xl mx-auto">
            {t('process.durationsNote')}
          </p>

          <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ borderColor: 'rgba(30,77,43,0.15)' }}>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr style={{ backgroundColor: CANOPEE }}>
                  {['category','germination','nursery','total','examples'].map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold text-white text-xs uppercase tracking-wider"
                    >
                      {t(`process.durationCols.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORY_KEYS.map((key, i) => {
                  const d = t(`process.durations.${key}`, { returnObjects: true })
                  return (
                    <tr
                      key={key}
                      className="border-t transition-colors hover:bg-white/60"
                      style={{ borderColor: 'rgba(30,77,43,0.08)', backgroundColor: i % 2 === 0 ? 'white' : 'rgba(251,247,239,0.6)' }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: CANOPEE }}>
                        <span className="mr-2">{CATEGORY_EMOJI[key]}</span>
                        {t(`calendrier.categories.${key}`)}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{d.germination}</td>
                      <td className="px-4 py-3 text-stone-600">{d.nursery}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: MANGUE }}>
                        {d.total}
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">{d.examples}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA catalogue */}
      <div className="py-10 text-center" style={{ backgroundColor: CANOPEE }}>
        <div className="bg-alveoles absolute inset-0 pointer-events-none" style={{ position: 'relative' }}>
          <Button
            asChild
            size="lg"
            className="font-bricolage font-semibold text-base px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: MANGUE, color: '#fff', border: 'none' }}
          >
            <Link to="/catalogue">{t('home.hero.cta')}</Link>
          </Button>
        </div>
      </div>

      {/* Idées pour la suite */}
      <section className="py-14 md:py-20" style={{ backgroundColor: CREME }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Lightbulb className="h-6 w-6" style={{ color: MANGUE }} />
            <h2
              className="font-bricolage text-2xl md:text-3xl font-bold"
              style={{ color: CANOPEE }}
            >
              {t('process.ideasTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contenus */}
            <div
              className="rounded-2xl p-6 border shadow-sm"
              style={{ backgroundColor: 'white', borderColor: 'rgba(30,77,43,0.12)' }}
            >
              <h3
                className="font-bricolage font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: CANOPEE }}
              >
                <BookOpen className="h-5 w-5" />
                {t('process.ideasContentTitle')}
              </h3>
              <ul className="space-y-3">
                {(t('process.ideasContent', { returnObjects: true }) || []).map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600 leading-relaxed">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                      style={{ backgroundColor: MANGUE }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nouvelles variétés */}
            <div
              className="rounded-2xl p-6 border shadow-sm"
              style={{ backgroundColor: 'white', borderColor: 'rgba(30,77,43,0.12)' }}
            >
              <h3
                className="font-bricolage font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: CANOPEE }}
              >
                <Sprout className="h-5 w-5" />
                {t('process.ideasVarietiesTitle')}
              </h3>
              <ul className="space-y-3">
                {(t('process.ideasVarieties', { returnObjects: true }) || []).map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5 text-base leading-none">{VARIETY_ICONS[i] || '🌱'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

function PlateauCard({ count, title, desc, cols, rows, accent = false }) {
  const cells = Array.from({ length: cols * rows })

  return (
    <div
      className="rounded-2xl p-6 border shadow-sm flex flex-col gap-4"
      style={{
        backgroundColor: accent ? '#fff' : CREME,
        borderColor: `rgba(30,77,43,${accent ? 0.25 : 0.12})`,
      }}
    >
      {/* Mini alvéole grid preview */}
      <div
        className="rounded-xl overflow-hidden p-3 flex-shrink-0"
        style={{ backgroundColor: CANOPEE + '12' }}
      >
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                height: 8,
                backgroundColor: accent ? MANGUE + '55' : CANOPEE + '40',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div
          className="text-3xl font-bricolage font-extrabold mb-1"
          style={{ color: accent ? MANGUE : CANOPEE }}
        >
          {count}
        </div>
        <div className="font-semibold text-sm mb-1" style={{ color: CANOPEE }}>
          {title}
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
