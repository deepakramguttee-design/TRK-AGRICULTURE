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

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

const PLACEHOLDER_LOGOS = [
  { label: 'Hôtel Côte d\'Or', initials: 'HCO' },
  { label: 'Restaurant Le Lagon', initials: 'RLL' },
  { label: 'Sands Resort', initials: 'SR' },
  { label: 'Jardin & Co', initials: 'J&C' },
]

export default function B2B() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const [form, setForm] = useState({
    company_type: '', company_name: '', contact_name: '',
    email: '', phone: '', volume_monthly: '',
    categories: [], message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function toggleCategory(id) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter(c => c !== id)
        : [...f.categories, id],
    }))
  }

  function validate() {
    const e = {}
    if (!form.company_type) e.company_type = true
    if (!form.company_name.trim()) e.company_name = true
    if (!form.contact_name.trim()) e.contact_name = true
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    if (!form.phone.trim() || !isValidMauritiusPhone(form.phone)) e.phone = true
    if (!form.volume_monthly) e.volume_monthly = true
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('b2b_inquiries').insert({
        company_type: form.company_type,
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        volume_monthly: form.volume_monthly,
        categories: form.categories,
        message: form.message.trim() || null,
        status: 'new',
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-primary" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold mb-2">{t('b2b.success.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('b2b.success.message')}</p>
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            {t('b2b.success.back')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            B2B
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('b2b.hero.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">{t('b2b.hero.subtitle')}</p>
          <Button size="lg" className="text-base px-8" asChild>
            <a href="#devis">{t('b2b.hero.cta')}</a>
          </Button>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">{t('b2b.advantages.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'delivery', Icon: Calendar, color: 'bg-blue-50 text-blue-600' },
            { key: 'pricing',  Icon: Tag,      color: 'bg-amber-50 text-amber-600' },
            { key: 'variety',  Icon: Leaf,     color: 'bg-green-50 text-green-600' },
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
      <section className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            {t('b2b.clients.title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {PLACEHOLDER_LOGOS.map(l => (
              <div
                key={l.label}
                className="w-28 h-14 rounded-xl bg-muted/60 border flex items-center justify-center"
                aria-label={l.label}
              >
                <span className="text-muted-foreground/40 font-bold text-sm tracking-wide">
                  {l.initials}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE ── */}
      <section id="devis" className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">{t('b2b.form.title')}</h2>
          <p className="text-muted-foreground">{t('b2b.form.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Type + nom entreprise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <B2BField label={`${t('b2b.form.companyType')} *`} error={errors.company_type}>
              <Select value={form.company_type} onValueChange={v => set('company_type', v)}>
                <SelectTrigger className={errors.company_type ? 'border-destructive ring-1 ring-destructive' : ''}>
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

            <B2BField label={`${t('b2b.form.companyName')} *`} error={errors.company_name}>
              <Input
                placeholder="TRK Hôtel Ltd"
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                className={errors.company_name ? 'border-destructive ring-1 ring-destructive' : ''}
              />
            </B2BField>
          </div>

          {/* Contact */}
          <B2BField label={`${t('b2b.form.contactName')} *`} error={errors.contact_name}>
            <Input
              placeholder={lang === 'fr' ? 'Jean Martin' : 'John Martin'}
              value={form.contact_name}
              onChange={e => set('contact_name', e.target.value)}
              className={errors.contact_name ? 'border-destructive ring-1 ring-destructive' : ''}
            />
          </B2BField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <B2BField label={`${t('b2b.form.email')} *`} error={errors.email}>
              <Input
                type="email"
                placeholder="contact@hotel.mu"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={errors.email ? 'border-destructive ring-1 ring-destructive' : ''}
              />
            </B2BField>
            <B2BField label={`${t('b2b.form.phone')} *`} error={errors.phone}>
              <Input
                type="tel"
                placeholder="52 345 678"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={errors.phone ? 'border-destructive ring-1 ring-destructive' : ''}
              />
            </B2BField>
          </div>

          {/* Volume */}
          <B2BField label={`${t('b2b.form.volume')} *`} error={errors.volume_monthly}>
            <Select value={form.volume_monthly} onValueChange={v => set('volume_monthly', v)}>
              <SelectTrigger className={errors.volume_monthly ? 'border-destructive ring-1 ring-destructive' : ''}>
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

          {/* Catégories multi-select */}
          <div>
            <p className="text-sm font-medium mb-2">{t('b2b.form.categories')}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const active = form.categories.includes(cat.id)
                const catKey = { epices: 'epices', salades: 'salades', bredes: 'bredes', legumes: 'legumes', melons: 'melons' }[cat.id]
                const labels = {
                  fr: { epices: 'Épices & Aromates', salades: 'Salades', bredes: 'Brèdes', legumes: 'Légumes variés', melons: 'Melons & Pastèques' },
                  en: { epices: 'Herbs & Spices', salades: 'Salads', bredes: 'Mauritian Greens', legumes: 'Vegetables', melons: 'Melons' },
                }
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/60'
                    }`}
                  >
                    <span aria-hidden>{cat.emoji}</span>
                    {labels[lang][catKey]}
                    {active && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <B2BField label={t('b2b.form.message')}>
            <textarea
              rows={4}
              placeholder={t('b2b.form.messagePlaceholder')}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </B2BField>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('b2b.form.submitting')}</>
              : t('b2b.form.submit')
            }
          </Button>
        </form>
      </section>
    </div>
  )
}

function B2BField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">Ce champ est requis</p>}
    </div>
  )
}
