import React, { useState } from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from './LoginRequiredModal';

/**
 * AddToCartButton Component
 * 
 * Nút thêm sản phẩm vào giỏ hàng với nhiều style khác nhau
 * 
 * @param {object} product - Thông tin sản phẩm
 * @param {number} quantity - Số lượng thêm vào (mặc định 1)
 * @param {'primary' | 'secondary' | 'outline' | 'icon'} variant - Style của button
 * @param {string} className - Custom class name
 * @param {boolean} showIcon - Hiển thị icon hay không
 * @param {string} text - Text hiển thị
 * @param {boolean} disabled - Disable button
 * @param {function} onSuccess - Callback khi thêm thành công
 */
const AddToCartButton = ({
    product,
    quantity = 1,
    variant = 'primary',
    className = '',
    showIcon = true,
    text = 'Thêm vào giỏ',
    disabled = false,
    onSuccess,
}) => {
    const { addToCart, showNotification } = useApp();
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const isOutOfStock = product?.stockQuantity === 0;
    const isDisabled = disabled || isOutOfStock;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDisabled || !product) return;

        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        addToCart(product, quantity);

        // Show success notification
        showNotification({
            type: 'success',
            message: `Đã thêm "${product.name}" vào giỏ hàng!`,
        });

        // Callback
        onSuccess?.();
    };

    // Base styles
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant styles
    const variantStyles = {
        primary: "px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl",
        secondary: "px-6 py-3 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200",
        outline: "px-6 py-3 border-2 border-rose-500 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white",
        icon: "p-3 bg-white text-gray-600 hover:bg-rose-500 hover:text-white rounded-full shadow-md hover:shadow-lg",
        minimal: "px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg",
    };

    const buttonText = isOutOfStock ? 'Hết hàng' : text;

    return (
        <>
            <button
                onClick={handleAddToCart}
                disabled={isDisabled}
                className={`${baseStyles} ${variantStyles[variant]} ${className}`}
                title={isOutOfStock ? 'Sản phẩm đã hết hàng' : `Thêm ${product?.name || 'sản phẩm'} vào giỏ`}
            >
                {showIcon && <ShoppingBagIcon className="h-5 w-5" />}
                {variant !== 'icon' && <span>{buttonText}</span>}
            </button>

            {/* Login Required Modal */}
            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"
            />
        </>
    );
};

export default AddToCartButton;
