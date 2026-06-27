import { Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldX } from 'lucide-react'

export default function ProtectedAdminRoute({ children }) {
  const { t } = useTranslation()
  const { user, isAdmin, isEmployee, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6.25rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />

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
