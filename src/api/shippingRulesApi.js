import axios from 'axios';
import authService from './authService';

// Base URL - sử dụng giá trị đầy đủ bao gồm /api prefix
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * API client cho Admin Shipping Rules
 */
const shippingRulesApi = {
    /**
     * Lấy danh sách rules (có phân trang)
     */
    getAll: async ({ page = 0, size = 20, city = '', keyword = '' } = {}) => {
        try {
            const token = authService.getAdminToken();
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            if (city) params.append('city', city);
            if (keyword) params.append('keyword', keyword);

            const response = await axios.get(
                `${API_BASE}/admin/shipping-rules?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching shipping rules:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 rule
     */
    getById: async (id) => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.get(
                `${API_BASE}/admin/shipping-rules/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching shipping rule:', error);
            throw error;
        }
    },

    /**
     * Tạo rule mới
     */
    create: async (data) => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.post(
                `${API_BASE}/admin/shipping-rules`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating shipping rule:', error);
            throw error;
        }
    },

    /**
     * Cập nhật rule
     */
    update: async (id, data) => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.put(
                `${API_BASE}/admin/shipping-rules/${id}`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating shipping rule:', error);
            throw error;
        }
    },

    /**
     * Xóa rule
     */
    delete: async (id) => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.delete(
                `${API_BASE}/admin/shipping-rules/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting shipping rule:', error);
            throw error;
        }
    },

    /**
     * Toggle active status
     */
    toggleActive: async (id) => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.patch(
                `${API_BASE}/admin/shipping-rules/${id}/toggle-active`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error toggling shipping rule:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách cities
     */
    getCities: async () => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.get(
                `${API_BASE}/admin/shipping-rules/cities`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách zones
     */
    getZones: async () => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.get(
                `${API_BASE}/admin/shipping-rules/zones`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching zones:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách delivery types
     */
    getDeliveryTypes: async () => {
        try {
            const token = authService.getAdminToken();
            const response = await axios.get(
                `${API_BASE}/admin/shipping-rules/delivery-types`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery types:', error);
            throw error;
        }
    },
};

export default shippingRulesApi;
