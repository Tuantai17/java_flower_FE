import axiosInstance from './axiosConfig';

const productApi = {
    // Get all products with optional filters (for public use)
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/products', { params });
        return response.data;
    },

    // Get paginated products - simulates pagination from full list since backend doesn't have /page endpoint
    getPaginated: async (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') => {
        try {
            // Try admin endpoint first for complete list
            const response = await axiosInstance.get('/admin/products');
            const allProducts = response.data;

            // Simulate pagination on frontend
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedProducts = allProducts.slice(startIndex, endIndex);

            // Return Spring Boot Page format
            return {
                content: paginatedProducts,
                totalElements: allProducts.length,
                totalPages: Math.ceil(allProducts.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: endIndex >= allProducts.length
            };
        } catch (error) {
            console.log('Admin products endpoint failed, trying public endpoint');
            // Fallback to public endpoint
            const response = await axiosInstance.get('/products');
            const allProducts = response.data;

            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedProducts = allProducts.slice(startIndex, endIndex);

            return {
                content: paginatedProducts,
                totalElements: allProducts.length,
                totalPages: Math.ceil(allProducts.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: endIndex >= allProducts.length
            };
        }
    },

    // Get product by ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            // Fallback to public endpoint
            const response = await axiosInstance.get(`/products/${id}`);
            return response.data;
        }
    },

    // Get product by slug
    getBySlug: async (slug) => {
        const response = await axiosInstance.get(`/products/slug/${slug}`);
        return response.data;
    },

    // Get products by category
    getByCategory: async (categoryId, page = 0, size = 12) => {
        const response = await axiosInstance.get(`/products/category/${categoryId}`, {
            params: { page, size }
        });
        return response.data;
    },

    // Get products by category with automatic parent/child detection
    getProductsByCategoryAuto: async (categoryId) => {
        const response = await axiosInstance.get(`/products/category-auto/${categoryId}`);
        return response.data;
    },

    // Get products by parent category ID
    getProductsByParentCategory: async (parentCategoryId) => {
        const response = await axiosInstance.get(`/products/parent-category/${parentCategoryId}`);
        return response.data;
    },

    // Get products by parent category slug
    getProductsByParentCategorySlug: async (slug) => {
        const response = await axiosInstance.get(`/products/parent-category/slug/${slug}`);
        return response.data;
    },

    // Search products
    search: async (keyword, page = 0, size = 12) => {
        const response = await axiosInstance.get('/products/search', {
            params: { keyword, page, size }
        });
        return response.data;
    },

    // Get featured products (using latest as alternative)
    getFeatured: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/featured', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            // Fallback to latest products
            const response = await axiosInstance.get('/products/latest', {
                params: { limit }
            });
            return response.data;
        }
    },

    // Get sale products
    getSale: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/on-sale');
            return response.data.slice(0, limit);
        } catch (error) {
            console.error('Sale products endpoint not available:', error);
            return [];
        }
    },

    // Get new arrivals
    getNewArrivals: async (limit = 8) => {
        const response = await axiosInstance.get('/products/latest', {
            params: { limit }
        });
        return response.data;
    },

    // Get best sellers (fallback to latest)
    getBestSellers: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/best-sellers', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            // Fallback to latest products
            const response = await axiosInstance.get('/products/latest', {
                params: { limit }
            });
            return response.data;
        }
    },

    // Admin: Create product
    create: async (productData) => {
        const response = await axiosInstance.post('/admin/products', productData);
        return response.data;
    },

    // Admin: Update product
    update: async (id, productData) => {
        const response = await axiosInstance.put(`/admin/products/${id}`, productData);
        return response.data;
    },

    // Admin: Delete product
    delete: async (id) => {
        const response = await axiosInstance.delete(`/admin/products/${id}`);
        return response.data;
    },

    // Admin: Toggle product status (needs to be implemented in backend or use update)
    toggleStatus: async (id) => {
        try {
            // Try the toggle endpoint first
            const response = await axiosInstance.patch(`/admin/products/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            // If toggle endpoint doesn't exist, get product and update active status
            console.log('Toggle endpoint not available, using update instead');
            const product = await productApi.getById(id);
            const updatedProduct = { ...product, active: !product.active };
            return await productApi.update(id, updatedProduct);
        }
    },

    // Get product statistics (admin)
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/products/stats');
            return response.data;
        } catch (error) {
            // Calculate stats from products list
            console.log('Stats endpoint not available, calculating from list');
            const products = await axiosInstance.get('/admin/products');
            const allProducts = products.data;
            return {
                total: allProducts.length,
                active: allProducts.filter(p => p.active).length,
                inactive: allProducts.filter(p => !p.active).length,
                onSale: allProducts.filter(p => p.salePrice && p.salePrice > 0).length
            };
        }
    },
};

// Named exports for the category methods
export const getProductsByCategoryAuto = productApi.getProductsByCategoryAuto;
export const getProductsByParentCategory = productApi.getProductsByParentCategory;
export const getProductsByParentCategorySlug = productApi.getProductsByParentCategorySlug;

export default productApi;
