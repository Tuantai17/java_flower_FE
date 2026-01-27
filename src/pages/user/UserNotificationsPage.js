import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon,
    CheckCircleIcon,
    TrashIcon,
    TicketIcon,
    ShoppingBagIcon,
    StarIcon,
    GiftIcon,
    CheckIcon,
    XCircleIcon,
    ArrowPathIcon,
    BellAlertIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { 
    getUserNotifications, 
    userMarkAllAsRead, 
    userMarkAsRead,
    userDeleteNotification,
    userDeleteNotifications,
    userDeleteAllNotifications,
    userDeleteReadNotifications,
} from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import ticketWebSocketService from '../../services/ticketWebSocketService';

/**
 * Trang thông báo cho User với Real-time WebSocket
 * Hiển thị tất cả thông báo của user với chức năng xóa và nhận realtime
 * 
 * LƯU Ý: Component này được render bên trong UserLayout,
 * nên KHÔNG cần thêm Header/Footer
 */
const UserNotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [newNotifAnimation, setNewNotifAnimation] = useState(false);
    const navigate = useNavigate();
    const audioRef = useRef(null);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUserNotifications(page, 50);
            if (response.success && response.data) {
                setNotifications(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Connect WebSocket for realtime notifications
    useEffect(() => {
        if (!user?.id) return;

        console.log('🔔 Setting up realtime notifications for user:', user.id);

        // Connect and subscribe to user notifications
        ticketWebSocketService.subscribeToUserNotifications(user.id, (newNotification) => {
            console.log('🔔 New realtime notification received:', newNotification);
            
            // Add new notification to top of list
            setNotifications(prev => {
                // Check if notification already exists
                const exists = prev.find(n => n.id === newNotification.id);
                if (exists) return prev;
                return [newNotification, ...prev];
            });

            // Trigger animation
            setNewNotifAnimation(true);
            setTimeout(() => setNewNotifAnimation(false), 3000);

            // Play notification sound (optional)
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
            }
        });

        setWsConnected(true);

        return () => {
            // Cleanup will be handled by service
            setWsConnected(false);
        };
    }, [user?.id]);

    const handleMarkAllRead = async () => {
        await userMarkAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = async (notif, e) => {
        if (selectMode || e?.target?.type === 'checkbox') {
            return;
        }
        
        if (!notif.isRead) {
            await userMarkAsRead(notif.id);
            setNotifications(prev => prev.map(n => 
                n.id === notif.id ? { ...n, isRead: true } : n
            ));
        }
        if (notif.url) {
            navigate(notif.url);
        }
    };

    // ==================== DELETE HANDLERS ====================

    const handleDeleteSingle = async (notifId, e) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;

        try {
            setDeleteLoading(true);
            await userDeleteNotification(notifId);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
            setSelectedIds(prev => prev.filter(id => id !== notifId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thông báo đã chọn?`)) return;

        try {
            setDeleteLoading(true);
            await userDeleteNotifications(selectedIds);
            setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
            setSelectedIds([]);
            setSelectMode(false);
        } catch (error) {
            console.error('Error deleting notifications:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ thông báo? Hành động này không thể hoàn tác!')) return;

        try {
            setDeleteLoading(true);
            await userDeleteAllNotifications();
            setNotifications([]);
            setSelectedIds([]);
            setSelectMode(false);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteRead = async () => {
        const readCount = notifications.filter(n => n.isRead).length;
        if (readCount === 0) {
            alert('Không có thông báo đã đọc để xóa.');
            return;
        }
        if (!window.confirm(`Bạn có chắc muốn xóa ${readCount} thông báo đã đọc?`)) return;

        try {
            setDeleteLoading(true);
            await userDeleteReadNotifications();
            setNotifications(prev => prev.filter(n => !n.isRead));
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting read notifications:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // ==================== SELECT HANDLERS ====================

    const toggleSelectMode = () => {
        setSelectMode(!selectMode);
        setSelectedIds([]);
    };

    const toggleSelectItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNotifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNotifications.map(n => n.id));
        }
    };

    // ==================== HELPER FUNCTIONS ====================

    const getNotificationIcon = (type) => {
        const iconClass = "h-6 w-6";
        switch (type) {
            case 'TICKET_REPLY':
            case 'TICKET_STATUS':
                return <TicketIcon className={`${iconClass} text-pink-500`} />;
            case 'ORDER_CREATED':
            case 'ORDER_STATUS':
            case 'ORDER_SHIPPING':
            case 'ORDER_DELIVERED':
                return <ShoppingBagIcon className={`${iconClass} text-green-500`} />;
            case 'ORDER_CANCELLED':
                return <XCircleIcon className={`${iconClass} text-red-500`} />;
            case 'REVIEW_REPLY':
            case 'REVIEW_APPROVED':
                return <StarIcon className={`${iconClass} text-yellow-500`} />;
            case 'VOUCHER':
            case 'PROMOTION':
                return <GiftIcon className={`${iconClass} text-purple-500`} />;
            default:
                return <BellIcon className={`${iconClass} text-gray-500`} />;
        }
    };

    const getNotificationBg = (type, isRead) => {
        if (isRead) return 'bg-white hover:bg-gray-50';
        switch (type) {
            case 'ORDER_CREATED':
            case 'ORDER_STATUS':
            case 'ORDER_DELIVERED':
            case 'REVIEW_APPROVED':
                return 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100';
            case 'ORDER_CANCELLED':
                return 'bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100';
            case 'TICKET_REPLY':
            case 'TICKET_STATUS':
                return 'bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100';
            case 'REVIEW_REPLY':
                return 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100';
            case 'VOUCHER':
            case 'PROMOTION':
                return 'bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100';
            default:
                return 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            'TICKET_REPLY': 'Phản hồi hỗ trợ',
            'TICKET_STATUS': 'Cập nhật hỗ trợ',
            'ORDER_CREATED': 'Đặt hàng thành công',
            'ORDER_STATUS': 'Cập nhật đơn hàng',
            'ORDER_SHIPPING': 'Đang giao hàng',
            'ORDER_DELIVERED': 'Giao hàng thành công',
            'ORDER_CANCELLED': 'Đơn hàng bị hủy',
            'REVIEW_REPLY': 'Shop đã trả lời',
            'REVIEW_APPROVED': 'Đánh giá được duyệt',
            'VOUCHER': 'Mã giảm giá',
            'PROMOTION': 'Khuyến mãi',
        };
        return labels[type] || 'Thông báo';
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Filter notifications
    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead)
        : filter === 'read'
        ? notifications.filter(n => n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    return (
        <>
            {/* Notification sound (optional) */}
            <audio ref={audioRef} preload="auto">
                <source src="/sounds/notification.mp3" type="audio/mpeg" />
            </audio>

            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`relative p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg ${newNotifAnimation ? 'animate-bounce' : ''}`}>
                                    <BellAlertIcon className="h-8 w-8 text-white" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Thông báo của tôi
                                    </h1>
                                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                                        Quản lý tất cả thông báo của bạn
                                        {wsConnected && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Realtime
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={loadNotifications}
                                    disabled={loading}
                                    className="p-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition-all shadow-sm border border-gray-200 disabled:opacity-50"
                                    title="Làm mới"
                                >
                                    <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={toggleSelectMode}
                                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                                        selectMode 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <CheckIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">{selectMode ? 'Hủy chọn' : 'Chọn nhiều'}</span>
                                </button>

                                {unreadCount > 0 && !selectMode && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all flex items-center gap-2 shadow-md"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span className="hidden sm:inline">Đánh dấu đã đọc</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                                <BellIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                            <p className="text-sm text-gray-500 mt-1">Tổng cộng</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                                <SparklesIcon className="h-6 w-6 text-rose-500" />
                            </div>
                            <p className="text-3xl font-bold text-rose-600">{unreadCount}</p>
                            <p className="text-sm text-gray-500 mt-1">Chưa đọc</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center mb-2">
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">{readCount}</p>
                            <p className="text-sm text-gray-500 mt-1">Đã đọc</p>
                        </div>
                    </div>

                    {/* Filter & Actions */}
                    <div className="bg-white rounded-2xl shadow-sm mb-6 p-4 border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            {/* Filters */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-xl transition-all font-medium ${
                                        filter === 'all' 
                                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-4 py-2 rounded-xl transition-all font-medium ${
                                        filter === 'unread' 
                                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Chưa đọc ({unreadCount})
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`px-4 py-2 rounded-xl transition-all font-medium ${
                                        filter === 'read' 
                                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Đã đọc ({readCount})
                                </button>
                            </div>

                            {/* Delete Actions */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {selectMode && selectedIds.length > 0 && (
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={deleteLoading}
                                        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Xóa ({selectedIds.length})
                                    </button>
                                )}
                                {readCount > 0 && (
                                    <button
                                        onClick={handleDeleteRead}
                                        disabled={deleteLoading}
                                        className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Xóa đã đọc
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        disabled={deleteLoading}
                                        className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Select All */}
                        {selectMode && filteredNotifications.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === filteredNotifications.length}
                                    onChange={toggleSelectAll}
                                    className="w-5 h-5 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                                />
                                <span className="text-gray-600">
                                    Chọn tất cả ({filteredNotifications.length} thông báo)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin h-12 w-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Đang tải thông báo...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                    <BellIcon className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                                     filter === 'read' ? 'Không có thông báo đã đọc' : 
                                     'Bạn chưa có thông báo nào'}
                                </h3>
                                <p className="text-gray-500">
                                    {filter === 'all' && 'Thông báo mới sẽ hiển thị ở đây'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notif, index) => (
                                    <div
                                        key={notif.id}
                                        onClick={(e) => handleNotificationClick(notif, e)}
                                        className={`p-4 cursor-pointer transition-all duration-300 flex items-start gap-3 ${getNotificationBg(notif.type, notif.isRead)} ${
                                            index === 0 && newNotifAnimation ? 'ring-2 ring-rose-500 ring-inset' : ''
                                        }`}
                                        style={{
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        {/* Checkbox */}
                                        {selectMode && (
                                            <div className="flex-shrink-0 pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(notif.id)}
                                                    onChange={() => toggleSelectItem(notif.id)}
                                                    className="w-5 h-5 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                                                />
                                            </div>
                                        )}

                                        {/* Icon */}
                                        <div className={`flex-shrink-0 p-2.5 rounded-xl ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                    notif.isRead 
                                                        ? 'bg-gray-100 text-gray-600' 
                                                        : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                    {getTypeLabel(notif.type)}
                                                </span>
                                                {notif.isRead ? (
                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                        Đã xem
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                                        <span className="text-xs text-rose-600 font-medium">Mới</span>
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-sm md:text-base ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                                {notif.title}
                                            </h3>
                                            {notif.content && (
                                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{notif.content}</p>
                                            )}
                                            <p className="text-gray-400 text-xs mt-2">{formatTime(notif.createdAt)}</p>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteSingle(notif.id, e)}
                                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa thông báo"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    Trang {page + 1} / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Connection Status Toast */}
                    {!wsConnected && user && (
                        <div className="fixed bottom-20 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Đang kết nối thông báo realtime...</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserNotificationsPage;
