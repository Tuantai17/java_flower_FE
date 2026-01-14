/**
 * ========================================
 * CheckoutPage - Trang Thanh Toán
 * ========================================
 * 
 * Triển khai theo README_FRONTEND.md (Checkout API)
 * 
 * Flow:
 * 1. User điền thông tin người gửi & người nhận
 * 2. User chọn địa chỉ giao hàng
 * 3. User chọn lịch giao hàng
 * 4. User chọn phương thức thanh toán
 * 5. Click "Đặt hàng":
 *    a. Validate form
 *    b. Sync giỏ hàng lên server
 *    c. Gọi API POST /orders/checkout
 * 6. COD: Hiển thị trang thành công
 * 7. MOMO/VNPAY: Redirect đến trang thanh toán
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import useCheckout from '../../hooks/useCheckout';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import { PAYMENT_METHODS } from '../../api/orderApi';

// Address Autocomplete (không có map, có nút chọn địa chỉ của tôi)
import AddressAutocomplete from '../../components/common/AddressAutocomplete';

// Icons
import {
    ShoppingBagIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    ClockIcon,
    GiftIcon,
} from '@heroicons/react/24/outline';

// ========================================
// MAIN COMPONENT
// ========================================

const CheckoutPage = () => {
    // Sử dụng custom hook quản lý checkout
    const checkout = useCheckout();

    // Hiển thị trang thành công
    if (checkout.orderSuccess) {
        return <OrderSuccessScreen orderData={checkout.orderData} />;
    }

    return (
        <div className="py-8 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <CheckoutHeader />

                {/* API Error */}
                {checkout.apiError && (
                    <ErrorAlert message={checkout.apiError} />
                )}

                <form onSubmit={checkout.handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Sender Information */}
                            <SenderInfoSection
                                formData={checkout.formData}
                                errors={checkout.errors}
                                onChange={checkout.handleChange}
                            />

                            {/* Recipient Information */}
                            <RecipientInfoSection
                                formData={checkout.formData}
                                errors={checkout.errors}
                                onChange={checkout.handleChange}
                                onCopyFromSender={() => checkout.setFormFields({
                                    recipientName: checkout.formData.senderName,
                                    recipientPhone: checkout.formData.senderPhone,
                                    sameAsSender: true,
                                })}
                            />

                            {/* Shipping Address */}
                            <ShippingAddressSection
                                formData={checkout.formData}
                                errors={checkout.errors}
                                onChange={checkout.handleChange}
                                provinces={checkout.provinces}
                                districts={checkout.availableDistricts}
                                userAddress={checkout.user?.address || ''}
                                onAddressSelect={(addressValue) => {
                                    // Cập nhật form với dữ liệu từ AddressAutocomplete
                                    checkout.setFormFields({
                                        addressDetail: addressValue.addressDetail || addressValue.addressLine,
                                        lat: addressValue.lat,
                                        lng: addressValue.lng,
                                        geoProvider: addressValue.provider,
                                        placeId: addressValue.placeId,
                                    });
                                }}
                            />

                            {/* Delivery Schedule */}
                            <DeliveryScheduleSection
                                formData={checkout.formData}
                                errors={checkout.errors}
                                onChange={checkout.handleChange}
                                timeSlots={checkout.deliveryTimeSlots}
                            />

                            {/* Payment Method */}
                            <PaymentMethodSection
                                selectedMethod={checkout.formData.paymentMethod}
                                momoType={checkout.formData.momoType}
                                onChange={(method) => checkout.setFormFields({ paymentMethod: method })}
                                onMomoTypeChange={(type) => checkout.setFormFields({ momoType: type })}
                            />

                            {/* Note */}
                            <NoteSection
                                note={checkout.formData.note}
                                onChange={checkout.handleChange}
                            />
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <OrderSummary
                                cart={checkout.cart}
                                cartTotal={checkout.cartTotal}
                                cartCount={checkout.cartCount}
                                discountAmount={checkout.discountAmount}
                                shippingFee={checkout.shippingFee}
                                finalTotal={checkout.finalTotal}
                                appliedVoucher={checkout.appliedVoucher}
                                loading={checkout.loading}
                                loadingText={checkout.loadingText}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ========================================
// HEADER COMPONENT
// ========================================

const CheckoutHeader = memo(() => (
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
));

// ========================================
// ERROR ALERT
// ========================================

const ErrorAlert = memo(({ message }) => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="font-medium text-red-800">Lỗi đặt hàng</p>
            <p className="text-red-600 text-sm mt-1">{message}</p>
        </div>
    </div>
));

// ========================================
// SENDER INFORMATION SECTION
// ========================================

