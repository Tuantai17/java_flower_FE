import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import axiosInstance from '../../api/axiosConfig';
import paymentApi, { PAYMENT_STATUS } from '../../api/paymentApi';
import { formatPrice } from '../../utils/formatPrice';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ShoppingBagIcon,
    ArrowLeftIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

/**
 * ========================================
 * Payment Result Page
 * ========================================
 * 
 * Xử lý callback từ các cổng thanh toán (MoMo, VNPay)
 * 
 * Flow:
 * 1. Nhận params từ URL callback
 * 2. Xác định trạng thái từ resultCode
 * 3. Hiển thị kết quả
 * 4. Clear cart nếu thành công
 */

// ====================
// CONSTANTS
// ====================

const STATUS_CONFIG = {
    [PAYMENT_STATUS.SUCCESS]: {
        icon: CheckCircleIcon,
        iconClass: 'text-green-500',
        bgClass: 'bg-green-100',
        title: 'Thanh toán thành công!',
        description: 'Cảm ơn bạn đã mua hàng tại FlowerCorner',
    },
    [PAYMENT_STATUS.PENDING]: {
        icon: ClockIcon,
        iconClass: 'text-yellow-500',
        bgClass: 'bg-yellow-100',
        title: 'Đang xử lý thanh toán',
        description: 'Giao dịch đang được xử lý, vui lòng đợi...',
    },
    [PAYMENT_STATUS.FAILED]: {
        icon: XCircleIcon,
        iconClass: 'text-red-500',
        bgClass: 'bg-red-100',
        title: 'Thanh toán thất bại',
        description: 'Đã có lỗi xảy ra trong quá trình thanh toán',
    },
    [PAYMENT_STATUS.CANCELLED]: {
        icon: ExclamationTriangleIcon,
        iconClass: 'text-orange-500',
        bgClass: 'bg-orange-100',
        title: 'Đã hủy thanh toán',
        description: 'Bạn đã hủy giao dịch thanh toán',
    },
    [PAYMENT_STATUS.EXPIRED]: {
        icon: ClockIcon,
        iconClass: 'text-gray-500',
        bgClass: 'bg-gray-100',
        title: 'Giao dịch hết hạn',
        description: 'Thời gian thanh toán đã hết, vui lòng thử lại',
    },
};

// ====================
// MAIN COMPONENT
// ====================

const PaymentResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart, showNotification } = useApp();

    // Ref để tránh gọi API nhiều lần (React StrictMode)
    const processedRef = useRef(false);

    // State
    const [loading, setLoading] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [retryingPayment, setRetryingPayment] = useState(false);

    // Process payment on mount
    useEffect(() => {
        // Tránh gọi 2 lần trong StrictMode
        if (processedRef.current) {
            return;
        }
        processedRef.current = true;

        const processPayment = async () => {
            try {
                const searchParams = location.search;

                // Kiểm tra có params không
                if (!searchParams || searchParams === '?') {
                    setPaymentResult({
                        status: PAYMENT_STATUS.FAILED,
                        message: 'Không tìm thấy thông tin thanh toán',
                    });
                    setLoading(false);
                    return;
                }

                console.log('🔄 Processing payment callback...');

                // Parse và xử lý kết quả
                const result = await paymentApi.processPaymentResult(searchParams);
                setPaymentResult(result);

                console.log('📦 Payment result:', result);

                // Lấy thông tin order cho mọi trường hợp (để hiển thị và retry)
                if (result.orderId) {
                    try {
                        const order = await paymentApi.getOrderAfterPayment(result.orderId);
                        if (order) {
                            setOrderDetails(order);
                        }
                    } catch (e) {
                        console.warn('Could not fetch order details:', e);
                    }
                }

                // Xử lý theo trạng thái
                if (result.status === PAYMENT_STATUS.SUCCESS) {
                    console.log('✅ Payment successful!');

                    // Clear cart
                    clearCart();

                    // Clear voucher
                    sessionStorage.removeItem('appliedVoucher');

                    // Show notification
                    showNotification({
                        type: 'success',
                        message: 'Thanh toán thành công! Đơn hàng đã được xác nhận.',
                    });

                } else if (result.status === PAYMENT_STATUS.CANCELLED) {
                    showNotification({
                        type: 'warning',
                        message: 'Bạn đã hủy giao dịch thanh toán. Đơn hàng vẫn được lưu, bạn có thể thanh toán lại.',
                    });
                } else {
                    showNotification({
                        type: 'error',
                        message: result.message || 'Thanh toán thất bại',
                    });
                }

            } catch (err) {
                console.error('❌ Error processing payment:', err);
                setPaymentResult({
                    status: PAYMENT_STATUS.FAILED,
                    message: 'Lỗi xử lý thanh toán',
                });
            } finally {
                setLoading(false);
            }
        };

        processPayment();
    }, [location.search, clearCart, showNotification]);

    // Retry payment function
    const handleRetryPayment = async () => {
        if (!orderDetails?.id) {
            showNotification({
                type: 'error',
                message: 'Không tìm thấy thông tin đơn hàng để thanh toán lại',
            });
            return;
        }

        setRetryingPayment(true);
        try {
            // Gọi API tạo lại payment URL cho order đã có
            const response = await axiosInstance.post(`/payment/momo/create?orderId=${orderDetails.id}`);
            const data = response.data;
            
            const payUrl = data?.data?.payUrl || data?.payUrl;
            if (payUrl) {
                showNotification({
                    type: 'info',
                    message: 'Đang chuyển đến trang thanh toán...',
                });
                window.location.href = payUrl;
            } else {
                throw new Error('Không thể tạo link thanh toán');
            }
        } catch (error) {
            console.error('Retry payment error:', error);
            showNotification({
                type: 'error',
                message: error.response?.data?.message || 'Không thể thanh toán lại. Vui lòng thử lại sau.',
            });
        } finally {
            setRetryingPayment(false);
        }
    };

    // Loading state
    if (loading) {
        return <LoadingScreen />;
    }

    // Get status config
    const status = paymentResult?.status || PAYMENT_STATUS.FAILED;
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[PAYMENT_STATUS.FAILED];

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gray-50">
            <div className="max-w-lg w-full">
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    {/* Icon */}
                    <div className={`w-24 h-24 ${config.bgClass} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <config.icon className={`h-14 w-14 ${config.iconClass}`} />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {config.title}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-500 mb-6">
                        {paymentResult?.message || config.description}
                    </p>

                    {/* Order Details (if success) */}
                    {status === PAYMENT_STATUS.SUCCESS && (
                        <OrderInfo
                            result={paymentResult}
                            orderDetails={orderDetails}
                        />
                    )}

                    {/* Order Info for Cancelled/Failed - Show order was created */}
                    {(status === PAYMENT_STATUS.CANCELLED || status === PAYMENT_STATUS.FAILED) && orderDetails && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
                            <h3 className="font-semibold text-orange-800 mb-3">
                                📦 Đơn hàng chưa thanh toán
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-orange-600">Mã đơn hàng:</span>
                                    <span className="font-semibold text-orange-800">
                                        #{orderDetails.orderCode || orderDetails.order_code || paymentResult?.orderId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-600">Tổng tiền:</span>
                                    <span className="font-semibold text-orange-800">
                                        {formatPrice(orderDetails.finalPrice || orderDetails.final_price || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-600">Trạng thái:</span>
                                    <span className="font-semibold text-orange-800">Chờ thanh toán</span>
                                </div>
                            </div>
                            <p className="text-xs text-orange-600 mt-3">
                                💡 Đơn hàng vẫn được lưu. Bạn có thể thanh toán lại ngay bây giờ.
                            </p>
                        </div>
                    )}

                    {/* Transaction Info */}
                    {paymentResult?.transactionId && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Mã giao dịch:</span>
                                <span className="font-mono font-medium">
                                    {paymentResult.transactionId}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <ActionButtons
                        status={status}
                        orderId={paymentResult?.orderId}
                        orderDetails={orderDetails}
                        navigate={navigate}
                        onRetryPayment={handleRetryPayment}
                        retryingPayment={retryingPayment}
                    />
                </div>

                {/* Security Note */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    🔒 Giao dịch được bảo mật bởi MoMo
                </p>
            </div>
        </div>
    );
};

// ====================
// SUB COMPONENTS
// ====================

/**
 * Loading Screen
 */
const LoadingScreen = () => (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Đang xác thực giao dịch...
            </h2>
            <p className="text-gray-500">
                Vui lòng không đóng trang này
            </p>
        </div>
    </div>
);

/**
 * Order Info Component
 */
const OrderInfo = ({ result, orderDetails }) => {
    const orderId = orderDetails?.orderCode ||
        orderDetails?.order_code ||
        orderDetails?.id ||
        result?.orderId ||
        'N/A';

    const totalPrice = orderDetails?.finalPrice ||
        orderDetails?.total_price ||
        orderDetails?.totalAmount ||
        result?.params?.amount;

    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">
                Thông tin đơn hàng
            </h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-green-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-green-800">#{orderId}</span>
                </div>
                {totalPrice && (
                    <div className="flex justify-between">
                        <span className="text-green-600">Tổng tiền:</span>
                        <span className="font-semibold text-green-800">
                            {formatPrice(parseInt(totalPrice, 10))}
                        </span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-green-600">Trạng thái:</span>
                    <span className="font-semibold text-green-800">Đã thanh toán</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Action Buttons
 */
const ActionButtons = ({ status, orderId, orderDetails, navigate, onRetryPayment, retryingPayment }) => {
    const isSuccess = status === PAYMENT_STATUS.SUCCESS;
    const isCancelledOrFailed = status === PAYMENT_STATUS.CANCELLED ||
        status === PAYMENT_STATUS.FAILED ||
        status === PAYMENT_STATUS.EXPIRED;

    // Kiểm tra xem có thể retry payment không (có order details và order chưa thanh toán)
    const canRetryPayment = isCancelledOrFailed && orderDetails && !orderDetails.isPaid;

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSuccess && (
                <>
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        Xem đơn hàng
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Tiếp tục mua sắm
                    </Link>
                </>
            )}

            {isCancelledOrFailed && (
                <>
                    {canRetryPayment ? (
                        // Thanh toán lại cho đơn hàng hiện tại
                        <button
                            onClick={onRetryPayment}
                            disabled={retryingPayment}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg disabled:opacity-50"
                        >
                            {retryingPayment ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <ArrowPathIcon className="h-5 w-5" />
                                    Thanh toán ngay
                                </>
                            )}
                        </button>
                    ) : (
                        // Quay lại checkout để tạo đơn mới
                        <button
                            onClick={() => navigate('/checkout')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            Thử lại thanh toán
                        </button>
                    )}
                    
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        Xem đơn hàng của tôi
                    </Link>
                </>
            )}

            {status === PAYMENT_STATUS.PENDING && (
                <Link
                    to="/profile/orders"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors font-medium"
                >
                    <ClockIcon className="h-5 w-5" />
                    Kiểm tra đơn hàng
                </Link>
            )}
        </div>
    );
};

export default PaymentResultPage;
