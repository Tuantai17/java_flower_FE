import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * Admin Protected Route
 * 
 * Sử dụng AdminAuthContext để kiểm tra admin authentication
 * Redirect đến /admin/login nếu chưa đăng nhập
 */
const AdminProtectedRoute = ({ children }) => {
    const { admin, loading, isAuthenticated } = useAdminAuth();
    const location = useLocation();

    console.log('🔐 AdminProtectedRoute check:', {
        loading,
        isAuthenticated,
        admin: admin?.username || null,
        path: location.pathname
    });

    // Đang kiểm tra authentication
    if (loading) {
        console.log('⏳ AdminProtectedRoute: Loading...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-300">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập
    if (!isAuthenticated || !admin) {
        console.log('🚫 AdminProtectedRoute: Not authenticated, redirecting to /admin/login');
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    // Kiểm tra role
    if (admin.role !== 'ADMIN' && admin.role !== 'STAFF') {
        console.log('🚫 AdminProtectedRoute: Invalid role:', admin.role);
        return <Navigate to="/admin/login" replace />;
    }

    // Đã xác thực, render children
    console.log('✅ AdminProtectedRoute: Access granted for', admin.username);
    return children;
};

export default AdminProtectedRoute;
