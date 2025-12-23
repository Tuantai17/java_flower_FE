import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderApi, { ORDER_STATUS, PAYMENT_METHODS } from '../../api/orderApi';
import { formatPrice } from '../../utils/formatPrice';
import {
    ShoppingBagIcon,
    ClockIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * My Orders Page - Trang đơn hàng của tôi
 */
const MyOrdersPage = () => {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('🔄 Fetching orders...');
            const data = await orderApi.getMyOrders(page, 10);
            console.log('✅ Orders fetched:', data);

            // Handle paginated response
            if (data?.content) {
                setOrders(data.content);
                setTotalPages(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setOrders(data);
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

    // Nếu chưa đăng nhập
    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Đăng nhập để xem đơn hàng của bạn
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Quay lại tài khoản
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Đơn hàng của tôi</h1>
                    <p className="text-gray-500 mt-1">
                        Theo dõi và quản lý các đơn hàng của bạn
                    </p>
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

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <ShoppingBagIcon className="h-20 w-20 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Chưa có đơn hàng nào
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Hãy khám phá và đặt hàng ngay!
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    /* Order List */
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2">
                                    Trang {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Order Card Component
 */
const OrderCard = ({ order }) => {
    const statusInfo = getStatusInfo(order.status);
    const orderCode = order.orderCode || order.order_code || `#${order.id}`;
    const createdAt = order.createdAt || order.created_at;
    const totalPrice = order.finalPrice || order.final_price || order.totalPrice || order.total_price || 0;
    const paymentMethod = order.paymentMethod || order.payment_method || 'COD';

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.bgColor}`}>
                        {statusInfo.icon}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{orderCode}</p>
                        <p className="text-sm text-gray-500">
                            {createdAt ? formatDate(createdAt) : 'Không rõ ngày'}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-lg font-bold text-rose-600">{formatPrice(totalPrice)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Thanh toán</p>
                        <p className="font-medium">{formatPaymentMethod(paymentMethod)}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        to={`/profile/orders/${order.id}`}
                        className="flex-1 py-2.5 px-4 border-2 border-rose-500 text-rose-500 rounded-xl text-center font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <EyeIcon className="h-5 w-5" />
                        Xem chi tiết
                    </Link>

                    {orderApi.canCancelOrder(order.status) && (
                        <CancelButton orderId={order.id} />
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Cancel Button Component
 */
const CancelButton = ({ orderId }) => {
    const [cancelling, setCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await orderApi.cancelOrder(orderId);
            window.location.reload();
        } catch (error) {
            console.error('Cancel error:', error);
            alert('Không thể hủy đơn hàng. Vui lòng thử lại.');
        } finally {
            setCancelling(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 disabled:opacity-50"
                >
                    {cancelling ? 'Đang hủy...' : 'Xác nhận'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2.5 border rounded-xl text-sm hover:bg-gray-50"
                >
                    Không
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="py-2.5 px-4 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
            <XCircleIcon className="h-5 w-5" />
            Hủy
        </button>
    );
};

// Helper functions
const getStatusInfo = (status) => {
    const statusMap = {
        [ORDER_STATUS.PENDING]: {
            label: 'Chờ xác nhận',
            icon: <ClockIcon className="h-5 w-5 text-yellow-500" />,
            bgColor: 'bg-yellow-100',
            badgeClass: 'bg-yellow-100 text-yellow-700',
        },
        [ORDER_STATUS.CONFIRMED]: {
            label: 'Đã xác nhận',
            icon: <CheckCircleIcon className="h-5 w-5 text-blue-500" />,
            bgColor: 'bg-blue-100',
            badgeClass: 'bg-blue-100 text-blue-700',
        },
        [ORDER_STATUS.PROCESSING]: {
            label: 'Đang xử lý',
            icon: <ClockIcon className="h-5 w-5 text-purple-500" />,
            bgColor: 'bg-purple-100',
            badgeClass: 'bg-purple-100 text-purple-700',
        },
        [ORDER_STATUS.DELIVERING]: {
            label: 'Đang giao hàng',
            icon: <TruckIcon className="h-5 w-5 text-indigo-500" />,
            bgColor: 'bg-indigo-100',
            badgeClass: 'bg-indigo-100 text-indigo-700',
        },
        [ORDER_STATUS.COMPLETED]: {
            label: 'Hoàn thành',
            icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
            bgColor: 'bg-green-100',
            badgeClass: 'bg-green-100 text-green-700',
        },
        [ORDER_STATUS.CANCELLED]: {
            label: 'Đã hủy',
            icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
            bgColor: 'bg-red-100',
            badgeClass: 'bg-red-100 text-red-700',
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

export default MyOrdersPage;
