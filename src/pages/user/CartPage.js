import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import { VoucherInput } from '../../components/user/VoucherList';
import {
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ShoppingBagIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const CartPage = () => {
    const navigate = useNavigate();
    const {
        state,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
    } = useApp();

    const { cart } = state;
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    // Calculate final total
    const discountAmount = appliedVoucher?.discountAmount || 0;
    const finalTotal = cartTotal - discountAmount;

    // Handle quantity change
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else if (newQuantity <= 99) {
            updateCartQuantity(productId, newQuantity);
        }
        // Recalculate voucher discount if applied
        if (appliedVoucher) {
            // Re-check voucher validity with new cart total
            setAppliedVoucher(null);
        }
    };

    // Handle remove item
    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
        // Clear voucher if cart changes significantly
        if (appliedVoucher) {
            setAppliedVoucher(null);
        }
    };

    // Handle clear cart
    const handleClearCart = () => {
        if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
            clearCart();
            setAppliedVoucher(null);
        }
    };

    // Handle apply voucher
    const handleApplyVoucher = (voucher) => {
        setAppliedVoucher(voucher);
    };

    // Handle checkout
    const handleCheckout = () => {
        // Store voucher info in session/localStorage for checkout page
        if (appliedVoucher) {
            sessionStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));
        } else {
            sessionStorage.removeItem('appliedVoucher');
        }
        navigate('/checkout');
    };

    // Empty cart state
    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                    <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-500 mb-8">
                        Bạn chưa thêm sản phẩm nào vào giỏ hàng
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors font-medium"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng</h1>
                        <p className="text-gray-500 mt-1">
                            {cartCount} sản phẩm trong giỏ hàng
                        </p>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <TrashIcon className="h-5 w-5" />
                        Xóa tất cả
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                Tóm tắt đơn hàng
                            </h3>

                            {/* Summary Details */}
                            <div className="space-y-4 mb-6">
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
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-rose-600">{formatPrice(finalTotal)}</span>
                                    </div>
                                    {appliedVoucher && (
                                        <p className="text-green-600 text-sm mt-1">
                                            Bạn tiết kiệm được {formatPrice(discountAmount)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Tiến hành thanh toán
                            </button>

                            {/* Continue Shopping */}
                            <Link
                                to="/shop"
                                className="flex items-center justify-center gap-2 mt-4 py-3 text-gray-600 hover:text-rose-500 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                Tiếp tục mua sắm
                            </Link>

                            {/* Voucher Section */}
                            <div className="mt-6 pt-6 border-t">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Mã giảm giá
                                </label>
                                <VoucherInput
                                    orderTotal={cartTotal}
                                    onApply={handleApplyVoucher}
                                    appliedVoucher={appliedVoucher}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Cart Item Component
 */
const CartItem = ({ item, onQuantityChange, onRemove }) => {
    const { id, name, price, salePrice, thumbnail, quantity } = item;
    const validThumbnail = getImageUrl(thumbnail);
    const displayPrice = salePrice && salePrice < price ? salePrice : price;
    const subtotal = displayPrice * quantity;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
            {/* Image */}
            <Link to={`/product/${id}`} className="flex-shrink-0">
                <img
                    src={validThumbnail}
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/96x96/f3f4f6/9ca3af?text=No+Image';
                    }}
                />
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between">
                    <Link
                        to={`/product/${id}`}
                        className="font-medium text-gray-800 hover:text-rose-500 transition-colors line-clamp-2"
                    >
                        {name}
                    </Link>
                    <button
                        onClick={() => onRemove(id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa sản phẩm"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Price */}
                <div className="mt-1 flex items-center gap-2">
                    {salePrice && salePrice < price ? (
                        <>
                            <span className="text-gray-400 line-through text-sm">{formatPrice(price)}</span>
                            <span className="text-rose-600 font-semibold">{formatPrice(salePrice)}</span>
                        </>
                    ) : (
                        <span className="text-rose-600 font-semibold">{formatPrice(price)}</span>
                    )}
                </div>

                {/* Quantity & Subtotal */}
                <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onQuantityChange(id, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-rose-500 hover:text-rose-500 transition-colors"
                        >
                            <MinusIcon className="h-4 w-4" />
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => onQuantityChange(id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border border-gray-200 rounded-lg py-1 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                            min="1"
                            max="99"
                        />
                        <button
                            onClick={() => onQuantityChange(id, quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-rose-500 hover:text-rose-500 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                        <span className="text-sm text-gray-500">Thành tiền:</span>
                        <p className="font-bold text-rose-600">{formatPrice(subtotal)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
