import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sprout, Leaf, Truck } from 'lucide-react'

export default function APropos() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('about.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('about.subtitle')}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3 items-start">
            <Sprout className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{t('about.intro')}</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground pl-8">
            {t('about.body')}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center mb-3">
              <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
              <h2 className="font-semibold">{t('about.approach.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('about.approach.body')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center mb-3">
              <Truck className="h-5 w-5 text-primary flex-shrink-0" />
              <h2 className="font-semibold">{t('about.delivery.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('about.delivery.body')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link to="/catalogue">{t('home.hero.cta')}</Link>
      </Button>
    </div>
  )
}
