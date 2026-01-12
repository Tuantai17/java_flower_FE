/**
 * Change Password Page - Trang đổi mật khẩu cho User
 * 
 * Cho phép người dùng đã đăng nhập đổi mật khẩu
 * Hiển thị thông tin user và form đổi mật khẩu
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import userService from '../../api/userService';
import Loading from '../../components/common/Loading';
import {
    KeyIcon,
    UserCircleIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ChangePasswordPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Profile state
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // UI state
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
            const data = await userService.getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // User Google không cần mật khẩu hiện tại
        const isGoogleUser = profile?.authProvider === 'GOOGLE';

        if (!isGoogleUser && !formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        // Chỉ kiểm tra trùng mật khẩu với user LOCAL
        if (!isGoogleUser && formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setNotification({ show: false, type: '', message: '' });

        try {
            const response = await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });

            if (response.success) {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Đổi mật khẩu thành công! Bạn sẽ được chuyển về trang tài khoản.'
                });
                
                // Reset form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });

                // Redirect after 2s
                setTimeout(() => {
                    navigate('/account');
                }, 2000);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.message || 'Đổi mật khẩu thất bại'
                });
            }
        } catch (err) {
            console.error('Error changing password:', err);
            let errorMessage = 'Có lỗi xảy ra khi đổi mật khẩu';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setNotification({
                show: true,
                type: 'error',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    // Redirect if not logged in
    if (!user && !loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-gray-500 mb-6">Vui lòng đăng nhập để đổi mật khẩu</p>
                    <Link to="/login" className="btn-primary inline-block">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingProfile) {
        return <Loading text="Đang tải thông tin..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-teal-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link 
                    to="/account" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-600 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Quay lại tài khoản</span>
                </Link>

                {/* Header Card - User Info */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {profile?.fullName || profile?.username || 'Người dùng'}
                                </h1>
                                <div className="flex items-center gap-2 text-white/80 mt-1">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    <span className="text-sm">{profile?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-600">@{profile?.username}</span>
                            </div>
                            {profile?.phoneNumber && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">{profile.phoneNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    profile?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                    profile?.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {profile?.role === 'ADMIN' ? 'Quản trị viên' :
                                     profile?.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <KeyIcon className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {profile?.authProvider === 'GOOGLE' ? 'Đặt mật khẩu' : 'Đổi mật khẩu'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {profile?.authProvider === 'GOOGLE' 
                                    ? 'Tạo mật khẩu để đăng nhập bằng email' 
                                    : 'Cập nhật mật khẩu để bảo vệ tài khoản'}
                            </p>
                        </div>
                    </div>

                    {/* Notification */}
                    {notification.show && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                            notification.type === 'success' 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            {notification.type === 'success' ? (
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <ExclamationCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                            )}
                            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                                {notification.message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Google User Notice */}
                        {profile?.authProvider === 'GOOGLE' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <div>
                                    <p className="text-blue-800 font-medium">Tài khoản đăng nhập bằng Google</p>
                                    <p className="text-blue-600 text-sm mt-1">
                                        Bạn đã đăng ký bằng Google nên không có mật khẩu. 
                                        Hãy đặt mật khẩu để có thể đăng nhập bằng email/mật khẩu.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Current Password - CHỈ HIỂN THỊ CHO USER LOCAL */}
                        {profile?.authProvider !== 'GOOGLE' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                                            errors.currentPassword ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? 
                                            <EyeSlashIcon className="h-5 w-5" /> : 
                                            <EyeIcon className="h-5 w-5" />
                                        }
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                                )}
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu mới <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                                        errors.newPassword ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                    placeholder="Nhập mật khẩu mới"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? 
                                        <EyeSlashIcon className="h-5 w-5" /> : 
                                        <EyeIcon className="h-5 w-5" />
                                    }
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Mật khẩu cần có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường và 1 số
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? 
                                        <EyeSlashIcon className="h-5 w-5" /> : 
                                        <EyeIcon className="h-5 w-5" />
                                    }
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                                    Yêu cầu mật khẩu:
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className={`flex items-center gap-2 ${
                                        formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Ít nhất 8 ký tự
                                    </li>
                                    <li className={`flex items-center gap-2 ${
                                        /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Có 1 chữ hoa (A-Z)
                                    </li>
                                    <li className={`flex items-center gap-2 ${
                                        /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Có 1 chữ thường (a-z)
                                    </li>
                                    <li className={`flex items-center gap-2 ${
                                        /\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Có 1 số (0-9)
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/account')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <KeyIcon className="h-5 w-5" />
                                        <span>{profile?.authProvider === 'GOOGLE' ? 'Đặt mật khẩu' : 'Đổi mật khẩu'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-semibold text-blue-800 mb-3">💡 Mẹo bảo mật</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                        <li>• Không sử dụng thông tin cá nhân trong mật khẩu (tên, ngày sinh...)</li>
                        <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                        <li>• Thay đổi mật khẩu định kỳ (3-6 tháng một lần)</li>
                        <li>• Sử dụng mật khẩu khác nhau cho các tài khoản khác nhau</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
