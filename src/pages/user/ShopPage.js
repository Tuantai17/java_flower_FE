import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import ProductFilter from '../../components/user/ProductFilter';
import ProductGrid from '../../components/user/ProductGrid';
import Pagination from '../../components/common/Pagination';
import productApi from '../../api/productApi';
import { useApp } from '../../context/AppContext';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 12,
        totalPages: 0,
        totalElements: 0,
    });
    const { addToCart, toggleFavorite, state } = useApp();

    const [filters, setFilters] = useState({
        categoryId: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortDir: searchParams.get('sortDir') || 'desc',
    });

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.getPaginated(
                pagination.page,
                pagination.size,
                filters.sortBy,
                filters.sortDir
            );

            setProducts(response.content || []);
            setPagination({
                ...pagination,
                totalPages: response.totalPages || 1,
                totalElements: response.totalElements || 0,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            // Không sử dụng mock data - chỉ lấy từ API
            setProducts([]);
            setPagination({ ...pagination, totalPages: 0, totalElements: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination({ ...pagination, page: 0 });

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, page: page - 1 });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Cửa hàng', path: '/shop' }]} />
                </div>
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
                <div className="container-custom text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Cửa Hàng Hoa Tươi</h1>
                    <p className="text-pink-100">Khám phá bộ sưu tập hoa tươi đẹp nhất</p>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <div className="lg:w-72 flex-shrink-0">
                        <ProductFilter
                            initialFilters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-soft p-4">
                            <p className="text-gray-600">
                                Hiển thị <span className="font-medium">{products.length}</span> / {pagination.totalElements} sản phẩm
                            </p>

                            <div className="flex items-center gap-4">
                                {/* View Mode */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'
                                            }`}
                                    >
                                        <Squares2X2Icon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'
                                            }`}
                                    >
                                        <ListBulletIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Sort - Mobile */}
                                <select
                                    value={`${filters.sortBy}-${filters.sortDir}`}
                                    onChange={(e) => {
                                        const [sortBy, sortDir] = e.target.value.split('-');
                                        handleFilterChange({ ...filters, sortBy, sortDir });
                                    }}
                                    className="lg:hidden px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="createdAt-desc">Mới nhất</option>
                                    <option value="price-asc">Giá thấp - cao</option>
                                    <option value="price-desc">Giá cao - thấp</option>
                                    <option value="name-asc">Tên A-Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <ProductGrid
                            products={products}
                            loading={loading}
                            columns={viewMode === 'grid' ? 4 : 2}
                            onAddToCart={addToCart}
                            onToggleFavorite={toggleFavorite}
                            favorites={state.favorites.map((f) => f.id)}
                        />

                        {/* Pagination */}
                        <Pagination
                            currentPage={pagination.page + 1}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalElements}
                            pageSize={pagination.size}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
