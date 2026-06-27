import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
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
import AdminProductDetail from './pages/admin/AdminProductDetail'
import AdminClientDetail from './pages/admin/AdminClientDetail'
import AdminOrdersList from './pages/admin/AdminOrdersList'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminB2BList from './pages/admin/AdminB2BList'
import AdminB2BDetail from './pages/admin/AdminB2BDetail'
import AdminSowingList from './pages/admin/AdminSowingList'
import AdminUsersList from './pages/admin/AdminUsersList'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import RequireAdmin from './components/RequireAdmin'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import Confidentialite from './pages/Confidentialite'
import Privacy from './pages/Privacy'
import MentionsLegales from './pages/MentionsLegales'
import APropos from './pages/APropos'
import Contact from './pages/Contact'
import NosProcess from './pages/NosProcess'
import Calendrier from './pages/Calendrier'
import Nursery from './pages/Nursery'
import MipsReturn from './pages/MipsReturn'
import { Toaster } from './components/ui/toaster'
import LanguageBar from './components/layout/LanguageBar'
import PromoBanner from './components/PromoBanner'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <LanguageBar />
            <Header />
            <PromoBanner />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalog />} />
                <Route path="/produit/:sku" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/commande" element={<Checkout />} />
                <Route path="/commande/confirmee/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/commande/retour-mips" element={<MipsReturn />} />
                <Route path="/b2b" element={<B2B />} />
                <Route path="/compte" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/notre-process" element={<NosProcess />} />
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/pepiniere" element={<Nursery />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
                <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="produits" element={<RequireAdmin><AdminProductsList /></RequireAdmin>} />
                  <Route path="produits/nouveau" element={<RequireAdmin><AdminProductCreate /></RequireAdmin>} />
                  <Route path="produits/:sku" element={<RequireAdmin><AdminProductDetail /></RequireAdmin>} />
                  <Route path="produits/:sku/editer" element={<RequireAdmin><AdminProductEdit /></RequireAdmin>} />
                  <Route path="commandes" element={<AdminOrdersList />} />
                  <Route path="commandes/:order_number" element={<AdminOrderDetail />} />
                  <Route path="b2b" element={<AdminB2BList />} />
                  <Route path="b2b/:id" element={<AdminB2BDetail />} />
                  <Route path="semis" element={<AdminSowingList />} />
                  <Route path="utilisateurs" element={<RequireAdmin><AdminUsersList /></RequireAdmin>} />
                  <Route path="utilisateurs/clients/:id" element={<RequireAdmin><AdminClientDetail /></RequireAdmin>} />
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
