import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Tag, Leaf, CheckCircle2, Loader2, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidMauritiusPhone } from '@/lib/delivery'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const COMPANY_TYPES = ['hotel', 'restaurant', 'landscaper', 'green_space', 'other']
const VOLUMES = ['lt5', '5_20', '20_50', 'gt50', 'unknown']
const CATEGORIES = [
  { id: 'epices',  emoji: '🌿' },
  { id: 'salades', emoji: '🥬' },
  { id: 'bredes',  emoji: '🍃' },
  { id: 'legumes', emoji: '🥕' },
  { id: 'melons',  emoji: '🍈' },
]

const CAT_LABELS = {
  fr: { epices: 'Épices & Aromates', salades: 'Salades', bredes: 'Brèdes', legumes: 'Légumes variés', melons: 'Melons & Pastèques' },
  en: { epices: 'Herbs & Spices', salades: 'Salads', bredes: 'Mauritian Greens', legumes: 'Vegetables', melons: 'Melons' },
}

const PLACEHOLDER_LOGOS = [
  { label: 'Hôtel Côte d\'Or', initials: 'HCO' },
  { label: 'Restaurant Le Lagon', initials: 'RLL' },
  { label: 'Sands Resort', initials: 'SR' },
  { label: 'Jardin & Co', initials: 'J&C' },
]

function genRef() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `INQ-${date}-${rand}`
}

