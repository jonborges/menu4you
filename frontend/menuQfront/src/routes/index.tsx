import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import SignUp from '../pages/signUp/SignUp';
import ScrollToTop from '../components/ScrollToTop';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { UIProvider } from '../contexts/UIContext';
import { CartProvider } from '../contexts/CartContext';
import Cart from '../components/cart/Cart';
import FloatingCart from '../components/cart/FloatingCart';
import RestaurantsPage from '../pages/restaurants/RestaurantsPage';
import RestaurantDashboard from '../pages/restaurants/RestaurantDashboard';
import CreateRestaurant from '../pages/restaurants/CreateRestaurant';
import CategoryPage from '../pages/category/CategoryPage';
import SearchPage from '../pages/search/SearchPage';
import { ItemModalProvider } from '../contexts/ItemModalContext';
import ItemModal from '../components/modals/ItemModal';
import RestaurantMenu from '../pages/public/RestaurantMenu';
import { PublicMenu } from '../pages/menu/PublicMenu';

// Placeholders for new pages
const EsqueciSenha = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Página de Recuperação de Senha</h1><p>Em construção...</p></div>;

// Componente para proteger rotas que requerem autenticação
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
 
  useEffect(() => {
    localStorage.removeItem('local_restaurants');
    localStorage.removeItem('local_items');
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
      <UIProvider>
      <CartProvider>
      <ItemModalProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LogoutListener />
        <ScrollToTop />
        <FloatingCart />
        <ItemModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<SignUp />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/restaurantes" element={<RestaurantsPage />} />
          <Route path="/owner/dashboard" element={
            <PrivateRoute>
              <RestaurantDashboard />
            </PrivateRoute>
          } />
          <Route path="/restaurants/create" element={
            <PrivateRoute>
              <CreateRestaurant />
            </PrivateRoute>
          } />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/menu/:id" element={<RestaurantMenu />} />
          <Route path="/menu/:restaurantId/mesa/:tableNumber" element={<PublicMenu />} />

          <Route
            path="*"
            element={
              <main className="p-5 text-center">
                <h1 className="text-2xl font-bold">404 - Página não encontrada</h1>
                <p className="text-gray-600 mt-2">A página que você tentou acessar não existe.</p>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
      </ItemModalProvider>
      </CartProvider>
      </UIProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function LogoutListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate('/');
    window.addEventListener('app:logout', handler as EventListener);
    return () => window.removeEventListener('app:logout', handler as EventListener);
  }, [navigate]);
  return null;
}
