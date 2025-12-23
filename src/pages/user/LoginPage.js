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

      if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50 py-12">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border">
        <h2 className="text-center text-3xl font-bold">Chào mừng trở lại</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username / Email / SĐT"
            required
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            required
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
          </button>

          {/* Quên mật khẩu */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-rose-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
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
            width="400"
          />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Chưa có tài khoản?
          <Link to="/register" className="text-teal-600 ml-1 font-medium hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
