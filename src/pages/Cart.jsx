import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, Minus, Plus, Leaf, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { CATEGORY_EMOJI } from '@/components/ProductCard'
import { getDeliveryFee } from '@/lib/delivery'

export default function Cart() {
  const { t, i18n } = useTranslation()
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const deliveryFee = getDeliveryFee(null, cartTotal)
  const total = cartTotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Leaf className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
        <p className="text-muted-foreground mb-6">{t('cart.emptyDesc')}</p>
        <Button asChild>
          <Link to="/catalogue">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('cart.discover')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Colonne gauche : items ── */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {items.map(item => {
              const name = lang === 'en' ? (item.name_en || item.name_fr) : item.name_fr
              const lineTotal = item.price_mur * item.quantity
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-xl bg-background items-start"
                >
                  {/* Miniature */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl select-none" aria-hidden>
                        {CATEGORY_EMOJI[item.category] || '🌱'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug truncate">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rs {Number(item.price_mur).toFixed(2)} / {item.unit}
                    </p>

                    {/* Sélecteur quantité */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        aria-label={lang === 'fr' ? 'Diminuer' : 'Decrease'}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={lang === 'fr' ? 'Augmenter' : 'Increase'}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Prix ligne + supprimer */}
                  <div className="flex flex-col items-end justify-between h-16">
                    <p className="font-bold text-primary text-sm">
                      Rs {lineTotal.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      aria-label={lang === 'fr' ? 'Supprimer' : 'Remove'}
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="mt-4 text-xs text-muted-foreground/60 hover:text-destructive transition-colors underline-offset-2 hover:underline"
          >
            {t('cart.clear')}
          </button>
        </div>

        {/* ── Colonne droite : récap sticky ── */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="border rounded-xl p-5 space-y-3 bg-background">
            <h2 className="font-semibold">{t('cart.summary')}</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cart.subtotal')}</span>
              <span className="font-medium">Rs {cartTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cart.delivery')}</span>
              <span className="font-medium">
                {deliveryFee === 0 ? t('cart.free') : `Rs ${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            {deliveryFee === 0 && (
              <p className="text-xs text-primary">{t('cart.freeDeliveryNote')}</p>
            )}
            {deliveryFee > 0 && (
              <p className="text-xs text-muted-foreground">{t('cart.deliveryEstimate')}</p>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">{t('cart.total')}</span>
              <span className="text-2xl font-bold text-primary">Rs {total.toFixed(2)}</span>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link to="/commande">{t('cart.checkout')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
