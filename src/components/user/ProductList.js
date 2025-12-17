import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { SkeletonCard } from '../common/Loading';

const ProductList = ({
    products,
    loading = false,
    onAddToCart,
    onToggleFavorite,
    favorites = [],
    emptyMessage = 'Không có sản phẩm nào'
}) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-white rounded-xl shadow-soft animate-pulse">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🌻</div>
                <p className="text-gray-500 text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-soft hover:shadow-card-hover transition-all duration-300"
                >
                    {/* Image */}
                    <Link
                        to={`/product/${product.id}`}
                        className="w-full sm:w-40 h-40 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <img
                            src={product.thumbnail || '/assets/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <Link
                                to={`/product/${product.id}`}
                                className="text-lg font-medium text-gray-800 hover:text-pink-600 transition-colors line-clamp-2"
                            >
                                {product.name}
                            </Link>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                {product.description || 'Bó hoa tươi đẹp, thiết kế tinh tế, giao hàng tận nơi.'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                                {product.salePrice && product.salePrice < product.price ? (
                                    <>
                                        <span className="text-gray-400 line-through text-sm">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </span>
                                        <span className="text-rose-600 font-bold text-lg">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-rose-600 font-bold text-lg">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                )}
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={() => onAddToCart?.(product)}
                                className="btn-primary text-sm py-2 px-4"
                            >
                                Thêm giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
