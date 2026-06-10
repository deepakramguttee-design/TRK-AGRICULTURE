import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'

const DISTRICTS = [
  'Port Louis',
  'Pamplemousses',
  'Rivière du Rempart',
  'Flacq',
  'Grand Port',
  'Savanne',
  'Plaines Wilhems',
  'Moka',
  'Black River',
]

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-primary mb-2 text-lg">
              TRK AGRICULTURE LIMITED
            </h3>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>

          {/* Delivery districts */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
              {t('footer.delivery')}
            </h4>
            <ul className="grid grid-cols-2 gap-1">
              {DISTRICTS.map((district) => (
                <li key={district} className="text-sm text-muted-foreground">
                  {district}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.legalNotice')}
                </Link>
              </li>
              <li>
                <Link
                  to="/confidentialite"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/cgv"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TRK Agriculture Limited — {t('footer.tagline')}
        </p>
      </div>
    </footer>
  )
}
