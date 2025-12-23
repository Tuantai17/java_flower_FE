import React, { useState, useEffect, useCallback } from 'react';
import { StockTable, StockAdjustModal, StockHistoryModal } from '../../../components/admin/stock';
import Pagination from '../../../components/common/Pagination';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import productApi from '../../../api/productApi';
import stockApi from '../../../api/stockApi';
import {
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ChartBarIcon,
    CubeIcon
} from '@heroicons/react/24/outline';

/**
 * Trang quản lý tồn kho cho Admin
 * Hiển thị danh sách sản phẩm với thông tin tồn kho
 * Cho phép điều chỉnh và xem lịch sử biến động
 */
const StockList = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out', 'available'
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    // Modal states
    const [adjustModal, setAdjustModal] = useState({ isOpen: false, product: null });
    const [historyModal, setHistoryModal] = useState({ isOpen: false, product: null });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        lowStock: 0,
        outOfStock: 0
    });

    // Notification
    const { toasts, notify, removeToast } = useNotification();

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching products for stock management...');
            const response = await productApi.getPaginated(pagination.page, pagination.size);

            let productsData = [];
            let totalPages = 1;
            let totalElements = 0;

            // Handle different response formats
            if (response?.content && Array.isArray(response.content)) {
                productsData = response.content;
                totalPages = response.totalPages || 1;
                totalElements = response.totalElements || productsData.length;
            } else if (Array.isArray(response)) {
                productsData = response;
                totalElements = productsData.length;
                totalPages = Math.ceil(totalElements / pagination.size);
            }

            // Filter products based on search and stock filter
            let filteredProducts = productsData;

            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filteredProducts = filteredProducts.filter(p =>
                    p.name?.toLowerCase().includes(query) ||
                    p.sku?.toLowerCase().includes(query) ||
                    String(p.id).includes(query)
                );
            }

            // Stock status filter
            switch (stockFilter) {
                case 'low':
                    filteredProducts = filteredProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10);
                    break;
                case 'out':
                    filteredProducts = filteredProducts.filter(p => p.stockQuantity <= 0);
                    break;
                case 'available':
                    filteredProducts = filteredProducts.filter(p => p.stockQuantity > 10);
                    break;
                default:
                    break;
            }

            // Calculate stats from all products (before filtering)
            const newStats = {
                total: productsData.length,
                available: productsData.filter(p => p.stockQuantity > 10).length,
                lowStock: productsData.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length,
                outOfStock: productsData.filter(p => p.stockQuantity <= 0).length
            };
            setStats(newStats);

            setProducts(filteredProducts);
            setPagination(prev => ({
                ...prev,
                totalPages: Math.ceil(filteredProducts.length / prev.size) || totalPages,
                totalElements: filteredProducts.length || totalElements
            }));

            console.log('✅ Loaded products for stock:', filteredProducts.length);
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối backend.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size, searchQuery, stockFilter]);

    // Initial load and filter changes
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handlers
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
    };

    const handleOpenAdjustModal = (product) => {
        setAdjustModal({ isOpen: true, product });
    };

    const handleOpenHistoryModal = (product) => {
        setHistoryModal({ isOpen: true, product });
    };

    const handleAdjustSuccess = () => {
        notify.success('Cập nhật tồn kho thành công!', 'Thành công');
        fetchProducts(); // Refresh data
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
    };

    const handleFilterChange = (filter) => {
        setStockFilter(filter);
        setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <ArchiveBoxIcon className="w-8 h-8 text-pink-500" />
                            Quản lý tồn kho
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Theo dõi và điều chỉnh số lượng tồn kho của các sản phẩm
                        </p>
                    </div>
                    <button
                        onClick={fetchProducts}
                        className="btn-secondary flex items-center gap-2"
                        disabled={loading}
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Products */}
                    <div
                        className={`stat-card cursor-pointer transition-all ${stockFilter === 'all' ? 'ring-2 ring-pink-500' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                                <CubeIcon className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng sản phẩm</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Available Stock */}
                    <div
                        className={`stat-card cursor-pointer transition-all ${stockFilter === 'available' ? 'ring-2 ring-green-500' : ''}`}
                        onClick={() => handleFilterChange('available')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                <ChartBarIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Còn nhiều (&gt;10)</p>
                                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div
                        className={`stat-card cursor-pointer transition-all ${stockFilter === 'low' ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => handleFilterChange('low')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sắp hết (≤10)</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                            </div>
                        </div>
                    </div>

                    {/* Out of Stock */}
                    <div
                        className={`stat-card cursor-pointer transition-all ${stockFilter === 'out' ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => handleFilterChange('out')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl">
                                <ArchiveBoxIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hết hàng</p>
                                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, SKU, ID..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Stock Status Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="available">Còn nhiều (&gt;10)</option>
                            <option value="low">Sắp hết (≤10)</option>
                            <option value="out">Hết hàng (0)</option>
                        </select>

                        {/* Clear Filters */}
                        {(searchQuery || stockFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStockFilter('all');
                                }}
                                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                            >
                                <FunnelIcon className="h-5 w-5" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-red-700 mb-2">Lỗi kết nối API</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Vui lòng kiểm tra backend đang chạy tại{' '}
                            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
                        </p>
                        <button onClick={fetchProducts} className="btn-primary">
                            🔄 Thử lại
                        </button>
                    </div>
                )}

                {/* Stock Table */}
                {!error && (
                    <StockTable
                        products={products}
                        loading={loading}
                        onAdjust={handleOpenAdjustModal}
                        onViewHistory={handleOpenHistoryModal}
                    />
                )}

                {/* Pagination */}
                {!error && products.length > 0 && (
                    <Pagination
                        currentPage={pagination.page + 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalElements}
                        pageSize={pagination.size}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Adjust Stock Modal */}
                <StockAdjustModal
                    isOpen={adjustModal.isOpen}
                    onClose={() => setAdjustModal({ isOpen: false, product: null })}
                    product={adjustModal.product}
                    onSuccess={handleAdjustSuccess}
                />

                {/* Stock History Modal */}
                <StockHistoryModal
                    isOpen={historyModal.isOpen}
                    onClose={() => setHistoryModal({ isOpen: false, product: null })}
                    product={historyModal.product}
                />
            </div>
        </>
    );
};

export default StockList;
