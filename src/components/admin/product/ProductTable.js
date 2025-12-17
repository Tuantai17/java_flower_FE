import React from 'react';
import { Link } from 'react-router-dom';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../../utils/formatPrice';

const ProductTable = ({
    products,
    onDelete,
    onToggleStatus,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-100" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 border-b border-gray-100 flex items-center px-6 gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm sản phẩm đầu tiên</p>
                <Link to="/admin/products/create" className="btn-primary">
                    Thêm sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-table overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="w-20">Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th className="text-right">Giá gốc</th>
                        <th className="text-right">Giá sale</th>
                        <th className="text-center">Tồn kho</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-center w-40">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            {/* Image */}
                            <td>
                                <img
                                    src={product.thumbnail || '/assets/images/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            </td>

                            {/* Name & Slug */}
                            <td>
                                <div>
                                    <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-gray-400">/{product.slug}</p>
                                </div>
                            </td>

                            {/* Category */}
                            <td>
                                <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                                    {product.categoryName || 'Chưa phân loại'}
                                </span>
                            </td>

                            {/* Original Price */}
                            <td className="text-right">
                                <span className="text-gray-600">{formatPrice(product.price)}</span>
                            </td>

                            {/* Sale Price */}
                            <td className="text-right">
                                {product.salePrice ? (
                                    <span className="text-rose-600 font-medium">{formatPrice(product.salePrice)}</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>

                            {/* Stock */}
                            <td className="text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stockQuantity > 10
                                        ? 'bg-green-100 text-green-700'
                                        : product.stockQuantity > 0
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {product.stockQuantity}
                                </span>
                            </td>

                            {/* Status */}
                            <td className="text-center">
                                <button
                                    onClick={() => onToggleStatus?.(product.id)}
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${product.active
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {product.active ? (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Hoạt động
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="h-4 w-4" />
                                            Ẩn
                                        </>
                                    )}
                                </button>
                            </td>

                            {/* Actions */}
                            <td>
                                <div className="flex items-center justify-center gap-2">
                                    <Link
                                        to={`/product/${product.id}`}
                                        target="_blank"
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Xem"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to={`/admin/products/edit/${product.id}`}
                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Sửa"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => onDelete?.(product.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
