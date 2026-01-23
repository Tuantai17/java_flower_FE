/**
 * Admin Profile Page - Trang Hồ sơ Admin
 * 
 * Hiển thị và chỉnh sửa thông tin cá nhân của admin
 * Cấu trúc modular, dễ dàng mở rộng
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ShieldCheckIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    XMarkIcon,
    CameraIcon,
    KeyIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import authService from '../../../api/authService';

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Profile Header với avatar và thông tin cơ bản
 */
const ProfileHeader = ({ admin, onEditClick }) => {
    const initials = admin?.username?.charAt(0)?.toUpperCase() || 'A';
    
    return (
        <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/50 shadow-lg overflow-hidden">
                        {admin?.avatar ? (
                            <img 
                                src={admin.avatar} 
                                alt={admin.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
                
                {/* Info */}
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {admin?.fullName || admin?.username || 'Admin User'}
                    </h1>
                    <p className="text-white/80 mt-1">{admin?.email || 'admin@flowercorner.vn'}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                            {admin?.role || 'ADMIN'}
                        </span>
                        {admin?.emailVerified && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-400/30 rounded-full text-sm">
                                <CheckCircleIcon className="h-4 w-4" />
                                Đã xác thực
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Edit Button */}
                <button
                    onClick={onEditClick}
                    className="px-5 py-2.5 bg-white text-rose-500 rounded-xl font-medium hover:bg-rose-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                    Chỉnh sửa
                </button>
            </div>
        </div>
    );
};

/**
 * Info Card Component
 */
const InfoCard = ({ icon: Icon, label, value, verified }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="p-3 bg-white rounded-lg shadow-sm">
            <Icon className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium text-gray-800 truncate">
                {value || <span className="text-gray-400 italic">Chưa cập nhật</span>}
            </p>
        </div>
        {verified && (
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
    </div>
);

/**
 * Section với tiêu đề
 */
const Section = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            {action}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

/**
 * Activity Item
 */
const ActivityItem = ({ title, time, type }) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'login':
                return 'bg-blue-100 text-blue-600';
            case 'update':
                return 'bg-green-100 text-green-600';
            case 'security':
                return 'bg-orange-100 text-orange-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };
    
    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className={`w-2 h-2 rounded-full ${getTypeStyles().replace('text-', 'bg-').replace('bg-', 'bg-')}`} />
            <div className="flex-1">
                <p className="text-sm text-gray-700">{title}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${getTypeStyles()}`}>
                {type === 'login' ? 'Đăng nhập' : type === 'update' ? 'Cập nhật' : 'Bảo mật'}
            </span>
        </div>
    );
};

/**
 * Edit Profile Modal
 */
const EditProfileModal = ({ isOpen, onClose, admin, onSave, onAvatarUpload }) => {
    const [formData, setFormData] = useState({
        fullName: admin?.fullName || '',
        email: admin?.email || '',
        phoneNumber: admin?.phoneNumber || '',
        address: admin?.address || '',
    });
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(admin?.avatar || null);
    const [avatarError, setAvatarError] = useState('');

    if (!isOpen) return null;

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            setAvatarError('Vui lòng chọn file ảnh hợp lệ');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setAvatarError('');
        setUploadingAvatar(true);

        try {
            const userService = (await import('../../../api/userService')).default;
            // Sử dụng uploadAvatarAdmin với adminToken
            const avatarUrl = await userService.uploadAvatarAdmin(file);
            setAvatarPreview(avatarUrl);
            if (onAvatarUpload) {
                onAvatarUpload(avatarUrl);
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setAvatarError('Lỗi upload: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAvatarError(''); // Clear any previous error
        try {
            await onSave(formData);
            // Hiển thị thông báo thành công
            alert('Cập nhật hồ sơ thành công!');
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            setAvatarError('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const initials = admin?.username?.charAt(0)?.toUpperCase() || 'A';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">Chỉnh sửa hồ sơ</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Ảnh đại diện
                        </label>
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">{initials}</span>
                                )}
                            </div>
                            <label 
                                htmlFor="edit-avatar-upload"
                                className="absolute bottom-0 right-0 p-2 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-lg"
                            >
                                {uploadingAvatar ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <CameraIcon className="h-4 w-4" />
                                )}
                            </label>
                            <input
                                type="file"
                                id="edit-avatar-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={uploadingAvatar}
                            />
                        </div>
                        {avatarError && (
                            <p className="text-sm text-red-500 mt-2">{avatarError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Click vào icon camera để thay đổi ảnh</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            placeholder="Nhập họ và tên"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-gray-400 text-xs">(không thể thay đổi)</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            placeholder="Nhập email"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                            placeholder="Nhập địa chỉ"
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Change Password Modal
 */
const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validate
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        setSaving(true);
        try {
            const response = await authService.changePasswordAdmin(formData);
            if (response.success) {
                setSuccess(true);
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            } else {
                setError(response.message || 'Không thể đổi mật khẩu');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.message || err.message || 'Không thể đổi mật khẩu');
        } finally {
            setSaving(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <KeyIcon className="h-5 w-5 text-rose-500" />
                        Đổi mật khẩu
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5" />
                            Đổi mật khẩu thành công!
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-12"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-12"
                                placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Mật khẩu cần có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường và 1 số
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-12"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving || success}
                            className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AdminProfilePage = () => {
    const { admin, isAuthenticated, updateAdmin } = useAdminAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle save profile
    const handleSaveProfile = async (data) => {
        try {
            const userService = (await import('../../../api/userService')).default;
            
            // Chỉ gửi các field được backend hỗ trợ (không có email)
            const profileData = {
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                address: data.address,
            };
            
            console.log('Sending profile update:', profileData);
            
            // Gọi API update profile với adminToken
            const updatedProfile = await userService.updateProfileAdmin(profileData);
            
            console.log('API response:', updatedProfile);
            
            // Cập nhật admin context với dữ liệu từ API response
            updateAdmin({ 
                ...admin, 
                fullName: updatedProfile.fullName || data.fullName,
                phoneNumber: updatedProfile.phoneNumber || data.phoneNumber,
                address: updatedProfile.address || data.address,
            });
            
            console.log('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error; // Re-throw để modal hiển thị lỗi
        }
    };

    // Mock activities
    const recentActivities = [
        { title: 'Đăng nhập từ Chrome trên Windows', time: 'Hôm nay, 14:30', type: 'login' },
        { title: 'Cập nhật thông tin cá nhân', time: 'Hôm qua, 10:15', type: 'update' },
        { title: 'Thay đổi mật khẩu', time: '3 ngày trước', type: 'security' },
        { title: 'Đăng nhập từ Safari trên MacOS', time: '5 ngày trước', type: 'login' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !admin) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Không có quyền truy cập</h2>
                <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem trang này</p>
                <Link
                    to="/admin/login"
                    className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                >
                    Đăng nhập
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Back Button */}
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                Quay lại Dashboard
            </Link>

            {/* Profile Header */}
            <ProfileHeader 
                admin={admin} 
                onEditClick={() => setShowEditModal(true)}
            />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Section title="Thông tin cá nhân">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard 
                                icon={UserCircleIcon}
                                label="Tên đăng nhập"
                                value={admin.username}
                            />
                            <InfoCard 
                                icon={EnvelopeIcon}
                                label="Email"
                                value={admin.email}
                                verified={admin.emailVerified}
                            />
                            <InfoCard 
                                icon={PhoneIcon}
                                label="Số điện thoại"
                                value={admin.phoneNumber}
                            />
                            <InfoCard 
                                icon={MapPinIcon}
                                label="Địa chỉ"
                                value={admin.address}
                            />
                            <InfoCard 
                                icon={CalendarDaysIcon}
                                label="Ngày tạo tài khoản"
                                value={formatDate(admin.createdAt)}
                            />
                            <InfoCard 
                                icon={ShieldCheckIcon}
                                label="Vai trò"
                                value={admin.role}
                            />
                        </div>
                    </Section>

                    {/* Security Section */}
                    <Section 
                        title="Bảo mật"
                        action={
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                            >
                                Thay đổi mật khẩu
                            </button>
                        }
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <KeyIcon className="h-5 w-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Mật khẩu</p>
                                        <p className="text-sm text-gray-500">Đã thay đổi 30 ngày trước</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                >
                                    Cập nhật
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Xác thực 2 yếu tố</p>
                                        <p className="text-sm text-gray-500">Tăng cường bảo mật tài khoản</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                                    Chưa bật
                                </span>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Column - Activity */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Section title="Thống kê nhanh">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-rose-50 rounded-xl">
                                <p className="text-2xl font-bold text-rose-600">24</p>
                                <p className="text-sm text-rose-500">Đơn hàng hôm nay</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <p className="text-2xl font-bold text-blue-600">5</p>
                                <p className="text-sm text-blue-500">Ticket đang chờ</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">98%</p>
                                <p className="text-sm text-green-500">Đánh giá tốt</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">156</p>
                                <p className="text-sm text-purple-500">Sản phẩm</p>
                            </div>
                        </div>
                    </Section>

                    {/* Recent Activity */}
                    <Section 
                        title="Hoạt động gần đây"
                        action={
                            <Link 
                                to="/admin/activity-log" 
                                className="text-sm text-rose-500 hover:text-rose-600"
                            >
                                Xem tất cả
                            </Link>
                        }
                    >
                        <div className="space-y-1">
                            {recentActivities.map((activity, index) => (
                                <ActivityItem key={index} {...activity} />
                            ))}
                        </div>
                    </Section>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                admin={admin}
                onSave={handleSaveProfile}
                onAvatarUpload={(avatarUrl) => updateAdmin({ ...admin, avatar: avatarUrl })}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
    );
};

export default AdminProfilePage;
