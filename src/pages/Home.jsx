import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Building2, Leaf } from 'lucide-react'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <ShoppingBag className="h-8 w-8 text-primary" />,
      titleKey: 'home.features.b2c.title',
      descKey: 'home.features.b2c.desc',
      link: '/catalogue',
    },
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      titleKey: 'home.features.b2b.title',
      descKey: 'home.features.b2b.desc',
      link: '/b2b',
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      titleKey: 'home.features.fresh.title',
      descKey: 'home.features.fresh.desc',
      link: '/catalogue',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-24 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {t('home.hero.subtitle')}
          </p>
          <Button size="lg" asChild className="text-base px-8">
            <Link to="/catalogue">{t('home.hero.cta')}</Link>
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.titleKey} className="hover:shadow-md transition-shadow">
              <CardHeader>
                {feature.icon}
                <CardTitle className="mt-3">{t(feature.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {t(feature.descKey)}
                </CardDescription>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to={feature.link}>{t('home.features.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
