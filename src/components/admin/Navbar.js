import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    BellIcon,
    Bars3Icon,
    ChevronDownIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';

const Navbar = ({ onMenuToggle }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin admin từ context
    const { admin, logout, isAuthenticated } = useAdminAuth();

    // Get current page title
    const getPageTitle = () => {
        const paths = {
            '/admin': 'Dashboard',
            '/admin/dashboard': 'Dashboard',
            '/admin/products': 'Quản lý sản phẩm',
            '/admin/products/create': 'Thêm sản phẩm',
            '/admin/categories': 'Quản lý danh mục',
            '/admin/categories/create': 'Thêm danh mục',
            '/admin/orders': 'Quản lý đơn hàng',
            '/admin/customers': 'Quản lý khách hàng',
            '/admin/analytics': 'Thống kê',
            '/admin/settings': 'Cài đặt',
            '/admin/vouchers': 'Quản lý Voucher',
            '/admin/stock': 'Quản lý Tồn kho',
            '/admin/reviews': 'Quản lý Đánh giá',
        };

        // Check for dynamic routes first
        if (location.pathname.includes('/edit/')) {
            if (location.pathname.includes('products')) return 'Chỉnh sửa sản phẩm';
            if (location.pathname.includes('categories')) return 'Chỉnh sửa danh mục';
            if (location.pathname.includes('vouchers')) return 'Chỉnh sửa Voucher';
        }
        
        // Check for product detail page (e.g., /admin/products/123)
        if (location.pathname.match(/^\/admin\/products\/\d+$/)) {
            return 'Chi tiết sản phẩm';
        }

        // Check for order detail page
        if (location.pathname.match(/^\/admin\/orders\/\d+$/)) {
            return 'Chi tiết đơn hàng';
        }

        for (const [path, title] of Object.entries(paths)) {
            if (location.pathname === path) return title;
        }

        return 'Admin Panel';
    };

    // Lấy thông tin hiển thị của admin
    const getAdminDisplayInfo = () => {
        if (!admin) {
            return {
                name: 'Admin',
                email: 'admin@flowercorner.vn',
                initials: 'A',
                avatar: null,
            };
        }

        const name = admin.name || admin.fullName || admin.username || 'Admin';
        const email = admin.email || 'admin@flowercorner.vn';
        const initials = name.charAt(0).toUpperCase();
        const avatar = admin.avatar || admin.avatarUrl || admin.profileImage || null;

        return { name, email, initials, avatar };
    };

    const adminInfo = getAdminDisplayInfo();

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/admin/login');
    };

    const notifications = [
        { id: 1, message: 'Đơn hàng mới #1234', time: '5 phút trước', unread: true },
        { id: 2, message: 'Sản phẩm sắp hết hàng', time: '1 giờ trước', unread: true },
        { id: 3, message: 'Khách hàng mới đăng ký', time: '2 giờ trước', unread: false },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-600" />
                    </button>

                    {/* Page Title */}
                    <h1 className="text-xl font-display font-semibold text-gray-800">
                        {getPageTitle()}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="hidden md:block relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-64"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <BellIcon className="h-6 w-6 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                    <button className="text-sm text-pink-600 hover:text-pink-700">
                                        Đọc tất cả
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${notif.unread ? 'bg-pink-50/50' : ''
                                                }`}
                                        >
                                            <p className="text-sm text-gray-700">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-center">
                                    <Link to="/admin/notifications" className="text-sm text-pink-600 hover:text-pink-700">
                                        Xem tất cả thông báo
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {/* Avatar */}
                            {adminInfo.avatar ? (
                                <img
                                    src={adminInfo.avatar}
                                    alt={adminInfo.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-pink-200"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {adminInfo.initials}
                                </div>
                            )}
                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                {adminInfo.name}
                            </span>
                            <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-500" />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-800">{adminInfo.name}</p>
                                    <p className="text-xs text-gray-500">{adminInfo.email}</p>
                                    {admin?.role && (
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                                            {admin.role}
                                        </span>
                                    )}
                                </div>
                                <div className="py-2">
                                    <Link
                                        to="/admin/profile"
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <UserCircleIcon className="h-5 w-5" />
                                        <span>Hồ sơ</span>
                                    </Link>
                                    <Link
                                        to="/admin/settings"
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Cog6ToothIcon className="h-5 w-5" />
                                        <span>Cài đặt</span>
                                    </Link>
                                </div>
                                <div className="py-2 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

