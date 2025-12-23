import axiosInstance from './axiosConfig';

/**
 * Customer API Service
 * Quản lý khách hàng cho Admin
 * Base path: /admin/customers
 */

// Helper function để unwrap response từ backend
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    return response.data;
};

const customerApi = {
    /**
     * Lấy danh sách khách hàng với lọc & phân trang
     * @param {Object} params - { keyword, role, isActive, page, size, sortBy, sortDir }
     */
    getAll: async (params = {}) => {
        const {
            keyword = '',
            role,
            isActive,
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        const queryParams = { page, size, sortBy, sortDir };

        // Chỉ thêm các param có giá trị
        if (keyword) queryParams.keyword = keyword;
        if (role) queryParams.role = role;
        if (typeof isActive === 'boolean') queryParams.isActive = isActive;

        console.log('🔄 Fetching customers with params:', queryParams);

        const response = await axiosInstance.get('/admin/customers', { params: queryParams });
        return unwrapResponse(response);
    },

    /**
     * Lấy chi tiết khách hàng
     * @param {number} id - ID khách hàng
     */
    getById: async (id) => {
        const response = await axiosInstance.get(`/admin/customers/${id}`);
        return unwrapResponse(response);
    },

    /**
     * Khóa/Mở khóa tài khoản
     * @param {number} id - ID khách hàng
     * @param {boolean} isActive - true để mở, false để khóa
     */
    updateStatus: async (id, isActive) => {
        const response = await axiosInstance.put(`/admin/customers/${id}/status`, { isActive });
        return unwrapResponse(response);
    },

    /**
     * Lấy thống kê khách hàng
     */
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/customers/stats');
            return unwrapResponse(response);
        } catch (error) {
            console.warn('Customer stats API not available');
            return {
                totalCustomers: 0,
                totalAdmins: 0,
                activeCustomers: 0,
                inactiveCustomers: 0,
                newThisMonth: 0
            };
        }
    },

    /**
     * Cập nhật thông tin khách hàng
     * @param {number} id - ID khách hàng
     * @param {Object} data - Dữ liệu cần cập nhật
     */
    update: async (id, data) => {
        const response = await axiosInstance.put(`/admin/customers/${id}`, data);
        return unwrapResponse(response);
    },

    /**
     * Lấy lịch sử đơn hàng của khách hàng
     * @param {number} customerId - ID khách hàng
     * @param {number} page - Số trang
     * @param {number} size - Số bản ghi mỗi trang
     */
    getOrderHistory: async (customerId, page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get(`/admin/customers/${customerId}/orders`, {
                params: { page, size }
            });
            return unwrapResponse(response);
        } catch (error) {
            console.warn('Customer orders API not available');
            return { content: [], totalElements: 0, totalPages: 0 };
        }
    }
};

// Helper: Format role name  
export const getRoleName = (role) => {
    const roleMap = {
        'USER': 'Khách hàng',
        'CUSTOMER': 'Khách hàng',  // Backend có thể trả về CUSTOMER
        'ADMIN': 'Quản trị viên',
        'MANAGER': 'Quản lý',
        'STAFF': 'Nhân viên'
    };
    return roleMap[role] || role;
};

// Helper: Get role badge color
export const getRoleBadgeColor = (role) => {
    const colorMap = {
        'ADMIN': 'bg-purple-100 text-purple-700',
        'MANAGER': 'bg-blue-100 text-blue-700',
        'STAFF': 'bg-green-100 text-green-700',
        'USER': 'bg-pink-100 text-pink-700',
        'CUSTOMER': 'bg-pink-100 text-pink-700'  // Backend có thể trả về CUSTOMER
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
};

// Helper: Format phone number
export const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    // Format: 0xxx xxx xxx
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
};

export default customerApi;
