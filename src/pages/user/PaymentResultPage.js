import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useApp } from '../../context/AppContext';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Payment Result Page
 * 
 * Xử lý callback từ các cổng thanh toán (MoMo, VNPay, ...)
 * 
 * URL Format:
 * - MoMo: /payment/result?resultCode=0&orderId=xxx&amount=xxx&...
 * - VNPay: /payment/result?vnp_ResponseCode=00&vnp_TxnRef=xxx&...
 * 
 * Flow:
 * 1. Parse query params từ URL
 * 2. Gọi API verify payment (nếu có)
 * 3. Hiển thị kết quả (thành công/thất bại)
 * 4. Xóa giỏ hàng nếu thanh toán thành công
 */
const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    const { clearCart } = useApp();

    const [status, setStatus] = useState('loading'); // loading, success, failed, error
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Parse payment result from URL
    const parsePaymentResult = useCallback(() => {
        // MoMo params
        const momoResultCode = searchParams.get('resultCode');
        const momoOrderId = searchParams.get('orderId');
        const momoAmount = searchParams.get('amount');
        const momoMessage = searchParams.get('message');
        const momoTransId = searchParams.get('transId');
        const momoOrderInfo = searchParams.get('orderInfo');
        const momoRequestId = searchParams.get('requestId');
        const momoExtraData = searchParams.get('extraData');

        // VNPay params (for future)
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpAmount = searchParams.get('vnp_Amount');

        // Check if it's MoMo callback
        if (momoResultCode !== null) {
            return {
                provider: 'MOMO',
                resultCode: momoResultCode,
                orderId: momoOrderId,
                orderInfo: momoOrderInfo,
                requestId: momoRequestId,
                amount: momoAmount ? parseInt(momoAmount) : 0,
                transId: momoTransId,
                message: momoMessage,
                extraData: momoExtraData,
                isSuccess: momoResultCode === '0',
            };
        }

        // Check if it's VNPay callback
        if (vnpResponseCode !== null) {
            return {
                provider: 'VNPAY',
                resultCode: vnpResponseCode,
                orderId: vnpTxnRef,
                amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, // VNPay sends amount * 100
                isSuccess: vnpResponseCode === '00',
            };
        }

        return null;
    }, [searchParams]);

    // Process payment result
    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                console.log('🔄 Processing payment callback...');
                console.log('📍 URL Params:', Object.fromEntries(searchParams.entries()));

                const result = parsePaymentResult();

                if (!result) {
                    console.error('❌ No valid payment params found');
                    setStatus('error');
                    setErrorMessage('Không tìm thấy thông tin thanh toán. Vui lòng kiểm tra lại.');
                    return;
                }

                console.log('📦 Parsed payment result:', result);
                setPaymentInfo(result);

                if (result.isSuccess) {
                    console.log('✅ Payment successful!');
                    setStatus('success');

                    // Clear cart on successful payment
                    clearCart();
                    sessionStorage.removeItem('appliedVoucher');

                    // Optional: Verify payment with backend
                    // await verifyPaymentWithBackend(result);
                } else {
                    console.log('❌ Payment failed:', result.message);
                    setStatus('failed');
                    setErrorMessage(result.message || getErrorMessage(result.provider, result.resultCode));
                }

            } catch (error) {
                console.error('❌ Error processing payment:', error);
                setStatus('error');
                setErrorMessage('Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
            }
        };

        processPaymentResult();
    }, [searchParams, parsePaymentResult, clearCart]);

    // Get error message based on provider and result code
    const getErrorMessage = (provider, resultCode) => {
        if (provider === 'MOMO') {
            const momoErrors = {
                '1001': 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền.',
                '1002': 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán.',
                '1003': 'Giao dịch bị hủy.',
                '1004': 'Số tiền thanh toán vượt quá hạn mức thanh toán của người dùng.',
                '1005': 'URL redirect hoặc IPN không được cấu hình.',
                '1006': 'Người dùng từ chối xác nhận thanh toán.',
                '1007': 'Giao dịch bị từ chối vì tài khoản không đủ quyền.',
                '1008': 'Giao dịch bị từ chối vì vượt quá hạn mức.',
                '1017': 'Giao dịch bị hủy bởi người dùng.',
                '1026': 'Giao dịch bị hạn chế.',
                '1080': 'Giao dịch bị từ chối (Refund).',
                '1081': 'Giao dịch refund bị từ chối (đã refund trước đó).',
                '99': 'Lỗi không xác định.',
            };
            return momoErrors[resultCode] || 'Thanh toán không thành công. Vui lòng thử lại.';
        }

        if (provider === 'VNPAY') {
            const vnpayErrors = {
                '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                '09': 'Thẻ/Tài khoản chưa đăng ký Internet Banking.',
                '10': 'Xác thực thông tin thẻ/Tài khoản không đúng quá 3 lần.',
                '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                '12': 'Thẻ/Tài khoản bị khóa.',
                '13': 'Sai mật khẩu xác thực giao dịch (OTP).',
                '24': 'Khách hàng hủy giao dịch.',
                '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
                '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
                '75': 'Ngân hàng thanh toán đang bảo trì.',
                '79': 'Sai mật khẩu thanh toán quá số lần quy định.',
                '99': 'Lỗi không xác định.',
            };
            return vnpayErrors[resultCode] || 'Thanh toán không thành công. Vui lòng thử lại.';
        }

        return 'Thanh toán không thành công. Vui lòng thử lại.';
    };

    // Render based on status
    if (status === 'loading') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Đang xử lý kết quả thanh toán...</h2>
                    <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return <PaymentSuccessScreen paymentInfo={paymentInfo} />;
    }

    if (status === 'failed') {
        return <PaymentFailedScreen paymentInfo={paymentInfo} errorMessage={errorMessage} />;
    }

    // Error state
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExclamationTriangleIcon className="h-14 w-14 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Không thể xử lý thanh toán</h1>
                <p className="text-gray-500 mb-6">{errorMessage}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-medium"
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        Kiểm tra đơn hàng
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

