import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/formatPrice';

/**
 * CartIcon Component
 * 
 * Hiển thị icon giỏ hàng với số lượng sản phẩm
 * Có thể hiển thị dropdown preview giỏ hàng
 * 
 * @param {boolean} showDropdown - Hiển thị dropdown khi hover
 * @param {string} className - Custom class name
 */
const CartIcon = ({ showDropdown = true, className = '' }) => {
    const { state, cartTotal, cartCount, removeFromCart } = useApp();
    const { cart } = state;

    // Max items to show in preview
    const previewItems = cart.slice(0, 3);
    const remainingCount = cart.length - previewItems.length;

    return (
        <div className={`relative group ${className}`}>
            {/* Cart Icon Link */}
            <Link
                to="/cart"
                className="relative flex items-center justify-center p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
                <ShoppingBagIcon className="h-6 w-6 text-gray-700" />

                {/* Badge */}
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-rose-500 text-white text-xs font-bold rounded-full">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </Link>

            {/* Dropdown Preview */}
            {showDropdown && cart.length > 0 && (
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b bg-gray-50">
                            <h4 className="font-semibold text-gray-800">
                                Giỏ hàng ({cartCount} sản phẩm)
                            </h4>
                        </div>

                        {/* Items */}
                        <div className="max-h-64 overflow-y-auto">
                            {previewItems.map((item) => (
                                <CartPreviewItem
                                    key={item.id}
                                    item={item}
                                    onRemove={removeFromCart}
                                />
                            ))}

                            {remainingCount > 0 && (
                                <div className="px-4 py-2 text-center text-sm text-gray-500 bg-gray-50">
                                    Và {remainingCount} sản phẩm khác...
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between mb-3">
                                <span className="text-gray-600">Tổng cộng:</span>
                                <span className="font-bold text-rose-600">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/cart"
                                    className="py-2 px-4 text-center border border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm"
                                >
                                    Xem giỏ hàng
                                </Link>
                                <Link
                                    to="/checkout"
                                    className="py-2 px-4 text-center bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium text-sm"
                                >
                                    Thanh toán
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Cart Preview Item - Hiển thị 1 sản phẩm trong dropdown
 */
const CartPreviewItem = ({ item, onRemove }) => {
    const { id, name, price, salePrice, thumbnail, quantity } = item;
    const displayPrice = salePrice && salePrice < price ? salePrice : price;

    return (
        <div className="px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors border-b last:border-b-0">
            {/* Image */}
            <Link to={`/product/${id}`} className="flex-shrink-0">
                <img
                    src={thumbnail || 'https://placehold.co/60x60/f3f4f6/9ca3af?text=No+Image'}
                    alt={name}
                    className="w-14 h-14 object-cover rounded-lg"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/60x60/f3f4f6/9ca3af?text=No+Image';
                    }}
                />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link
                    to={`/product/${id}`}
                    className="text-sm font-medium text-gray-800 hover:text-rose-500 transition-colors line-clamp-1"
                >
                    {name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">SL: {quantity}</span>
                    <span className="text-sm font-semibold text-rose-600">{formatPrice(displayPrice)}</span>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Xóa sản phẩm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default CartIcon;
