import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import B2B from './pages/B2B'
import Account from './pages/Account'
import Admin from './pages/Admin'
import AdminProducts from './pages/AdminProducts'
import OrderConfirmation from './pages/OrderConfirmation'
import { Toaster } from './components/ui/toaster'
import LanguageBar from './components/layout/LanguageBar'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <LanguageBar />
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalog />} />
                <Route path="/produit/:sku" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/commande" element={<Checkout />} />
                <Route path="/b2b" element={<B2B />} />
                <Route path="/compte" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/commande/confirmee/:orderNumber" element={<OrderConfirmation />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
