import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import orderApi, { ORDER_STATUS, PAYMENT_METHODS } from '../../../api/orderApi';
import { formatPrice } from '../../../utils/formatPrice';
import { getImageUrl } from '../../../utils/imageUrl';
import {
    ArrowLeftIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    TruckIcon,
    CreditCardIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';

/**
 * Admin Order Detail Page
 * Xem chi tiết và cập nhật trạng thái đơn hàng
 */
const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('🔄 Fetching order detail:', id);
            const data = await orderApi.getOrderById(id);
            console.log('✅ Order detail:', data);
            setOrder(data);
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Xác nhận chuyển trạng thái sang "${getStatusLabel(newStatus)}"?`)) {
            return;
        }

        setUpdating(true);
        try {
            await orderApi.updateOrderStatus(id, newStatus);
            fetchOrderDetail();
        } catch (err) {
            console.error('Update error:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-12 bg-white rounded-xl">
                    <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!order) return null;

    // Extract data
    const orderCode = order.orderCode || order.order_code || `#${order.id}`;
    const status = order.status || 'PENDING';
    const createdAt = order.createdAt || order.created_at;
    const items = order.items || order.orderItems || [];
    const totalPrice = order.totalPrice || order.total_price || 0;
    const discountAmount = order.discountAmount || order.discount_amount || 0;
    const shippingFee = order.shippingFee || order.shipping_fee || 0;
    const finalPrice = order.finalPrice || order.final_price || totalPrice;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-500 mb-2"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Đơn hàng {orderCode}
                    </h1>
                    <p className="text-gray-500">
                        Ngày tạo: {formatDate(createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <PrinterIcon className="h-5 w-5" />
                        In đơn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Update */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-blue-500" />
                            Trạng thái đơn hàng
                        </h2>
                        <StatusTimeline status={status} />

                        {/* Status Actions */}
                        {status !== ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.COMPLETED && (
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-gray-600 mb-3">Cập nhật trạng thái:</p>
                                <StatusActions
                                    currentStatus={status}
                                    onUpdate={handleUpdateStatus}
                                    isUpdating={updating}
                                />
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                            Sản phẩm ({items.length})
                        </h2>
                        <div className="divide-y">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <OrderItemRow key={item.id || index} item={item} />
                                ))
                            ) : (
                                <p className="text-gray-500 py-4">Không có sản phẩm</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-500" />
                            Thông tin khách hàng
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium">{order.customerName || 'N/A'}</p>
                                    <p className="text-gray-500 text-xs">Họ tên</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium">{order.customerPhone || 'N/A'}</p>
                                    <p className="text-gray-500 text-xs">Số điện thoại</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium">{order.customerEmail || 'N/A'}</p>
                                    <p className="text-gray-500 text-xs">Email</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium">{order.shippingAddress || 'N/A'}</p>
                                    <p className="text-gray-500 text-xs">Địa chỉ giao hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-blue-500" />
                            Thanh toán
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phương thức</span>
                                <span className="font-medium">
                                    {formatPaymentMethod(order.paymentMethod)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tạm tính</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phí ship</span>
                                <span>{shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-blue-600">{formatPrice(finalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-yellow-800 mb-1">Ghi chú:</p>
                            <p className="text-sm text-yellow-700">{order.note}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Status Timeline
 */
const StatusTimeline = ({ status }) => {
    const steps = [
        { key: ORDER_STATUS.PENDING, label: 'Chờ xác nhận' },
        { key: ORDER_STATUS.CONFIRMED, label: 'Đã xác nhận' },
        { key: ORDER_STATUS.PROCESSING, label: 'Đang xử lý' },
        { key: ORDER_STATUS.DELIVERING, label: 'Đang giao' },
        { key: ORDER_STATUS.COMPLETED, label: 'Hoàn thành' },
    ];

    const currentIndex = steps.findIndex(s => s.key === status);
    const isCancelled = status === ORDER_STATUS.CANCELLED;

    if (isCancelled) {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <XCircleIcon className="h-8 w-8 text-red-500" />
                <div>
                    <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center">
            {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {isCompleted ? (
                                    <CheckCircleIcon className="h-6 w-6" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <p className={`text-xs mt-2 text-center ${isCurrent ? 'font-semibold text-green-600' : 'text-gray-500'
                                }`}>
                                {step.label}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/**
 * Status Action Buttons
 */
const StatusActions = ({ currentStatus, onUpdate, isUpdating }) => {
    const getNextStatuses = (current) => {
        const flow = {
            [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
            [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
            [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.DELIVERING],
            [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.COMPLETED],
        };
        return flow[current] || [];
    };

    const nextStatuses = getNextStatuses(currentStatus);

    const buttonStyles = {
        [ORDER_STATUS.CONFIRMED]: 'bg-blue-500 hover:bg-blue-600 text-white',
        [ORDER_STATUS.PROCESSING]: 'bg-purple-500 hover:bg-purple-600 text-white',
        [ORDER_STATUS.DELIVERING]: 'bg-indigo-500 hover:bg-indigo-600 text-white',
        [ORDER_STATUS.COMPLETED]: 'bg-green-500 hover:bg-green-600 text-white',
        [ORDER_STATUS.CANCELLED]: 'bg-red-500 hover:bg-red-600 text-white',
    };

    return (
        <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => (
                <button
                    key={status}
                    onClick={() => onUpdate(status)}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${buttonStyles[status]}`}
                >
                    {isUpdating ? 'Đang xử lý...' : getStatusLabel(status)}
                </button>
            ))}
        </div>
    );
};

/**
 * Order Item Row
 */
const OrderItemRow = ({ item }) => {
    const productName = item.productName || item.product_name || item.product?.name || 'Sản phẩm';
    const quantity = item.quantity || 1;
    const price = item.price || item.unitPrice || 0;
    const thumbnail = item.productThumbnail || item.product?.thumbnail;

    return (
        <div className="flex gap-4 py-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                    src={getImageUrl(thumbnail)}
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/64x64/f3f4f6/9ca3af?text=No+Image';
                    }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{productName}</p>
                <p className="text-sm text-gray-500">Số lượng: {quantity}</p>
                <p className="text-sm text-gray-500">Đơn giá: {formatPrice(price)}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-blue-600">{formatPrice(price * quantity)}</p>
            </div>
        </div>
    );
};

// Helpers
const getStatusLabel = (status) => {
    const labels = {
        [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
        [ORDER_STATUS.CONFIRMED]: 'Xác nhận đơn',
        [ORDER_STATUS.PROCESSING]: 'Bắt đầu xử lý',
        [ORDER_STATUS.DELIVERING]: 'Giao hàng',
        [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
        [ORDER_STATUS.CANCELLED]: 'Hủy đơn',
    };
    return labels[status] || status;
};

const formatPaymentMethod = (method) => {
    const methods = {
        [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng',
        [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
        [PAYMENT_METHODS.VNPAY]: 'VNPay',
        [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản',
    };
    return methods[method] || method || 'COD';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
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

export default OrderDetail;
