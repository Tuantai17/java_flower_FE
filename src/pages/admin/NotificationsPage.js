import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon,
    CheckCircleIcon,
    TrashIcon,
    FunnelIcon,
    TicketIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
    CreditCardIcon,
    XCircleIcon,
    StarIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { 
    getAdminNotifications, 
    markAllAsRead, 
    markAsRead,
    deleteNotification,
    deleteNotifications,
    deleteAllNotifications,
    deleteReadNotifications,
} from '../../api/notificationApi';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await getAdminNotifications(page, 50);
            if (response.success && response.data) {
                setNotifications(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = async (notif, e) => {
        // Nếu đang ở chế độ select hoặc click vào checkbox thì không navigate
        if (selectMode || e?.target?.type === 'checkbox') {
            return;
        }
        
        if (!notif.isRead) {
            await markAsRead(notif.id);
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
            await deleteNotification(notifId);
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
            await deleteNotifications(selectedIds);
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
            await deleteAllNotifications();
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
            await deleteReadNotifications();
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
            case 'TICKET_NEW':
                return <TicketIcon className={`${iconClass} text-pink-500`} />;
            case 'TICKET_MESSAGE':
                return <TicketIcon className={`${iconClass} text-blue-500`} />;
            case 'ORDER_NEW':
                return <ShoppingBagIcon className={`${iconClass} text-green-500`} />;
            case 'ORDER_STATUS':
                return <ShoppingBagIcon className={`${iconClass} text-blue-500`} />;
            case 'ORDER_CANCELLED':
                return <XCircleIcon className={`${iconClass} text-red-500`} />;
            case 'ORDER_PAYMENT':
                return <CreditCardIcon className={`${iconClass} text-emerald-500`} />;
            case 'STOCK_LOW':
                return <ExclamationTriangleIcon className={`${iconClass} text-orange-500`} />;
            case 'USER_NEW':
                return <UserPlusIcon className={`${iconClass} text-purple-500`} />;
            case 'REVIEW_NEW':
                return <StarIcon className={`${iconClass} text-yellow-500`} />;
            case 'REVIEW_REPLY':
                return <StarIcon className={`${iconClass} text-amber-500`} />;
            case 'REVIEW_APPROVED':
                return <StarIcon className={`${iconClass} text-green-500`} />;
            default:
                return <BellIcon className={`${iconClass} text-gray-500`} />;
        }
    };

    const getNotificationBg = (type, isRead) => {
        if (isRead) return 'bg-white';
        switch (type) {
            case 'ORDER_NEW':
            case 'ORDER_PAYMENT':
            case 'REVIEW_APPROVED':
                return 'bg-green-50';
            case 'ORDER_CANCELLED':
                return 'bg-red-50';
            case 'TICKET_NEW':
            case 'TICKET_MESSAGE':
                return 'bg-pink-50';
            case 'REVIEW_NEW':
            case 'REVIEW_REPLY':
                return 'bg-yellow-50';
            default:
                return 'bg-blue-50';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            'TICKET_NEW': 'Ticket mới',
            'TICKET_MESSAGE': 'Tin nhắn ticket',
            'TICKET_REPLY': 'Phản hồi ticket',
            'TICKET_STATUS': 'Trạng thái ticket',
            'ORDER_NEW': 'Đơn hàng mới',
            'ORDER_STATUS': 'Cập nhật đơn hàng',
            'ORDER_CANCELLED': 'Đơn hàng bị hủy',
            'ORDER_PAYMENT': 'Thanh toán',
            'STOCK_LOW': 'Tồn kho thấp',
            'USER_NEW': 'Khách hàng mới',
            'REVIEW_NEW': 'Đánh giá mới',
            'REVIEW_REPLY': 'Phản hồi đánh giá',
            'REVIEW_APPROVED': 'Đánh giá được duyệt',
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
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <BellIcon className="h-8 w-8 text-pink-500" />
                            Tất cả thông báo
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Xem và quản lý tất cả thông báo hệ thống
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Toggle Select Mode */}
                        <button
                            onClick={toggleSelectMode}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                selectMode 
                                    ? 'bg-gray-800 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <CheckIcon className="h-5 w-5" />
                            {selectMode ? 'Hủy chọn' : 'Chọn nhiều'}
                        </button>

                        {unreadCount > 0 && !selectMode && (
                            <button
                                onClick={handleMarkAllRead}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                            >
                                <CheckCircleIcon className="h-5 w-5" />
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 rounded-xl">
                            <BellIcon className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng thông báo</p>
                            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chưa đọc</p>
                            <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đã đọc</p>
                            <p className="text-2xl font-bold text-green-600">{readCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <CheckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đã chọn</p>
                            <p className="text-2xl font-bold text-blue-600">{selectedIds.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Actions Bar */}
            <div className="bg-white rounded-xl shadow-soft mb-6 p-4 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <FunnelIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-600 font-medium">Lọc:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-pink-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Tất cả ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'unread' 
                                        ? 'bg-pink-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Chưa đọc ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'read' 
                                        ? 'bg-pink-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Đã đọc ({readCount})
                            </button>
                        </div>
                    </div>

                    {/* Delete Actions */}
                    <div className="flex items-center gap-2">
                        {selectMode && selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <TrashIcon className="h-5 w-5" />
                                Xóa đã chọn ({selectedIds.length})
                            </button>
                        )}
                        {readCount > 0 && (
                            <button
                                onClick={handleDeleteRead}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <TrashIcon className="h-5 w-5" />
                                Xóa đã đọc
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <TrashIcon className="h-5 w-5" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>

                {/* Select All checkbox when in select mode */}
                {selectMode && filteredNotifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selectedIds.length === filteredNotifications.length}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                        />
                        <span className="text-gray-600">
                            Chọn tất cả ({filteredNotifications.length} thông báo)
                        </span>
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500">Đang tải thông báo...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                             filter === 'read' ? 'Không có thông báo đã đọc' : 
                             'Chưa có thông báo nào'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={(e) => handleNotificationClick(notif, e)}
                                className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-4 ${getNotificationBg(notif.type, notif.isRead)}`}
                            >
                                {/* Checkbox for select mode */}
                                {selectMode && (
                                    <div className="flex-shrink-0 pt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(notif.id)}
                                            onChange={() => toggleSelectItem(notif.id)}
                                            className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                                        />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`flex-shrink-0 p-3 rounded-xl ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                    {getNotificationIcon(notif.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            notif.isRead 
                                                ? 'bg-gray-100 text-gray-600' 
                                                : 'bg-pink-100 text-pink-600'
                                        }`}>
                                            {getTypeLabel(notif.type)}
                                        </span>
                                        {notif.isRead ? (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircleIcon className="h-3 w-3" />
                                                Đã xem
                                            </span>
                                        ) : (
                                            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className={`text-base ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                        {notif.title}
                                    </h3>
                                    {notif.content && (
                                        <p className="text-gray-500 text-sm mt-1">{notif.content}</p>
                                    )}
                                    <p className="text-gray-400 text-xs mt-2">{formatTime(notif.createdAt)}</p>
                                </div>

                                {/* Delete button (always visible) */}
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
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Trang {page + 1} / {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
