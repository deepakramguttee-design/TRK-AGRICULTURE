import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

const CONTACT_ITEMS = [
  {
    icon: Mail,
    key: 'email',
    href: 'mailto:kailashramguttee@gmail.com',
    value: 'kailashramguttee@gmail.com',
  },
  {
    icon: Phone,
    key: 'phone',
    href: 'tel:+23057745306',
    value: '+230 5774 5306',
  },
  {
    icon: MessageCircle,
    key: 'whatsapp',
    href: 'https://wa.me/23057745306',
    value: '+230 5774 5306',
    external: true,
  },
  {
    icon: MapPin,
    key: 'address',
    // Épingle la localisation exacte (dépose un marqueur aux coordonnées GPS).
    href: 'https://www.google.com/maps/search/?api=1&query=-20.322619,57.465368',
    value: 'Henrietta, Vacoas, Mauritius',
    subValue: '-20.322619, 57.465368',
    external: true,
  },
]

export default function Contact() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-2">{t('contact.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('contact.intro')}</p>

      <Card className="mb-6">
        <CardContent className="pt-6 divide-y">
          {CONTACT_ITEMS.map(({ icon: Icon, key, href, value, subValue, external }) => (
            <a
              key={key}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:text-primary transition-colors group"
            >
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t(`contact.${key}`)}</p>
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {value}
                </p>
                {subValue && (
                  <p className="text-xs text-muted-foreground tabular-nums">{subValue}</p>
                )}
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-forest-800/5 border-forest-800/15">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{t('contact.note')}</p>
          <Button asChild className="mt-4">
            <Link to="/catalogue">{t('contact.viewCatalog')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
