import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    TrashIcon, 
    ShoppingBagIcon,
    HeartIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../common/LoginRequiredModal';

/**
 * WishlistItem Component
 * 
 * Hiển thị thông tin sản phẩm trong danh sách yêu thích
 * 
 * Props:
 * - product: Thông tin sản phẩm
 * - onRemove: Callback khi xóa sản phẩm khỏi yêu thích
 */
const WishlistItem = ({ product, onRemove }) => {
    const { addToCart, showNotification } = useApp();
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const { 
        id, 
        name, 
        price, 
        salePrice, 
        thumbnail, 
        stockQuantity 
    } = product;

    const validThumbnail = getImageUrl(thumbnail);
    const isOutOfStock = stockQuantity === 0;
    const discount = salePrice && price > salePrice 
        ? Math.round(((price - salePrice) / price) * 100) 
        : 0;

    /**
     * Xử lý thêm vào giỏ hàng
     */
    const handleAddToCart = () => {
        if (isOutOfStock) return;

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        addToCart(product, 1);
        showNotification({
            type: 'success',
            message: `Đã thêm "${name}" vào giỏ hàng!`,
        });
    };

    /**
     * Xử lý xóa khỏi yêu thích với animation
     */
    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(id);
        }, 300);
    };

    return (
        <div 
            className={`
                bg-white rounded-xl shadow-sm hover:shadow-md 
                transition-all duration-300 overflow-hidden
                ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden group">
                <Link to={`/product/${id}`}>
                    <img
                        src={validThumbnail}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';
                        }}
                    />
                </Link>

                {/* Sale Badge */}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        -{discount}%
                    </span>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Hết hàng</span>
                    </div>
                )}

                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-rose-500 text-gray-600 hover:text-white rounded-full shadow-lg transition-all duration-300"
                    title="Xóa khỏi yêu thích"
                >
                    <HeartSolidIcon className="h-5 w-5 text-rose-500 group-hover:text-white" />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <Link 
                    to={`/product/${id}`}
                    className="block text-gray-800 font-medium hover:text-rose-500 transition-colors line-clamp-2 min-h-[48px]"
                >
                    {name}
                </Link>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {salePrice && salePrice < price ? (
                        <>
                            <span className="text-gray-400 line-through text-sm">
                                {formatPrice(price)}
                            </span>
                            <span className="text-rose-600 font-bold text-lg">
                                {formatPrice(salePrice)}
                            </span>
                        </>
                    ) : (
                        <span className="text-rose-600 font-bold text-lg">
                            {formatPrice(price)}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {stockQuantity !== undefined && stockQuantity > 0 && stockQuantity < 5 && (
                    <p className="mt-2 text-xs text-orange-500">
                        Chỉ còn {stockQuantity} sản phẩm
                    </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`
                            flex-1 flex items-center justify-center gap-2 
                            py-3 px-4 rounded-lg font-medium
                            transition-all duration-300
                            ${isOutOfStock 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                            }
                        `}
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        <span>{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
                    </button>

                    {/* Remove Button */}
                    <button
                        onClick={handleRemove}
                        className="p-3 border border-gray-200 text-gray-500 hover:border-rose-500 hover:text-rose-500 rounded-lg transition-all duration-300"
                        title="Xóa khỏi yêu thích"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Login Required Modal */}
            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"
            />
        </div>
    );
};

export default WishlistItem;
