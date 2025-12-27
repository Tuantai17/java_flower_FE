import React, { useState, useEffect, createContext, useContext } from 'react';
import authService from '../api/authService';

/**
 * Admin Auth Context
 * 
 * Context riêng cho Admin authentication
 * Hoàn toàn độc lập với User AuthContext
 * 
 * Lưu thêm thông tin admin vào localStorage để persist qua reload
 */

const AdminAuthContext = createContext();

// Key lưu admin info trong localStorage
const ADMIN_INFO_KEY = 'adminInfo';

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper: Lưu admin info vào localStorage
    const saveAdminToStorage = (adminData) => {
        if (adminData) {
            localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminData));
        } else {
            localStorage.removeItem(ADMIN_INFO_KEY);
        }
    };

    // Helper: Lấy admin info từ localStorage
    const getAdminFromStorage = () => {
        try {
            const stored = localStorage.getItem(ADMIN_INFO_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Error parsing admin info:', e);
            return null;
        }
    };

    // Check admin token on mount
    useEffect(() => {
        const checkAdminAuth = async () => {
            const token = authService.getAdminToken();
            console.log('🔍 AdminAuthProvider - checking token:', token ? 'exists' : 'none');

            if (token) {
                // Thử lấy từ localStorage trước (nhanh hơn)
                const storedAdmin = getAdminFromStorage();
                if (storedAdmin) {
                    console.log('📦 Admin info from storage:', storedAdmin);
                    setAdmin(storedAdmin);
                }

                // Sau đó verify với API
                try {
                    const userData = await authService.getCurrentAdmin();
                    console.log('✅ Admin user loaded from API:', userData);
                    setAdmin(userData);
                    saveAdminToStorage(userData);
                } catch (error) {
                    console.error('❌ Admin token invalid:', error);
                    authService.logoutAdmin();
                    saveAdminToStorage(null);
                    setAdmin(null);
                }
            } else {
                // Không có token, xóa admin info
                saveAdminToStorage(null);
                setAdmin(null);
            }
            setLoading(false);
        };

        checkAdminAuth();
    }, []);

    const login = async (credentials) => {
        const data = await authService.adminLogin(credentials);
        console.log('🔐 Admin login response:', data);

        const adminData = data.user || data;
        setAdmin(adminData);
        saveAdminToStorage(adminData);

        return data;
    };

    const logout = () => {
        authService.logoutAdmin();
        saveAdminToStorage(null);
        setAdmin(null);
    };

    // Update admin info (cho Settings page)
    const updateAdmin = (newAdminData) => {
        setAdmin(newAdminData);
        saveAdminToStorage(newAdminData);
    };

    const isAuthenticated = !!admin;

    return (
        <AdminAuthContext.Provider value={{
            admin,
            login,
            logout,
            updateAdmin,
            loading,
            isAuthenticated,
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};
