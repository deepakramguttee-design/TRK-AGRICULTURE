import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function MipsReturn() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  // MIPS peut renvoyer différents noms de paramètres selon la banque
  const orderNumber = params.get('order_id') ?? params.get('order_number') ?? params.get('orderId')
  const paymentStatus = params.get('status') ?? params.get('payment_status') ?? params.get('StatusCode')
  const txnId = params.get('txn_id') ?? params.get('transaction_id') ?? params.get('TransactionId')

  useEffect(() => {
    async function processReturn() {
      if (!orderNumber) { setStatus('fail'); return }

      const isPaid = ['success', 'paid', '1', '00', 'SUCCESS'].includes(paymentStatus ?? '')

      try {
        if (isPaid) {
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status:  'paid',
              provider_txn_id: txnId ?? null,
              paid_at:         new Date().toISOString(),
            })
            .eq('order_number', orderNumber)

          if (error) throw error

          setStatus('success')
          setTimeout(() => navigate(`/commande/confirmee/${orderNumber}`, { replace: true }), 2500)
        } else {
          await supabase
            .from('orders')
            .update({ payment_status: 'failed', status: 'cancelled' })
            .eq('order_number', orderNumber)
          setStatus('fail')
        }
      } catch {
        setStatus('fail')
      }
    }

    processReturn()
  }, [orderNumber, paymentStatus, txnId, navigate])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{t('checkout.mipsReturn.verifying')}</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('checkout.mipsReturn.success')}</h1>
        {orderNumber && (
          <p className="text-muted-foreground mb-2">
            {t('confirmation.orderNumber')} : <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">{t('checkout.mipsReturn.redirecting')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <XCircle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-bold mb-3">{t('checkout.mipsReturn.fail')}</h1>
      <p className="text-muted-foreground mb-8">
        {orderNumber
          ? t('checkout.mipsReturn.failDescOrder', { order: orderNumber })
          : t('checkout.mipsReturn.failDesc')}
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/panier">{t('checkout.backToCart')}</Link>
        </Button>
        <Button asChild>
          <Link to="/catalogue">{t('catalog.title')}</Link>
        </Button>
      </div>
    </div>
  )
}
