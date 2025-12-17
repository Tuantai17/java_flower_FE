import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import ProductGrid from '../../components/user/ProductGrid';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import productApi from '../../api/productApi';
import { useApp } from '../../context/AppContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchResultPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 12,
        totalPages: 0,
        totalElements: 0,
    });
    const { addToCart, toggleFavorite, state } = useApp();

    useEffect(() => {
        if (query) {
            fetchSearchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, pagination.page]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const response = await productApi.search(query, pagination.page, pagination.size);
            setProducts(response.content || []);
            setPagination({
                ...pagination,
                totalPages: response.totalPages || 1,
                totalElements: response.totalElements || 0,
            });
        } catch (error) {
            console.error('Error searching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
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
                    <Breadcrumb items={[{ label: 'Tìm kiếm', path: '/search' }]} />
                </div>
            </div>

            {/* Header */}
            <div className="bg-white py-8 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex items-center gap-3 mb-2">
                        <MagnifyingGlassIcon className="h-8 w-8 text-pink-500" />
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                            Kết quả tìm kiếm
                        </h1>
                    </div>
                    {query && (
                        <p className="text-gray-600">
                            Tìm kiếm cho: <span className="font-semibold text-pink-600">"{query}"</span>
                            {!loading && (
                                <span className="ml-2">
                                    ({pagination.totalElements} kết quả)
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            <div className="container-custom py-8">
                {loading ? (
                    <Loading text="Đang tìm kiếm..." />
                ) : products.length > 0 ? (
                    <>
                        <ProductGrid
                            products={products}
                            columns={4}
                            onAddToCart={addToCart}
                            onToggleFavorite={toggleFavorite}
                            favorites={state.favorites.map((f) => f.id)}
                        />

                        <Pagination
                            currentPage={pagination.page + 1}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalElements}
                            pageSize={pagination.size}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Không tìm thấy kết quả
                        </h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Không có sản phẩm nào phù hợp với từ khóa "{query}".
                            Hãy thử tìm kiếm với từ khóa khác.
                        </p>
                        <Link to="/shop" className="btn-primary">
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultPage;
