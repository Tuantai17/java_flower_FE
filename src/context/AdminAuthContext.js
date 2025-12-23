import React, { useState, useEffect, createContext, useContext } from 'react';
import authService from '../api/authService';

/**
 * Admin Auth Context
 * 
 * Context riêng cho Admin authentication
 * Hoàn toàn độc lập với User AuthContext
 */

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check admin token on mount
    useEffect(() => {
        const checkAdminAuth = async () => {
            const token = authService.getAdminToken();
            console.log('🔍 AdminAuthProvider - checking token:', token ? 'exists' : 'none');

            if (token) {
                try {
                    const userData = await authService.getCurrentAdmin();
                    console.log('✅ Admin user loaded:', userData);
                    setAdmin(userData);
                } catch (error) {
                    console.error('❌ Admin token invalid:', error);
                    authService.logoutAdmin();
                    setAdmin(null);
                }
            }
            setLoading(false);
        };

        checkAdminAuth();
    }, []);

    const login = async (credentials) => {
        const data = await authService.adminLogin(credentials);
        setAdmin(data.user);
        return data;
    };

    const logout = () => {
        authService.logoutAdmin();
        setAdmin(null);
    };

    const isAuthenticated = !!admin;

    return (
        <AdminAuthContext.Provider value={{
            admin,
            login,
            logout,
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
