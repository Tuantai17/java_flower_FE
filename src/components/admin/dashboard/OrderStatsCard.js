/**
 * OrderStatsCard Component
 * 
 * Hiển thị thống kê đơn hàng theo trạng thái trong Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    XCircleIcon,
    ArrowRightIcon,
    ShoppingCartIcon,
} from '@heroicons/react/24/outline';

const OrderStatsCard = ({ stats = {}, loading = false }) => {
    const orderStatuses = [
        {
            key: 'pendingOrders',
            label: 'Chờ xử lý',
            icon: ClockIcon,
            color: 'yellow',
            path: '/admin/orders?status=PENDING'
        },
        {
            key: 'confirmedOrders',
            label: 'Đã xác nhận',
            icon: CheckCircleIcon,
            color: 'blue',
            path: '/admin/orders?status=CONFIRMED'
        },
        {
            key: 'shippingOrders',
            label: 'Đang giao',
            icon: TruckIcon,
            color: 'purple',
            path: '/admin/orders?status=SHIPPING'
        },
        {
            key: 'completedOrders',
            label: 'Hoàn thành',
            icon: CheckCircleIcon,
            color: 'green',
            path: '/admin/orders?status=COMPLETED'
        },
        {
            key: 'cancelledOrders',
            label: 'Đã hủy',
            icon: XCircleIcon,
            color: 'red',
            path: '/admin/orders?status=CANCELLED'
        },
    ];

    const colorClasses = {
        yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', hover: 'hover:bg-yellow-50' },
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', hover: 'hover:bg-blue-50' },
        purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', hover: 'hover:bg-purple-50' },
        green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', hover: 'hover:bg-green-50' },
        red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', hover: 'hover:bg-red-50' },
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50">
                            <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse mb-3" />
                            <div className="h-6 w-10 bg-gray-200 rounded animate-pulse mb-1" />
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Thống kê đơn hàng
                    </h2>
                </div>
                <Link
                    to="/admin/orders"
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                    Xem chi tiết
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {orderStatuses.map((status) => {
                    const Icon = status.icon;
                    const colors = colorClasses[status.color];
                    const value = stats[status.key] || 0;

                    return (
                        <Link
                            key={status.key}
                            to={status.path}
                            className={`p-4 rounded-xl transition-all ${colors.hover} group border border-transparent hover:border-gray-100 hover:shadow-sm`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors.icon}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                {value.toLocaleString('vi-VN')}
                            </div>
                            <div className="text-sm text-gray-500">
                                {status.label}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Total Orders Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tổng số đơn hàng:</span>
                    <span className="text-xl font-bold text-gray-800">
                        {(stats.totalOrders || 0).toLocaleString('vi-VN')}
                    </span>
                </div>
                {stats.todayOrders > 0 && (
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-500 text-sm">Đơn hàng hôm nay:</span>
                        <span className="text-green-600 font-semibold">
                            +{stats.todayOrders.toLocaleString('vi-VN')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStatsCard;
