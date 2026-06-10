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
import Login from './pages/Login'
import Logout from './pages/Logout'
import AdminProducts from './pages/AdminProducts'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductsList from './pages/admin/AdminProductsList'
import AdminProductCreate from './pages/admin/AdminProductCreate'
import AdminProductEdit from './pages/admin/AdminProductEdit'
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
                <Route path="/commande/confirmee/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/b2b" element={<B2B />} />
                <Route path="/compte" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="produits" element={<AdminProductsList />} />
                  <Route path="produits/nouveau" element={<AdminProductCreate />} />
                  <Route path="produits/:sku/editer" element={<AdminProductEdit />} />
                </Route>
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
