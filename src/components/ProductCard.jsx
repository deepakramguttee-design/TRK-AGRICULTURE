import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const CATEGORY_EMOJI = {
  epices:  '🌿',
  salades: '🥬',
  bredes:  '🍃',
  legumes: '🥕',
  melons:  '🍈',
}

export default function ProductCard({ product, categories = [] }) {
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const name = lang === 'en' ? (product.name_en || product.name_fr) : product.name_fr
  const catLabel = categories.find(c => c.id === product.category)?.[`name_${lang}`] || product.category

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <Link to={`/produit/${product.sku}`} className="block group h-full">
      <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="aspect-square bg-green-50 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl select-none" aria-hidden>
              {CATEGORY_EMOJI[product.category] || '🌱'}
            </span>
          )}
        </div>

        <CardHeader className="p-3 pb-0">
          <Badge variant="secondary" className="w-fit text-[10px] mb-1.5">
            {CATEGORY_EMOJI[product.category]} {catLabel}
          </Badge>
          <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
            {name}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-3 py-2 mt-auto">
          <p className="text-base font-bold text-primary">
            Rs {Number(product.price_mur).toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              / {product.unit}
            </span>
          </p>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button
            size="sm"
            className="w-full text-xs gap-1"
            variant={justAdded ? 'secondary' : 'default'}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3" />
            {justAdded ? t('catalog.added') : t('catalog.addToCart')}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
