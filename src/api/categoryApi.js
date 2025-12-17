import axiosInstance from './axiosConfig';

const categoryApi = {
    // Get all categories (flat list) - using parents endpoint since /categories doesn't exist in public API
    // For admin, we'll use admin endpoints
    getAll: async () => {
        try {
            // Try admin endpoint first for complete list including inactive
            const response = await axiosInstance.get('/admin/categories');
            return response.data;
        } catch (error) {
            // Fallback to parents endpoint if admin fails
            console.log('Admin endpoint failed, trying parents endpoint');
            const response = await axiosInstance.get('/categories/parents');
            return response.data;
        }
    },

    // Get category menu (hierarchical tree)
    getMenu: async () => {
        const response = await axiosInstance.get('/categories/menu');
        return response.data;
    },

    // Get parent categories only
    getParents: async () => {
        const response = await axiosInstance.get('/categories/parents');
        return response.data;
    },

    // Get child categories of a parent
    getChildren: async (parentId) => {
        const response = await axiosInstance.get(`/categories/children/${parentId}`);
        return response.data;
    },

    // Get category by ID (admin with fallback to public)
    getById: async (id) => {
        try {
            // Try admin endpoint first for full details
            const response = await axiosInstance.get(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            // Fallback to public endpoint
            const response = await axiosInstance.get(`/categories/${id}`);
            return response.data;
        }
    },

    // Get category by slug
    getBySlug: async (slug) => {
        const response = await axiosInstance.get(`/categories/slug/${slug}`);
        return response.data;
    },

    // Admin: Create category
    create: async (categoryData) => {
        const response = await axiosInstance.post('/admin/categories', categoryData);
        return response.data;
    },

    // Admin: Update category
    update: async (id, categoryData) => {
        const response = await axiosInstance.put(`/admin/categories/${id}`, categoryData);
        return response.data;
    },

    // Admin: Delete category
    delete: async (id) => {
        const response = await axiosInstance.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // Admin: Toggle category status (toggle active field via update)
    toggleStatus: async (id) => {
        try {
            // Try toggle endpoint first
            const response = await axiosInstance.patch(`/admin/categories/${id}/toggle-status`);
            return response.data;
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
            return response.data;
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
            return response.data;
        } catch (error) {
            console.error('Stats endpoint not available:', error);
            return { total: 0, active: 0, inactive: 0 };
        }
    },
};

export default categoryApi;

