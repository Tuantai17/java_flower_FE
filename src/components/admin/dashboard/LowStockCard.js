/**
 * LowStockCard Component
 * 
 * Hiển thị cảnh báo sản phẩm sắp hết hàng trong Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
    ExclamationTriangleIcon,
    ArrowRightIcon,
    CubeIcon,
} from '@heroicons/react/24/outline';

const LowStockCard = ({ products, loading = false }) => {
    // Đảm bảo products luôn là mảng
    const productList = Array.isArray(products) ? products : [];

    // Lấy mức độ cảnh báo dựa trên số lượng tồn kho
    const getStockLevel = (quantity, threshold = 10) => {
        if (quantity === 0) {
            return { level: 'out', bg: 'bg-red-100', text: 'text-red-700', label: 'Hết hàng' };
        }
        if (quantity <= threshold / 2) {
            return { level: 'critical', bg: 'bg-orange-100', text: 'text-orange-700', label: 'Nguy hiểm' };
        }
        return { level: 'warning', bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Sắp hết' };
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6 min-h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Sản phẩm sắp hết hàng
                    </h2>
                    {productList.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            {productList.length}
                        </span>
                    )}
                </div>
                <Link
                    to="/admin/stock?filter=low"
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                    Quản lý kho
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Products List */}
            {productList.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <CubeIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-gray-500">Tất cả sản phẩm đều còn hàng</p>
                    <p className="text-sm text-gray-400 mt-1">Kho hàng đang ổn định</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {productList.map((product) => {
                        const stockStatus = getStockLevel(product.stockQuantity, product.threshold);

                        return (
                            <Link
                                key={product.id}
                                to={`/admin/stock?productId=${product.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                {/* Product Image */}
                                <img
                                    src={product.thumbnail || '/placeholder-product.png'}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.png';
                                    }}
                                />

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Tồn kho:</span>
                                        <span className={`font-semibold ${stockStatus.text}`}>
                                            {product.stockQuantity}
                                        </span>
                                    </div>
                                </div>

                                {/* Stock Status Badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.text}`}>
                                    {stockStatus.label}
                                </div>

                                {/* Progress Bar */}
                                <div className="w-16">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${stockStatus.level === 'out' ? 'bg-red-500' :
                                                stockStatus.level === 'critical' ? 'bg-orange-500' :
                                                    'bg-yellow-500'
                                                }`}
                                            style={{ width: `${Math.min((product.stockQuantity / (product.threshold * 2)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LowStockCard;
