import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
  if (!isAdmin) return <Navigate to="/admin" replace />
  return children
}