const SenderInfoSection = memo(({ formData, errors, onChange }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-rose-500" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Thông tin người gửi</h2>
                <p className="text-sm text-gray-500">Thông tin của bạn để shop liên hệ</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender Name */}
            <FormInput
                label="Họ và tên"
                name="senderName"
                value={formData.senderName}
                onChange={onChange}
                error={errors.senderName}
                placeholder="Nguyễn Văn A"
                icon={<UserIcon className="h-5 w-5" />}
                required
            />

            {/* Sender Phone */}
            <FormInput
                label="Số điện thoại"
                name="senderPhone"
                type="tel"
                value={formData.senderPhone}
                onChange={onChange}
                error={errors.senderPhone}
                placeholder="0912 345 678"
                icon={<PhoneIcon className="h-5 w-5" />}
                required
            />

            {/* Sender Email */}
            <div className="md:col-span-2">
                <FormInput
                    label="Email"
                    name="senderEmail"
                    type="email"
                    value={formData.senderEmail}
                    onChange={onChange}
                    error={errors.senderEmail}
                    placeholder="email@example.com"
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                    hint="Email để nhận thông báo đơn hàng (không bắt buộc)"
                />
            </div>
        </div>
    </div>
));

// ========================================
// RECIPIENT INFORMATION SECTION
// ========================================

const RecipientInfoSection = memo(({ formData, errors, onChange, onCopyFromSender }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <GiftIcon className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Thông tin người nhận</h2>
                    <p className="text-sm text-gray-500">Người sẽ nhận hoa từ bạn</p>
                </div>
            </div>

            {/* Copy from sender button */}
            <button
                type="button"
                onClick={onCopyFromSender}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
                <CheckCircleIcon className="h-4 w-4" />
                Giống người gửi
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recipient Name */}
            <FormInput
                label="Họ và tên người nhận"
                name="recipientName"
                value={formData.recipientName}
                onChange={onChange}
                error={errors.recipientName}
                placeholder="Trần Thị B"
                icon={<UserIcon className="h-5 w-5" />}
                required
            />

            {/* Recipient Phone */}
            <FormInput
                label="Số điện thoại người nhận"
                name="recipientPhone"
                type="tel"
                value={formData.recipientPhone}
                onChange={onChange}
                error={errors.recipientPhone}
                placeholder="0987 654 321"
                icon={<PhoneIcon className="h-5 w-5" />}
                required
            />
        </div>
    </div>
));

// ========================================
// SHIPPING ADDRESS SECTION
// ========================================

const ShippingAddressSection = memo(({ formData, errors, onChange, provinces, districts, onAddressSelect, userAddress }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Địa chỉ giao hàng</h2>
                <p className="text-sm text-gray-500">Nơi giao hoa đến cho người nhận</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Province */}
            <FormSelect
                label="Tỉnh / Thành phố"
                name="province"
                value={formData.province}
                onChange={onChange}
                error={errors.province}
                options={provinces}
                optionLabel="name"
                optionValue="name"
                placeholder="Chọn Tỉnh/Thành phố"
                required
            />

            {/* District */}
            <FormSelect
                label="Quận / Huyện"
                name="district"
                value={formData.district}
                onChange={onChange}
                error={errors.district}
                options={districts}
                optionLabel="name"
                optionValue="name"
                placeholder="Chọn Quận/Huyện"
                disabled={!formData.province}
                required
            />

            {/* Address Detail với Autocomplete */}
            <div className="md:col-span-2">
                <AddressAutocomplete
                    value={{
                        addressLine: formData.addressDetail || '',
                        lat: formData.lat,
                        lng: formData.lng,
                        provider: formData.geoProvider,
                        placeId: formData.placeId,
                    }}
                    onChange={(addressValue) => {
                        onAddressSelect({
                            ...addressValue,
                            // Map addressLine to addressDetail for form
                            addressDetail: addressValue.addressLine,
                        });
                    }}
                    userAddress={userAddress}
                    error={errors.addressDetail}
                    label="Địa chỉ chi tiết"
                    placeholder="Số nhà, tên đường, tòa nhà... (có gợi ý tự động)"
                    required
                />
            </div>
        </div>
    </div>
));

// ========================================
// DELIVERY SCHEDULE SECTION
// ========================================

const DeliveryScheduleSection = memo(({ formData, errors, onChange, timeSlots }) => {
    // Get min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Lịch giao hàng</h2>
                    <p className="text-sm text-gray-500">Chọn thời gian bạn muốn giao hoa</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Delivery Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày giao hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={onChange}
                            min={today}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${errors.deliveryDate ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                    </div>
                    {errors.deliveryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                    )}
                </div>

                {/* Delivery Time */}
                <FormSelect
                    label="Khung giờ giao"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={onChange}
                    error={errors.deliveryTime}
                    options={timeSlots}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Chọn khung giờ"
                    icon={<ClockIcon className="h-5 w-5" />}
                    required
                />
            </div>

            {/* Delivery Tips */}
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                        Đơn hàng đặt trước 14:00 có thể giao trong ngày. 
                        Các ngày lễ/Tết có thể cần đặt trước 2-3 ngày.
                    </span>
                </p>
            </div>
        </div>
    );
});

// ========================================
// PAYMENT METHOD SECTION
// ========================================

