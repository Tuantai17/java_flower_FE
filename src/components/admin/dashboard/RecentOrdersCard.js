/**
 * RecentOrdersCard Component
 * 
 * Hiển thị danh sách đơn hàng gần đây trong Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    XCircleIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { ORDER_STATUS_COLORS } from '../../../types/dashboard';

const RecentOrdersCard = ({ orders, loading = false }) => {
    // Đảm bảo orders luôn là mảng
    const orderList = Array.isArray(orders) ? orders : [];

    // Icon mapping theo status
    const statusIcons = {
        PENDING: ClockIcon,
        CONFIRMED: CheckCircleIcon,
        PREPARING: ClockIcon,
        SHIPPING: TruckIcon,
        COMPLETED: CheckCircleIcon,
        CANCELLED: XCircleIcon,
    };

    // Format giá tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    // Format ngày giờ
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6 min-h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                    Đơn hàng gần đây
                </h2>
                <Link
                    to="/admin/orders"
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                    Xem tất cả
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Orders List */}
            {orderList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <ClockIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orderList.map((order) => {
                        const StatusIcon = statusIcons[order.status] || ClockIcon;
                        const statusColor = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.PENDING;

                        return (
                            <Link
                                key={order.id}
                                to={`/admin/orders/${order.id}`}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                {/* Order Code Icon */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor.bg} ${statusColor.text}`}>
                                    <StatusIcon className="h-5 w-5" />
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-800 truncate">
                                            #{order.orderCode}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {order.customerName || 'Khách hàng'}
                                    </p>
                                </div>

                                {/* Price & Status */}
                                <div className="text-right">
                                    <p className="font-semibold text-gray-800">
                                        {formatCurrency(order.finalPrice)}
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                        {order.statusDisplayName || order.status}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentOrdersCard;
