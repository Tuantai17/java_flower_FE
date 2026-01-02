import React, { useState } from 'react';
import { 
    MinusIcon, 
    PlusIcon, 
    ShoppingBagIcon,
    HeartIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

/**
 * ========================================
 * Product Purchase Actions Component
 * ========================================
 * 
 * Xử lý các hành động mua hàng:
 * - Chọn số lượng (+/-)
 * - Nút thêm vào giỏ hàng
 * - Nút yêu thích
 */

const ProductPurchaseActions = ({ 
    product, 
    onAddToCart, 
    onToggleFavorite, 
    isFavorite = false 
}) => {
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const { stockQuantity = 0 } = product;
    const isInStock = stockQuantity > 0;
    const maxQuantity = Math.min(stockQuantity, 99);

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (isInStock && onAddToCart) {
            onAddToCart(product, quantity);
            // Reset quantity after adding
            setQuantity(1);
        }
    };

    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(product);
        }
    };

    return (
        <div className="space-y-4">
            {/* Quantity Selector & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                    <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-50 rounded-l-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Giảm số lượng"
                    >
                        <MinusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    <span className="w-14 text-center font-semibold text-lg text-gray-800">
                        {quantity}
                    </span>
                    
                    <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= maxQuantity}
                        className="p-3 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Tăng số lượng"
                    >
                        <PlusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className={`
                        flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full 
                        font-semibold text-white transition-all duration-300 shadow-lg
                        ${isInStock 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-pink-500/25 active:scale-[0.98]' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }
                    `}
                >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {isInStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className={`
                        p-3.5 rounded-full border-2 transition-all duration-300 shadow-sm
                        ${isFavorite 
                            ? 'bg-pink-500 border-pink-500 text-white hover:bg-pink-600' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-pink-400 hover:text-pink-500'
                        }
                    `}
                    aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                    {isFavorite ? (
                        <HeartSolidIcon className="h-6 w-6" />
                    ) : (
                        <HeartIcon className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Stock Warning */}
            {isInStock && stockQuantity <= 5 && (
                <p className="text-sm text-amber-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Chỉ còn {stockQuantity} sản phẩm - Đặt hàng ngay!
                </p>
            )}
        </div>
    );
};

export default ProductPurchaseActions;
