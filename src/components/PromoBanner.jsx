import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Truck, X } from 'lucide-react'

export default function PromoBanner() {
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem('trk_promo_v2'))

  if (dismissed || pathname.startsWith('/admin')) return null

  function dismiss() {
    sessionStorage.setItem('trk_promo_v2', '1')
    setDismissed(true)
  }

  return (
    <div className="relative bg-green-700 text-white z-30">
      <div className="container mx-auto flex items-center justify-center gap-2.5 px-10 py-2">
        <Truck className="h-3.5 w-3.5 shrink-0 text-green-300" aria-hidden />
        <p className="text-xs font-medium">
          <strong className="font-bold">Livraison gratuite</strong>
          <span className="text-green-200"> sur toutes vos commandes</span>
          {' — '}
          <Link
            to="/catalogue"
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Commander maintenant
          </Link>
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Fermer la bannière"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300 hover:text-white transition-colors p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
