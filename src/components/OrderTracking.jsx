import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useOrderStatusLabels, MAX_STEP } from '@/hooks/useOrderStatusLabels'

/**
 * Barre de suivi de commande à 5 étapes, alimentée par order_status_labels.
 * S'abonne en temps réel aux UPDATE de la commande (filtre sur son id) :
 * le statut change sous les yeux du client, sans rechargement.
 */
export default function OrderTracking({ order }) {
  const { i18n } = useTranslation()
  const { ready, getLabel, getStep, getStepLabel } = useOrderStatusLabels()
  const [status, setStatus] = useState(order.status)

  // Le parent peut aussi rafraîchir le statut (ex. abonnement par client)
  useEffect(() => { setStatus(order.status) }, [order.status])

  useEffect(() => {
    if (!order.id) return
    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        payload => { if (payload.new?.status) setStatus(payload.new.status) },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  if (!ready) return null

  const lang = i18n.language
  const ft = order.fulfillment_type
  const currentStep = getStep(status, ft)

  // Commande annulée : bandeau, pas de barre de progression
  if (status === 'cancelled' || currentStep === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <XCircle className="h-4 w-4 shrink-0" />
        {getLabel('cancelled', ft, lang)}
      </div>
    )
  }

  if (currentStep == null) return null

  const steps = Array.from({ length: MAX_STEP }, (_, i) => i + 1)

  return (
    <div className="pt-1">
      <ol className="flex items-start">
        {steps.map(step => {
          const isDone = step < currentStep
          const isCurrent = step === currentStep
          return (
            <li key={step} className="flex-1 flex flex-col items-center relative">
              {/* Trait de liaison vers l'étape précédente */}
              {step > 1 && (
                <span
                  aria-hidden
                  className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                    step <= currentStep ? 'bg-green-600' : 'bg-border'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                  isDone
                    ? 'border-green-600 bg-green-600 text-white'
                    : isCurrent
                    ? 'border-green-600 bg-white text-green-700 ring-4 ring-green-100'
                    : 'border-border bg-white text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span
                className={`mt-1.5 px-0.5 text-center text-[10px] leading-tight sm:text-[11px] ${
                  isCurrent ? 'font-semibold text-green-700' : isDone ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {getStepLabel(step, status, ft, lang)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
