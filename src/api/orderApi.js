import axiosInstance from './axiosConfig';

/**
 * Order API Service
 * 
 * API Endpoints (theo Backend):
 * ================== USER ==================
 * POST   /api/orders/checkout              : Tạo đơn hàng mới
 * GET    /api/orders/me?page=0&size=10     : Lấy danh sách đơn hàng của tôi
 * GET    /api/orders/{id}                  : Chi tiết đơn hàng
 * POST   /api/orders/{id}/cancel           : Hủy đơn hàng
 * 
 * ================== ADMIN ==================
 * GET    /api/admin/orders                 : Lấy tất cả đơn hàng
 * PUT    /api/admin/orders/{id}/status     : Cập nhật trạng thái
 */

/**
 * Helper để unwrap response từ backend
 * Giữ nguyên paymentUrl nếu có
 */
const unwrapResponse = (response) => {
    console.log('Order API Raw Response:', response.data);

    if (response.data && typeof response.data === 'object') {
        // Nếu response có dạng { data: {...}, success: true, ... }
        if ('data' in response.data) {
            const innerData = response.data.data;

            // Nếu có paymentUrl ở ngoài cùng, copy vào innerData
            if (response.data.paymentUrl && innerData) {
                innerData.paymentUrl = response.data.paymentUrl;
            }
            // Tương tự cho payment_url (snake_case)
            if (response.data.payment_url && innerData) {
                innerData.paymentUrl = response.data.payment_url;
            }

            console.log('Order API Unwrapped Data:', innerData);
            return innerData;
        }
    }
    return response.data;
};

/**
 * Order Status Constants (match với backend enum)
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',           // Chờ xác nhận
    CONFIRMED: 'CONFIRMED',       // Đã xác nhận
    PROCESSING: 'PROCESSING',     // Đang xử lý
    DELIVERING: 'DELIVERING',     // Đang giao hàng
    COMPLETED: 'COMPLETED',       // Hoàn thành
    CANCELLED: 'CANCELLED',       // Đã hủy
};

/**
 * Payment Method Constants (match với backend enum)
 */
export const PAYMENT_METHODS = {
    COD: 'COD',                   // Thanh toán khi nhận hàng
    MOMO: 'MOMO',                 // Ví MoMo
    VNPAY: 'VNPAY',               // VNPay
    BANK_TRANSFER: 'BANK_TRANSFER', // Chuyển khoản
};

/**
 * Payment Status Constants
 */
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',           // Chờ thanh toán
    PAID: 'PAID',                 // Đã thanh toán
    FAILED: 'FAILED',             // Thanh toán thất bại
    REFUNDED: 'REFUNDED',         // Đã hoàn tiền
};

