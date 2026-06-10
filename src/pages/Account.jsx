import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Account() {
  const { user, isAdmin, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6.25rem)] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="rounded-xl border border-green-200 bg-white shadow-sm p-8">
        <h1 className="text-xl font-bold mb-1">Mon compte</h1>
        <p className="text-muted-foreground text-sm mb-6">Connecté en tant que</p>
        <p className="font-medium break-all">{user.email}</p>

        {isAdmin && (
          <div className="mt-6">
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Interface d'administration
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => signOut()}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  )
}
