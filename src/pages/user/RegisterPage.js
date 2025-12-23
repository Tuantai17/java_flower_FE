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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-rose-50 py-12">
      <div className="max-w-md bg-white p-10 rounded-2xl shadow-xl w-full border">
        <h2 className="text-center text-3xl font-bold">Tạo tài khoản</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mt-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Tên đăng nhập"
            required
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />

          <input
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Email"
            required
            type="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <input
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Số điện thoại"
            required
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          <input
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Mật khẩu"
            type="password"
            required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <input
            className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            placeholder="Xác nhận mật khẩu"
            type="password"
            required
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <button
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
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
            width="400"
          />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Đã có tài khoản?
          <Link to="/login" className="text-rose-600 ml-1 font-medium hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
