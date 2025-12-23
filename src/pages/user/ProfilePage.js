import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../api/userService';
import Loading from '../../components/common/Loading';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    PencilSquareIcon,
    ShieldCheckIcon,
    CalendarIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await userService.getProfile();
            console.log('📋 Profile data:', data);
            setProfile(data);
            setEditForm({
                fullName: data.fullName || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                setError('Không thể tải thông tin tài khoản. ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setNotification({ show: false, type: '', message: '' });

        try {
            const updatedProfile = await userService.updateProfile(editForm);
            setProfile(updatedProfile);
            setIsEditing(false);
            setNotification({
                show: true,
                type: 'success',
                message: 'Cập nhật thông tin thành công!'
            });
        } catch (err) {
            console.error('Error updating profile:', err);
            setNotification({
                show: true,
                type: 'error',
                message: 'Lỗi khi cập nhật: ' + (err.response?.data?.message || err.message)
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            ADMIN: { label: 'Quản trị viên', color: 'bg-red-100 text-red-700' },
            STAFF: { label: 'Nhân viên', color: 'bg-blue-100 text-blue-700' },
            CUSTOMER: { label: 'Khách hàng', color: 'bg-green-100 text-green-700' },
        };
        const config = roleConfig[role] || { label: role, color: 'bg-gray-100 text-gray-700' };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Redirect if not logged in
    if (!user && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản</p>
                    <Link to="/login" className="btn-primary inline-block">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <Loading text="Đang tải thông tin tài khoản..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-teal-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={fetchProfile} className="btn-primary">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-teal-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Notification */}
                {notification.show && (
                    <div className={`mb-6 p-4 rounded-lg border ${notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-32"></div>
                    <div className="relative px-6 pb-6">
                        {/* Avatar */}
                        <div className="absolute -top-16 left-6">
                            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                        {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex justify-end pt-4 gap-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Đăng xuất
                            </button>
                        </div>

                        {/* User Name & Role */}
                        <div className="mt-8">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {profile?.fullName || profile?.username || 'Người dùng'}
                            </h1>
                            <p className="text-gray-500 mb-2">@{profile?.username}</p>
                            {getRoleBadge(profile?.role)}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <UserCircleIcon className="h-6 w-6 text-rose-500" />
                            Thông tin cá nhân
                        </h3>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Họ và tên</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={editForm.fullName}
                                        onChange={handleEditChange}
                                        placeholder="Nhập họ và tên"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-800 font-medium">
                                        {profile?.fullName || <span className="text-amber-500 italic">Chưa cập nhật</span>}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Tên đăng nhập</label>
                                <p className="text-gray-800 font-medium">{profile?.username}</p>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                    <p className="text-gray-800">{profile?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <PhoneIcon className="h-6 w-6 text-rose-500" />
                            Thông tin liên hệ
                        </h3>

                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-start gap-3">
                                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={editForm.phoneNumber}
                                            onChange={handleEditChange}
                                            placeholder="Nhập số điện thoại"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800">
                                            {profile?.phoneNumber || <span className="text-amber-500 italic">Chưa cập nhật</span>}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={editForm.address}
                                            onChange={handleEditChange}
                                            placeholder="Nhập địa chỉ"
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800">
                                            {profile?.address || <span className="text-amber-500 italic">Chưa cập nhật</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <ShieldCheckIcon className="h-6 w-6 text-rose-500" />
                            Thông tin tài khoản
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
                                {getRoleBadge(profile?.role)}
                            </div>

                            {/* Created At */}
                            <div className="flex items-start gap-3">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo tài khoản</label>
                                    <p className="text-gray-800">{formatDate(profile?.createdAt)}</p>
                                </div>
                            </div>

                            {/* Updated At */}
                            <div className="flex items-start gap-3">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Cập nhật gần nhất</label>
                                    <p className="text-gray-800">{formatDate(profile?.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Liên kết nhanh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            to="/profile/orders"
                            className="flex flex-col items-center p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                            <span className="text-2xl mb-2">📦</span>
                            <span className="text-sm font-medium text-gray-700">Đơn hàng</span>
                        </Link>
                        <Link
                            to="/wishlist"
                            className="flex flex-col items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                        >
                            <span className="text-2xl mb-2">❤️</span>
                            <span className="text-sm font-medium text-gray-700">Yêu thích</span>
                        </Link>
                        <Link
                            to="/cart"
                            className="flex flex-col items-center p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                        >
                            <span className="text-2xl mb-2">🛒</span>
                            <span className="text-sm font-medium text-gray-700">Giỏ hàng</span>
                        </Link>
                        <Link
                            to="/change-password"
                            className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            <span className="text-2xl mb-2">🔐</span>
                            <span className="text-sm font-medium text-gray-700">Đổi mật khẩu</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
