import axiosInstance from './axiosConfig';

const categoryApi = {
    /**
     * Helper function để unwrap response từ backend
     * Backend trả về: { success, data, message, timestamp }
     * Cần lấy data từ wrapper
     */
    unwrapResponse: (response) => {
        // Nếu response.data có property 'data' và 'success', đó là wrapper
        if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
            return response.data.data;
        }
        // Fallback: trả về response.data nếu không phải wrapper
        return response.data;
    },

    // Get all categories (flat list) - using parents endpoint since /categories doesn't exist in public API
    // For admin, we'll use admin endpoints
    getAll: async () => {
        try {
            // Try admin endpoint first for complete list including inactive
            const response = await axiosInstance.get('/admin/categories');
            return categoryApi.unwrapResponse(response);
        } catch (error) {
            // Fallback to parents endpoint if admin fails
            console.log('Admin endpoint failed, trying parents endpoint');
            const response = await axiosInstance.get('/categories/parents');
            return categoryApi.unwrapResponse(response);
        }
    },

    // Get category menu (hierarchical tree)
    getMenu: async () => {
        const response = await axiosInstance.get('/categories/menu');
        return categoryApi.unwrapResponse(response);
    },

    // Get parent categories only
    getParents: async () => {
        const response = await axiosInstance.get('/categories/parents');
        return categoryApi.unwrapResponse(response);
    },

    // Get child categories of a parent
    getChildren: async (parentId) => {
        const response = await axiosInstance.get(`/categories/children/${parentId}`);
        return categoryApi.unwrapResponse(response);
    },

    // Get category by ID (admin with fallback to public)
    getById: async (id) => {
        try {
            // Try admin endpoint first for full details
            const response = await axiosInstance.get(`/admin/categories/${id}`);
            return categoryApi.unwrapResponse(response);
        } catch (error) {
            // Fallback to public endpoint
            const response = await axiosInstance.get(`/categories/${id}`);
            return categoryApi.unwrapResponse(response);
        }
    },

    // Get category by slug
    getBySlug: async (slug) => {
        const response = await axiosInstance.get(`/categories/slug/${slug}`);
        return categoryApi.unwrapResponse(response);
    },

    // Admin: Create category
    create: async (categoryData) => {
        const response = await axiosInstance.post('/admin/categories', categoryData);
        return categoryApi.unwrapResponse(response);
    },

    // Admin: Update category
    update: async (id, categoryData) => {
        const response = await axiosInstance.put(`/admin/categories/${id}`, categoryData);
        return categoryApi.unwrapResponse(response);
    },

    // Admin: Delete category
    delete: async (id) => {
        const response = await axiosInstance.delete(`/admin/categories/${id}`);
        return categoryApi.unwrapResponse(response);
    },

    // Admin: Toggle category status (toggle active field via update)
    toggleStatus: async (id) => {
        try {
            // Try toggle endpoint first
            const response = await axiosInstance.patch(`/admin/categories/${id}/toggle-status`);
            return categoryApi.unwrapResponse(response);
        } catch (error) {
            // If toggle endpoint doesn't exist, get category and update active status
            console.log('Toggle endpoint not available, using update instead');
            const category = await categoryApi.getById(id);
            const updatedCategory = { ...category, active: !category.active };
            return await categoryApi.update(id, updatedCategory);
        }
    },

    // Admin: Update sort order (via update if dedicated endpoint doesn't exist)
    updateSortOrder: async (id, sortOrder) => {
        try {
            const response = await axiosInstance.patch(`/admin/categories/${id}/sort-order`, { sortOrder });
            return categoryApi.unwrapResponse(response);
        } catch (error) {
            // If sort-order endpoint doesn't exist, use update
            console.log('Sort order endpoint not available, using update instead');
            const category = await categoryApi.getById(id);
            const updatedCategory = { ...category, sortOrder };
            return await categoryApi.update(id, updatedCategory);
        }
    },

    // Get category statistics (admin)
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/categories/stats');
            return categoryApi.unwrapResponse(response);
        } catch (error) {
            console.error('Stats endpoint not available:', error);
            return { total: 0, active: 0, inactive: 0 };
        }
    },
};

export default categoryApi;
