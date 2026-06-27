import { useParams, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Home, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function OrderConfirmation() {
  const { orderNumber } = useParams()
  const { state } = useLocation()
  const { t } = useTranslation()
  const { user } = useAuth()

  const name = state?.name || '—'
  const total = state?.total != null ? `Rs ${Number(state.total).toFixed(2)}` : '—'
  const district = state?.district || '—'

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="flex items-center justify-center mb-6">
        <CheckCircle2 className="h-20 w-20 text-primary" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold mb-2">{t('confirmation.title')}</h1>
      <p className="text-muted-foreground mb-1">{t('confirmation.subtitle')}</p>

      <p className="text-lg font-semibold text-primary mt-4 mb-1">
        {t('confirmation.orderNumber')} : {orderNumber}
      </p>
      <p className="text-muted-foreground text-sm mb-8">{t('confirmation.message')}</p>

      {/* Récap */}
      <div className="border rounded-xl p-5 text-left space-y-3 mb-8 bg-muted/30">
        <InfoRow label={t('confirmation.name')} value={name} />
        <InfoRow label={t('confirmation.district')} value={district} />
        <InfoRow label={t('confirmation.total')} value={total} bold />
      </div>

      {/* Banner compte pour invités */}
      {!user && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-left mb-6">
          <div className="flex items-start gap-3">
            <UserPlus className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 text-sm mb-1">{t('confirmation.trackOrders')}</p>
              <p className="text-xs text-green-700 mb-3">
                {t('confirmation.createAccountDesc')}
              </p>
              <Button size="sm" variant="outline" asChild
                className="border-green-400 text-green-800 hover:bg-green-100">
                <Link to="/login">{t('confirmation.createAccount')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button size="lg" className="w-full" asChild>
        <Link to="/">
          <Home className="h-4 w-4 mr-2" />
          {t('confirmation.backHome')}
        </Link>
      </Button>
    </div>
  )
}

function InfoRow({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'font-bold text-primary' : 'font-medium'}>{value}</span>
    </div>
  )
}
