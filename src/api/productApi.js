import axiosInstance from './axiosConfig';

/**
 * Helper function để unwrap response từ backend
 * Backend trả về: { success, data, message, timestamp }
 * Cần lấy data từ wrapper
 */
const unwrapResponse = (response) => {
    // Nếu response.data có property 'data' và 'success', đó là wrapper
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    // Fallback: trả về response.data nếu không phải wrapper
    return response.data;
};

const productApi = {
    // Get all products with optional filters (for public use)
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/products', { params });
        return unwrapResponse(response);
    },

    // Get paginated products - simulates pagination from full list since backend doesn't have /page endpoint
    getPaginated: async (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') => {
        try {
            // Try admin endpoint first for complete list
            const response = await axiosInstance.get('/admin/products');
            const allProducts = unwrapResponse(response);

            // Ensure allProducts is an array
            const productsArray = Array.isArray(allProducts) ? allProducts : [];

            // Simulate pagination on frontend
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedProducts = productsArray.slice(startIndex, endIndex);

            // Return Spring Boot Page format
            return {
                content: paginatedProducts,
                totalElements: productsArray.length,
                totalPages: Math.ceil(productsArray.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: endIndex >= productsArray.length
            };
        } catch (error) {
            console.log('Admin products endpoint failed, trying public endpoint');
            // Fallback to public endpoint
            const response = await axiosInstance.get('/products');
            const allProducts = unwrapResponse(response);

            // Ensure allProducts is an array
            const productsArray = Array.isArray(allProducts) ? allProducts : [];

            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedProducts = productsArray.slice(startIndex, endIndex);

            return {
                content: paginatedProducts,
                totalElements: productsArray.length,
                totalPages: Math.ceil(productsArray.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: endIndex >= productsArray.length
            };
        }
    },

    // Get product by ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/admin/products/${id}`);
            return unwrapResponse(response);
        } catch (error) {
            // Fallback to public endpoint
            const response = await axiosInstance.get(`/products/${id}`);
            return unwrapResponse(response);
        }
    },

    // Get product by slug
    getBySlug: async (slug) => {
        const response = await axiosInstance.get(`/products/slug/${slug}`);
        return unwrapResponse(response);
    },

    // Get products by category
    getByCategory: async (categoryId, page = 0, size = 12) => {
        const response = await axiosInstance.get(`/products/category/${categoryId}`, {
            params: { page, size }
        });
        return unwrapResponse(response);
    },

    // Get products by category with automatic parent/child detection
    getProductsByCategoryAuto: async (categoryId) => {
        const response = await axiosInstance.get(`/products/category-auto/${categoryId}`);
        return unwrapResponse(response);
    },

    // Get products by parent category ID
    getProductsByParentCategory: async (parentCategoryId) => {
        const response = await axiosInstance.get(`/products/parent-category/${parentCategoryId}`);
        return unwrapResponse(response);
    },

    // Get products by parent category slug
    getProductsByParentCategorySlug: async (slug) => {
        const response = await axiosInstance.get(`/products/parent-category/slug/${slug}`);
        return unwrapResponse(response);
    },

    // Search products (basic)
    search: async (keyword, page = 0, size = 12) => {
        const response = await axiosInstance.get('/products/search', {
            params: { keyword, page, size }
        });
        return unwrapResponse(response);
    },

    /**
     * Tìm kiếm và lọc nâng cao kết hợp
     * @param {Object} params - Các tham số tìm kiếm và lọc
     * @param {string} params.keyword - Từ khóa tìm kiếm
     * @param {number} params.priceFrom - Giá tối thiểu
     * @param {number} params.priceTo - Giá tối đa
     * @param {number} params.categoryId - ID danh mục
     * @param {string} params.sortBy - Sắp xếp theo (newest, price_asc, price_desc, name_asc, name_desc)
     * @param {number} params.page - Trang hiện tại
     * @param {number} params.size - Số sản phẩm mỗi trang
     */
    searchProducts: async (params = {}) => {
        const {
            keyword = '',
            priceFrom = '',
            priceTo = '',
            categoryId = '',
            sortBy = 'newest',
            page = 0,
            size = 12
        } = params;

        try {
            // Cố gắng gọi API search từ backend nếu có
            const response = await axiosInstance.get('/products/search', {
                params: {
                    keyword: keyword || undefined,
                    priceFrom: priceFrom || undefined,
                    priceTo: priceTo || undefined,
                    categoryId: categoryId || undefined,
                    sortBy: sortBy || undefined,
                    page,
                    size
                }
            });

            const data = unwrapResponse(response);

            // Nếu data đã có format pagination từ backend
            if (data && data.content) {
                return data;
            }

            // Nếu data là array, tự tạo pagination
            const productsArray = Array.isArray(data) ? data : [];
            return {
                content: productsArray.slice(page * size, (page + 1) * size),
                totalElements: productsArray.length,
                totalPages: Math.ceil(productsArray.length / size),
                number: page,
                size: size
            };
        } catch (error) {
            console.log('Backend search endpoint not available, performing client-side filtering');

            // Fallback: lấy tất cả sản phẩm và lọc ở client
            let allProducts = [];

            try {
                const response = await axiosInstance.get('/admin/products');
                allProducts = unwrapResponse(response);
            } catch (adminError) {
                const response = await axiosInstance.get('/products');
                allProducts = unwrapResponse(response);
            }

            // Đảm bảo là array
            allProducts = Array.isArray(allProducts) ? allProducts : [];

            // Lọc theo từ khóa
            if (keyword) {
                const lowerKeyword = keyword.toLowerCase();
                allProducts = allProducts.filter(p =>
                    p.name?.toLowerCase().includes(lowerKeyword) ||
                    p.description?.toLowerCase().includes(lowerKeyword)
                );
            }

            // Lọc theo danh mục
            if (categoryId) {
                allProducts = allProducts.filter(p =>
                    p.categoryId?.toString() === categoryId.toString() ||
                    p.category?.id?.toString() === categoryId.toString()
                );
            }

            // Lọc theo khoảng giá
            if (priceFrom) {
                allProducts = allProducts.filter(p => {
                    const productPrice = p.salePrice || p.price;
                    return productPrice >= Number(priceFrom);
                });
            }

            if (priceTo) {
                allProducts = allProducts.filter(p => {
                    const productPrice = p.salePrice || p.price;
                    return productPrice <= Number(priceTo);
                });
            }

            // Sắp xếp
            switch (sortBy) {
                case 'price_asc':
                    allProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                    break;
                case 'price_desc':
                    allProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                    break;
                case 'name_asc':
                    allProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    break;
                case 'name_desc':
                    allProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                    break;
                case 'newest':
                default:
                    allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }

            // Phân trang
            const startIndex = page * size;
            const paginatedProducts = allProducts.slice(startIndex, startIndex + size);

            return {
                content: paginatedProducts,
                totalElements: allProducts.length,
                totalPages: Math.ceil(allProducts.length / size),
                number: page,
                size: size,
                first: page === 0,
                last: startIndex + size >= allProducts.length
            };
        }
    },

    // Get featured products (using latest as alternative)
    getFeatured: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/featured', {
                params: { limit }
            });
            return unwrapResponse(response);
        } catch (error) {
            // Fallback to latest products
            const response = await axiosInstance.get('/products/latest', {
                params: { limit }
            });
            return unwrapResponse(response);
        }
    },

    // Get sale products
    getSale: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/on-sale');
            const data = unwrapResponse(response);
            // Ensure data is an array before slicing
            const productsArray = Array.isArray(data) ? data : [];
            return productsArray.slice(0, limit);
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
        return unwrapResponse(response);
    },

    // Get best sellers (fallback to latest)
    getBestSellers: async (limit = 8) => {
        try {
            const response = await axiosInstance.get('/products/best-sellers', {
                params: { limit }
            });
            return unwrapResponse(response);
        } catch (error) {
            // Fallback to latest products
            const response = await axiosInstance.get('/products/latest', {
                params: { limit }
            });
            return unwrapResponse(response);
        }
    },

    // Admin: Create product
    create: async (productData) => {
        // Transform data to match backend DTO
        const transformedData = {
            name: productData.name,
            slug: productData.slug || null,
            description: productData.description || null,
            price: Number(productData.price) || 0,
            salePrice: productData.salePrice ? Number(productData.salePrice) : null,
            stockQuantity: Number(productData.stockQuantity) || 0,
            categoryId: Number(productData.categoryId),
            thumbnail: productData.thumbnail || null,
            active: productData.active !== undefined ? productData.active : true,
            // Only include status if backend expects it
            ...(productData.status !== undefined && { status: Number(productData.status) })
        };

        console.log('📤 Creating product with data:', transformedData);

        try {
            const response = await axiosInstance.post('/admin/products', transformedData);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Create product error:', error.response?.data);
            // Re-throw with more detailed message
            if (error.response?.status === 400) {
                const responseData = error.response?.data;
                let errorMessage = 'Dữ liệu không hợp lệ';

                // Try to extract detailed validation errors
                if (responseData?.data && typeof responseData.data === 'object') {
                    // Backend returns validation errors in data property
                    const validationErrors = Object.entries(responseData.data)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join('; ');
                    if (validationErrors) {
                        errorMessage = validationErrors;
                    }
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.error) {
                    errorMessage = responseData.error;
                }

                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    // Admin: Update product
    update: async (id, productData) => {
        // Transform data to match backend DTO
        const transformedData = {
            id: Number(id),
            name: productData.name,
            slug: productData.slug || null,
            description: productData.description || null,
            price: Number(productData.price) || 0,
            salePrice: productData.salePrice ? Number(productData.salePrice) : null,
            stockQuantity: Number(productData.stockQuantity) || 0,
            categoryId: Number(productData.categoryId),
            thumbnail: productData.thumbnail || null,
            active: productData.active !== undefined ? productData.active : true,
            ...(productData.status !== undefined && { status: Number(productData.status) })
        };

        console.log('📤 Updating product with data:', transformedData);

        try {
            const response = await axiosInstance.put(`/admin/products/${id}`, transformedData);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Update product error:', error.response?.data);
            if (error.response?.status === 400) {
                const responseData = error.response?.data;
                let errorMessage = 'Dữ liệu không hợp lệ';

                // Try to extract detailed validation errors
                if (responseData?.data && typeof responseData.data === 'object') {
                    const validationErrors = Object.entries(responseData.data)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join('; ');
                    if (validationErrors) {
                        errorMessage = validationErrors;
                    }
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.error) {
                    errorMessage = responseData.error;
                }

                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    // Admin: Delete product
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/admin/products/${id}`);
            return unwrapResponse(response);
        } catch (error) {
            // Handle specific error cases
            if (error.response?.status === 500) {
                // Server error - likely FK constraint or database issue
                const errorMessage = error.response?.data?.message ||
                    'Không thể xóa sản phẩm. Sản phẩm có thể đang được sử dụng trong đơn hàng hoặc giỏ hàng.';

                // Try soft delete (set active = false) as fallback
                console.log('Hard delete failed, attempting soft delete...');
                try {
                    const product = await productApi.getById(id);
                    await productApi.update(id, { ...product, active: false });
                    return {
                        success: true,
                        message: 'Sản phẩm đã được ẩn thay vì xóa do đang được sử dụng',
                        softDeleted: true
                    };
                } catch (softDeleteError) {
                    console.error('Soft delete also failed:', softDeleteError);
                    throw new Error(errorMessage);
                }
            }
            throw error;
        }
    },

    // Admin: Toggle product status (using update since toggle endpoint may not exist)
    toggleStatus: async (id) => {
        try {
            // Get current product first
            const product = await productApi.getById(id);

            // Update with toggled active status
            const updatedProduct = {
                ...product,
                active: !product.active
            };

            const response = await productApi.update(id, updatedProduct);
            return response;
        } catch (error) {
            console.error('Toggle status failed:', error);
            throw error;
        }
    },

    // Get product statistics (admin)
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/products/stats');
            return unwrapResponse(response);
        } catch (error) {
            // Calculate stats from products list
            console.log('Stats endpoint not available, calculating from list');
            const response = await axiosInstance.get('/admin/products');
            const allProducts = unwrapResponse(response);
            const productsArray = Array.isArray(allProducts) ? allProducts : [];
            return {
                total: productsArray.length,
                active: productsArray.filter(p => p.active).length,
                inactive: productsArray.filter(p => !p.active).length,
                onSale: productsArray.filter(p => p.salePrice && p.salePrice > 0).length
            };
        }
    },
};

// Named exports for the category methods
export const getProductsByCategoryAuto = productApi.getProductsByCategoryAuto;
export const getProductsByParentCategory = productApi.getProductsByParentCategory;
export const getProductsByParentCategorySlug = productApi.getProductsByParentCategorySlug;

export default productApi;
