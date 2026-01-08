import React, { useState, useEffect } from 'react';
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
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

/**
 * Trang thông báo cho User
 * Hiển thị tất cả thông báo của user với chức năng xóa
 */
const UserNotificationsPage = () => {
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
    };

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
        if (isRead) return 'bg-white';
        switch (type) {
            case 'ORDER_DELIVERED':
            case 'REVIEW_APPROVED':
                return 'bg-green-50';
            case 'ORDER_CANCELLED':
                return 'bg-red-50';
            case 'TICKET_REPLY':
                return 'bg-pink-50';
            case 'REVIEW_REPLY':
                return 'bg-yellow-50';
            case 'VOUCHER':
            case 'PROMOTION':
                return 'bg-purple-50';
            default:
                return 'bg-blue-50';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            'TICKET_REPLY': 'Phản hồi hỗ trợ',
            'TICKET_STATUS': 'Cập nhật hỗ trợ',
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
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <BellIcon className="h-8 w-8 text-rose-500" />
                                    Thông báo của tôi
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Quản lý tất cả thông báo của bạn
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
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
                                        className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                            <p className="text-sm text-gray-500">Tổng cộng</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-rose-600">{unreadCount}</p>
                            <p className="text-sm text-gray-500">Chưa đọc</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-green-600">{readCount}</p>
                            <p className="text-sm text-gray-500">Đã đọc</p>
                        </div>
                    </div>

                    {/* Filter & Actions */}
                    <div className="bg-white rounded-xl shadow-sm mb-6 p-4 border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            {/* Filters */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === 'all' 
                                            ? 'bg-rose-500 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === 'unread' 
                                            ? 'bg-rose-500 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Chưa đọc ({unreadCount})
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === 'read' 
                                            ? 'bg-rose-500 text-white' 
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-gray-500">Đang tải thông báo...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                                     filter === 'read' ? 'Không có thông báo đã đọc' : 
                                     'Bạn chưa có thông báo nào'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={(e) => handleNotificationClick(notif, e)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${getNotificationBg(notif.type, notif.isRead)}`}
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
                                        <div className={`flex-shrink-0 p-2 rounded-lg ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    notif.isRead 
                                                        ? 'bg-gray-100 text-gray-600' 
                                                        : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                    {getTypeLabel(notif.type)}
                                                </span>
                                                {notif.isRead ? (
                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3 w-3" />
                                                        Đã xem
                                                    </span>
                                                ) : (
                                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <h3 className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                                {notif.title}
                                            </h3>
                                            {notif.content && (
                                                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{notif.content}</p>
                                            )}
                                            <p className="text-gray-400 text-xs mt-1">{formatTime(notif.createdAt)}</p>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteSingle(notif.id, e)}
                                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa thông báo"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    Trang {page + 1} / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserNotificationsPage;
