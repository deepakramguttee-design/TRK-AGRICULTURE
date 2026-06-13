import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Leaf, Globe, MessageCircle, Mail, MapPin } from 'lucide-react'

const DISTRICTS = [
  'Port Louis', 'Pamplemousses', 'Rivière du Rempart',
  'Flacq', 'Grand Port', 'Savanne',
  'Plaines Wilhems', 'Moka', 'Black River',
]

export default function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e) {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="border-t bg-stone-50 mt-auto">
      <div className="container mx-auto px-4 pt-12 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand column */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm text-foreground">TRK Agriculture</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              Île Maurice
            </div>
            {/* Social links */}
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="Page Facebook TRK Agriculture"
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-stone-500 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/230"
                aria-label="WhatsApp TRK Agriculture"
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-green-100 hover:text-green-700 flex items-center justify-center text-stone-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@trkagriculturelimited.mu"
                aria-label="Email TRK Agriculture"
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-green-100 hover:text-green-700 flex items-center justify-center text-stone-500 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Delivery districts */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-stone-500">
              {t('footer.delivery')}
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
              {DISTRICTS.map((district) => (
                <li key={district} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
                  {district}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-stone-500">
              {t('footer.links')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/catalogue', key: 'nav.catalog' },
                { to: '/b2b',       key: 'nav.b2b' },
                { to: '/a-propos',  key: 'nav.about' },
                { to: '/contact',   key: 'nav.contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-1 text-xs uppercase tracking-widest text-stone-500">
              Restez informé
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Nouveaux produits, promotions et actualités de la ferme.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Leaf className="h-4 w-4 shrink-0" />
                Merci ! On vous tient au courant.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="votre@email.mu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-sm rounded-lg h-9 flex-1 min-w-0"
                />
                <Button type="submit" size="sm" className="h-9 px-3 rounded-lg shrink-0">
                  OK
                </Button>
              </form>
            )}
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TRK Agriculture Limited — {t('footer.tagline')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/mentions-legales" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.legalNotice')}
            </Link>
            <Link to="/confidentialite" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/cgv" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
          <Link
            to="/admin/products"
            className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            ⚙
          </Link>
        </div>

      </div>
    </footer>
  )
}
