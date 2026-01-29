import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import ProductFilter from '../../components/user/ProductFilter';
import ProductGrid from '../../components/user/ProductGrid';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import productApi from '../../api/productApi';
import { useApp } from '../../context/AppContext';
import { Squares2X2Icon, ListBulletIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * ShopPage - Trang cửa hàng chính
 * 
 * Tính năng:
 * - Tìm kiếm sản phẩm theo từ khóa
 * - Lọc theo danh mục, khoảng giá
 * - Sắp xếp theo nhiều tiêu chí
 * - Hỗ trợ phân trang
 * - Đồng bộ URL params với trạng thái filter
 */
const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 0,
        size: 6,
        totalPages: 0,
        totalElements: 0,
    });

    const { addToCart, toggleFavorite, state, showNotification } = useApp();

    // Filter state - lấy từ URL params hoặc sử dụng giá trị mặc định
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || searchParams.get('q') || '',
        categoryId: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'newest',
    });

    // Load products khi filters hoặc page thay đổi
    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page]);

    // Đồng bộ URL params khi location thay đổi
    useEffect(() => {
        const keyword = searchParams.get('keyword') || searchParams.get('q') || '';
        const categoryId = searchParams.get('category') || '';

        if (keyword !== filters.keyword || categoryId !== filters.categoryId) {
            setFilters(prev => ({
                ...prev,
                keyword,
                categoryId
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    /**
     * Fetch products từ API với các filter hiện tại
     */
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Sử dụng searchProducts API mới với tất cả các filter
            const response = await productApi.searchProducts({
                keyword: filters.keyword,
                priceFrom: filters.minPrice,
                priceTo: filters.maxPrice,
                categoryId: filters.categoryId,
                sortBy: filters.sortBy,
                page: pagination.page,
                size: pagination.size
            });

            // Xử lý response
            const productsData = response.content || response || [];
            setProducts(productsData);

            setPagination(prev => ({
                ...prev,
                totalPages: response.totalPages || 1,
                totalElements: response.totalElements || productsData.length,
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
            showNotification({
                type: 'error',
                message: 'Không thể tải sản phẩm. Vui lòng thử lại sau.',
            });
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.size, showNotification]);

    /**
     * Xử lý thay đổi filter
     */
    const handleFilterChange = (newFilters) => {
        // Cập nhật state filters
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        // Reset về trang đầu khi filter thay đổi
        setPagination(prev => ({ ...prev, page: 0 }));

        // Cập nhật URL params
        updateURLParams(updatedFilters);
    };

    /**
     * Xử lý tìm kiếm từ SearchBar
     */
    const handleSearch = (keyword) => {
        handleFilterChange({ keyword });
    };

    /**
     * Cập nhật URL params dựa trên filters
     */
    const updateURLParams = (currentFilters) => {
        const params = new URLSearchParams();

        if (currentFilters.keyword) {
            params.set('keyword', currentFilters.keyword);
        }
        if (currentFilters.categoryId) {
            params.set('category', currentFilters.categoryId);
        }
        if (currentFilters.minPrice) {
            params.set('minPrice', currentFilters.minPrice);
        }
        if (currentFilters.maxPrice) {
            params.set('maxPrice', currentFilters.maxPrice);
        }
        if (currentFilters.sortBy && currentFilters.sortBy !== 'newest') {
            params.set('sortBy', currentFilters.sortBy);
        }

        setSearchParams(params);
    };

    /**
     * Xử lý chuyển trang
     */
    /**
     * Xử lý chuyển trang
     */
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Xử lý thay đổi số lượng hiển thị mỗi trang
     */
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ 
            ...prev, 
            size: Number(newSize),
            page: 0 // Reset về trang đầu
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Xóa tất cả filter
     */
    const handleClearFilters = () => {
        const clearedFilters = {
            keyword: '',
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest',
        };
        setFilters(clearedFilters);
        setPagination(prev => ({ ...prev, page: 0 }));
        setSearchParams(new URLSearchParams());
    };

    // Kiểm tra xem có filter nào đang active không
    const hasActiveFilters = filters.keyword || filters.categoryId ||
        filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest';

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Cửa hàng', path: '/shop' }]} />
                </div>
            </div>

            {/* Page Header với Search */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
                <div className="container-custom text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                        Cửa Hàng Hoa Tươi
                    </h1>
                    <p className="text-pink-100 mb-6">
                        Khám phá bộ sưu tập hoa tươi đẹp nhất
                    </p>

                    {/* Search Bar in Header */}
                    <div className="max-w-xl mx-auto">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Tìm kiếm hoa tươi, quà tặng..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-gray-600 text-sm">Đang lọc:</span>

                        {filters.keyword && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                "{filters.keyword}"
                                <button
                                    onClick={() => handleFilterChange({ keyword: '' })}
                                    className="ml-1 hover:text-pink-900"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filters.categoryId && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                Danh mục: {filters.categoryId}
                                <button
                                    onClick={() => handleFilterChange({ categoryId: '' })}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {(filters.minPrice || filters.maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                Giá: {filters.minPrice ? `${Number(filters.minPrice).toLocaleString('vi-VN')} VND` : '0 VND'}
                                - {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString('vi-VN')} VND` : '∞'}
                                <button
                                    onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })}
                                    className="ml-1 hover:text-green-900"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-pink-600 hover:text-pink-700 underline ml-2"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <div className="lg:w-80 flex-shrink-0">
                        <ProductFilter
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            showCategoryFilter={true}
                            showPriceFilter={true}
                            showSortFilter={true}
                        />
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Toggle */}
                                <button
                                    onClick={() => setShowMobileFilter(!showMobileFilter)}
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                                >
                                    <FunnelIcon className="h-5 w-5" />
                                    <span className="text-sm font-medium">Lọc</span>
                                </button>


                            </div>

                            <div className="flex items-center gap-4">
                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                                ? 'bg-white shadow-sm text-pink-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        title="Xem dạng lưới"
                                    >
                                        <Squares2X2Icon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                                ? 'bg-white shadow-sm text-pink-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        title="Xem dạng danh sách"
                                    >
                                        <ListBulletIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Sort Dropdown - Desktop */}
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                    className="hidden sm:block px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="price_asc">Giá thấp - cao</option>
                                    <option value="price_desc">Giá cao - thấp</option>
                                    <option value="name_asc">Tên A-Z</option>
                                    <option value="name_desc">Tên Z-A</option>
                                </select>
                            </div>
                        </div>

                        {/* Top Pagination */}
                        {/* Top Pagination */}


                        {/* Products Grid */}
                        <ProductGrid
                            products={products}
                            loading={loading}
                            columns={viewMode === 'grid' ? 3 : 2}
                            onAddToCart={addToCart}
                            onToggleFavorite={toggleFavorite}
                            favorites={state.favorites.map((f) => f.id)}
                            emptyMessage={
                                hasActiveFilters
                                    ? "Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn"
                                    : "Chưa có sản phẩm nào trong cửa hàng"
                            }
                        />

                        {/* Pagination */}
                        {/* Pagination */}
                        <div className="mt-8">
                            <Pagination
                                currentPage={pagination.page + 1}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalElements}
                                pageSize={pagination.size}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
