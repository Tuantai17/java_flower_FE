import React from 'react';
import {
    PencilSquareIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArchiveBoxIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Bảng hiển thị sản phẩm với thông tin tồn kho
 */
const StockTable = ({
    products = [],
    loading = false,
    onAdjust,     // (product) => void - Mở modal điều chỉnh
    onViewHistory // (product) => void - Mở modal lịch sử
}) => {
    // Format giá tiền
    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Xác định trạng thái tồn kho
    const getStockStatus = (quantity) => {
        if (quantity <= 0) {
            return { label: 'Hết hàng', color: 'bg-red-100 text-red-700', icon: '🔴' };
        }
        if (quantity <= 10) {
            return { label: 'Sắp hết', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' };
        }
        if (quantity <= 50) {
            return { label: 'Còn ít', color: 'bg-orange-100 text-orange-700', icon: '🟠' };
        }
        return { label: 'Còn nhiều', color: 'bg-green-100 text-green-700', icon: '🟢' };
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded" />
                            <div className="h-8 w-24 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <ArchiveBoxIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Không có sản phẩm</h3>
                <p className="text-gray-500">Chưa có sản phẩm nào để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Sản phẩm
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Danh mục
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Giá bán
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Tồn kho
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => {
                            const stockStatus = getStockStatus(product.stockQuantity);
                            const isLowStock = product.stockQuantity <= 10;

                            return (
                                <tr
                                    key={product.id}
                                    className={`hover:bg-gray-50 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}
                                >
                                    {/* Product Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {product.thumbnail ? (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    className="w-14 h-14 object-cover rounded-lg shadow-sm border border-gray-100"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/56?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <ArchiveBoxIcon className="w-7 h-7 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">
                                                    {product.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    SKU: {product.sku || product.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {product.categoryName || product.category?.name || '-'}
                                        </span>
                                    </td>

                                    {/* Price */}
                                    <td className="px-6 py-4 text-right">
                                        {product.salePrice && product.salePrice < product.price ? (
                                            <div>
                                                <span className="text-pink-600 font-semibold">
                                                    {formatPrice(product.salePrice)}
                                                </span>
                                                <span className="block text-xs text-gray-400 line-through">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-semibold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </td>

                                    {/* Stock Quantity */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {isLowStock && (
                                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                                            )}
                                            <span className={`text-xl font-bold ${product.stockQuantity <= 0
                                                    ? 'text-red-600'
                                                    : isLowStock
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-900'
                                                }`}>
                                                {product.stockQuantity}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                            <span>{stockStatus.icon}</span>
                                            {stockStatus.label}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Adjust Stock Button */}
                                            <button
                                                onClick={() => onAdjust?.(product)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                                                title="Điều chỉnh kho"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                                Cập nhật
                                            </button>

                                            {/* View History Button */}
                                            <button
                                                onClick={() => onViewHistory?.(product)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Xem lịch sử"
                                            >
                                                <ClockIcon className="w-4 h-4" />
                                                Lịch sử
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;
