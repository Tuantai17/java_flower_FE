import axiosInstance from './axiosConfig';

/**
 * ========================================
 * Payment API Service
 * ========================================
 * 
 * Xử lý tất cả các API liên quan đến thanh toán:
 * - MoMo Payment
 * - VNPay Payment (future)
 * 
 * API Endpoints:
 * - GET  /payment/momo/return      : Xác thực callback từ MoMo
 * - GET  /payment/momo/status/:id  : Kiểm tra trạng thái thanh toán
 * - POST /payment/momo/ipn         : IPN callback từ MoMo (BE->BE)
 */

// ====================
// CONSTANTS
// ====================

/**
 * Các mã kết quả thanh toán từ MoMo
 */
export const MOMO_RESULT_CODES = {
    SUCCESS: 0,           // Giao dịch thành công
    PENDING: 9000,        // Giao dịch đang được xử lý
    FAILED: 99,           // Giao dịch thất bại
    CANCELLED: 1006,      // Người dùng hủy giao dịch
    TIMEOUT: 1005,        // Giao dịch hết hạn
    INSUFFICIENT_FUND: 11, // Không đủ tiền trong ví
};

/**
 * Trạng thái thanh toán
 */
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Parse query string thành object
 * @param {string} queryString - Query string từ URL
 * @returns {Object} - Object chứa các params
 */
export const parseQueryParams = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    return result;
};

/**
 * Kiểm tra kết quả thanh toán MoMo từ resultCode
 * @param {number|string} resultCode - Mã kết quả từ MoMo
 * @returns {string} - Trạng thái thanh toán
 */
export const getMomoPaymentStatus = (resultCode) => {
    const code = parseInt(resultCode, 10);

    switch (code) {
        case MOMO_RESULT_CODES.SUCCESS:
            return PAYMENT_STATUS.SUCCESS;
        case MOMO_RESULT_CODES.PENDING:
            return PAYMENT_STATUS.PENDING;
        case MOMO_RESULT_CODES.CANCELLED:
            return PAYMENT_STATUS.CANCELLED;
        case MOMO_RESULT_CODES.TIMEOUT:
            return PAYMENT_STATUS.EXPIRED;
        default:
            return PAYMENT_STATUS.FAILED;
    }
};

/**
 * Lấy thông báo từ resultCode MoMo
 * @param {number|string} resultCode - Mã kết quả từ MoMo
 * @returns {string} - Thông báo chi tiết
 */
export const getMomoResultMessage = (resultCode) => {
    const code = parseInt(resultCode, 10);

    const messages = {
        [MOMO_RESULT_CODES.SUCCESS]: 'Thanh toán thành công!',
        [MOMO_RESULT_CODES.PENDING]: 'Giao dịch đang được xử lý',
        [MOMO_RESULT_CODES.FAILED]: 'Giao dịch thất bại',
        [MOMO_RESULT_CODES.CANCELLED]: 'Bạn đã hủy giao dịch',
        [MOMO_RESULT_CODES.TIMEOUT]: 'Giao dịch đã hết hạn',
        [MOMO_RESULT_CODES.INSUFFICIENT_FUND]: 'Số dư ví MoMo không đủ',
    };

    return messages[code] || 'Giao dịch thất bại. Vui lòng thử lại.';
};

// ====================
// API FUNCTIONS
// ====================

