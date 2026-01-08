import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// GLOBAL CONTEXT
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import BlankLayout from './layouts/BlankLayout';

// USER Pages
import HomePage from './pages/user/HomePage';
import ShopPage from './pages/user/ShopPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CategoryPage from './pages/user/CategoryPage';
import SearchResultPage from './pages/user/SearchResultPage';
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';
import ProfilePage from './pages/user/ProfilePage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import VoucherPage from './pages/user/VoucherPage';
import MyVouchersPage from './pages/user/MyVouchersPage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import PaymentResultPage from './pages/user/PaymentResultPage';
import MyTicketsPage from './pages/user/MyTicketsPage';
import TicketDetailPage from './pages/user/TicketDetailPage';
import UserNotificationsPage from './pages/user/UserNotificationsPage';


// AUTH Pages (User)
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";

// ADMIN Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/product/ProductList';
import ProductCreate from './pages/admin/product/ProductCreate';
import ProductEdit from './pages/admin/product/ProductEdit';
import ProductShow from './pages/admin/product/ProductShow';
import CategoryList from './pages/admin/category/CategoryList';
import CategoryCreate from './pages/admin/category/CategoryCreate';
import CategoryEdit from './pages/admin/category/CategoryEdit';
import VoucherList from './pages/admin/voucher/VoucherList';
import VoucherCreate from './pages/admin/voucher/VoucherCreate';
import VoucherEdit from './pages/admin/voucher/VoucherEdit';
import AdminOrderList from './pages/admin/order/OrderList';
import AdminOrderDetail from './pages/admin/order/OrderDetail';
import AdminReviewList from './pages/admin/review/ReviewList';
import AnalyticsPage from './pages/admin/analytics';
import SettingsPage from './pages/admin/settings';
import { StockList } from './pages/admin/stock';
import { CustomerList } from './pages/admin/customer';
import BannerList from './pages/admin/banner/BannerList';
import BannerForm from './pages/admin/banner/BannerForm';
import TicketList from './pages/admin/ticket/TicketList';
import TicketDetail from './pages/admin/ticket/TicketDetail';
import NotificationsPage from './pages/admin/NotificationsPage';

// Global Components
import GlobalNotification from './components/common/GlobalNotification';

// Google Client ID từ biến môi trường
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <Router>
              {/* Global Notification */}
              <GlobalNotification />

              <Routes>

                {/* ================= USER ROUTES ================= */}
                <Route path="/" element={<UserLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="product/:id" element={<ProductDetailPage />} />
                  <Route path="category/:id" element={<CategoryPage />} />
                  <Route path="search" element={<SearchResultPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="my-tickets" element={<MyTicketsPage />} />
                  <Route path="tickets/:id" element={<TicketDetailPage />} />
                  <Route path="vouchers" element={<VoucherPage />} />
                  <Route path="my-vouchers" element={<MyVouchersPage />} />

                  {/* USER ACCOUNT */}
                  <Route path="account" element={<ProfilePage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/orders" element={<MyOrdersPage />} />
                  <Route path="profile/orders/:id" element={<OrderDetailPage />} />
                  <Route path="notifications" element={<UserNotificationsPage />} />

                  {/* CART & CHECKOUT */}
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />

                  {/* PAYMENT CALLBACK (MoMo, VNPay) */}
                  {/* MoMo có thể redirect về: /payment/result, /payment/success, /payment/failure */}
                  <Route path="payment/result" element={<PaymentResultPage />} />
                  <Route path="payment/success" element={<PaymentResultPage />} />
                  <Route path="payment/failure" element={<PaymentResultPage />} />
                  <Route path="payment/momo/return" element={<PaymentResultPage />} />



                  {/* AUTH USER */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                </Route>




                {/* ================= ADMIN LOGIN (NO LAYOUT) ================= */}
                <Route path="/admin/login" element={<AdminLoginPage />} />


                {/* ================= ADMIN ROUTES ================= */}
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />


                  {/* PRODUCT */}
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/create" element={<ProductCreate />} />
                  <Route path="products/:id" element={<ProductShow />} />
                  <Route path="products/edit/:id" element={<ProductEdit />} />

                  {/* CATEGORY */}
                  <Route path="categories" element={<CategoryList />} />
                  <Route path="categories/create" element={<CategoryCreate />} />
                  <Route path="categories/edit/:id" element={<CategoryEdit />} />

                  {/* VOUCHER */}
                  <Route path="vouchers" element={<VoucherList />} />
                  <Route path="vouchers/create" element={<VoucherCreate />} />
                  <Route path="vouchers/edit/:id" element={<VoucherEdit />} />

                  {/* ORDERS */}
                  <Route path="orders" element={<AdminOrderList />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />

                  {/* STOCK MANAGEMENT */}
                  <Route path="stock" element={<StockList />} />

                  {/* CUSTOMERS */}
                  <Route path="customers" element={<CustomerList />} />

                  {/* REVIEWS */}
                  <Route path="reviews" element={<AdminReviewList />} />

                  {/* ANALYTICS */}
                  <Route path="analytics" element={<AnalyticsPage />} />

                  {/* BANNERS */}
                  <Route path="banners" element={<BannerList />} />
                  <Route path="banners/create" element={<BannerForm />} />
                  <Route path="banners/edit/:id" element={<BannerForm />} />

                  {/* TICKETS */}
                  <Route path="tickets" element={<TicketList />} />
                  <Route path="tickets/:id" element={<TicketDetail />} />

                  {/* NOTIFICATIONS */}
                  <Route path="notifications" element={<NotificationsPage />} />

                  {/* SETTINGS */}
                  <Route path="settings" element={<SettingsPage />} />
                </Route>


                {/* ================= OPTIONAL AUTH BLANK LAYOUT ================= */}
                <Route path="/auth" element={<BlankLayout />}>
                  {/* Future auth pages */}
                </Route>

              </Routes>
            </Router>
          </AdminAuthProvider>
        </AuthProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
