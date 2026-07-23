import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldX } from 'lucide-react'

export default function ProtectedAdminRoute({ children }) {
  const { t } = useTranslation()
  const { user, isAdmin, isEmployee, loading } = useAuth()

  // Vérifie que la session est élevée en MFA (aal2) — admins uniquement. La RLS
  // l'exige côté serveur pour is_admin() ; les operators travaillent en AAL1.
  const [aalOk, setAalOk] = useState(null) // null = vérification en cours

  useEffect(() => {
    let active = true
    if (!user) { setAalOk(null); return }
    if (!isAdmin) { setAalOk(true); return }
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      .then(({ data }) => { if (active) setAalOk(data?.currentLevel === 'aal2') })
      .catch(() => { if (active) setAalOk(false) })
    return () => { active = false }
  }, [user, isAdmin])

  if (loading || (user && aalOk === null)) {
    return (
      <div className="min-h-[calc(100vh-6.25rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />

  // Session admin non élevée en MFA → retour au login admin pour finir le TOTP
  if (isAdmin && aalOk === false) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin && !isEmployee) {
    return (
      <div className="min-h-[calc(100vh-6.25rem)] flex flex-col items-center justify-center gap-4">
        <ShieldX className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">{t('admin.accessDenied')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.accessDeniedDesc')}</p>
        <Button asChild variant="outline">
          <Link to="/">{t('admin.backHome')}</Link>
        </Button>
      </div>
    )
  }

  return children
}
