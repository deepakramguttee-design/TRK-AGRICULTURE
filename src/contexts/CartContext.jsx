import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product) => {
    const qtyToAdd = product.quantity || 1
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qtyToAdd } : i)
      }
      return [...prev, { ...product, quantity: qtyToAdd }]
    })
  }

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId)
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const cartTotal = items.reduce((sum, item) => sum + item.price_mur * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
