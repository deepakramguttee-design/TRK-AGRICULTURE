import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Truck, X } from 'lucide-react'

export default function PromoBanner() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem('trk_promo_v2'))

  if (dismissed || pathname.startsWith('/admin')) return null

  function dismiss() {
    sessionStorage.setItem('trk_promo_v2', '1')
    setDismissed(true)
  }

  return (
    <div className="relative bg-forest-800 text-cream-50 z-30">
      <div className="container mx-auto flex items-center justify-center gap-2.5 px-10 py-2">
        <Truck className="h-3.5 w-3.5 shrink-0 text-mango" aria-hidden />
        <p className="text-xs font-medium">
          <strong className="font-bold">{t('promo.freeDelivery')}</strong>
          <span className="text-cream-100/80">{t('promo.freeDeliveryDesc')}</span>
          {' — '}
          <Link
            to="/catalogue"
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            {t('promo.orderNow')}
          </Link>
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label={t('promo.close')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-100/60 hover:text-cream-50 transition-colors p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
