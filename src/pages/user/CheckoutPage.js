import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import orderApi, { PAYMENT_METHODS, MOMO_TYPES } from '../../api/orderApi';
import cartApi from '../../api/cartApi';
import {
    ShoppingBagIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CreditCardIcon,
    TruckIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Checkout Page - Trang thanh toán
 * 
 * Flow:
 * 1. User điền thông tin giao hàng
 * 2. Chọn phương thức thanh toán
 * 3. Click "Đặt hàng":
 *    a. Sync giỏ hàng lên server (POST /cart/add)
 *    b. Gọi API POST /orders/checkout
 * 4. COD: Hiển thị trang thành công
 * 5. MOMO/VNPAY: Redirect đến trang thanh toán
 */
const CheckoutPage = () => {
    const navigate = useNavigate();

    // Cart data từ AppContext
    const { state, cartTotal, cartCount, clearCart } = useApp();
    const { cart } = state;

    // Auth từ AuthContext (tách riêng cho chính xác)
    const { user, isAuthenticated } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        shippingAddress: '',
        note: '',
        paymentMethod: PAYMENT_METHODS.COD,
    });

    // MoMo sub-type state (QR hoặc CARD)
    const [momoType, setMomoType] = useState(MOMO_TYPES.QR);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [apiError, setApiError] = useState('');

    // Load voucher from session storage
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    useEffect(() => {
        // Load voucher if any
        const savedVoucher = sessionStorage.getItem('appliedVoucher');
        if (savedVoucher) {
            try {
                setAppliedVoucher(JSON.parse(savedVoucher));
            } catch (e) {
                console.error('Error parsing voucher:', e);
            }
        }

        // Pre-fill user info if logged in
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                customerName: user.fullName || user.username || '',
                customerPhone: user.phone || user.phoneNumber || '',
                customerEmail: user.email || '',
                shippingAddress: user.address || '',
            }));
        }
    }, [isAuthenticated, user]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [cart, navigate, orderSuccess]);

    // Calculate totals
    const shippingFee = 0; // Miễn phí ship
    const discountAmount = appliedVoucher?.discountAmount || 0;
    const finalTotal = cartTotal - discountAmount + shippingFee;

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setApiError('');

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Vui lòng nhập số điện thoại';
        } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
            newErrors.customerPhone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Email không hợp lệ';
        }

        if (!formData.shippingAddress.trim()) {
            newErrors.shippingAddress = 'Vui lòng nhập địa chỉ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit order
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        // Check authentication - yêu cầu đăng nhập để checkout
        if (!isAuthenticated) {
            setApiError('Vui lòng đăng nhập để tiến hành đặt hàng');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Sync giỏ hàng với backend
            setLoadingText('Đang đồng bộ giỏ hàng...');
            console.log('🔄 Step 1: Syncing cart to server...');

            try {
                await cartApi.ensureCartSynced(cart);
                console.log('✅ Cart synced successfully');
            } catch (syncError) {
                console.error('❌ Cart sync error:', syncError);
                // Không throw lỗi, tiếp tục checkout vì có thể backend đã có cart
            }

            // Step 2: Prepare checkout data
            setLoadingText('Đang tạo đơn hàng...');
            console.log('🔄 Step 2: Creating order...');

            const checkoutData = {
                // Thông tin khách hàng
                customerName: formData.customerName.trim(),
                customerPhone: formData.customerPhone.trim(),
                customerEmail: formData.customerEmail.trim(),
                shippingAddress: formData.shippingAddress.trim(),

                // Thông tin thanh toán
                paymentMethod: formData.paymentMethod,

                // MoMo type (chỉ khi chọn MOMO)
                ...(formData.paymentMethod === PAYMENT_METHODS.MOMO && {
                    momoType: momoType,
                    requestType: momoType, // Backend có thể cần field này
                }),

                // Voucher (nếu có)
                voucherCode: appliedVoucher?.code || null,

                // Ghi chú
                note: formData.note.trim() || null,
            };

            console.log('📤 Submitting checkout:', checkoutData);
            console.log('📍 Payment Method selected:', formData.paymentMethod);

            const result = await orderApi.checkout(checkoutData);

            console.log('✅ Checkout response:', result);

            // ========================================
            // XỬ LÝ PAYMENT URL (MoMo/VNPay)
            // ========================================
            // orderApi.checkout đã xử lý và trả về paymentUrl ở top level
            const paymentUrl = result?.paymentUrl;

            console.log('📍 Payment Method:', formData.paymentMethod);
            console.log('📍 Payment URL:', paymentUrl);

            // Redirect nếu có paymentUrl (MOMO, VNPAY)
            if (paymentUrl && formData.paymentMethod !== PAYMENT_METHODS.COD) {
                console.log('🔄 Redirecting to payment gateway...');
                setLoadingText('Đang chuyển đến trang thanh toán...');

                // Validate URL
                try {
                    new URL(paymentUrl);

                    // Delay nhỏ để user thấy loading message
                    setTimeout(() => {
                        window.location.href = paymentUrl;
                    }, 500);
                    return;

                } catch (urlError) {
                    console.error('❌ Invalid payment URL:', paymentUrl);
                    setApiError('URL thanh toán không hợp lệ. Vui lòng liên hệ CSKH.');
                    setLoading(false);
                    return;
                }
            }

            // Cảnh báo nếu chọn MOMO/VNPAY nhưng không có paymentUrl
            if (formData.paymentMethod !== PAYMENT_METHODS.COD && !paymentUrl) {
                console.warn('⚠️ No paymentUrl for', formData.paymentMethod);
                setApiError(
                    'Đơn hàng đã được tạo nhưng không thể kết nối cổng thanh toán. ' +
                    'Vui lòng kiểm tra "Đơn hàng của tôi" hoặc liên hệ CSKH.'
                );
            }

            // ========================================
            // COD hoặc FALLBACK - Hiển thị trang thành công
            // ========================================
            console.log('✅ Order created successfully');
            clearCart();
            sessionStorage.removeItem('appliedVoucher');
            setOrderData(result);
            setOrderSuccess(true);

        } catch (error) {
            console.error('❌ Checkout error:', error.response?.data || error.message);

            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Đặt hàng thất bại. Vui lòng thử lại.';

            setApiError(errorMessage);
        } finally {
            setLoading(false);
            setLoadingText('');
        }
    };

    // Success state
    if (orderSuccess) {
        return <OrderSuccessScreen orderData={orderData} />;
    }

    return (
        <div className="py-8 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Quay lại giỏ hàng
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>
                    <p className="text-gray-500 mt-1">
                        Hoàn tất thông tin để đặt hàng
                    </p>
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800">Lỗi đặt hàng</p>
                            <p className="text-red-600 text-sm mt-1">{apiError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <ShippingInfoSection
                                formData={formData}
                                errors={errors}
                                onChange={handleChange}
                            />

                            {/* Payment Method */}
                            <PaymentMethodSection
                                selectedMethod={formData.paymentMethod}
                                onChange={(method) => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                momoType={momoType}
                                onMomoTypeChange={setMomoType}
                            />

                            {/* Order Note */}
                            <NoteSection
                                note={formData.note}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <OrderSummary
                                cart={cart}
                                cartTotal={cartTotal}
                                cartCount={cartCount}
                                discountAmount={discountAmount}
                                shippingFee={shippingFee}
                                finalTotal={finalTotal}
                                appliedVoucher={appliedVoucher}
                                loading={loading}
                                loadingText={loadingText}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Shipping Information Section
 */
const ShippingInfoSection = ({ formData, errors, onChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-5 w-5 text-rose-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Thông tin giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={onChange}
                            placeholder="Nguyễn Văn A"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${errors.customerName ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                    </div>
                    {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={onChange}
                            placeholder="0912 345 678"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${errors.customerPhone ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                    </div>
                    {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={onChange}
                            placeholder="email@example.com"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${errors.customerEmail ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                    </div>
                    {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <textarea
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={onChange}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            rows={3}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none ${errors.shippingAddress ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                    </div>
                    {errors.shippingAddress && <p className="text-red-500 text-sm mt-1">{errors.shippingAddress}</p>}
                </div>
            </div>
        </div>
    );
};

/**
 * Payment Method Section
 * Bao gồm các phương thức thanh toán và lựa chọn con cho MoMo
 */
const PaymentMethodSection = ({ selectedMethod, onChange, momoType, onMomoTypeChange }) => {
    const paymentMethods = [
        {
            id: PAYMENT_METHODS.COD,
            name: 'Thanh toán khi nhận hàng (COD)',
            description: 'Thanh toán bằng tiền mặt khi nhận được hàng',
            icon: '💵',
            disabled: false,
        },
        {
            id: PAYMENT_METHODS.MOMO,
            name: 'Ví MoMo',
            description: 'Thanh toán qua ví điện tử MoMo',
            icon: '📱',
            disabled: false,
            hasSubOptions: true, // Đánh dấu có lựa chọn con
        },
        {
            id: PAYMENT_METHODS.VNPAY,
            name: 'VNPay',
            description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard...)',
            icon: '💳',
            disabled: true, // Chưa tích hợp
        },
        {
            id: PAYMENT_METHODS.BANK_TRANSFER,
            name: 'Chuyển khoản ngân hàng',
            description: 'Chuyển khoản trực tiếp vào tài khoản shop',
            icon: '🏦',
            disabled: true, // Chưa tích hợp
        },
    ];

    // Các lựa chọn con cho MoMo
    const momoSubOptions = [
        {
            id: MOMO_TYPES.QR,
            name: 'Thanh toán bằng QR MoMo',
            description: 'Quét mã QR bằng ứng dụng MoMo',
            icon: '📲',
        },
        {
            id: MOMO_TYPES.CARD,
            name: 'Thanh toán bằng thẻ / MoMo ATM',
            description: 'Dùng thẻ ATM nội địa hoặc thẻ quốc tế',
            icon: '💳',
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-rose-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <div key={method.id}>
                        {/* Payment Method Option */}
                        <label
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedMethod === method.id
                                    ? 'border-rose-500 bg-rose-50'
                                    : 'border-gray-200 hover:border-rose-200'
                                } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={selectedMethod === method.id}
                                onChange={() => !method.disabled && onChange(method.id)}
                                disabled={method.disabled}
                                className="w-5 h-5 text-rose-500 focus:ring-rose-500"
                            />
                            <span className="text-2xl">{method.icon}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                    {method.name}
                                    {method.disabled && (
                                        <span className="text-xs text-gray-400 ml-2">(Sắp ra mắt)</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                            {selectedMethod === method.id && !method.disabled && (
                                <CheckCircleIcon className="h-6 w-6 text-rose-500" />
                            )}
                        </label>

                        {/* MoMo Sub-Options - Hiển thị khi chọn MoMo */}
                        {method.id === PAYMENT_METHODS.MOMO && selectedMethod === PAYMENT_METHODS.MOMO && (
                            <div className="mt-3 ml-8 p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-rose-200 rounded-xl animate-fadeIn">
                                <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🔸</span>
                                    Chọn hình thức thanh toán MoMo
                                </p>
                                <div className="space-y-2">
                                    {momoSubOptions.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${momoType === option.id
                                                    ? 'bg-white border-2 border-rose-400 shadow-sm'
                                                    : 'bg-white/50 border border-gray-200 hover:border-rose-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="momoType"
                                                value={option.id}
                                                checked={momoType === option.id}
                                                onChange={() => onMomoTypeChange(option.id)}
                                                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                                            />
                                            <span className="text-xl">{option.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-700 text-sm">
                                                    {option.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{option.description}</p>
                                            </div>
                                            {momoType === option.id && (
                                                <CheckCircleIcon className="h-5 w-5 text-rose-500" />
                                            )}
                                        </label>
                                    ))}
                                </div>

                                {/* MoMo Tips */}
                                <div className="mt-3 p-2 bg-pink-100/50 rounded-lg">
                                    <p className="text-xs text-pink-700 flex items-start gap-1">
                                        <span>💡</span>
                                        <span>
                                            {momoType === MOMO_TYPES.QR
                                                ? 'Bạn sẽ được chuyển đến trang quét mã QR bằng ứng dụng MoMo'
                                                : 'Bạn sẽ nhập thông tin thẻ ATM/Visa/MasterCard để thanh toán qua MoMo'
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Note Section
 */
const NoteSection = ({ note, onChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú đơn hàng</h2>
            <textarea
                name="note"
                value={note}
                onChange={onChange}
                placeholder="Ghi chú thêm cho đơn hàng (ví dụ: giao giờ hành chính, gọi trước khi giao...)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none"
            />
        </div>
    );
};

/**
 * Order Summary Component
 */
const OrderSummary = ({
    cart,
    cartTotal,
    cartCount,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedVoucher,
    loading,
    loadingText = ''
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Đơn hàng của bạn
            </h3>

            {/* Cart Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2">
                {cart.map((item) => (
                    <CartItemMini key={item.id} item={item} />
                ))}
            </div>

            {/* Summary Details */}
            <div className="space-y-3 py-4 border-y border-gray-100">
                <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({cartCount} sản phẩm)</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>

                {/* Discount */}
                {appliedVoucher && discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({appliedVoucher.code})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">
                        {shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}
                    </span>
                </div>
            </div>

            {/* Total */}
            <div className="py-4">
                <div className="flex justify-between text-xl font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-rose-600">{formatPrice(finalTotal)}</span>
                </div>
                {appliedVoucher && discountAmount > 0 && (
                    <p className="text-green-600 text-sm mt-1 text-right">
                        Bạn tiết kiệm được {formatPrice(discountAmount)}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {loadingText || 'Đang xử lý...'}
                    </>
                ) : (
                    <>
                        <ShieldCheckIcon className="h-5 w-5" />
                        Đặt hàng
                    </>
                )}
            </button>

            {/* Security Note */}
            <p className="text-center text-sm text-gray-500 mt-4">
                🔒 Thanh toán an toàn & bảo mật
            </p>
        </div>
    );
};

/**
 * Mini Cart Item for Order Summary
 */
const CartItemMini = ({ item }) => {
    const { name, price, salePrice, thumbnail, quantity } = item;
    const validThumbnail = getImageUrl(thumbnail);
    const displayPrice = salePrice && salePrice < price ? salePrice : price;

    return (
        <div className="flex gap-3">
            <div className="relative flex-shrink-0">
                <img
                    src={validThumbnail}
                    alt={name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/64x64/f3f4f6/9ca3af?text=No+Image';
                    }}
                />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {quantity}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{name}</p>
                <p className="text-rose-600 font-semibold text-sm mt-1">
                    {formatPrice(displayPrice * quantity)}
                </p>
            </div>
        </div>
    );
};

/**
 * Order Success Screen
 */
const OrderSuccessScreen = ({ orderData }) => {
    const orderCode = orderData?.orderCode || orderData?.order_code || orderData?.id || 'N/A';

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="h-14 w-14 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Đặt hàng thành công!
                </h1>
                <p className="text-gray-500 mb-4">
                    Cảm ơn bạn đã mua hàng tại FlowerCorner
                </p>
                <p className="text-lg font-semibold text-rose-600 mb-6">
                    Mã đơn hàng: #{orderCode}
                </p>
                <p className="text-gray-600 mb-8">
                    Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
                    Vui lòng kiểm tra email để theo dõi trạng thái đơn hàng.
                </p>

                {/* Order Details Summary */}
                {orderData && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-700 mb-2">Chi tiết đơn hàng:</h3>
                        <div className="text-sm space-y-1">
                            <p><span className="text-gray-500">Tổng tiền:</span> <span className="font-medium text-rose-600">{formatPrice(orderData.finalPrice || orderData.total_price || 0)}</span></p>
                            <p><span className="text-gray-500">Phương thức:</span> <span className="font-medium">{orderData.paymentMethod || 'COD'}</span></p>
                            <p><span className="text-gray-500">Trạng thái:</span> <span className="font-medium text-yellow-600">Chờ xác nhận</span></p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/profile/orders"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-medium"
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

export default CheckoutPage;
