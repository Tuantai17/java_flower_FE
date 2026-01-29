import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    UserCircleIcon,
    PhoneIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    ShoppingCartIcon,
    CheckCircleIcon,
    BellIcon,
    TicketIcon,
    ArrowPathIcon,
    HeartIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon as UserCircleSolidIcon } from '@heroicons/react/24/solid';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';
import { getUserNotifications, getUserUnreadCount, userMarkAllAsRead } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import CartIcon from './CartIcon';
import ticketWebSocketService from '../../services/ticketWebSocketService';


const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showLoginSuccess, setShowLoginSuccess] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Search states
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchDropdownRef = useRef(null);

    const accountDropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user từ AuthContext
    const { user, logout, justLoggedIn, clearLoginNotification } = useAuth();
    
    // Lấy số lượng yêu thích từ AppContext
    const { favoritesCount } = useApp();

    // Hiển thị thông báo đăng nhập thành công CHỈ khi vừa thực hiện đăng nhập
    useEffect(() => {
        if (justLoggedIn && user) {
            setShowLoginSuccess(true);
            const timer = setTimeout(() => {
                setShowLoginSuccess(false);
                clearLoginNotification(); // Reset flag sau khi hiển thị xong
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn, user, clearLoginNotification]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setShowAccountDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            // Đóng search dropdown khi click ra ngoài
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load initial notifications from API when user logs in
    useEffect(() => {
        if (!user?.id) {
            // Reset notifications when user logs out
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const loadInitialNotifications = async () => {
            try {
                // Load unread count
                const countResponse = await getUserUnreadCount();
                if (countResponse.success && countResponse.data) {
                    setUnreadCount(countResponse.data.unreadCount || 0);
                }

                // Load recent notifications for dropdown
                const notifResponse = await getUserNotifications(0, 10);
                if (notifResponse.success && notifResponse.data?.content) {
                    const formattedNotifs = notifResponse.data.content.map(n => ({
                        id: n.id,
                        type: n.type,
                        message: n.title,
                        description: n.content,
                        url: n.url,
                        time: formatNotificationTime(n.createdAt),
                        unread: !n.isRead,
                    }));
                    setNotifications(formattedNotifs);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        };

        loadInitialNotifications();

        // Subscribe to realtime notifications via WebSocket
        ticketWebSocketService.subscribeToUserNotifications(user.id, (notification) => {
            console.log('🔔 User notification received:', notification);
            const newNotif = {
                id: notification.id || Date.now(),
                type: notification.type,
                message: notification.title,
                description: notification.content,
                url: notification.url,
                time: 'Vừa xong',
                unread: true,
            };
            setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
            setUnreadCount(prev => prev + 1);
        });
    }, [user?.id]);

    // Helper function to format notification time
    const formatNotificationTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getMenu();
                console.log('Categories loaded:', data);
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Debounced search - tìm kiếm sản phẩm realtime
    const handleSearchInput = useCallback((value) => {
        setSearchQuery(value);
        
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Nếu query rỗng, đóng dropdown
        if (!value.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        
        // Debounce 300ms
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await productApi.search(value.trim(), 0, 6);
                const products = response?.content || response || [];
                setSearchResults(Array.isArray(products) ? products.slice(0, 6) : []);
                setShowSearchDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchResults([]);
            setShowSearchDropdown(false);
        }
    };

    // Click vào sản phẩm từ dropdown
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchDropdown(false);
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(price);
    };

    const handleLogout = () => {
        logout();
        setShowAccountDropdown(false);
        navigate('/');
    };

    // Handle notification click
    const handleNotificationClick = (notif) => {
        setNotifications(prev => prev.map(n => 
            n.id === notif.id ? { ...n, unread: false } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - (notif.unread ? 1 : 0)));
        if (notif.url) {
            navigate(notif.url);
        }
        setShowNotifications(false);
    };

    // Mark all notifications as read
    const handleMarkAllRead = async () => {
        try {
            await userMarkAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Kiểm tra category đang active
    const isActiveCategory = (categoryId) => {
        return location.pathname === `/category/${categoryId}`;
    };

    // Kiểm tra trang hiện tại
    const isActivePage = (path) => {
        return location.pathname === path;
    };

    // Toggle mobile category dropdown
    const toggleMobileCategory = (categoryId) => {
        setMobileOpenCategory(mobileOpenCategory === categoryId ? null : categoryId);
    };

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
            }`}>

            {/* Toast thông báo đăng nhập thành công */}
            {showLoginSuccess && user && (
                <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <CheckCircleIcon className="h-6 w-6" />
                        <div>
                            <p className="font-medium">Đăng nhập thành công!</p>
                            <p className="text-sm text-green-100">Xin chào, {user.fullName || user.username}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar - Đơn giản hơn, không có account dropdown */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm py-2">
                <div className="container-custom flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        <span>HOTLINE: <strong>1900 633 045</strong> | 0865 160 360</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/contact" className="hover:text-pink-200 transition-colors">
                            Liên hệ
                        </Link>
                        <Link to="/cart" className="hover:text-pink-200 transition-colors">
                            Giỏ hàng
                        </Link>
                        <Link to="/checkout" className="hover:text-pink-200 transition-colors">
                            Thanh toán
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container-custom py-4">
                <div className="flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">🌸</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gradient">
                                FlowerCorner
                            </h1>
                            <p className="text-xs text-gray-500 italic">Say it with Flowers</p>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop với Dropdown */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl relative">
                        <div className="relative w-full" ref={searchInputRef}>
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm hoa tươi, quà tặng..."
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowSearchDropdown(true)}
                                className="input-search"
                                autoComplete="off"
                            />
                            {isSearching && (
                                <ArrowPathIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500 animate-spin" />
                            )}
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {showSearchDropdown && searchQuery.trim() && (
                            <div 
                                ref={searchDropdownRef}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                            >
                                {searchResults.length > 0 ? (
                                    <>
                                        <div className="px-4 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                Tìm thấy <span className="font-semibold text-rose-600">{searchResults.length}</span> sản phẩm
                                            </p>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {searchResults.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleProductClick(product.id)}
                                                    className="flex items-center gap-4 w-full px-4 py-3 hover:bg-rose-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.images?.[0]?.imageUrl || product.thumbnail || product.image ? (
                                                            <img 
                                                                src={product.images?.[0]?.imageUrl || product.thumbnail || product.image} 
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                                🌸
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                                        <p className="text-sm text-gray-500 truncate">{product.category?.name || 'Hoa tươi'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {product.discountPrice && product.discountPrice < product.price ? (
                                                                <>
                                                                    <span className="text-rose-600 font-semibold">{formatPrice(product.discountPrice)}</span>
                                                                    <span className="text-gray-400 text-sm line-through">{formatPrice(product.price)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-rose-600 font-semibold">{formatPrice(product.price)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                        {searchResults.length >= 6 && (
                                            <button 
                                                type="submit"
                                                className="w-full px-4 py-3 text-center text-rose-600 hover:bg-rose-50 font-medium border-t border-gray-100 transition-colors"
                                            >
                                                Xem tất cả kết quả →
                                            </button>
                                        )}
                                    </>
                                ) : searchQuery.trim() && !isSearching ? (
                                    <div className="px-4 py-8 text-center">
                                        <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                                        <p className="text-sm text-gray-400 mt-1">Thử tìm với từ khóa khác</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </form>

                    {/* Icons */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell - Only for logged in users */}
                        {user && (
                            <div className="hidden lg:block relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 hover:bg-pink-50 rounded-full transition-colors"
                                >
                                    <BellIcon className="h-6 w-6 text-gray-700" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-pink-50">
                                            <h3 className="font-semibold text-gray-800">
                                                Thông báo
                                                {unreadCount > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                                                        {unreadCount} mới
                                                    </span>
                                                )}
                                            </h3>
                                            <button 
                                                onClick={handleMarkAllRead}
                                                className="text-sm text-rose-600 hover:text-rose-700"
                                            >
                                                Đọc tất cả
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 text-center text-gray-500">
                                                    <BellIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                                    <p>Không có thông báo</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex items-start gap-3 ${
                                                            notif.unread ? 'bg-rose-50/50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            <TicketIcon className="h-5 w-5 text-rose-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${notif.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                                                {notif.message}
                                                            </p>
                                                            {notif.description && (
                                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                    {notif.description}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                        {notif.unread && (
                                                            <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 mt-2" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="px-4 py-3 bg-gray-50 text-center border-t">
                                            <Link 
                                                to="/notifications" 
                                                onClick={() => setShowNotifications(false)}
                                                className="text-sm text-rose-600 hover:text-rose-700"
                                            >
                                                Xem tất cả thông báo
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Icon - Desktop */}
                        <Link 
                            to="/wishlist" 
                            className="hidden lg:block relative p-2 hover:bg-pink-50 rounded-full transition-colors"
                            title="Sản phẩm yêu thích"
                        >
                            <HeartIcon className="h-6 w-6 text-gray-700" />
                            {favoritesCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                    {favoritesCount > 9 ? '9+' : favoritesCount}
                                </span>
                            )}
                        </Link>

                        {/* User Icon với Dropdown - Desktop */}
                        <div className="hidden lg:block relative" ref={accountDropdownRef}>
                            <button
                                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                className={`relative p-2 rounded-full transition-colors flex items-center gap-2 ${user ? 'bg-rose-100 hover:bg-rose-200' : 'hover:bg-pink-50'}`}
                            >
                                {user ? (
                                    <>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full object-cover border border-rose-200"
                                            />
                                        ) : (
                                            <UserCircleSolidIcon className="h-6 w-6 text-rose-600" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden xl:block">
                                            {user.fullName || user.username}
                                        </span>
                                        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform hidden xl:block ${showAccountDropdown ? 'rotate-180' : ''}`} />
                                        <span className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                                    </>
                                ) : (
                                    <UserIcon className="h-6 w-6 text-gray-700" />
                                )}
                            </button>

                            {/* Account Dropdown Menu */}
                            {showAccountDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                                    {user ? (
                                        <>
                                            {/* User Info Header */}
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-rose-500">
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt="Avatar"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserCircleSolidIcon className="h-6 w-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-800 truncate">{user.fullName || user.username}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <Link
                                                to="/account"
                                                onClick={() => setShowAccountDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            >
                                                <UserCircleIcon className="h-5 w-5" />
                                                <span>Tài khoản của tôi</span>
                                            </Link>
                                            <Link
                                                to="/profile/orders"
                                                onClick={() => setShowAccountDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            >
                                                <ShoppingCartIcon className="h-5 w-5" />
                                                <span>Đơn hàng của tôi</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setShowAccountDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            >
                                                <Cog6ToothIcon className="h-5 w-5" />
                                                <span>Cài đặt</span>
                                            </Link>

                                            {/* Admin Dashboard - Hiển thị cho ADMIN hoặc STAFF */}
                                            {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                                                <>
                                                    <div className="border-t border-gray-100 my-2"></div>
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setShowAccountDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Trang Quản Trị</span>
                                                        <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                                                            {user.role === 'ADMIN' ? 'Admin' : 'Staff'}
                                                        </span>
                                                    </Link>
                                                </>
                                            )}

                                            {/* Divider */}
                                            <div className="border-t border-gray-100 my-2"></div>

                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Chưa đăng nhập */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-gray-600 text-sm">Chào mừng bạn đến với FlowerCorner!</p>
                                            </div>
                                            <Link
                                                to="/login"
                                                onClick={() => setShowAccountDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-white bg-rose-500 hover:bg-rose-600 transition-colors mx-3 my-2 rounded-lg justify-center font-medium"
                                            >
                                                Đăng nhập
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setShowAccountDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-rose-600 border border-rose-500 hover:bg-rose-50 transition-colors mx-3 mb-2 rounded-lg justify-center font-medium"
                                            >
                                                Đăng ký tài khoản
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart với count từ AppContext */}
                        <CartIcon showDropdown={true} />

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-pink-50 rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation - Desktop với Menu 2 lớp */}
            <nav className="border-t border-gray-100 hidden lg:block bg-white">
                <div className="container-custom">
                    <ul className="flex items-center justify-center">
                        {/* Trang Chủ */}
                        <li>
                            <Link
                                to="/"
                                className={`
                                    flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                    transition-all duration-300 border-b-2
                                    ${isActivePage('/')
                                        ? 'text-rose-600 border-rose-500'
                                        : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                    }
                                `}
                            >
                                Trang Chủ
                            </Link>
                        </li>
                        {/* Sản Phẩm */}
                        <li>
                            <Link
                                to="/shop"
                                className={`
                                    flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                    transition-all duration-300 border-b-2
                                    ${isActivePage('/shop') || location.pathname.startsWith('/shop')
                                        ? 'text-rose-600 border-rose-500'
                                        : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                    }
                                `}
                            >
                                Sản Phẩm
                            </Link>
                        </li>


                        {/* Tin Tức */}
                        <li>
                            <Link
                                to="/news"
                                className={`
                                    flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                    transition-all duration-300 border-b-2
                                    ${isActivePage('/news') || location.pathname.startsWith('/news')
                                        ? 'text-rose-600 border-rose-500'
                                        : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                    }
                                `}
                            >
                                Tin Tức
                            </Link>
                        </li>

                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="relative group"
                                onMouseEnter={() => setOpenDropdown(category.id)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    to={`/category/${category.id}`}
                                    className={`
                                        flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                        transition-all duration-300 border-b-2
                                        ${isActiveCategory(category.id) || openDropdown === category.id
                                            ? 'text-rose-600 border-rose-500'
                                            : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                        }
                                    `}
                                >
                                    {category.name}
                                    {category.children && category.children.length > 0 && (
                                        <ChevronDownIcon
                                            className={`h-4 w-4 transition-transform duration-300 ${openDropdown === category.id ? 'rotate-180' : ''
                                                }`}
                                        />
                                    )}
                                </Link>

                                {/* Dropdown Menu con - 2 lớp */}
                                {category.children && category.children.length > 0 && (
                                    <div
                                        className={`
                                            absolute top-full left-0 bg-white shadow-2xl rounded-b-xl py-3 min-w-[280px] 
                                            border border-gray-100 border-t-2 border-t-rose-500 z-50
                                            transition-all duration-300 origin-top
                                            ${openDropdown === category.id
                                                ? 'opacity-100 visible transform scale-100'
                                                : 'opacity-0 invisible transform scale-95'
                                            }
                                        `}
                                    >
                                        {category.children.map((child, index) => (
                                            <Link
                                                key={child.id}
                                                to={`/category/${child.id}`}
                                                className={`
                                                    flex items-center px-5 py-3 text-gray-600 
                                                    hover:text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50
                                                    transition-all duration-200 group/item
                                                    ${index !== category.children.length - 1 ? 'border-b border-gray-50' : ''}
                                                    ${isActiveCategory(child.id) ? 'text-rose-600 bg-rose-50' : ''}
                                                `}
                                            >
                                                <span className="flex-1 text-sm font-medium">{child.name}</span>
                                                <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover/item:opacity-100 transform translate-x-0 group-hover/item:translate-x-1 transition-all duration-200" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Hotline Bar */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 py-2 text-center hidden lg:block">
                <p className="text-rose-600 font-medium text-sm">
                    HOTLINE ĐẶT HOA NHANH - TP HCM: <strong>1900 633 045</strong> - Hà Nội: <strong>094 200 7921</strong>
                </p>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
                    {/* Mobile User Account */}
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-rose-500">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleSolidIcon className="h-8 w-8 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{user.fullName || user.username}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg text-center font-medium hover:bg-rose-600 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 py-2.5 border border-rose-500 text-rose-600 rounded-lg text-center font-medium hover:bg-rose-50 transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="input-search"
                                autoComplete="off"
                            />
                            {isSearching && (
                                <ArrowPathIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500 animate-spin" />
                            )}
                        </div>
                        
                        {/* Mobile Search Results */}
                        {showSearchDropdown && searchResults.length > 0 && (
                            <div className="mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-lg">
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.slice(0, 4).map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => {
                                                handleProductClick(product.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-rose-50 text-left border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {product.images?.[0]?.imageUrl || product.thumbnail ? (
                                                    <img 
                                                        src={product.images?.[0]?.imageUrl || product.thumbnail} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                                                <p className="text-rose-600 font-semibold text-sm">{formatPrice(product.discountPrice || product.price)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full px-4 py-2.5 text-center text-rose-600 hover:bg-rose-50 font-medium text-sm border-t border-gray-100"
                                >
                                    Xem tất cả kết quả
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Mobile Navigation với 2 lớp */}
                    <ul className="py-2">
                        {/* Trang Chủ */}
                        <li className="border-b border-gray-50">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    block px-6 py-3.5 font-semibold text-sm uppercase
                                    ${isActivePage('/') ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                `}
                            >
                                Trang Chủ
                            </Link>
                        </li>
                        {/* Sản Phẩm */}
                        <li className="border-b border-gray-50">
                            <Link
                                to="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    block px-6 py-3.5 font-semibold text-sm uppercase
                                    ${isActivePage('/shop') || location.pathname.startsWith('/shop') ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                `}
                            >
                                Sản Phẩm
                            </Link>
                        </li>

                        {/* Yêu thích */}
                        <li className="border-b border-gray-50">
                            <Link
                                to="/wishlist"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center justify-between px-6 py-3.5 font-semibold text-sm uppercase
                                    ${isActivePage('/wishlist') ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <HeartIcon className="h-5 w-5" />
                                    Yêu thích
                                </span>
                                {favoritesCount > 0 && (
                                    <span className="px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* Trang Quản Trị - Chỉ hiển thị cho ADMIN hoặc STAFF */}
                        {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                            <li className="border-b border-gray-50">
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center justify-between px-6 py-3.5 font-semibold text-sm uppercase
                                        bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        <Cog6ToothIcon className="h-5 w-5" />
                                        Trang Quản Trị
                                    </span>
                                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                                        {user.role === 'ADMIN' ? 'Admin' : 'Staff'}
                                    </span>
                                </Link>
                            </li>
                        )}

                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                            <li key={category.id} className="border-b border-gray-50">
                                {/* Parent Category */}
                                <div className="flex items-center">
                                    <Link
                                        to={`/category/${category.id}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex-1 px-6 py-3.5 font-semibold text-sm uppercase
                                            ${isActiveCategory(category.id) ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                        `}
                                    >
                                        {category.name}
                                    </Link>
                                    {category.children && category.children.length > 0 && (
                                        <button
                                            onClick={() => toggleMobileCategory(category.id)}
                                            className="px-4 py-3.5 text-gray-500 hover:text-rose-600 transition-colors"
                                        >
                                            <ChevronDownIcon
                                                className={`h-5 w-5 transition-transform duration-300 ${mobileOpenCategory === category.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Children Categories cho Mobile */}
                                {category.children && category.children.length > 0 && mobileOpenCategory === category.id && (
                                    <div className="bg-gray-50 border-t border-gray-100">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                to={`/category/${child.id}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`
                                                    block pl-10 pr-6 py-3 text-sm border-b border-gray-100 last:border-b-0
                                                    ${isActiveCategory(child.id)
                                                        ? 'text-rose-600 bg-rose-50 font-medium'
                                                        : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                                    }
                                                `}
                                            >
                                                • {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Hotline */}
                    <div className="p-4 bg-rose-50 text-center">
                        <p className="text-rose-600 font-medium text-sm">
                            📞 Hotline: <strong>1900 633 045</strong>
                        </p>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
