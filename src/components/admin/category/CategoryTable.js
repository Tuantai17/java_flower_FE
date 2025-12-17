import React from 'react';
import { Link } from 'react-router-dom';
import {
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

const CategoryTable = ({
    categories,
    onDelete,
    onToggleStatus,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-100" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 border-b border-gray-100 flex items-center px-6 gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <div className="text-5xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có danh mục nào</h3>
                <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm danh mục đầu tiên</p>
                <Link to="/admin/categories/create" className="btn-primary">
                    Thêm danh mục
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-table overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="w-16">Ảnh</th>
                        <th>Tên danh mục</th>
                        <th>Slug</th>
                        <th>Danh mục cha</th>
                        <th className="text-center">Thứ tự</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-center w-32">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                            {/* Image */}
                            <td>
                                {category.imageUrl ? (
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <FolderIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                            </td>

                            {/* Name */}
                            <td>
                                <span className="font-medium text-gray-800">{category.name}</span>
                            </td>

                            {/* Slug */}
                            <td>
                                <span className="text-gray-500 text-sm">/{category.slug}</span>
                            </td>

                            {/* Parent */}
                            <td>
                                {category.parentName ? (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        {category.parentName}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                )}
                            </td>

                            {/* Sort Order */}
                            <td className="text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                                    {category.sortOrder || 0}
                                </span>
                            </td>

                            {/* Status */}
                            <td className="text-center">
                                <button
                                    onClick={() => onToggleStatus?.(category.id)}
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${category.active
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.active ? (
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
                                        to={`/admin/categories/edit/${category.id}`}
                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Sửa"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => onDelete?.(category.id)}
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

export default CategoryTable;
