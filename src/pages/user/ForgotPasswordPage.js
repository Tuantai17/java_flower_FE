import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../api/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50 py-12">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Quên mật khẩu?</h2>
                    <p className="text-gray-500 mt-2">
                        Nhập email của bạn để nhận link đặt lại mật khẩu
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="text-green-700 font-medium">Email đã được gửi!</p>
                                <p className="text-green-600 text-sm mt-1">
                                    Vui lòng kiểm tra hộp thư (bao gồm cả thư rác) để lấy link đặt lại mật khẩu.
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
                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="example@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang gửi...
                                </span>
                            ) : (
                                'GỬI LINK KHÔI PHỤC'
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-rose-600 transition"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại đăng nhập
                    </Link>
                </div>

                {/* Additional Help */}
                {success && (
                    <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-sm text-gray-500">
                            Không nhận được email?{' '}
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-rose-600 hover:underline font-medium"
                            >
                                Gửi lại
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
