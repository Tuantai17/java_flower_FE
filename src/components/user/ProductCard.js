import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUrl';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../common/LoginRequiredModal';

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
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const {
        id,
        name,
        price,
        salePrice,
        thumbnail,
        stockQuantity,
        soldCount,
        _links // HATEOAS links từ backend
    } = product;

    // Xử lý thumbnail thông qua utility
    const validThumbnail = getImageUrl(thumbnail);

    const discount = salePrice && price > salePrice
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const isOutOfStock = stockQuantity === 0;
    const productIsFavorite = isFavorite(id);

    // Lấy URL chi tiết sản phẩm
    const getProductDetailUrl = () => {
        if (_links?.self?.href) {
            const hateoasUrl = _links.self.href;
            const matches = hateoasUrl.match(/\/products\/(\d+)/);
            if (matches && matches[1]) {
                return `/product/${matches[1]}`;
            }
        }
        return `/product/${id}`;
    };

    const navigateToDetail = () => {
        navigate(getProductDetailUrl());
    };

    // Helper to get action links
    const getHateoasAction = (actionName) => {
        if (_links && _links[actionName]?.href) {
            return _links[actionName].href;
        }
        return null;
    };

    // Handle add to cart
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

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

    // Handle toggle favorite
    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            showNotification({
                type: 'warning',
                message: 'Vui lòng đăng nhập để thêm vào danh sách yêu thích',
                duration: 3000,
            });
            return;
        }

        toggleFavorite(product);
        showNotification({
            type: productIsFavorite ? 'info' : 'success',
            message: productIsFavorite
                ? `Đã xóa "${name}" khỏi yêu thích`
                : `Đã thêm "${name}" vào yêu thích!`,
        });
    };

    const productDetailUrl = getProductDetailUrl();

    return (
        <div className="card-product group flex flex-col h-full">
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-square">
                <Link to={productDetailUrl}>
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

                {/* Sale Tag */}
                {discount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
                        -{discount}%
                    </span>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Hết hàng</span>
                    </div>
                )}

                {/* Quick Actions (Hover) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-pink-500 hover:text-white text-gray-800 font-medium py-3 px-4 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Thêm vào giỏ hàng"
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${productIsFavorite
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-pink-500 hover:text-white'
                                }`}
                            title={productIsFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                        >
                            {productIsFavorite ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                        </button>
                        {showQuickView && (
                            <button
                                onClick={navigateToDetail}
                                className="p-3 bg-white text-gray-600 hover:bg-pink-500 hover:text-white rounded-full shadow-lg transition-all duration-300"
                                title="Xem chi tiết"
                            >
                                <EyeIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Info - Flex column to push rating to bottom */}
            <div className="p-4 flex flex-col flex-1">
                {/* Name */}
                <Link
                    to={productDetailUrl}
                    className="block text-gray-800 font-medium hover:text-pink-600 transition-colors line-clamp-2 min-h-[40px] mb-2"
                    title={name}
                >
                    {name}
                </Link>

                {/* Price Section */}
                <div className="mb-2">
                    {salePrice && salePrice < price ? (
                        <div className="flex flex-col">
                           <span className="text-red-600 font-bold text-lg">
                                {formatPrice(salePrice)}
                            </span>
                            <span className="text-gray-400 text-sm line-through decoration-gray-400">
                                {formatPrice(price)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-red-600 font-bold text-lg">
                            {formatPrice(price)}
                        </span>
                    )}
                </div>

                {/* Spacer to push bottom content down */}
                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                     {/* Rating */}
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-3.5 w-3.5" />
                        ))}
                    </div>

                    {/* Sold Count */}
                    <span className="text-gray-500 text-xs">
                        Đã bán {soldCount || 0}
                    </span>
                </div>
            </div>

            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"
            />
        </div>
    );
};

export default ProductCard;
