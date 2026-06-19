import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Loader2, CreditCard, Banknote, CheckCircle2, Smartphone, Copy, Check, MapPin, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_EMOJI } from '@/components/ProductCard'
import { DISTRICTS, FREE_DELIVERY_THRESHOLD, getDeliveryFee, isValidMauritiusPhone } from '@/lib/delivery'
import { getProvider, MipsProvider } from '@/lib/payments'
import { useAuth } from '@/contexts/AuthContext'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const SLOTS = ['morning', 'afternoon', 'any']
const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
const PICKUP_LAT = -20.322619
const PICKUP_LNG = 57.465368

export default function Checkout() {
  const { t, i18n } = useTranslation()
  const { items, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const [form, setForm] = useState({ name: '', phone: '', email: '', district: '', address: '', slot: 'any', notes: '' })
  const [deliveryMode, setDeliveryMode] = useState('delivery')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [juicePhase, setJuicePhase] = useState(null)  // { orderId, orderNumber, total }
  const [juiceTxnRef, setJuiceTxnRef] = useState('')
  const [juiceTxnError, setJuiceTxnError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [discountPct, setDiscountPct] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase.from('customers')
      .select('discount_pct, full_name, phone, address, district')
      .eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        if (data.discount_pct) setDiscountPct(data.discount_pct)
        setForm(f => ({
          ...f,
          name:     data.full_name || f.name,
          phone:    data.phone     || f.phone,
          address:  data.address   || f.address,
          district: data.district  || f.district,
        }))
      })
  }, [user])

  const deliveryFee = deliveryMode === 'pickup' ? 0 : getDeliveryFee(form.district, cartTotal)
  const discountMur = discountPct > 0 ? Math.round(cartTotal * discountPct) / 100 : 0
  const total = cartTotal + deliveryFee - discountMur
  const juiceProvider = getProvider('juice')
  const mipsProvider  = MipsProvider

  if (items.length === 0 && !juicePhase) {
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
    if (deliveryMode === 'delivery') {
      if (!form.district) e.district = true
      if (!form.address.trim()) e.address = true
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/place-order`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            items: items.map(i => ({ id: i.id, quantity: i.quantity })),
            form,
            deliveryMode,
            paymentMethod,
          }),
        },
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande')

      clearCart()

      if (paymentMethod === 'juice') {
        setJuicePhase({ orderId: data.order_id, orderNumber: data.order_number, total: data.total_mur })
        return
      }

      if (paymentMethod === 'mips') {
        mipsProvider.redirectToGateway(data.order_number, data.total_mur)
        return
      }

      navigate(`/commande/confirmee/${data.order_number}`, {
        replace: true,
        state: { name: form.name, total: data.total_mur, district: form.district, deliveryFee: data.delivery_fee_mur },
      })
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJuiceConfirm() {
    if (!juiceTxnRef.trim()) { setJuiceTxnError(true); return }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ provider_txn_id: juiceTxnRef.trim() })
        .eq('id', juicePhase.orderId)
      if (error) throw error
      navigate(`/commande/confirmee/${juicePhase.orderNumber}`, {
        replace: true,
        state: { name: form.name, total: juicePhase.total, district: form.district, deliveryFee, paymentMethod: 'juice' },
      })
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── Phase 2 : écran de paiement Juice ──────────────────────
  if (juicePhase) {
    return (
      <JuiceScreen
        orderNumber={juicePhase.orderNumber}
        total={juicePhase.total}
        juiceTxnRef={juiceTxnRef}
        setJuiceTxnRef={v => { setJuiceTxnRef(v); setJuiceTxnError(false) }}
        juiceTxnError={juiceTxnError}
        onConfirm={handleJuiceConfirm}
        saving={saving}
        t={t}
        provider={juiceProvider}
      />
    )
  }

  // ── Phase 1 : formulaire ────────────────────────────────────
  const fieldClass = f => `${inputClass} ${errors[f] ? 'border-destructive ring-1 ring-destructive' : ''}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/panier"><ChevronLeft className="h-4 w-4 mr-1" />{t('checkout.backToCart')}</Link>
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
                  <Input placeholder={t('checkout.namePlaceholder')} value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={errors.name ? 'border-destructive ring-1 ring-destructive' : ''} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={`${t('checkout.phone')} *`} error={errors.phone} hint={errors.phone ? t('checkout.phoneError') : undefined}>
                    <Input type="tel" placeholder={t('checkout.phonePlaceholder')} value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className={errors.phone ? 'border-destructive ring-1 ring-destructive' : ''} />
                  </Field>
                  <Field label={t('checkout.email')} error={errors.email}>
                    <Input type="email" placeholder="email@exemple.mu" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className={errors.email ? 'border-destructive ring-1 ring-destructive' : ''} />
                  </Field>
                </div>
              </div>
            </section>

            {/* Livraison */}
            <section>
              <h2 className="font-semibold text-base mb-4 pb-2 border-b">{t('checkout.delivery')}</h2>

              {/* Mode toggle */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('delivery')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 text-sm text-left transition-all ${
                    deliveryMode === 'delivery'
                      ? 'border-primary bg-primary/5 font-medium text-primary'
                      : 'border-border hover:border-stone-300 hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <Truck className={`h-4 w-4 shrink-0 ${deliveryMode === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">{t('checkout.deliveryMode')}</p>
                    <p className="text-xs text-muted-foreground">{t('checkout.deliveryModeDesc')}</p>
                  </div>
                  {deliveryMode === 'delivery' && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">✓</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode('pickup')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 text-sm text-left transition-all ${
                    deliveryMode === 'pickup'
                      ? 'border-green-500 bg-green-50 font-medium text-green-800'
                      : 'border-border hover:border-stone-300 hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <MapPin className={`h-4 w-4 shrink-0 ${deliveryMode === 'pickup' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">{t('checkout.pickupMode')}</p>
                    <p className="text-xs text-muted-foreground">{t('checkout.pickupModeDesc')}</p>
                  </div>
                  {deliveryMode === 'pickup' && (
                    <span className="ml-auto text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">✓</span>
                  )}
                </button>
              </div>

              {deliveryMode === 'pickup' ? (
                /* Pickup info */
                <div className="rounded-lg border border-green-200 bg-green-50/40 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-green-900">{t('checkout.pickupAddress')}</p>
                      <p className="text-sm text-green-700">{t('checkout.pickupAddressDetail')}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${PICKUP_LAT},${PICKUP_LNG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
                  >
                    <MapPin className="h-3 w-3" />
                    {t('checkout.pickupGps')}
                  </a>
                  <p className="text-xs text-green-700 leading-relaxed">{t('checkout.pickupNote')}</p>
                  <Field label={t('checkout.notes')}>
                    <textarea rows={2} placeholder={t('checkout.notesPlaceholder')} value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      className={`${inputClass} resize-none`} />
                  </Field>
                </div>
              ) : (
                /* Delivery fields */
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
                              {d.name}{cartTotal >= FREE_DELIVERY_THRESHOLD ? ` — ${t('cart.free')}` : ` — Rs ${d.fee}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={t('checkout.slot')}>
                      <Select value={form.slot} onValueChange={v => set('slot', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <textarea rows={3} placeholder={t('checkout.addressPlaceholder')} value={form.address}
                      onChange={e => set('address', e.target.value)}
                      className={`${fieldClass('address')} resize-none`} />
                  </Field>
                  <Field label={t('checkout.notes')}>
                    <textarea rows={2} placeholder={t('checkout.notesPlaceholder')} value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      className={`${inputClass} resize-none`} />
                  </Field>
                </div>
              )}
            </section>

            {/* Paiement */}
            <section>
              <h2 className="font-semibold text-base mb-4 pb-2 border-b">{t('checkout.payment')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <PaymentOption
                  icon={<Banknote className="h-5 w-5" />}
                  label={t('checkout.cod')}
                  selected={paymentMethod === 'cod'}
                  onClick={() => setPaymentMethod('cod')}
                />
                <PaymentOption
                  icon={<Smartphone className="h-5 w-5" />}
                  label={t('checkout.juice')}
                  selected={paymentMethod === 'juice'}
                  onClick={() => setPaymentMethod('juice')}
                  accent
                />
                <PaymentOption
                  icon={<CreditCard className="h-5 w-5" />}
                  label={t('checkout.mips')}
                  selected={paymentMethod === 'mips'}
                  onClick={() => mipsProvider.isAvailable && setPaymentMethod('mips')}
                  disabled={!mipsProvider.isAvailable}
                  badge={!mipsProvider.isAvailable ? t('checkout.mipsSoon') : undefined}
                />
              </div>

              {paymentMethod === 'juice' && (
                <div className="rounded-lg border border-green-200 bg-green-50/60 p-4 text-sm text-green-800">
                  <p className="font-medium mb-1">💚 {t('checkout.juiceInfo.title')}</p>
                  <p className="text-green-700 text-xs leading-relaxed">{t('checkout.juiceInfo.notice')}</p>
                </div>
              )}

              {paymentMethod === 'mips' && mipsProvider.isAvailable && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">💳 {t('checkout.mipsInfo.title')}</p>
                  <p className="text-blue-700 text-xs leading-relaxed">{t('checkout.mipsInfo.notice')}</p>
                </div>
              )}
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
                          : <span aria-hidden>{CATEGORY_EMOJI[item.category] || '🌱'}</span>}
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
                  <span>{
                    deliveryMode === 'pickup'
                      ? t('checkout.pickupFee')
                      : form.district
                        ? (deliveryFee === 0 ? t('cart.free') : `Rs ${deliveryFee.toFixed(2)}`)
                        : '—'
                  }</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-medium">{t('checkout.discountLabel', { pct: discountPct })}</span>
                    <span className="font-medium">− Rs {discountMur.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">{t('cart.total')}</span>
                <span className="text-xl font-bold text-primary">Rs {total.toFixed(2)}</span>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('checkout.submitting')}</>
                  : paymentMethod === 'juice' ? t('checkout.juiceSubmit')
                  : paymentMethod === 'mips'  ? t('checkout.mipsSubmit')
                  : t('checkout.submit')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── Phase 2 : Écran paiement Juice ──────────────────────────────
function JuiceScreen({ orderNumber, total, juiceTxnRef, setJuiceTxnRef, juiceTxnError, onConfirm, saving, t, provider }) {
  const amount = `Rs ${Number(total).toFixed(2)}`
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  function copyText(text, setCopied) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">

      {/* En-tête commande créée */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-1">{t('checkout.juiceStep.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('checkout.juiceStep.subtitle')}</p>
        <p className="mt-2 text-sm font-semibold text-primary">
          {t('confirmation.orderNumber')} : {orderNumber}
        </p>
      </div>

      {/* Carte instructions Juice */}
      <div className="rounded-2xl border border-green-200 bg-green-50/40 overflow-hidden mb-6">

        {/* Header vert */}
        <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-green-100" />
          <span className="text-white font-semibold text-sm">MCB Juice</span>
        </div>

        {/* Détails paiement */}
        <div className="p-5 space-y-3">

          <DetailRow label={t('checkout.juiceStep.beneficiary')} value={provider.beneficiaryName} />

          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">{t('checkout.juiceStep.juiceNumber')}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm tracking-widest">{provider.beneficiaryNumber}</span>
              <CopyBtn copied={copiedNumber} onClick={() => copyText(provider.beneficiaryNumber, setCopiedNumber)} t={t} />
            </div>
          </div>

          {/* Montant — mis en valeur */}
          <div className="rounded-xl bg-white border border-green-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-stone-600">{t('checkout.juiceStep.amount')}</span>
            <span className="font-display text-2xl font-bold text-green-700">{amount}</span>
          </div>

          {/* Référence à mettre en libellé */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-xs text-amber-700 font-medium mb-2">📋 {t('checkout.juiceStep.refLabel')}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-stone-900 text-sm tracking-wide">{orderNumber}</span>
              <CopyBtn copied={copiedRef} onClick={() => copyText(orderNumber, setCopiedRef)} t={t} />
            </div>
            <p className="text-[11px] text-amber-600 mt-1.5">{t('checkout.juiceStep.refNote')}</p>
          </div>

          {/* Étapes */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">{t('checkout.juiceStep.steps')}</p>
            <ol className="space-y-2">
              {[
                t('checkout.juiceStep.step1'),
                t('checkout.juiceStep.step2', { amount, number: provider.beneficiaryNumber }),
                t('checkout.juiceStep.step3', { ref: orderNumber }),
                t('checkout.juiceStep.step4'),
                t('checkout.juiceStep.step5'),
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-stone-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="leading-tight pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Champ ID transaction */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5">
          {t('checkout.juiceStep.txnLabel')}
        </label>
        <Input
          placeholder={t('checkout.juiceStep.txnPlaceholder')}
          value={juiceTxnRef}
          onChange={e => setJuiceTxnRef(e.target.value)}
          className={juiceTxnError ? 'border-destructive ring-1 ring-destructive' : ''}
        />
        {juiceTxnError && (
          <p className="text-xs text-destructive mt-1">{t('checkout.juiceStep.txnError')}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{t('checkout.juiceStep.txnHint')}</p>
      </div>

      <Button onClick={onConfirm} className="w-full" size="lg" disabled={saving}>
        {saving
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('checkout.juiceStep.confirming')}</>
          : t('checkout.juiceStep.confirm')}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
        {t('checkout.juiceStep.notice')}
      </p>
    </div>
  )
}

function CopyBtn({ copied, onClick, t }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white border border-stone-200 hover:bg-stone-50 transition-colors text-stone-600 shrink-0">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? t('checkout.juiceStep.copied') : t('checkout.juiceStep.copy')}
    </button>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
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

function PaymentOption({ icon, label, selected, onClick, accent, disabled, badge }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 text-sm w-full text-left transition-all duration-150
        ${disabled
          ? 'border-border opacity-50 cursor-not-allowed'
          : selected
            ? accent
              ? 'border-green-500 bg-green-50 font-medium text-green-800'
              : 'border-primary bg-primary/5 font-medium'
            : 'border-border hover:border-stone-300 hover:bg-muted/30'
        }`}
    >
      <span className={disabled ? 'text-muted-foreground' : selected && accent ? 'text-green-600' : selected ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && !selected && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 font-medium shrink-0">
          {badge}
        </span>
      )}
      {selected && !disabled && (
        <span className={`text-xs px-1.5 py-0.5 rounded ${accent ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground'}`}>
          ✓
        </span>
      )}
    </button>
  )
}
