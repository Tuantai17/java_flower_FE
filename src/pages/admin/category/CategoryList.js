import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryTable from '../../../components/admin/category/CategoryTable';
import CategoryTree from '../../../components/admin/category/CategoryTree';
import { ConfirmModal } from '../../../components/common/Modal';
import categoryApi from '../../../api/categoryApi';
import {
    PlusIcon,
    TableCellsIcon,
    ListBulletIcon,
} from '@heroicons/react/24/outline';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'tree'
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching categories with viewMode:', viewMode);
            const response = viewMode === 'tree'
                ? await categoryApi.getMenu()
                : await categoryApi.getAll();

            console.log('✅ Categories API response:', response);

            // Handle different response formats
            let categoriesData = [];
            if (Array.isArray(response)) {
                categoriesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
            } else if (response && response.content && Array.isArray(response.content)) {
                categoriesData = response.content;
            } else if (response && typeof response === 'object') {
                // If response is an object with categories nested
                categoriesData = response.categories || response.items || [];
            }

            console.log('📋 Parsed categories:', categoriesData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            const errorMessage = error.response?.data?.message
                || error.response?.statusText
                || error.message
                || 'Không thể tải danh mục. Vui lòng kiểm tra kết nối backend.';
            setError(errorMessage);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await categoryApi.delete(id);
            setCategories(categories.filter((c) => c.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
        setDeleteModal({ isOpen: false, categoryId: null });
    };

    const handleToggleStatus = async (id) => {
        try {
            await categoryApi.toggleStatus(id);
            setCategories(categories.map((c) =>
                c.id === id ? { ...c, active: !c.active } : c
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
            // Optimistic update
            setCategories(categories.map((c) =>
                c.id === id ? { ...c, active: !c.active } : c
            ));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
                    <p className="text-gray-500">Tổng cộng {categories.length} danh mục</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-soft">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-pink-100 text-pink-600' : 'text-gray-500'
                                }`}
                        >
                            <TableCellsIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'tree' ? 'bg-pink-100 text-pink-600' : 'text-gray-500'
                                }`}
                        >
                            <ListBulletIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <Link to="/admin/categories/create" className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm danh mục
                    </Link>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-red-700 mb-2">Lỗi kết nối API</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Vui lòng kiểm tra backend đang chạy tại <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
                    </p>
                    <button
                        onClick={fetchCategories}
                        className="btn-primary"
                    >
                        🔄 Thử lại
                    </button>
                </div>
            )}

            {/* Content */}
            {!error && viewMode === 'table' ? (
                <CategoryTable
                    categories={categories}
                    loading={loading}
                    onDelete={(id) => setDeleteModal({ isOpen: true, categoryId: id })}
                    onToggleStatus={handleToggleStatus}
                />
            ) : !error && (
                <CategoryTree
                    categories={categories}
                    onDelete={(id) => setDeleteModal({ isOpen: true, categoryId: id })}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
                onConfirm={() => handleDelete(deleteModal.categoryId)}
                title="Xóa danh mục"
                message="Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục sẽ không bị xóa."
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default CategoryList;
