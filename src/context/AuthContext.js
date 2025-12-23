import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

/**
 * Auth Context
 * 
 * Quản lý authentication cho User (không phải Admin)
 * - Sử dụng 'userToken' riêng biệt với 'adminToken'
 * - Admin có context riêng hoặc sử dụng authService trực tiếp
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Load user nếu có token (restore session)
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getUserToken();

      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch {
          // Token không hợp lệ, xóa đi
          authService.logoutUser();
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Đăng nhập User
   */
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setJustLoggedIn(true);
    return data;
  };

  /**
   * Đăng nhập bằng Google
   */
  const googleLogin = async (googleIdToken) => {
    const data = await authService.googleLogin(googleIdToken);
    setUser(data.user);
    setJustLoggedIn(true);
    return data;
  };

  /**
   * Reset trạng thái justLoggedIn
   */
  const clearLoginNotification = () => {
    setJustLoggedIn(false);
  };

  /**
   * Đăng xuất User - KHÔNG ảnh hưởng Admin session
   */
  const logout = () => {
    authService.logoutUser();
    setUser(null);
    setJustLoggedIn(false);
  };

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      googleLogin,
      logout,
      loading,
      justLoggedIn,
      clearLoginNotification,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
