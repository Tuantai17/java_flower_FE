import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductTable from '../../../components/admin/product/ProductTable';
import Pagination from '../../../components/common/Pagination';
import { ConfirmModal } from '../../../components/common/Modal';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import { StockAdjustModal } from '../../../components/admin/stock';
import productApi from '../../../api/productApi';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    const [adjustModal, setAdjustModal] = useState({ isOpen: false, product: null });
    const { toasts, notify, removeToast } = useNotification();

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching products with page:', pagination.page);
            const response = await productApi.getPaginated(pagination.page, pagination.size);

            console.log('✅ Products API response:', response);

            // Handle different response formats
            let productsData = [];
            let totalPages = 1;
            let totalElements = 0;

            if (response && response.content && Array.isArray(response.content)) {
                // Spring Boot Page format
                productsData = response.content;
                totalPages = response.totalPages || 1;
                totalElements = response.totalElements || productsData.length;
            } else if (Array.isArray(response)) {
                // Direct array response
                productsData = response;
                totalElements = productsData.length;
            } else if (response && response.data && Array.isArray(response.data)) {
                // Wrapped response
                productsData = response.data;
                totalPages = response.totalPages || 1;
                totalElements = response.totalElements || productsData.length;
            } else if (response && response.products && Array.isArray(response.products)) {
                // Products nested in object
                productsData = response.products;
                totalPages = response.totalPages || 1;
                totalElements = response.totalElements || productsData.length;
            }

            console.log('📦 Parsed products:', productsData);

            setProducts(productsData);
            setPagination(prev => ({
                ...prev,
                totalPages: totalPages,
                totalElements: totalElements,
            }));
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            const errorMessage = error.response?.data?.message
                || error.response?.statusText
                || error.message
                || 'Không thể tải sản phẩm. Vui lòng kiểm tra kết nối backend.';
            setError(errorMessage);
            setProducts([]);
            setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await productApi.delete(id);

            // Both hard delete and soft delete success - remove from list
            setProducts(products.filter((p) => p.id !== id));

            // Update pagination count
            setPagination(prev => ({
                ...prev,
                totalElements: prev.totalElements - 1,
                totalPages: Math.ceil((prev.totalElements - 1) / prev.size)
            }));

            if (result?.softDeleted) {
                // Soft delete was used
                notify.warning(
                    'Sản phẩm đang được sử dụng trong đơn hàng/giỏ hàng nên đã được ẩn thay vì xóa hoàn toàn.',
                    'Đã ẩn sản phẩm'
                );
            } else {
                // Hard delete successful
                notify.success('Đã xóa sản phẩm thành công!', 'Thành công');
            }
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
            notify.error(errorMessage, 'Lỗi xóa sản phẩm');
        } finally {
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    const handleToggleStatus = async (id) => {
        // Optimistic update first for better UX
        const originalProducts = [...products];
        setProducts(products.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
        ));

        try {
            await productApi.toggleStatus(id);
            console.log('✅ Product status toggled successfully');
        } catch (error) {
            console.error('❌ Error toggling status:', error);
            // Revert on error
            setProducts(originalProducts);
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Không thể thay đổi trạng thái sản phẩm.';
            notify.error(errorMessage, 'Lỗi cập nhật trạng thái');
        }
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, page: page - 1 });
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                        <p className="text-gray-500">Tổng cộng {pagination.totalElements} sản phẩm</p>
                    </div>
                    <Link to="/admin/products/create" className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm sản phẩm
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <option value="">Tất cả danh mục</option>
                            <option value="1">Hoa Sinh Nhật</option>
                            <option value="2">Hoa Khai Trương</option>
                            <option value="3">Lan Hồ Điệp</option>
                        </select>

                        {/* Status Filter */}
                        <select className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Đã ẩn</option>
                        </select>

                        <button className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <FunnelIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Lọc</span>
                        </button>
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
                            onClick={fetchProducts}
                            className="btn-primary"
                        >
                            🔄 Thử lại
                        </button>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <ProductTable
                        products={products}
                        loading={loading}
                        onDelete={(id) => setDeleteModal({ isOpen: true, productId: id })}
                        onToggleStatus={handleToggleStatus}
                        onAdjustStock={(product) => setAdjustModal({ isOpen: true, product })}
                    />
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={pagination.page + 1}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalElements}
                    pageSize={pagination.size}
                    onPageChange={handlePageChange}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                    onConfirm={() => handleDelete(deleteModal.productId)}
                    title="Xóa sản phẩm"
                    message="Bạn có chắc chắn muốn xóa sản phẩm này? Nếu sản phẩm đang được sử dụng trong đơn hàng, sản phẩm sẽ được ẩn thay vì xóa hoàn toàn."
                    confirmText="Xóa"
                    variant="danger"
                />

                {/* Stock Adjust Modal */}
                <StockAdjustModal
                    isOpen={adjustModal.isOpen}
                    onClose={() => setAdjustModal({ isOpen: false, product: null })}
                    product={adjustModal.product}
                    onSuccess={() => {
                        notify.success('Cập nhật tồn kho thành công!', 'Thành công');
                        fetchProducts();
                    }}
                />
            </div>
        </>
    );
};

export default ProductList;
