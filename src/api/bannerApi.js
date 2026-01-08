import api from './axiosConfig';

/**
 * Banner API Service
 * All APIs related to banner management
 */

// ================== PUBLIC APIs ==================

/**
 * Get all active banners
 * GET /api/banners
 */
export const getActiveBanners = async () => {
    try {
        const response = await api.get('/banners');
        return response.data;
    } catch (error) {
        console.error('Error fetching active banners:', error);
        throw error;
    }
};

// ================== ADMIN APIs ==================

/**
 * Get all banners (Admin only)
 * GET /api/admin/banners
 */
export const getAllBanners = async () => {
    try {
        const response = await api.get('/admin/banners');
        return response.data;
    } catch (error) {
        console.error('Error fetching all banners:', error);
        throw error;
    }
};

/**
 * Get banner by ID (Admin only)
 * GET /api/admin/banners/:id
 */
export const getBannerById = async (id) => {
    try {
        const response = await api.get(`/admin/banners/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching banner ${id}:`, error);
        throw error;
    }
};

/**
 * Create new banner (Admin only)
 * POST /api/admin/banners
 */
export const createBanner = async (bannerData) => {
    try {
        const response = await api.post('/admin/banners', bannerData);
        return response.data;
    } catch (error) {
        console.error('Error creating banner:', error);
        throw error;
    }
};

/**
 * Update banner (Admin only)
 * PUT /api/admin/banners/:id
 */
export const updateBanner = async (id, bannerData) => {
    try {
        const response = await api.put(`/admin/banners/${id}`, bannerData);
        return response.data;
    } catch (error) {
        console.error(`Error updating banner ${id}:`, error);
        throw error;
    }
};

/**
 * Delete banner (Admin only)
 * DELETE /api/admin/banners/:id
 */
export const deleteBanner = async (id) => {
    try {
        const response = await api.delete(`/admin/banners/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting banner ${id}:`, error);
        throw error;
    }
};

/**
 * Toggle banner active status (Admin only)
 * PATCH /api/admin/banners/:id/active
 */
export const toggleBannerActive = async (id) => {
    try {
        const response = await api.patch(`/admin/banners/${id}/active`);
        return response.data;
    } catch (error) {
        console.error(`Error toggling banner ${id}:`, error);
        throw error;
    }
};

/**
 * Reorder banners (Admin only)
 * PATCH /api/admin/banners/reorder
 * @param {Object} orderMap - Map of banner ID to sort order {1: 0, 2: 1, 3: 2}
 */
export const reorderBanners = async (orderMap) => {
    try {
        const response = await api.patch('/admin/banners/reorder', orderMap);
        return response.data;
    } catch (error) {
        console.error('Error reordering banners:', error);
        throw error;
    }
};
