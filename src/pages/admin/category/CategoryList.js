import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryTable from '../../../components/admin/category/CategoryTable';
import CategoryTree from '../../../components/admin/category/CategoryTree';
import { ConfirmModal } from '../../../components/common/Modal';
import categoryApi from '../../../api/categoryApi';
import productApi from '../../../api/productApi';
import { getImageUrl } from '../../../utils/imageUrl';
import { formatPrice } from '../../../utils/formatPrice';
import {
    PlusIcon,
    TableCellsIcon,
    ListBulletIcon,
    XMarkIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('tree'); // 'table' or 'tree'
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });
    
    // Preview state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [previewProducts, setPreviewProducts] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    // Helper to get all IDs from a category and its children
    const getCategoryTreeIds = (category) => {
        let ids = [category.id];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                ids = [...ids, ...getCategoryTreeIds(child)];
            });
        }
        return ids;
    };

    const handleSelectCategory = async (category) => {
        if (selectedCategory?.id === category.id) {
            // Deselect if clicking same category
            setSelectedCategory(null);
            setPreviewProducts([]);
            return;
        }

        setSelectedCategory(category);
        setPreviewLoading(true);
        try {
            // Fetch all admin products 
            const allProducts = await productApi.getAdminAll();
            
            // Get all Category IDs (including children)
            const targetIds = getCategoryTreeIds(category);
            const targetIdsSet = new Set(targetIds.map(id => Number(id)));

            // Normalize and filter
            const productsArray = Array.isArray(allProducts) ? allProducts : [];
            const categoryProducts = productsArray.filter(p => {
                const pCatId = p.categoryId ? Number(p.categoryId) : (p.category?.id ? Number(p.category.id) : null);
                return pCatId && targetIdsSet.has(pCatId);
            });

            setPreviewProducts(categoryProducts);
        } catch (error) {
            console.error('Error fetching preview products:', error);
            setPreviewProducts([]);
        } finally {
            setPreviewLoading(false);
        }
    };

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
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex-1 w-full">
                        <CategoryTree
                            categories={categories}
                            onDelete={(id) => setDeleteModal({ isOpen: true, categoryId: id })}
                            onSelect={handleSelectCategory}
                            selectedId={selectedCategory?.id}
                        />
                    </div>

                    {/* Preview Panel */}
                    {selectedCategory && (
                        <div className="w-full lg:w-96 bg-white rounded-xl shadow-soft p-4 border border-gray-100 flex-shrink-0 sticky top-24 transition-all animate-fadeIn">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 line-clamp-1" title={selectedCategory.name}>
                                    {selectedCategory.name} <span className="text-gray-500 font-normal text-sm">({previewProducts.length})</span>
                                </h3>
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {previewLoading ? (
                                    // Loading Skeletons
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : previewProducts.length > 0 ? (
                                    <>
                                        {/* Product List */}
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {previewProducts.map((product) => (
                                                <div key={product.id} className="flex gap-3 group bg-gray-50 p-2 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer">
                                                    <img 
                                                        src={getImageUrl(product.thumbnail)} 
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                                        onError={(e) => e.target.src = 'https://placehold.co/64?text=Flower'}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs font-bold text-rose-600">
                                                                {formatPrice(product.salePrice || product.price)}
                                                            </p>
                                                            {!product.active && (
                                                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Hidden</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* View All Button */}
                                        <Link 
                                            to={`/admin/categories/${selectedCategory.id}/products`}
                                            className="block w-full py-2.5 mt-2 text-center text-sm font-medium text-pink-600 bg-white border border-pink-200 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            Quản lý chi tiết
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Chưa có sản phẩm nào</p>
                                        <Link 
                                            to="/admin/products/create"
                                            className="text-pink-600 text-sm hover:underline mt-2 inline-block"
                                        >
                                            + Thêm sản phẩm
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
