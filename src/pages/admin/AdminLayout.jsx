import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Leaf, UserCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute'
import { toast } from '@/hooks/use-toast'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/b2b', label: 'B2B', icon: Users },
  { to: '/admin/semis', label: 'Semis', icon: Leaf },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: UserCheck },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast({ title: 'Déconnecté' })
    navigate('/', { replace: true })
  }

  return (
    <ProtectedAdminRoute>
      <div className="flex" style={{ minHeight: 'calc(100vh - 100px)' }}>
        {/* Sidebar */}
        <aside className="w-56 border-r bg-muted/30 flex flex-col shrink-0">
          <div className="flex flex-col gap-1 p-3 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Administration
            </p>
            {NAV.map(({ to, label, icon: Icon, end, disabled }) =>
              disabled ? (
                <span
                  key={label}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-muted-foreground/40 cursor-not-allowed"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className="ml-auto text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                    Bientôt
                  </span>
                </span>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              )
            )}
          </div>

          <div className="border-t p-3">
            <p className="text-xs text-muted-foreground truncate px-3 pb-2">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </ProtectedAdminRoute>
  )
}
