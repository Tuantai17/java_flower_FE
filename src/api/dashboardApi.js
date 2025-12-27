/**
 * Dashboard API Service
 * 
 * Kết nối với Backend Dashboard APIs
 * 
 * @version 2.0.0 - Cập nhật theo Backend endpoints mới
 */

import axiosInstance from './axiosConfig';

// ============================================
// CONSTANTS
// ============================================

const BASE_URL = '/admin/dashboard';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Unwrap response từ backend
 * Backend trả về: { success, data, message, timestamp }
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object') {
        // Nếu có wrapper { success, data }
        if ('data' in response.data && 'success' in response.data) {
            return response.data.data;
        }
        // Nếu không có wrapper
        return response.data;
    }
    return response.data;
};

/**
 * Handle API error
 */
const handleError = (error, defaultMessage = 'Đã xảy ra lỗi') => {
    console.error('Dashboard API Error:', error);

    if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || data?.errorMessage || defaultMessage;

        switch (status) {
            case 401:
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            case 403:
                throw new Error('Bạn không có quyền truy cập Dashboard.');
            case 404:
                throw new Error('API không tồn tại. Vui lòng kiểm tra Backend.');
            case 500:
                throw new Error('Lỗi server. Vui lòng thử lại sau.');
            default:
                throw new Error(message);
        }
    }

    if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }

    throw new Error(error.message || defaultMessage);
};

// ============================================
// API FUNCTIONS
// ============================================

const dashboardApi = {
    /**
     * Lấy thống kê nhanh (Quick Stats)
     * Endpoint: GET /api/admin/dashboard/quick-stats
     * 
     * @returns {Promise<DashboardStats>}
     */
    getQuickStats: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/quick-stats`);
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải thống kê nhanh');
        }
    },

    /**
     * Lấy dữ liệu biểu đồ doanh thu
     * Endpoint: GET /api/admin/dashboard/revenue-chart?period=7days
     * 
     * @param {string} period - "7days" | "30days" | "3months"
     * @returns {Promise<RevenueChartData>}
     */
    getRevenueChart: async (period = '7days') => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/revenue-chart`, {
                params: { period }
            });
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải dữ liệu biểu đồ doanh thu');
        }
    },

    /**
     * Lấy dữ liệu phân bố đơn hàng
     * Endpoint: GET /api/admin/dashboard/order-distribution
     * 
     * @returns {Promise<OrderDistribution>}
     */
    getOrderDistribution: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/order-distribution`);
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải dữ liệu phân bố đơn hàng');
        }
    },

    /**
     * Lấy toàn bộ dữ liệu Dashboard (Overview)
     * Endpoint: GET /api/admin/dashboard/overview?period=7days
     * 
     * @param {string} period - "7days" | "30days" | "3months"
     * @returns {Promise<DashboardOverview>}
     */
    getOverview: async (period = '7days') => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/overview`, {
                params: { period }
            });
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải dữ liệu Dashboard');
        }
    },

    /**
     * Lấy đơn hàng gần đây
     * Endpoint: GET /api/admin/dashboard/recent-orders
     * 
     * @param {number} limit - Số lượng đơn cần lấy
     * @returns {Promise<RecentOrder[]>}
     */
    getRecentOrders: async (limit = 5) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/recent-orders`, {
                params: { limit }
            });
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải đơn hàng gần đây');
        }
    },

    /**
     * Lấy sản phẩm bán chạy
     * Endpoint: GET /api/admin/dashboard/top-products
     * 
     * @param {number} limit - Số lượng sản phẩm cần lấy
     * @returns {Promise<TopProduct[]>}
     */
    getTopProducts: async (limit = 5) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/top-products`, {
                params: { limit }
            });
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải sản phẩm bán chạy');
        }
    },

    /**
     * Lấy sản phẩm sắp hết hàng
     * Endpoint: GET /api/admin/dashboard/low-stock
     * 
     * @param {number} limit - Số lượng sản phẩm cần lấy
     * @returns {Promise<LowStockProduct[]>}
     */
    getLowStockProducts: async (limit = 5) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/low-stock`, {
                params: { limit }
            });
            return unwrapResponse(response);
        } catch (error) {
            handleError(error, 'Không thể tải sản phẩm sắp hết hàng');
        }
    },
};

export default dashboardApi;
