import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, User, Menu, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/contexts/CartContext'

const NAV_LINKS = [
  { to: '/catalogue', labelKey: 'nav.catalog' },
  { to: '/b2b', labelKey: 'nav.b2b' },
  { to: '/a-propos', labelKey: 'nav.about' },
  { to: '/contact', labelKey: 'nav.contact' },
]

export default function Header() {
  const { t, i18n } = useTranslation()
  const { cartCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-base md:text-lg text-primary tracking-tight">
          TRK AGRICULTURE LIMITED
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-2">
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase font-semibold">
                  {i18n.language.slice(0, 2)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
            <Link to="/compte" aria-label={t('nav.account')}>
              <User className="h-5 w-5" />
            </Link>
          </Button>

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
                  className="font-bold text-primary mb-4 text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  TRK AGRICULTURE LIMITED
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-base font-medium py-3 border-b last:border-0 text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                <Link
                  to="/compte"
                  className="text-base font-medium py-3 mt-2 flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('nav.account')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
