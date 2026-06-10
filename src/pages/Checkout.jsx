import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Loader2, CreditCard, Banknote } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_EMOJI } from '@/components/ProductCard'
import { DISTRICTS, getDeliveryFee, isValidMauritiusPhone } from '@/lib/delivery'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const SLOTS = ['morning', 'afternoon', 'any']

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

export default function Checkout() {
  const { t, i18n } = useTranslation()
  const { items, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    district: '', address: '', slot: 'any', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const deliveryFee = getDeliveryFee(form.district, cartTotal)
  const total = cartTotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">{t('cart.empty')}</p>
        <Button asChild><Link to="/catalogue">{t('cart.discover')}</Link></Button>
      </div>
    )
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = true
    if (!form.phone.trim() || !isValidMauritiusPhone(form.phone)) e.phone = true
    if (!form.district) e.district = true
    if (!form.address.trim()) e.address = true
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const slotLabel = { morning: t('checkout.slotMorning'), afternoon: t('checkout.slotAfternoon'), any: t('checkout.slotAny') }[form.slot]
      const notes = [
        `Nom: ${form.name}`,
        `Tél: ${form.phone}`,
        `District: ${form.district}`,
        `Adresse: ${form.address}`,
        `Créneau: ${slotLabel}`,
        form.notes ? `Notes: ${form.notes}` : '',
      ].filter(Boolean).join('\n')

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          guest_phone: form.phone,
          guest_email: form.email || null,
          status: 'pending',
          payment_method: 'cod',
          payment_status: 'pending',
          subtotal_mur: cartTotal,
          delivery_fee_mur: deliveryFee,
          total_mur: total,
          customer_notes: notes,
        })
        .select('id, order_number')
        .single()

      if (orderErr) throw orderErr

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_sku: item.sku,
        product_name: item.name_fr,
        unit_price_mur: item.price_mur,
        quantity: item.quantity,
        line_total_mur: Number((item.price_mur * item.quantity).toFixed(2)),
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      clearCart()
      navigate(`/commande/confirmee/${order.order_number}`, {
        replace: true,
        state: { name: form.name, total, district: form.district, deliveryFee },
      })
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = (field) =>
    `${inputClass} ${errors[field] ? 'border-destructive ring-1 ring-destructive' : ''}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/panier">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('checkout.backToCart')}
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Formulaire (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Coordonnées */}
            <section>
              <h2 className="font-semibold text-base mb-4 pb-2 border-b">{t('checkout.contact')}</h2>
              <div className="space-y-4">
                <Field label={`${t('checkout.name')} *`} error={errors.name}>
                  <Input
                    placeholder={t('checkout.namePlaceholder')}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={errors.name ? 'border-destructive ring-1 ring-destructive' : ''}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={`${t('checkout.phone')} *`} error={errors.phone} hint={errors.phone ? t('checkout.phoneError') : undefined}>
                    <Input
                      type="tel"
                      placeholder={t('checkout.phonePlaceholder')}
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className={errors.phone ? 'border-destructive ring-1 ring-destructive' : ''}
                    />
                  </Field>
                  <Field label={t('checkout.email')} error={errors.email}>
                    <Input
                      type="email"
                      placeholder="email@exemple.mu"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className={errors.email ? 'border-destructive ring-1 ring-destructive' : ''}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Livraison */}
            <section>
              <h2 className="font-semibold text-base mb-4 pb-2 border-b">{t('checkout.delivery')}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={`${t('checkout.district')} *`} error={errors.district}>
                    <Select value={form.district} onValueChange={v => set('district', v)}>
                      <SelectTrigger className={errors.district ? 'border-destructive ring-1 ring-destructive' : ''}>
                        <SelectValue placeholder={t('checkout.selectDistrict')} />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map(d => (
                          <SelectItem key={d.name} value={d.name}>
                            {d.name}
                            {cartTotal >= d.freeThreshold
                              ? ` — ${t('cart.free')}`
                              : ` — Rs ${d.fee}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={`${t('checkout.slot')}`}>
                    <Select value={form.slot} onValueChange={v => set('slot', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SLOTS.map(s => (
                          <SelectItem key={s} value={s}>
                            {t(`checkout.slot${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={`${t('checkout.address')} *`} error={errors.address}>
                  <textarea
                    rows={3}
                    placeholder={t('checkout.addressPlaceholder')}
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    className={`${fieldClass('address')} resize-none`}
                  />
                </Field>
                <Field label={t('checkout.notes')}>
                  <textarea
                    rows={2}
                    placeholder={t('checkout.notesPlaceholder')}
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            </section>

            {/* Paiement */}
            <section>
              <h2 className="font-semibold text-base mb-4 pb-2 border-b">{t('checkout.payment')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PaymentOption icon={<Banknote className="h-5 w-5" />} label={t('checkout.cod')} active />
                <PaymentOption icon={<CreditCard className="h-5 w-5" />} label={t('checkout.mips')} badge={t('checkout.mipsSoon')} disabled />
              </div>
            </section>

            <p className="text-xs text-muted-foreground">* {t('checkout.requiredFields')}</p>
          </div>

          {/* ── Récap sticky (1/3) ── */}
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="border rounded-xl p-5 bg-background space-y-3">
              <h2 className="font-semibold">{t('checkout.summary')}</h2>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map(item => {
                  const name = lang === 'en' ? (item.name_en || item.name_fr) : item.name_fr
                  return (
                    <div key={item.id} className="flex gap-2 text-sm">
                      <div className="w-8 h-8 flex-shrink-0 rounded bg-zinc-100 flex items-center justify-center text-base">
                        {item.image_url
                          ? <img src={item.image_url} alt="" className="w-full h-full object-cover rounded" />
                          : <span aria-hidden>{CATEGORY_EMOJI[item.category] || '🌱'}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-xs">{name}</p>
                        <p className="text-muted-foreground text-xs">{item.quantity} × Rs {Number(item.price_mur).toFixed(2)}</p>
                      </div>
                      <p className="text-xs font-semibold flex-shrink-0">Rs {(item.price_mur * item.quantity).toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span>Rs {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.delivery')}</span>
                  <span>{form.district
                    ? (deliveryFee === 0 ? t('cart.free') : `Rs ${deliveryFee.toFixed(2)}`)
                    : '—'
                  }</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">{t('cart.total')}</span>
                <span className="text-xl font-bold text-primary">Rs {total.toFixed(2)}</span>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('checkout.submitting')}</>
                  : t('checkout.submit')
                }
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-destructive mt-1">{hint}</p>}
      {error && !hint && <p className="text-xs text-destructive mt-1">Ce champ est requis</p>}
    </div>
  )
}

function PaymentOption({ icon, label, active, disabled, badge }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 text-sm
      ${active ? 'border-primary bg-primary/5 font-medium' : ''}
      ${disabled ? 'opacity-50 border-border' : ''}`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {active && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">✓</span>}
      {badge && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{badge}</span>}
    </div>
  )
}
