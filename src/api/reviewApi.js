import axiosInstance from './axiosConfig';

/**
 * ========================================
 * Review API Service
 * ========================================
 * 
 * API Endpoints:
 * 
 * PUBLIC:
 * GET    /api/reviews/product/{productId}        : Lấy reviews của sản phẩm (đã duyệt)
 * GET    /api/reviews/product/{productId}/stats  : Lấy thống kê đánh giá
 * 
 * USER (Authenticated):
 * POST   /api/reviews                            : Tạo đánh giá mới
 * GET    /api/reviews/my-reviews                 : Lấy đánh giá của user
 * PUT    /api/reviews/{id}                       : Cập nhật đánh giá
 * DELETE /api/reviews/{id}                       : Xóa đánh giá
 * 
 * ADMIN:
 * GET    /api/admin/reviews                      : Lấy tất cả reviews
 * PUT    /api/admin/reviews/{id}/status          : Duyệt/từ chối review
 * POST   /api/admin/reviews/{id}/reply           : Phản hồi review
 * DELETE /api/admin/reviews/{id}                 : Xóa review
 */

// ====================
// CONSTANTS
// ====================

export const REVIEW_STATUS = {
    PENDING: 'PENDING',       // Chờ duyệt
    APPROVED: 'APPROVED',     // Đã duyệt
    REJECTED: 'REJECTED',     // Bị từ chối
};

export const REVIEW_STATUS_LABELS = {
    [REVIEW_STATUS.PENDING]: 'Chờ duyệt',
    [REVIEW_STATUS.APPROVED]: 'Đã duyệt',
    [REVIEW_STATUS.REJECTED]: 'Bị từ chối',
};

export const REVIEW_STATUS_COLORS = {
    [REVIEW_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
    [REVIEW_STATUS.APPROVED]: 'bg-green-100 text-green-700',
    [REVIEW_STATUS.REJECTED]: 'bg-red-100 text-red-700',
};

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Unwrap response data từ backend
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
            return response.data.data;
        }
    }
    return response.data;
};

/**
 * Format rating thành text
 */
export const getRatingText = (rating) => {
    const texts = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Tuyệt vời',
    };
    return texts[rating] || '';
};

/**
 * Tính phần trăm cho mỗi mức sao
 */
