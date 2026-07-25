import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, Loader2, Leaf } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

// Page publique — accessible sans compte. Désinscription marketing par token.
export default function Unsubscribe() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState('loading') // loading | success | error | invalid

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    let active = true
    supabase
      .rpc('marketing_unsubscribe', { p_token: token, p_channel: 'all' })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setState('error')
        else setState(data === true ? 'success' : 'invalid')
      })
    return () => { active = false }
  }, [token])

  return (
    <div className="min-h-[calc(100vh-6.25rem)] bg-[#f4f1ea] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-5 mx-auto">
          <Leaf className="h-7 w-7 text-white" />
        </div>

        {state === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('unsubscribe.loading')}</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-zinc-900 mb-2">{t('unsubscribe.successTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t('unsubscribe.successBody')}</p>
          </>
        )}

        {(state === 'invalid' || state === 'error') && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-zinc-900 mb-2">{t('unsubscribe.errorTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {state === 'invalid' ? t('unsubscribe.invalidBody') : t('unsubscribe.errorBody')}
            </p>
          </>
        )}

        {state !== 'loading' && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/">{t('unsubscribe.backHome')}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
