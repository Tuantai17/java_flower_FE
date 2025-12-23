import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderApi, { ORDER_STATUS, PAYMENT_METHODS } from '../../../api/orderApi';
import { formatPrice } from '../../../utils/formatPrice';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    TruckIcon,
    ClockIcon,
    XCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Admin Order List Page
 * Quản lý tất cả đơn hàng
 */
const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Status update
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('🔄 Fetching admin orders...');
            const params = {
                page,
                size: pageSize,
                ...(statusFilter && { status: statusFilter }),
            };

            const data = await orderApi.getAllOrders(params);
            console.log('✅ Orders fetched:', data);

            // Handle paginated response
            if (data?.content) {
                setOrders(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || data.content.length);
            } else if (Array.isArray(data)) {
                setOrders(data);
                setTotalElements(data.length);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            // Refresh orders
            fetchOrders();
        } catch (err) {
            console.error('Update status error:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter locally by search query
    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const orderCode = (order.orderCode || order.order_code || '').toLowerCase();
        const customerName = (order.customerName || '').toLowerCase();
        const customerPhone = (order.customerPhone || '').toLowerCase();
        return orderCode.includes(query) || customerName.includes(query) || customerPhone.includes(query);
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                <p className="text-gray-500 mt-1">
                    Tổng cộng {totalElements} đơn hàng
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn, tên, SĐT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value={ORDER_STATUS.PENDING}>Chờ xác nhận</option>
                            <option value={ORDER_STATUS.CONFIRMED}>Đã xác nhận</option>
                            <option value={ORDER_STATUS.PROCESSING}>Đang xử lý</option>
                            <option value={ORDER_STATUS.DELIVERING}>Đang giao</option>
                            <option value={ORDER_STATUS.COMPLETED}>Hoàn thành</option>
                            <option value={ORDER_STATUS.CANCELLED}>Đã hủy</option>
                        </select>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-red-800">Lỗi</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Mã đơn
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Thanh toán
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        onUpdateStatus={handleUpdateStatus}
                                        isUpdating={updatingId === order.id}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} / {totalElements} đơn hàng
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Order Row Component
 */
const OrderRow = ({ order, onUpdateStatus, isUpdating }) => {
    const orderCode = order.orderCode || order.order_code || `#${order.id}`;
    const status = order.status || 'PENDING';
    const statusInfo = getStatusInfo(status);
    const createdAt = order.createdAt || order.created_at;
    const finalPrice = order.finalPrice || order.final_price || order.totalPrice || 0;
    const paymentMethod = order.paymentMethod || order.payment_method || 'COD';

    return (
        <tr className="hover:bg-gray-50">
            {/* Order Code */}
            <td className="px-6 py-4">
                <p className="font-semibold text-gray-800">{orderCode}</p>
            </td>

            {/* Customer */}
            <td className="px-6 py-4">
                <p className="font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{order.customerPhone || 'N/A'}</p>
            </td>

            {/* Total */}
            <td className="px-6 py-4">
                <p className="font-bold text-blue-600">{formatPrice(finalPrice)}</p>
            </td>

            {/* Payment Method */}
            <td className="px-6 py-4">
                <span className="text-sm">{formatPaymentMethod(paymentMethod)}</span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <StatusDropdown
                    currentStatus={status}
                    onChangeStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
                    isUpdating={isUpdating}
                />
            </td>

            {/* Created At */}
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600">{formatDate(createdAt)}</p>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-center">
                <Link
                    to={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <EyeIcon className="h-4 w-4" />
                    Chi tiết
                </Link>
            </td>
        </tr>
    );
};

/**
 * Status Dropdown Component
 */
const StatusDropdown = ({ currentStatus, onChangeStatus, isUpdating }) => {
    const statusInfo = getStatusInfo(currentStatus);

    if (currentStatus === ORDER_STATUS.CANCELLED || currentStatus === ORDER_STATUS.COMPLETED) {
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeClass}`}>
                {statusInfo.icon}
                {statusInfo.label}
            </span>
        );
    }

    return (
        <select
            value={currentStatus}
            onChange={(e) => onChangeStatus(e.target.value)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${statusInfo.bgClass} ${isUpdating ? 'opacity-50' : ''}`}
        >
            <option value={ORDER_STATUS.PENDING}>⏳ Chờ xác nhận</option>
            <option value={ORDER_STATUS.CONFIRMED}>✅ Đã xác nhận</option>
            <option value={ORDER_STATUS.PROCESSING}>🔄 Đang xử lý</option>
            <option value={ORDER_STATUS.DELIVERING}>🚚 Đang giao</option>
            <option value={ORDER_STATUS.COMPLETED}>✔️ Hoàn thành</option>
            <option value={ORDER_STATUS.CANCELLED}>❌ Đã hủy</option>
        </select>
    );
};

// Helper functions
const getStatusInfo = (status) => {
    const statusMap = {
        [ORDER_STATUS.PENDING]: {
            label: 'Chờ xác nhận',
            icon: <ClockIcon className="h-4 w-4" />,
            badgeClass: 'bg-yellow-100 text-yellow-700',
            bgClass: 'bg-yellow-50 text-yellow-700',
        },
        [ORDER_STATUS.CONFIRMED]: {
            label: 'Đã xác nhận',
            icon: <CheckCircleIcon className="h-4 w-4" />,
            badgeClass: 'bg-blue-100 text-blue-700',
            bgClass: 'bg-blue-50 text-blue-700',
        },
        [ORDER_STATUS.PROCESSING]: {
            label: 'Đang xử lý',
            icon: <ClockIcon className="h-4 w-4" />,
            badgeClass: 'bg-purple-100 text-purple-700',
            bgClass: 'bg-purple-50 text-purple-700',
        },
        [ORDER_STATUS.DELIVERING]: {
            label: 'Đang giao',
            icon: <TruckIcon className="h-4 w-4" />,
            badgeClass: 'bg-indigo-100 text-indigo-700',
            bgClass: 'bg-indigo-50 text-indigo-700',
        },
        [ORDER_STATUS.COMPLETED]: {
            label: 'Hoàn thành',
            icon: <CheckCircleIcon className="h-4 w-4" />,
            badgeClass: 'bg-green-100 text-green-700',
            bgClass: 'bg-green-50 text-green-700',
        },
        [ORDER_STATUS.CANCELLED]: {
            label: 'Đã hủy',
            icon: <XCircleIcon className="h-4 w-4" />,
            badgeClass: 'bg-red-100 text-red-700',
            bgClass: 'bg-red-50 text-red-700',
        },
    };
    return statusMap[status] || statusMap[ORDER_STATUS.PENDING];
};

const formatPaymentMethod = (method) => {
    const methods = {
        [PAYMENT_METHODS.COD]: 'COD',
        [PAYMENT_METHODS.MOMO]: 'MoMo',
        [PAYMENT_METHODS.VNPAY]: 'VNPay',
        [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản',
    };
    return methods[method] || method;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

export default OrderList;
