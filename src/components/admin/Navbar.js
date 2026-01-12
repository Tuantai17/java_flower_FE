import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    BellIcon,
    Bars3Icon,
    ChevronDownIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    TicketIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';
import ticketWebSocketService from '../../services/ticketWebSocketService';
import { getUnreadNotifications, getUnreadCount, markAllAsRead, markAsRead } from '../../api/notificationApi';

const Navbar = ({ onMenuToggle }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const notificationRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin admin từ context
    const { admin, logout, isAuthenticated } = useAdminAuth();

    // Fetch notifications from API on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [isAuthenticated]);

    // Subscribe to realtime notifications
    useEffect(() => {
        if (!isAuthenticated) return;

        // Subscribe to admin ticket and order notifications
        ticketWebSocketService.subscribeToAdminNotifications(
            // On new ticket
            (notification) => {
                console.log('🎫 New ticket notification:', notification);
                const newNotif = {
                    id: notification.id || Date.now(),
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    url: notification.url,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                };
                setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
                setUnreadCount(prev => prev + 1);
            },
            // On new message
            (notification) => {
                console.log('💬 New message notification:', notification);
                const newNotif = {
                    id: notification.id || Date.now(),
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    url: notification.url,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                };
                setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
                setUnreadCount(prev => prev + 1);
            },
            // On new order / order update
            (notification) => {
                console.log('🛒 New order notification:', notification);
                const newNotif = {
                    id: notification.id || Date.now(),
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    url: notification.url,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                };
                setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
                setUnreadCount(prev => prev + 1);
            }
        );
    }, [isAuthenticated]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await getUnreadNotifications();
            if (response.success && Array.isArray(response.data)) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const response = await getUnreadCount();
            if (response.success && response.data) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

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
            '/admin/profile': 'Hồ sơ cá nhân',
            '/admin/vouchers': 'Quản lý Voucher',
            '/admin/stock': 'Quản lý Tồn kho',
            '/admin/reviews': 'Quản lý Đánh giá',
            '/admin/tickets': 'Quản lý Ticket',
            '/admin/notifications': 'Thông báo',
        };

        if (location.pathname.includes('/edit/')) {
            if (location.pathname.includes('products')) return 'Chỉnh sửa sản phẩm';
            if (location.pathname.includes('categories')) return 'Chỉnh sửa danh mục';
            if (location.pathname.includes('vouchers')) return 'Chỉnh sửa Voucher';
        }
        
        if (location.pathname.match(/^\/admin\/products\/\d+$/)) return 'Chi tiết sản phẩm';
        if (location.pathname.match(/^\/admin\/orders\/\d+$/)) return 'Chi tiết đơn hàng';
        if (location.pathname.match(/^\/admin\/tickets\/\d+$/)) return 'Chi tiết Ticket';

        for (const [path, title] of Object.entries(paths)) {
            if (location.pathname === path) return title;
        }

        return 'Admin Panel';
    };

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

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/admin/login');
    };

    // Handle notification click
    const handleNotificationClick = async (notif) => {
        // Mark as read in backend and state
        if (!notif.isRead) {
            await markAsRead(notif.id);
            setNotifications(prev => prev.map(n => 
                n.id === notif.id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        // Navigate
        if (notif.url) {
            navigate(notif.url);
        }
        setShowNotifications(false);
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'TICKET_NEW':
            case 'TICKET_MESSAGE':
                return <TicketIcon className="h-5 w-5 text-pink-500" />;
            case 'ORDER_NEW':
            case 'ORDER_STATUS':
                return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
            case 'STOCK_LOW':
                return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
            case 'USER_NEW':
                return <UserPlusIcon className="h-5 w-5 text-green-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-600" />
                    </button>
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
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <BellIcon className="h-6 w-6 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
                                    <h3 className="font-semibold text-gray-800">
                                        Thông báo
                                        {unreadCount > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                                {unreadCount} mới
                                            </span>
                                        )}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={handleMarkAllRead}
                                            className="text-sm text-pink-600 hover:text-pink-700"
                                        >
                                            Đọc tất cả
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {loading ? (
                                        <div className="py-8 text-center">
                                            <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">Đang tải...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            <BellIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                            <p>Không có thông báo mới</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex items-start gap-3 transition-colors ${
                                                    !notif.isRead ? 'bg-pink-50/50' : ''
                                                }`}
                                            >
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notif.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {notif.content && (
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                            {notif.content}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTime(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-center">
                                    <Link 
                                        to="/admin/notifications" 
                                        onClick={() => setShowNotifications(false)}
                                        className="text-sm text-pink-600 hover:text-pink-700"
                                    >
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