export const calculateRatingPercentage = (stats) => {
    if (!stats || !stats.totalReviews || stats.totalReviews === 0) {
        return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const total = stats.totalReviews;
    return {
        5: Math.round(((stats.fiveStars || 0) / total) * 100),
        4: Math.round(((stats.fourStars || 0) / total) * 100),
        3: Math.round(((stats.threeStars || 0) / total) * 100),
        2: Math.round(((stats.twoStars || 0) / total) * 100),
        1: Math.round(((stats.oneStars || 0) / total) * 100),
    };
};

// ====================
// PUBLIC API FUNCTIONS
// ====================

const reviewApi = {
    /**
     * Lấy danh sách đánh giá của sản phẩm (đã duyệt)
     * 
     * @param {number} productId - ID sản phẩm
     * @param {number} page - Trang (default: 0)
     * @param {number} size - Số lượng mỗi trang (default: 10)
     * @returns {Promise<Object>} - { content, totalPages, totalElements, ... }
     */
    getProductReviews: async (productId, page = 0, size = 10) => {
        console.log(`🌟 Fetching reviews for product #${productId}, page ${page}`);
        try {
            const response = await axiosInstance.get(`/reviews/product/${productId}`, {
                params: { page, size },
            });
            console.log('✅ Reviews loaded');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Get reviews error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Lấy thống kê đánh giá của sản phẩm
     * 
     * @param {number} productId - ID sản phẩm
     * @returns {Promise<Object>} - { averageRating, totalReviews, fiveStars, fourStars, ... }
     */
    getProductStats: async (productId) => {
        console.log(`📊 Fetching review stats for product #${productId}`);
        try {
            const response = await axiosInstance.get(`/reviews/product/${productId}/stats`);
            console.log('✅ Review stats loaded');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Get stats error:', error.response?.data?.message || error.message);
            // Return default stats if error
            return {
                averageRating: 0,
                totalReviews: 0,
                fiveStars: 0,
                fourStars: 0,
                threeStars: 0,
                twoStars: 0,
                oneStars: 0,
            };
        }
    },

    // ====================
    // USER API FUNCTIONS
    // ====================

    /**
     * Tạo đánh giá mới
     * 
     * @param {Object} data - Dữ liệu đánh giá
     * @param {number} data.productId - ID sản phẩm
     * @param {number} data.orderId - ID đơn hàng
     * @param {number} data.rating - Số sao (1-5)
     * @param {string} data.comment - Nội dung đánh giá
     * @param {string[]} data.imageUrls - URLs ảnh đánh giá (optional)
     * @returns {Promise<Object>} - Review đã tạo
     */
    createReview: async (data) => {
        console.log('🌟 Creating new review:', data);
        try {
            const response = await axiosInstance.post('/reviews', data);
            console.log('✅ Review created');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Create review error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Lấy danh sách đánh giá của user hiện tại
     * 
     * @returns {Promise<Array>} - Danh sách reviews
     */
    getMyReviews: async () => {
        console.log('🌟 Fetching my reviews...');
        try {
            const response = await axiosInstance.get('/reviews/my-reviews');
            console.log('✅ My reviews loaded');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Get my reviews error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Cập nhật đánh giá
     * 
     * @param {number} reviewId - ID đánh giá
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} - Review đã cập nhật
     */
    updateReview: async (reviewId, data) => {
        console.log(`🌟 Updating review #${reviewId}:`, data);
        try {
            const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
            console.log('✅ Review updated');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Update review error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Xóa đánh giá của user
     * 
     * @param {number} reviewId - ID đánh giá
     * @returns {Promise<void>}
     */
    deleteReview: async (reviewId) => {
        console.log(`🌟 Deleting review #${reviewId}`);
        try {
            await axiosInstance.delete(`/reviews/${reviewId}`);
            console.log('✅ Review deleted');
        } catch (error) {
            console.error('❌ Delete review error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Kiểm tra user đã đánh giá sản phẩm trong đơn hàng chưa
     * 
     * @param {number} productId - ID sản phẩm
     * @param {number} orderId - ID đơn hàng
     * @returns {Promise<boolean>}
     */
    checkUserReviewed: async (productId, orderId) => {
        try {
            const response = await axiosInstance.get('/reviews/check', {
                params: { productId, orderId },
            });
            return response.data?.data || response.data || false;
        } catch (error) {
            return false;
        }
    },

    // ====================
    // ADMIN API FUNCTIONS
    // ====================

    /**
     * [ADMIN] Lấy tất cả đánh giá với filter
     * 
     * @param {Object} params - Query params
     * @param {string} params.status - Filter theo status
     * @param {number} params.productId - Filter theo product
     * @param {number} params.page - Trang
     * @param {number} params.size - Số lượng mỗi trang
     * @returns {Promise<Object>} - Paginated reviews
     */
    adminGetAllReviews: async (params = {}) => {
        console.log('🌟 [ADMIN] Fetching all reviews:', params);
        try {
            const response = await axiosInstance.get('/admin/reviews', { params });
            console.log('✅ [ADMIN] Reviews loaded');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ [ADMIN] Get reviews error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * [ADMIN] Cập nhật trạng thái đánh giá (duyệt/từ chối)
     * 
     * @param {number} reviewId - ID đánh giá
     * @param {string} status - Trạng thái mới (APPROVED/REJECTED)
     * @returns {Promise<Object>} - Review đã cập nhật
     */
    adminUpdateStatus: async (reviewId, status) => {
        console.log(`🌟 [ADMIN] Updating review #${reviewId} status to ${status}`);
        try {
            const response = await axiosInstance.put(`/admin/reviews/${reviewId}/status`, { status });
            console.log('✅ [ADMIN] Status updated');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ [ADMIN] Update status error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * [ADMIN] Phản hồi đánh giá
     * 
     * @param {number} reviewId - ID đánh giá
     * @param {string} reply - Nội dung phản hồi
     * @param {string[]} images - Danh sách URL ảnh đính kèm (optional)
     * @returns {Promise<Object>} - Review đã cập nhật
     */
    adminReplyReview: async (reviewId, reply, images = []) => {
        console.log(`🌟 [ADMIN] Replying to review #${reviewId} with ${images.length} images`);
        try {
            const response = await axiosInstance.post(`/admin/reviews/${reviewId}/reply`, { 
                reply,
                images: images.length > 0 ? images : null
            });
            console.log('✅ [ADMIN] Reply sent');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ [ADMIN] Reply error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * [ADMIN] Xóa đánh giá
     * 
     * @param {number} reviewId - ID đánh giá
     * @returns {Promise<void>}
     */
    adminDeleteReview: async (reviewId) => {
        console.log(`🌟 [ADMIN] Deleting review #${reviewId}`);
        try {
            await axiosInstance.delete(`/admin/reviews/${reviewId}`);
            console.log('✅ [ADMIN] Review deleted');
        } catch (error) {
            console.error('❌ [ADMIN] Delete error:', error.response?.data?.message || error.message);
            throw error;
        }
    },
};

export default reviewApi;
