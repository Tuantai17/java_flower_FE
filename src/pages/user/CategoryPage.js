import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import ProductGrid from '../../components/user/ProductGrid';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import categoryApi from '../../api/categoryApi';
import productApi, { getProductsByCategoryAuto } from '../../api/productApi';
import { useApp } from '../../context/AppContext';

const CategoryPage = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 12,
        totalPages: 0,
        totalElements: 0,
    });
    const { addToCart, toggleFavorite, state } = useApp();

    // Reset pagination when category changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 0 }));
    }, [id]);

    // Fetch data when category or page changes
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, pagination.page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoryData, productsData] = await Promise.all([
                categoryApi.getById(id),
                getProductsByCategoryAuto(id),
            ]);

            setCategory(categoryData);

            // Handle response - check if it's paginated or simple array
            if (productsData && productsData.content && productsData.totalPages !== undefined) {
                // Response has pagination from server
                setAllProducts(productsData.content);
                setProducts(productsData.content);
                setPagination({
                    ...pagination,
                    totalPages: productsData.totalPages,
                    totalElements: productsData.totalElements,
                });
            } else if (Array.isArray(productsData)) {
                // Response is simple array - need client-side pagination
                setAllProducts(productsData);

                // Calculate pagination
                const totalElements = productsData.length;
                const totalPages = Math.ceil(totalElements / pagination.size);

                // Get products for current page
                const startIndex = pagination.page * pagination.size;
                const endIndex = startIndex + pagination.size;
                const currentPageProducts = productsData.slice(startIndex, endIndex);

                setProducts(currentPageProducts);
                setPagination(prev => ({
                    ...prev,
                    totalPages,
                    totalElements,
                }));
            } else if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
                // Handle case where API returns wrapped response
                const productList = productsData.data || productsData.products || [];
                if (Array.isArray(productList)) {
                    setAllProducts(productList);
                    const totalElements = productList.length;
                    const totalPages = Math.ceil(totalElements / pagination.size);
                    const startIndex = pagination.page * pagination.size;
                    const endIndex = startIndex + pagination.size;
                    const currentPageProducts = productList.slice(startIndex, endIndex);
                    setProducts(currentPageProducts);
                    setPagination(prev => ({
                        ...prev,
                        totalPages,
                        totalElements,
                    }));
                } else {
                    setAllProducts([]);
                    setProducts([]);
                    setPagination({ ...pagination, totalPages: 0, totalElements: 0 });
                }
            } else {
                // Fallback for unexpected response structure
                setAllProducts([]);
                setProducts([]);
                setPagination({ ...pagination, totalPages: 0, totalElements: 0 });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response) {
                console.error('API Error:', error.response.status, error.response.data);
            }
            setCategory(null);
            setProducts([]);
            setAllProducts([]);
            setPagination({ ...pagination, totalPages: 0, totalElements: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        const newPage = page - 1;
        
        // If using client-side pagination, slice from allProducts
        if (allProducts && allProducts.length > 0) {
            const startIndex = newPage * pagination.size;
            const endIndex = startIndex + pagination.size;
            const currentPageProducts = allProducts.slice(startIndex, endIndex);
            setProducts(currentPageProducts);
        }
        
        setPagination({ ...pagination, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !category) {
        return <Loading fullScreen text="Đang tải danh mục..." />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb
                        items={[
                            { label: 'Cửa hàng', path: '/shop' },
                            { label: category?.name || 'Danh mục' },
                        ]}
                    />
                </div>
            </div>

            {/* Category Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
                <div className="container-custom text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        {category?.name}
                    </h1>
                    {category?.description && (
                        <p className="text-pink-100 max-w-2xl mx-auto">{category.description}</p>
                    )}
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Products Count */}
                <div className="mb-6 text-gray-600">
                    Tìm thấy <span className="font-semibold text-gray-800">{pagination.totalElements}</span> sản phẩm
                </div>

                {/* Products Grid */}
                <ProductGrid
                    products={products}
                    loading={loading}
                    columns={4}
                    onAddToCart={addToCart}
                    onToggleFavorite={toggleFavorite}
                    favorites={state.favorites.map((f) => f.id)}
                    emptyMessage="Chưa có sản phẩm trong danh mục này"
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
    );
};

export default CategoryPage;