const paymentApi = {
    /**
     * Xác thực giao dịch MoMo sau khi redirect về
     * 
     * @param {Object} queryParams - Các params từ URL callback
     * @param {string} queryParams.partnerCode - Mã đối tác
     * @param {string} queryParams.orderId - Mã đơn hàng (từ MoMo)
     * @param {string} queryParams.requestId - Request ID
     * @param {number} queryParams.amount - Số tiền
     * @param {string} queryParams.orderInfo - Thông tin đơn hàng
     * @param {string} queryParams.orderType - Loại đơn hàng
     * @param {string} queryParams.transId - Mã giao dịch MoMo
     * @param {number} queryParams.resultCode - Mã kết quả
     * @param {string} queryParams.message - Thông báo từ MoMo
     * @param {string} queryParams.payType - Loại thanh toán
     * @param {number} queryParams.responseTime - Thời gian phản hồi
     * @param {string} queryParams.extraData - Dữ liệu bổ sung
     * @param {string} queryParams.signature - Chữ ký xác thực
     * 
     * @returns {Promise<Object>} - Kết quả xác thực
     */
    verifyMomoPayment: async (queryParams) => {
        console.log('🔍 Verifying MoMo payment:', queryParams);

        try {
            const response = await axiosInstance.get('/payment/momo/return', {
                params: queryParams
            });

            console.log('✅ MoMo verification response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ MoMo verification error:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra trạng thái thanh toán của đơn hàng
     * 
     * @param {number|string} orderId - ID đơn hàng
     * @returns {Promise<Object>} - Trạng thái thanh toán
     */
    checkPaymentStatus: async (orderId) => {
        console.log(`🔍 Checking payment status for order #${orderId}`);

        try {
            const response = await axiosInstance.get(`/payment/momo/status/${orderId}`);
            console.log('✅ Payment status:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Payment status check error:', error);
            throw error;
        }
    },

    /**
     * Xử lý kết quả thanh toán từ URL params
     * - Phân tích các params từ callback URL
     * - Xác định trạng thái thanh toán
     * - Gọi API verify nếu cần
     * 
     * @param {string} searchParams - Query string từ window.location.search
     * @returns {Promise<Object>} - Kết quả xử lý
     */
    processPaymentResult: async (searchParams) => {
        const params = parseQueryParams(searchParams);

        console.log('📋 Processing payment result params:', params);

        // Kiểm tra các params bắt buộc
        const { resultCode, orderId, transId, message } = params;

        // Xác định trạng thái từ resultCode (từ MoMo)
        const status = getMomoPaymentStatus(resultCode);
        const statusMessage = getMomoResultMessage(resultCode);

        // Tạo kết quả cơ bản
        const result = {
            status,
            message: message || statusMessage,
            orderId: orderId,
            transactionId: transId,
            params,
            verified: false,
        };

        // Nếu thanh toán thành công hoặc pending, verify với backend
        if (status === PAYMENT_STATUS.SUCCESS || status === PAYMENT_STATUS.PENDING) {
            try {
                const verifyResponse = await paymentApi.verifyMomoPayment(params);

                // Xử lý response từ backend
                const isSuccess =
                    verifyResponse?.success === true ||
                    verifyResponse?.code === 200 ||
                    verifyResponse?.data?.code === 200 ||
                    verifyResponse?.status === 'success' ||
                    verifyResponse?.data?.status === 'success';

                result.verified = isSuccess;
                result.backendResponse = verifyResponse;

                // Nếu backend xác nhận thất bại
                if (!isSuccess && status === PAYMENT_STATUS.SUCCESS) {
                    result.status = PAYMENT_STATUS.FAILED;
                    result.message = verifyResponse?.message || 'Xác thực thanh toán thất bại';
                }
            } catch (error) {
                console.error('❌ Backend verification failed:', error);
                // Vẫn coi là thành công nếu MoMo trả về success
                result.verified = false;
                result.verificationError = error.message;
            }
        }

        console.log('📦 Final payment result:', result);
        return result;
    },

    /**
     * Lấy thông tin chi tiết order sau thanh toán
     * 
     * @param {string} orderId - Mã đơn hàng
     * @returns {Promise<Object>} - Chi tiết đơn hàng
     */
    getOrderAfterPayment: async (orderId) => {
        try {
            const response = await axiosInstance.get(`/orders/${orderId}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('❌ Error fetching order:', error);
            return null;
        }
    },
};

export default paymentApi;
