import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';

/**
 * Protected Route Component
 * 
 * Xử lý authentication cho User và Admin:
 * - User routes: Kiểm tra qua AuthContext (userToken)
 * - Admin routes: Kiểm tra adminToken trong localStorage
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading: userLoading, isAuthenticated } = useAuth();
  const [adminData, setAdminData] = useState({ user: null, loading: true, checked: false });
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminRequired = requiredRole === 'ADMIN';

  // Kiểm tra Admin authentication
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAdminRoute || !isAdminRequired) {
        setAdminData({ user: null, loading: false, checked: true });
        return;
      }

      const adminToken = authService.getAdminToken();
      console.log('🔍 Checking admin token:', adminToken ? 'exists' : 'not found');

      if (!adminToken) {
        setAdminData({ user: null, loading: false, checked: true });
        return;
      }

      try {
        // Gọi API với admin token
        const userData = await authService.getCurrentAdmin();
        console.log('✅ Admin user verified:', userData);
        setAdminData({ user: userData, loading: false, checked: true });
      } catch (error) {
        console.error('❌ Admin verification failed:', error);
        // Token hết hạn hoặc không hợp lệ
        authService.logoutAdmin();
        setAdminData({ user: null, loading: false, checked: true });
      }
    };

    checkAdmin();
  }, [isAdminRoute, isAdminRequired, location.pathname]);

  // ======================
  // ADMIN ROUTES
  // ======================
  if (isAdminRoute && isAdminRequired) {
    // Đang kiểm tra
    if (adminData.loading || !adminData.checked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-300">Đang xác thực...</p>
          </div>
        </div>
      );
    }

    // Không có admin user
    if (!adminData.user) {
      console.log('⚠️ No admin user, redirecting to login');
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    // Kiểm tra role
    const adminRole = adminData.user.role;
    if (adminRole !== 'ADMIN' && adminRole !== 'STAFF') {
      console.log('⚠️ Invalid role:', adminRole);
      return <Navigate to="/admin/login" replace />;
    }

    // Admin đã xác thực
    console.log('✅ Admin authenticated, rendering page');
    return children;
  }

  // ======================
  // USER ROUTES
  // ======================
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // User chưa đăng nhập
  if (!user && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Kiểm tra role (nếu yêu cầu role cụ thể)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
