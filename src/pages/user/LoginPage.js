import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Xử lý đăng nhập thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData);
      console.log('Login response data:', data);

      if (data.user?.role === 'ADMIN' || data.user?.role === 'STAFF') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error types
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
      } else if (err.response?.status === 401) {
        // Backend trả về AuthResponse với message trực tiếp
        const errorMessage = err.response?.data?.message || 'Thông tin đăng nhập không chính xác.';
        setError(errorMessage);
      } else if (err.response?.status === 403) {
        setError('Tài khoản của bạn không có quyền truy cập.');
      } else if (err.response?.status >= 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      // credentialResponse.credential chính là Google ID Token
      const data = await googleLogin(credentialResponse.credential);

      if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập bằng Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google thất bại
  const handleGoogleError = () => {
    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1490750967868-58cb75069ed6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10 transition-all duration-300 hover:shadow-rose-500/10">
        <div className="mb-8 text-center">
            <span className="text-4xl mb-2 block">🌸</span>
            <h2 className="text-3xl font-display font-bold text-gray-900">Chào mừng trở lại</h2>
            <p className="text-gray-500 mt-2 text-sm">Đăng nhập để quản lý và mua sắm</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
              <input
                type="text"
                placeholder="Username / Email / SĐT"
                required
                className="input-field"
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link to="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline">
                  Quên mật khẩu?
                </Link>
            </div>
            <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                required
                className="input-field"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base shadow-rose-500/25"
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-400 text-sm font-medium bg-transparent">HOẶC</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          Chưa có tài khoản?
          <Link to="/register" className="text-rose-600 ml-1 font-bold hover:text-rose-700 hover:underline transition-colors">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
