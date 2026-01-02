import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatPrice';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
    TruckIcon, 
    ShieldCheckIcon, 
    ArrowPathIcon,
    CheckBadgeIcon 
} from '@heroicons/react/24/outline';

/**
 * ========================================
 * Product Main Info Component
 * ========================================
 * 
 * Hiển thị thông tin chính của sản phẩm:
 * - Category badge
 * - Tên sản phẩm
 * - Giá (gốc + sale + % giảm)
 * - Rating tổng quan
 * - Mô tả ngắn
 * - Tình trạng kho
 * - Trust badges
 */

const ProductMainInfo = ({ 
    product, 
    reviewStats = { averageRating: 0, totalReviews: 0 } 
}) => {
    if (!product) return null;

    const { 
        name, 
        price, 
        salePrice, 
        description, 
        categoryName, 
        categoryId,
        stockQuantity,
        sku 
    } = product;

    // Tính % giảm giá
    const hasDiscount = salePrice && price > salePrice;
    const discountPercent = hasDiscount 
        ? Math.round(((price - salePrice) / price) * 100) 
        : 0;

    const isInStock = stockQuantity > 0;

    return (
        <div className="space-y-5">
            {/* Category Badge */}
            {categoryName && (
                <Link 
                    to={`/category/${categoryId}`}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 rounded-full text-sm font-medium hover:from-pink-200 hover:to-rose-200 transition-colors"
                >
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    {categoryName}
                </Link>
            )}

            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 leading-tight">
                {name}
            </h1>

            {/* Rating Summary */}
            {reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-5 w-5 ${
                                    star <= Math.round(reviewStats.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">
                        {reviewStats.averageRating?.toFixed(1)} ({reviewStats.totalReviews} đánh giá)
                    </span>
                </div>
            )}

            {/* Price Section */}
            <div className="flex items-baseline flex-wrap gap-3">
                <span className="text-3xl font-bold text-rose-600">
                    {formatPrice(hasDiscount ? salePrice : price)}
                </span>
                
                {hasDiscount && (
                    <>
                        <span className="text-xl text-gray-400 line-through">
                            {formatPrice(price)}
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                            -{discountPercent}%
                        </span>
                    </>
                )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                    {isInStock 
                        ? `Còn ${stockQuantity} sản phẩm` 
                        : 'Hết hàng'
                    }
                </span>
                {sku && (
                    <span className="text-xs text-gray-400 ml-2">
                        SKU: {sku}
                    </span>
                )}
            </div>

            {/* Short Description */}
            {description && (
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                    {description}
                </p>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100">
                <TrustBadge 
                    icon={TruckIcon} 
                    text="Giao hàng nhanh 2h" 
                />
                <TrustBadge 
                    icon={ShieldCheckIcon} 
                    text="Đảm bảo chất lượng" 
                />
                <TrustBadge 
                    icon={ArrowPathIcon} 
                    text="Đổi trả miễn phí" 
                />
            </div>
        </div>
    );
};

/**
 * Trust Badge Item
 */
const TrustBadge = ({ icon: Icon, text }) => (
    <div className="text-center group">
        <div className="w-12 h-12 mx-auto mb-2 bg-pink-50 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors">
            <Icon className="h-6 w-6 text-pink-500" />
        </div>
        <p className="text-xs text-gray-600 leading-tight">{text}</p>
    </div>
);

export default ProductMainInfo;
