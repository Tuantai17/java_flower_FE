import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import customerApi, { getRoleName, getRoleBadgeColor, formatPhoneNumber } from '../../../api/customerApi';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Modal hiển thị chi tiết khách hàng
 */
const CustomerDetailModal = ({
    isOpen,
    onClose,
    customer
}) => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (isOpen && customer?.id) {
            fetchOrders();
        }
    }, [isOpen, customer?.id]);

    const fetchOrders = async () => {
        if (!customer?.id) return;

        setLoadingOrders(true);
        try {
            const data = await customerApi.getOrderHistory(customer.id, 0, 5);
            if (data?.content) {
                setOrders(data.content);
            } else if (Array.isArray(data)) {
                setOrders(data.slice(0, 5));
            }
        } catch (err) {
            console.warn('Error fetching orders:', err);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (!customer) return null;

    const isActive = customer.isActive ?? customer.active ?? true;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết khách hàng"
            size="large"
        >
            <div className="space-y-6">
                {/* Header with Avatar */}
                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg ${customer.role === 'ADMIN'
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                            : 'bg-gradient-to-br from-pink-500 to-rose-500'
                        }`}>
                        {(customer.fullName || customer.username || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                                {customer.fullName || customer.username}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(customer.role)}`}>
                                {getRoleName(customer.role)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {isActive ? '✓ Hoạt động' : '✕ Đã khóa'}
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">@{customer.username}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                            <p className="font-medium text-gray-900">{customer.email || '-'}</p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <PhoneIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Số điện thoại</p>
                            <p className="font-medium text-gray-900">{formatPhoneNumber(customer.phoneNumber)}</p>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <MapPinIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Địa chỉ</p>
                            <p className="font-medium text-gray-900">{customer.address || 'Chưa cập nhật'}</p>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày đăng ký</p>
                            <p className="font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Cập nhật cuối</p>
                            <p className="font-medium text-gray-900">{formatDate(customer.updatedAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
                        Đơn hàng gần đây
                    </h4>

                    {loadingOrders ? (
                        <div className="flex justify-center py-8">
                            <div className="loader" />
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">#{order.orderCode || order.id}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(order.createdAt || order.orderDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-pink-600">
                                            {formatPrice(order.totalAmount || order.total)}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p>Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomerDetailModal;