const PaymentMethodSection = memo(({ selectedMethod, momoType, onChange, onMomoTypeChange }) => {
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
            name: 'MoMo',
            description: 'Thanh toán qua ví điện tử MoMo',
            icon: '📱',
            disabled: false,
        },
        {
            id: PAYMENT_METHODS.VNPAY,
            name: 'VNPay',
            description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard...)',
            icon: '💳',
            disabled: true,
        },
        {
            id: PAYMENT_METHODS.BANK_TRANSFER,
            name: 'Chuyển khoản ngân hàng',
            description: 'Chuyển khoản trực tiếp vào tài khoản shop',
            icon: '🏦',
            disabled: true,
        },
    ];

    // MoMo sub-options
    const momoOptions = [
        {
            id: 'wallet',
            name: 'Quét mã QR',
            description: 'Mở app MoMo và quét mã',
            icon: '📲',
        },
        {
            id: 'card',
            name: 'Thẻ ATM / Visa / Master',
            description: 'Thanh toán bằng thẻ ngân hàng',
            icon: '💳',
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <div key={method.id}>
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

                        {/* MoMo Sub-options */}
                        {method.id === PAYMENT_METHODS.MOMO && selectedMethod === PAYMENT_METHODS.MOMO && (
                            <div className="mt-3 ml-12 space-y-2">
                                {momoOptions.map((option) => (
                                    <label
                                        key={option.id}
                                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                            momoType === option.id
                                                ? 'border-pink-400 bg-pink-50'
                                                : 'border-gray-200 hover:border-pink-200'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="momoType"
                                            value={option.id}
                                            checked={momoType === option.id}
                                            onChange={() => onMomoTypeChange(option.id)}
                                            className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                                        />
                                        <span className="text-lg">{option.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-700 text-sm">{option.name}</p>
                                            <p className="text-xs text-gray-500">{option.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MoMo Info */}
            {selectedMethod === PAYMENT_METHODS.MOMO && (
                <div className="mt-4 p-3 bg-pink-50 rounded-xl">
                    <p className="text-sm text-pink-700 flex items-start gap-2">
                        <span className="text-lg">📲</span>
                        <span>
                            Sau khi đặt hàng, bạn sẽ được chuyển đến trang thanh toán MoMo 
                            để hoàn tất giao dịch.
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
});

// ========================================
// NOTE SECTION
// ========================================

const NoteSection = memo(({ note, onChange }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lời nhắn</h2>
        <textarea
            name="note"
            value={note}
            onChange={onChange}
            placeholder="Lời chúc kèm theo hoa, ghi chú đặc biệt cho đơn hàng..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none"
        />
        <p className="text-sm text-gray-500 mt-2">
            💝 Lời nhắn sẽ được viết tay kèm theo hoa gửi đến người nhận
        </p>
    </div>
));

// ========================================
// ORDER SUMMARY
// ========================================

const OrderSummary = memo(({
    cart,
    cartTotal,
    cartCount,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedVoucher,
    loading,
    loadingText,
}) => (
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
));

// ========================================
// CART ITEM MINI
// ========================================

const CartItemMini = memo(({ item }) => {
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
});

// ========================================
// ORDER SUCCESS SCREEN
// ========================================

const OrderSuccessScreen = ({ orderData }) => {
    const orderCode = orderData?.orderCode || orderData?.order_code || orderData?.id || 'N/A';

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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
                            <p>
                                <span className="text-gray-500">Tổng tiền:</span>{' '}
                                <span className="font-medium text-rose-600">
                                    {formatPrice(orderData.finalPrice || orderData.total_price || 0)}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-500">Phương thức:</span>{' '}
                                <span className="font-medium">{orderData.paymentMethod || 'COD'}</span>
                            </p>
                            <p>
                                <span className="text-gray-500">Trạng thái:</span>{' '}
                                <span className="font-medium text-yellow-600">Chờ xác nhận</span>
                            </p>
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

// ========================================
// REUSABLE FORM COMPONENTS
// ========================================

/**
 * Form Input Component
 */
const FormInput = memo(({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    icon,
    hint,
    required,
    ...props
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-200'
                    }`}
                {...props}
            />
        </div>
        {hint && !error && (
            <p className="text-gray-500 text-sm mt-1">{hint}</p>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
));

/**
 * Form Select Component
 */
const FormSelect = memo(({
    label,
    name,
    value,
    onChange,
    error,
    options = [],
    optionLabel = 'label',
    optionValue = 'value',
    placeholder,
    icon,
    required,
    disabled,
    ...props
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors appearance-none bg-white ${error ? 'border-red-500' : 'border-gray-200'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                {...props}
            >
                <option value="">{placeholder || 'Chọn...'}</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt[optionValue] || opt}>
                        {opt[optionLabel] || opt}
                    </option>
                ))}
            </select>
            {/* Dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
));

/**
 * Form Textarea Component
 */
const FormTextarea = memo(({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    icon,
    rows = 3,
    required,
    ...props
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-3 text-gray-400">
                    {icon}
                </div>
            )}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors resize-none ${error ? 'border-red-500' : 'border-gray-200'
                    }`}
                {...props}
            />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
));

export default CheckoutPage;
