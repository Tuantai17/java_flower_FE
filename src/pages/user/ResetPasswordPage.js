import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    // Lấy token và email từ URL query parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        // Validate cả token và email từ URL
        if (!token || !email) {
            setTokenValid(false);
            setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password match
        if (formData.newPassword !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        // Validate password strength
        if (formData.newPassword.length < 6) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        setLoading(true);

        try {
            // Gửi đầy đủ thông tin: token, email, newPassword, confirmPassword
            await authService.resetPassword({
                token,
                email,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Link có thể đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50 py-12">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
                    <p className="text-gray-500 mt-2">
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                    {/* Hiển thị email đang reset (nếu có) */}
                    {email && tokenValid && (
                        <p className="text-sm text-teal-600 mt-1 font-medium">
                            {email}
                        </p>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="text-green-700 font-medium">Đặt lại mật khẩu thành công!</p>
                                <p className="text-green-600 text-sm mt-1">
                                    Đang chuyển hướng đến trang đăng nhập...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                {!success && tokenValid && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                placeholder="Nhập mật khẩu mới"
                                required
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Nhập lại mật khẩu"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'ĐẶT LẠI MẬT KHẨU'
                            )}
                        </button>
                    </form>
                )}

                {/* Invalid Token State */}
                {!tokenValid && !success && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                        >
                            Yêu cầu link mới
                        </Link>
                    </div>
                )}

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-teal-600 transition"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