/**
 * Payment Success Screen
 */
const PaymentSuccessScreen = ({ paymentInfo }) => {
    const { orderId, amount, transId, provider } = paymentInfo || {};

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-green-50 to-white">
            <div className="text-center max-w-md">
                {/* Success Animation */}
                <div className="relative mb-8">
                    <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                    </div>
                    {/* Confetti effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-ping absolute w-28 h-28 rounded-full bg-green-200 opacity-50" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Thanh toán thành công! 🎉
                </h1>
                <p className="text-gray-500 mb-6">
                    Cảm ơn bạn đã mua hàng tại FlowerCorner
                </p>

                {/* Payment Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5 text-green-500" />
                        Chi tiết thanh toán
                    </h3>
                    <div className="space-y-3 text-sm">
                        {provider && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hình thức</span>
                                <span className="font-medium flex items-center gap-2">
                                    {provider === 'MOMO' && <span className="text-pink-500">📱 MoMo</span>}
                                    {provider === 'VNPAY' && <span className="text-blue-500">💳 VNPay</span>}
                                </span>
                            </div>
                        )}
                        {orderId && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã đơn hàng</span>
                                <span className="font-medium text-rose-600">#{orderId.replace('ORDER_', '')}</span>
                            </div>
                        )}
                        {transId && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã giao dịch</span>
                                <span className="font-medium">{transId}</span>
                            </div>
                        )}
                        {amount > 0 && (
                            <div className="flex justify-between border-t pt-3">
                                <span className="text-gray-700 font-medium">Số tiền thanh toán</span>
                                <span className="font-bold text-green-600 text-lg">{formatPrice(amount)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                        <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Đơn hàng đang được xử lý</p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng. Vui lòng kiểm tra email để theo dõi trạng thái.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg font-medium"
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
                </div>
            </div>
        </div>
    );
};

/**
 * Payment Failed Screen
 */
const PaymentFailedScreen = ({ paymentInfo, errorMessage }) => {
    const { orderId, amount, provider } = paymentInfo || {};
    const navigate = useNavigate();

    const handleRetryPayment = () => {
        // Navigate back to checkout to try again
        navigate('/checkout');
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-red-50 to-white">
            <div className="text-center max-w-md">
                {/* Failed Icon */}
                <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircleIcon className="h-16 w-16 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Thanh toán thất bại
                </h1>
                <p className="text-gray-500 mb-4">
                    Rất tiếc, giao dịch của bạn không thành công
                </p>

                {/* Error Details */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-red-700">
                        <strong>Lý do:</strong> {errorMessage}
                    </p>
                </div>

                {/* Order Info */}
                {orderId && (
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 text-left">
                        <div className="space-y-2 text-sm">
                            {provider && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hình thức</span>
                                    <span className="font-medium">
                                        {provider === 'MOMO' ? '📱 MoMo' : '💳 VNPay'}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã đơn hàng</span>
                                <span className="font-medium text-gray-700">#{orderId.replace('ORDER_', '')}</span>
                            </div>
                            {amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền</span>
                                    <span className="font-medium">{formatPrice(amount)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Bạn có thể:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Thử thanh toán lại với phương thức khác</li>
                        <li>Kiểm tra số dư tài khoản của bạn</li>
                        <li>Liên hệ hotline: <strong>1900 xxxx</strong> để được hỗ trợ</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRetryPayment}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg font-medium"
                    >
                        <CreditCardIcon className="h-5 w-5" />
                        Thử lại thanh toán
                    </button>
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        Kiểm tra đơn hàng
                    </Link>
                </div>

                {/* Back to home */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 mt-6 text-sm"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default PaymentResultPage;
