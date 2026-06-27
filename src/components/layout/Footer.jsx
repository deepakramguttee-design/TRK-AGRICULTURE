import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Leaf, Mail, MapPin } from 'lucide-react'

const SOCIAL = [
  {
    href: 'https://www.facebook.com/dipraj.ramguttee',
    label: 'Facebook TRK Agriculture',
    icon: IconFacebook,
    hover: 'hover:bg-blue-100 hover:text-blue-700',
  },
  {
    href: 'https://www.instagram.com/trk_agriculture',
    label: 'Instagram TRK Agriculture',
    icon: IconInstagram,
    hover: 'hover:bg-pink-100 hover:text-pink-600',
  },
  {
    href: 'https://wa.me/23057745306',
    label: 'WhatsApp TRK Agriculture',
    icon: IconWhatsApp,
    hover: 'hover:bg-green-100 hover:text-green-700',
  },
  {
    href: 'https://www.tiktok.com/@trkagriculturelimited',
    label: 'TikTok TRK Agriculture',
    icon: IconTikTok,
    hover: 'hover:bg-stone-200 hover:text-stone-800',
  },
  {
    href: 'mailto:contact@trkagriculturelimited.mu',
    label: 'Email TRK Agriculture',
    icon: ({ className }) => <Mail className={className} />,
    hover: 'hover:bg-green-100 hover:text-green-700',
  },
]

const DISTRICTS = [
  'Port Louis', 'Pamplemousses', 'Rivière du Rempart',
  'Flacq', 'Grand Port', 'Savanne',
  'Plaines Wilhems', 'Moka', 'Black River',
]

export default function Footer() {
  const { t, i18n } = useTranslation()
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
              {t('footer.location')}
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map(({ href, label, icon: Icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 transition-colors ${hover}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
                { to: '/catalogue',     key: 'nav.catalog' },
                { to: '/notre-process', key: 'nav.process' },
                { to: '/calendrier',    key: 'nav.calendar' },
                { to: '/pepiniere',    key: 'nav.nursery' },
                { to: '/b2b',           key: 'nav.b2b' },
                { to: '/a-propos',      key: 'nav.about' },
                { to: '/contact',       key: 'nav.contact' },
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
              {t('footer.newsletter.title')}
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t('footer.newsletter.desc')}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Leaf className="h-4 w-4 shrink-0" />
                {t('footer.newsletter.success')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t('footer.newsletter.placeholder')}
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
            <Link to={i18n.language === 'en' ? '/privacy' : '/confidentialite'} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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

/* ── Icônes SVG inline (lucide-react ne fournit pas les logos de marques) ── */

function IconFacebook({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconInstagram({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconWhatsApp({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function IconTikTok({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}
