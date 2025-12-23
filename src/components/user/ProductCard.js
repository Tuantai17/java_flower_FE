import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import { useApp } from '../../context/AppContext';

/**
 * ProductCard Component
 * 
 * Hiển thị thông tin sản phẩm dạng card với các action:
 * - Thêm vào giỏ hàng
 * - Thêm vào yêu thích
 * - Xem chi tiết
 */
const ProductCard = ({
    product,
    showQuickView = true
}) => {
    const { addToCart, toggleFavorite, isFavorite, showNotification } = useApp();

    const {
        id,
        name,
        price,
        salePrice,
        thumbnail,
        stockQuantity
    } = product;

    // Xử lý thumbnail thông qua utility
    const validThumbnail = getImageUrl(thumbnail);

    const discount = salePrice && price > salePrice
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const isOutOfStock = stockQuantity === 0;
    const productIsFavorite = isFavorite(id);

    // Handle add to cart
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        addToCart(product, 1);
        showNotification({
            type: 'success',
            message: `Đã thêm "${name}" vào giỏ hàng!`,
        });
    };

    // Handle toggle favorite
    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleFavorite(product);
        showNotification({
            type: productIsFavorite ? 'info' : 'success',
            message: productIsFavorite
                ? `Đã xóa "${name}" khỏi yêu thích`
                : `Đã thêm "${name}" vào yêu thích!`,
        });
    };

    return (
        <div className="card-product group">
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-square">
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

                {/* Badges */}
                {discount > 0 && (
                    <span className="badge-sale">
                        -{discount}%
                    </span>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Hết hàng</span>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-center gap-2">
                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-pink-500 hover:text-white text-gray-800 font-medium py-3 px-4 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Thêm giỏ</span>
                        </button>

                        {/* Favorite */}
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${productIsFavorite
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-pink-500 hover:text-white'
                                }`}
                        >
                            {productIsFavorite ? (
                                <HeartSolidIcon className="h-5 w-5" />
                            ) : (
                                <HeartIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Quick View */}
                        {showQuickView && (
                            <Link
                                to={`/product/${id}`}
                                className="p-3 bg-white text-gray-600 hover:bg-pink-500 hover:text-white rounded-full shadow-lg transition-all duration-300"
                            >
                                <EyeIcon className="h-5 w-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <Link
                    to={`/product/${id}`}
                    className="block text-gray-800 font-medium hover:text-pink-600 transition-colors line-clamp-2 min-h-[48px]"
                >
                    {name}
                </Link>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {salePrice && salePrice < price ? (
                        <>
                            <span className="price-original">{formatPrice(price)}</span>
                            <span className="price-sale">{formatPrice(salePrice)}</span>
                        </>
                    ) : (
                        <span className="text-rose-600 font-bold text-lg">{formatPrice(price)}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
