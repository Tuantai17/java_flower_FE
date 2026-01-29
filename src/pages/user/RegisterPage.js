import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../api/authService';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  // Xử lý đăng ký thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);

    try {
      await authService.register(formData);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập/đăng ký bằng Google
  // Nếu user chưa tồn tại, backend sẽ tự động tạo tài khoản mới
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const data = await googleLogin(credentialResponse.credential);

      // Redirect dựa trên role
      if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký bằng Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1507290439931-a861b5a38200?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10 hover:shadow-rose-500/10 transition-all duration-300">
        <div className="mb-8 text-center">
            <span className="text-4xl mb-2 block">✨</span>
            <h2 className="text-3xl font-display font-bold text-gray-900">Tạo tài khoản mới</h2>
            <p className="text-gray-500 mt-2 text-sm">Tham gia cộng đồng yêu hoa ngay hôm nay</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm text-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
              <input
                className="input-field"
                placeholder="Tên đăng nhập"
                required
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
          </div>

          <div>
              <input
                className="input-field"
                placeholder="Email"
                required
                type="email"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
          </div>

          <div>
              <input
                className="input-field"
                placeholder="Số điện thoại"
                required
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="Mật khẩu"
                type="password"
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Xác nhận MK"
                type="password"
                required
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
          </div>

          <button
            disabled={loading}
            className="w-full btn-primary py-3.5 mt-2 text-base shadow-rose-500/25"
          >
            {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ NGAY'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-400 text-sm font-medium">HOẶC</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Google Register/Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="text-center mt-8 text-sm text-gray-600">
          Đã có tài khoản?
          <Link to="/login" className="text-rose-600 ml-1 font-bold hover:text-rose-700 hover:underline transition-colors">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
