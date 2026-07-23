import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, User, Menu, LayoutDashboard, LogOut, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { to: '/catalogue',      labelKey: 'nav.catalog' },
  { to: '/notre-process',  labelKey: 'nav.process' },
  { to: '/calendrier',     labelKey: 'nav.calendar' },
  { to: '/pepiniere',      labelKey: 'nav.nursery' },
  { to: '/b2b',            labelKey: 'nav.b2b' },
  { to: '/a-propos',       labelKey: 'nav.about' },
  { to: '/contact',        labelKey: 'nav.contact' },
]

export default function Header() {
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <header className="sticky top-9 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Kailash Farming">
          <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <Leaf className="h-4 w-4 text-lime" />
          </div>
          <span className="font-display text-base md:text-lg font-semibold text-forest-800 tracking-tight leading-tight">
            Kailash <span className="text-leaf">Farming</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                isActive(link.to)
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden md:block text-xs text-muted-foreground/60 hover:text-foreground transition-colors px-2"
            >
              Admin
            </Link>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/panier" aria-label={t('nav.cart')}>
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </div>
            </Link>
          </Button>

          {/* Account — desktop only */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-accent transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0">
                    {(profile?.full_name || user.email).slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {profile?.full_name?.split(' ')[0] || t('nav.account')}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/compte" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    {t('nav.account')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-3.5 w-3.5" />
                  {t('account.signout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="outline" asChild className="hidden md:inline-flex gap-1.5">
              <Link to="/login">
                <User className="h-3.5 w-3.5" />
                {t('nav.signin')}
              </Link>
            </Button>
          )}

          {/* Mobile burger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-1 mt-8">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 mb-6"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-lime" />
                  </div>
                  <span className="font-display text-lg font-semibold text-forest-800">Kailash <span className="text-leaf">Farming</span></span>
                </Link>

                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium py-2.5 px-3 rounded-lg border-b border-border/40 last:border-0 transition-colors ${
                      isActive(link.to)
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link
                      to="/compte"
                      className="text-sm font-medium py-2.5 px-3 mt-2 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      {t('nav.account')}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-sm font-medium py-2.5 px-3 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false) }}
                      className="text-sm font-medium py-2.5 px-3 rounded-lg flex items-center gap-2 text-destructive w-full hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('account.signout')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-medium py-2.5 px-3 mt-2 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {t('nav.signin')}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