const orderApi = {
    // ==================== USER APIs ====================

    /**
     * Tạo đơn hàng mới (Checkout)
     * Endpoint: POST /api/orders/checkout
     * 
     * @param {Object} checkoutData - Thông tin checkout
     * @param {string} checkoutData.customerName - Họ tên khách hàng
     * @param {string} checkoutData.customerPhone - Số điện thoại
     * @param {string} checkoutData.customerEmail - Email
     * @param {string} checkoutData.shippingAddress - Địa chỉ giao hàng
     * @param {string} checkoutData.paymentMethod - Phương thức thanh toán (COD, MOMO, VNPAY)
     * @param {string} checkoutData.voucherCode - Mã voucher (optional)
     * @param {string} checkoutData.note - Ghi chú (optional)
     * @param {Array} checkoutData.items - Danh sách sản phẩm [{ productId, quantity }]
     * 
     * @returns {Object} OrderDTO với paymentUrl (nếu là MOMO/VNPAY)
     */
    checkout: async (checkoutData) => {
        console.log('📤 Creating order (checkout):', checkoutData);
        console.log('📤 Payment method:', checkoutData.paymentMethod);

        try {
            const response = await axiosInstance.post('/orders/checkout', checkoutData);

            console.log('✅ Raw checkout response:', response);
            console.log('✅ Response data:', response.data);
            console.log('✅ Response data.data:', response.data?.data);
            console.log('✅ PaymentUrl in response.data:', response.data?.paymentUrl);
            console.log('✅ PaymentUrl in response.data.data:', response.data?.data?.paymentUrl);

            // Đặc biệt xử lý cho MOMO - preserve paymentUrl
            if (checkoutData.paymentMethod === 'MOMO') {
                const result = response.data;

                // Trả về toàn bộ response nếu có paymentUrl ở ngoài cùng
                if (result?.paymentUrl) {
                    console.log('✅ Found paymentUrl at root level:', result.paymentUrl);
                    return result;
                }

                // Hoặc nếu có trong data
                if (result?.data?.paymentUrl) {
                    console.log('✅ Found paymentUrl in data:', result.data.paymentUrl);
                    return result.data;
                }

                // Hoặc payment_url (snake_case)
                if (result?.payment_url) {
                    console.log('✅ Found payment_url at root level:', result.payment_url);
                    result.paymentUrl = result.payment_url;
                    return result;
                }
            }

            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Checkout error:', error.response?.data);
            throw error;
        }
    },

    /**
     * Lấy danh sách đơn hàng của user đang đăng nhập
     * Endpoint: GET /api/orders/me
     */
    getMyOrders: async (page = 0, size = 10) => {
        console.log('🔄 Fetching my orders...');
        const response = await axiosInstance.get('/orders/me', {
            params: { page, size }
        });
        return unwrapResponse(response);
    },

    /**
     * Lấy chi tiết đơn hàng theo ID
     * Endpoint: GET /api/orders/{id}
     */
    getOrderById: async (orderId) => {
        console.log(`🔄 Fetching order #${orderId}...`);
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return unwrapResponse(response);
    },

    /**
     * Hủy đơn hàng
     * Endpoint: POST /api/orders/{id}/cancel
     */
    cancelOrder: async (orderId, reason = '') => {
        console.log(`🔄 Cancelling order #${orderId}...`);
        const response = await axiosInstance.post(`/orders/${orderId}/cancel`, { reason });
        return unwrapResponse(response);
    },

    // ==================== ADMIN APIs ====================

    /**
     * Lấy tất cả đơn hàng (Admin)
     */
    getAllOrders: async (params = {}) => {
        console.log('🔄 Fetching all orders (admin)...');
        const response = await axiosInstance.get('/admin/orders', { params });
        return unwrapResponse(response);
    },

    /**
     * Cập nhật trạng thái đơn hàng (Admin)
     */
    updateOrderStatus: async (orderId, status) => {
        console.log(`🔄 Updating order #${orderId} status to ${status}...`);
        const response = await axiosInstance.put(`/admin/orders/${orderId}/status`, { status });
        return unwrapResponse(response);
    },

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Format trạng thái đơn hàng sang tiếng Việt
     */
    formatOrderStatus: (status) => {
        const statusMap = {
            [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
            [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
            [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
            [ORDER_STATUS.DELIVERING]: 'Đang giao hàng',
            [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
            [ORDER_STATUS.CANCELLED]: 'Đã hủy',
        };
        return statusMap[status] || status;
    },

    /**
     * Format phương thức thanh toán sang tiếng Việt
     */
    formatPaymentMethod: (method) => {
        const methodMap = {
            [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
            [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
            [PAYMENT_METHODS.VNPAY]: 'VNPay',
            [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
        };
        return methodMap[method] || method;
    },

    /**
     * Lấy màu badge cho trạng thái
     */
    getStatusColor: (status) => {
        const colorMap = {
            [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
            [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-700',
            [ORDER_STATUS.PROCESSING]: 'bg-purple-100 text-purple-700',
            [ORDER_STATUS.DELIVERING]: 'bg-indigo-100 text-indigo-700',
            [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
            [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700';
    },

    /**
     * Kiểm tra đơn hàng có thể hủy không
     */
    canCancelOrder: (status) => {
        return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
    },
};

export default orderApi;
