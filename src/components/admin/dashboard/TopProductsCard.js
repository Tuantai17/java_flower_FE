/**
 * TopProductsCard Component
 * 
 * Hiển thị danh sách sản phẩm bán chạy nhất trong Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRightIcon,
    FireIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';

const TopProductsCard = ({ products, loading = false }) => {
    // Đảm bảo products luôn là mảng
    const productList = Array.isArray(products) ? products : [];

    // Format giá tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                            <div className="w-14 h-14 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FireIcon className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Sản phẩm bán chạy nhất
                    </h2>
                </div>
                <Link
                    to="/admin/products?sort=sold"
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                    Xem tất cả
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Products List - Horizontal Grid */}
            {productList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <FireIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Chưa có dữ liệu bán hàng</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {productList.map((product, index) => (
                        <div
                            key={product.id}
                            className="relative flex flex-col p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                            {/* Ranking Badge */}
                            <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10
                                ${index === 0 ? 'bg-yellow-400 text-white shadow-lg' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                            'bg-gray-300 text-gray-600'}`}
                            >
                                #{index + 1}
                            </div>

                            {/* Product Image */}
                            <img
                                src={product.thumbnail || '/placeholder-product.png'}
                                alt={product.name}
                                className="w-full h-28 rounded-lg object-cover mb-3"
                                onError={(e) => {
                                    e.target.src = '/placeholder-product.png';
                                }}
                            />

                            {/* Product Info */}
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 text-sm line-clamp-2 mb-2" title={product.name}>
                                    {product.name}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {product.salePrice && product.salePrice < product.price ? (
                                        <>
                                            <span className="text-pink-600 font-semibold text-sm">
                                                {formatCurrency(product.salePrice)}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-pink-600 font-semibold text-sm">
                                            {formatCurrency(product.price)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Sold Count */}
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Đã bán</span>
                                <span className="text-sm font-bold text-green-600">
                                    {product.totalSold?.toLocaleString('vi-VN') || product.soldQuantity || 0}
                                </span>
                            </div>

                            {/* Edit Button */}
                            <Link
                                to={`/admin/products/edit/${product.id}`}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white text-gray-400 hover:text-pink-600 hover:bg-pink-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                title="Chỉnh sửa"
                            >
                                <PencilSquareIcon className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopProductsCard;
