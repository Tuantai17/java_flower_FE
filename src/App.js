import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context
import { AppProvider } from './context/AppContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import BlankLayout from './layouts/BlankLayout';

// User Pages
import HomePage from './pages/user/HomePage';
import ShopPage from './pages/user/ShopPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CategoryPage from './pages/user/CategoryPage';
import SearchResultPage from './pages/user/SearchResultPage';
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/product/ProductList';
import ProductCreate from './pages/admin/product/ProductCreate';
import ProductEdit from './pages/admin/product/ProductEdit';
import CategoryList from './pages/admin/category/CategoryList';
import CategoryCreate from './pages/admin/category/CategoryCreate';
import CategoryEdit from './pages/admin/category/CategoryEdit';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="search" element={<SearchResultPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/create" element={<CategoryCreate />} />
            <Route path="categories/edit/:id" element={<CategoryEdit />} />
          </Route>

          {/* Blank Layout (for future auth pages) */}
          <Route path="/auth" element={<BlankLayout />}>
            {/* Add auth routes here */}
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