export default function B2B() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const [form, setForm] = useState({
    business_type: '', business_name: '', contact_name: '',
    email: '', phone: '', estimated_volume: '',
    varieties_interested: [], message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function toggleCategory(id) {
    setForm(f => ({
      ...f,
      varieties_interested: f.varieties_interested.includes(id)
        ? f.varieties_interested.filter(c => c !== id)
        : [...f.varieties_interested, id],
    }))
  }

  function validate() {
    const e = {}
    if (!form.business_type) e.business_type = true
    if (!form.business_name.trim()) e.business_name = true
    if (!form.contact_name.trim()) e.contact_name = true
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    if (!form.phone.trim() || !isValidMauritiusPhone(form.phone)) e.phone = true
    if (!form.estimated_volume) e.estimated_volume = true
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const ref = genRef()
      const { error } = await supabase.from('b2b_inquiries').insert({
        business_type: form.business_type,
        business_name: form.business_name.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        estimated_volume: form.estimated_volume,
        varieties_interested: form.varieties_interested,
        message: form.message.trim() || null,
        status: 'new',
      })
      if (error) throw error
      setReference(ref)
    } catch (err) {
      toast({ title: t('b2b.form.errorTitle'), description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (reference) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-leaf" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold mb-2">{t('b2b.success.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('b2b.success.message')}</p>
        <p className="text-sm font-mono bg-muted rounded-lg px-4 py-2 inline-block mb-8 text-muted-foreground">
          {t('b2b.success.ref')} <span className="font-semibold text-foreground">{reference}</span>
        </p>
        <div>
          <Button size="lg" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              {t('b2b.success.back')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-cream-100 to-cream-200 py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <span className="inline-block bg-forest-800/10 text-forest-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            B2B
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('b2b.hero.title')}
          </h1>
          <p className="text-xl text-zinc-600 mb-8">{t('b2b.hero.subtitle')}</p>
          <Button size="lg" className="text-base px-8 bg-mango text-forest-900 hover:bg-forest-800 hover:text-cream-50" asChild>
            <a href="#devis">{t('b2b.hero.cta')}</a>
          </Button>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center mb-10">{t('b2b.advantages.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { key: 'delivery', Icon: Calendar, color: 'bg-blue-50 text-blue-600' },
            { key: 'pricing',  Icon: Tag,      color: 'bg-amber-50 text-amber-600' },
            { key: 'variety',  Icon: Leaf,     color: 'bg-forest-800/8 text-leaf' },
          ].map(({ key, Icon, color }) => (
            <div key={key} className="rounded-2xl border p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{t(`b2b.advantages.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`b2b.advantages.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLIENTS (placeholder) ── */}
      <section className="bg-muted/30 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">{t('b2b.clients.title')}</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            {PLACEHOLDER_LOGOS.map(l => (
              <div
                key={l.label}
                className="w-32 h-16 rounded-xl bg-muted/60 border flex items-center justify-center grayscale"
                aria-label={l.label}
              >
                <span className="text-muted-foreground/40 font-bold text-sm tracking-wide">
                  {l.initials}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t('b2b.clients.placeholder')}</p>
        </div>
      </section>

      {/* ── FORMULAIRE ── */}
      <section id="devis" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">{t('b2b.form.title')}</h2>
            <p className="text-muted-foreground">{t('b2b.form.subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-forest-800/10 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Type + nom entreprise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <B2BField label={`${t('b2b.form.companyType')} *`} error={errors.business_type} t={t}>
                  <Select value={form.business_type} onValueChange={v => set('business_type', v)}>
                    <SelectTrigger className={errors.business_type ? 'border-destructive ring-1 ring-destructive' : ''}>
                      <SelectValue placeholder={t('b2b.form.companyTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {t(`b2b.form.types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </B2BField>

                <B2BField label={`${t('b2b.form.companyName')} *`} error={errors.business_name} t={t}>
                  <Input
                    placeholder={lang === 'fr' ? 'Ex: Restaurant Le Jardin' : 'Ex: Le Jardin Restaurant'}
                    value={form.business_name}
                    onChange={e => set('business_name', e.target.value)}
                    className={errors.business_name ? 'border-destructive ring-1 ring-destructive' : ''}
                  />
                </B2BField>
              </div>

              {/* Contact */}
              <B2BField label={`${t('b2b.form.contactName')} *`} error={errors.contact_name} t={t}>
                <Input
                  placeholder={t('b2b.form.contactNamePlaceholder')}
                  value={form.contact_name}
                  onChange={e => set('contact_name', e.target.value)}
                  className={errors.contact_name ? 'border-destructive ring-1 ring-destructive' : ''}
                />
              </B2BField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <B2BField label={`${t('b2b.form.email')} *`} error={errors.email} t={t}>
                  <Input
                    type="email"
                    placeholder="contact@votre-entreprise.mu"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={errors.email ? 'border-destructive ring-1 ring-destructive' : ''}
                  />
                </B2BField>
                <B2BField label={`${t('b2b.form.phone')} *`} error={errors.phone} t={t}>
                  <Input
                    type="tel"
                    placeholder="+230 5 XXX XXXX"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className={errors.phone ? 'border-destructive ring-1 ring-destructive' : ''}
                  />
                </B2BField>
              </div>

              {/* Volume */}
              <B2BField label={`${t('b2b.form.volume')} *`} error={errors.estimated_volume} t={t}>
                <Select value={form.estimated_volume} onValueChange={v => set('estimated_volume', v)}>
                  <SelectTrigger className={errors.estimated_volume ? 'border-destructive ring-1 ring-destructive' : ''}>
                    <SelectValue placeholder={t('b2b.form.volumePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {VOLUMES.map(v => (
                      <SelectItem key={v} value={v}>
                        {t(`b2b.form.volumes.${v}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </B2BField>

              {/* Catégories */}
              <div>
                <p className="text-sm font-medium mb-2">{t('b2b.form.categories')}</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => {
                    const active = form.varieties_interested.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          active
                            ? 'bg-forest-800 text-cream-50 border-forest-800'
                            : 'bg-background border-border hover:border-forest-800/50'
                        }`}
                      >
                        <span aria-hidden>{cat.emoji}</span>
                        {CAT_LABELS[lang][cat.id]}
                        {active && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message */}
              <B2BField label={t('b2b.form.message')} t={t}>
                <textarea
                  rows={4}
                  placeholder={t('b2b.form.messagePlaceholder')}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </B2BField>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-mango text-forest-900 hover:bg-forest-800 hover:text-cream-50"
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('b2b.form.submitting')}</>
                  : t('b2b.form.submit')
                }
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

function B2BField({ label, error, t, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{t('b2b.form.required')}</p>}
    </div>
  )
}
