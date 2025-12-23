import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * Admin Login Page
 * 
 * Sử dụng AdminAuthContext để đăng nhập admin
 * Token được lưu riêng trong 'adminToken'
 */
const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && admin) {
      console.log('✅ Already authenticated, redirecting...');
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, admin, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Logging in with:', credentials.identifier);
      await login(credentials);

      // Navigate sẽ được xử lý bởi useEffect trên
      console.log('✅ Login successful');

    } catch (err) {
      console.error('❌ Admin login error:', err);
      setError(err.message || 'Sai tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-center text-2xl font-bold text-slate-800">
          Cổng Quản Trị
        </h2>

        {error && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-3">
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <input
            placeholder="Tài khoản Admin"
            className="w-full border px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={credentials.identifier}
            onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
            required
          />

          <input
            placeholder="Mật khẩu"
            type="password"
            className="w-full border px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-3 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra...' : 'ĐĂNG NHẬP ADMIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
