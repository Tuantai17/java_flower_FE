import axiosInstance from './axiosConfig';

/**
 * Voucher API Service
 * 
 * API Endpoints:
 * ================== PUBLIC ==================
 * GET  /api/vouchers/active              : Lấy voucher đang hoạt động (Public)
 * GET  /api/vouchers/check/{code}        : Kiểm tra mã voucher (Public)
 * 
 * ================== ADMIN ==================
 * GET    /api/vouchers/admin             : MẶC ĐỊNH - Chỉ voucher còn hạn
 * GET    /api/vouchers/admin/all         : Tất cả voucher (bao gồm hết hạn + đã ẩn)
 * GET    /api/vouchers/admin/stats       : Thống kê {activeCount, hiddenCount, totalCount}
 * GET    /api/vouchers/admin/{id}        : Chi tiết voucher theo ID
 * POST   /api/vouchers/admin/create      : Tạo voucher mới
 * PUT    /api/vouchers/admin/{id}        : Cập nhật voucher
 * DELETE /api/vouchers/admin/{id}        : Ẩn voucher (soft delete)
 * DELETE /api/vouchers/admin/{id}/permanent : Xóa vĩnh viễn
 * PATCH  /api/vouchers/admin/{id}/toggle : Bật/tắt trạng thái
 */

/**
 * Helper để unwrap response từ backend
 */
const unwrapResponse = (response) => {
    console.log('API Raw Response:', response.data);

    if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
            return response.data.data;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
    }
    return response.data;
};

const voucherApi = {
    // ==================== PUBLIC APIs ====================

    /**
     * Lấy danh sách voucher đang hoạt động (Public)
     */
    getActiveVouchers: async () => {
        const response = await axiosInstance.get('/vouchers/active');
        return unwrapResponse(response);
    },

    /**
     * Kiểm tra mã voucher có hợp lệ không
     */
    checkVoucher: async (code) => {
        const response = await axiosInstance.get(`/vouchers/check/${code}`);
        return unwrapResponse(response);
    },

    // ==================== NEWSLETTER APIs ====================

    /**
     * Đăng ký nhận tin khuyến mãi và nhận voucher welcome
     * POST /api/public/newsletter/subscribe
     * 
     * @param {string} email - Email đăng ký
     * @returns {Object} { voucherCode, discountPercent, maxDiscount, expiryDate, message }
     */
    subscribeNewsletter: async (email) => {
        console.log(`📧 Subscribing newsletter for: ${email}`);
        const response = await axiosInstance.post('/public/newsletter/subscribe', { email });
        return unwrapResponse(response);
    },

    /**
     * Kiểm tra email đã đăng ký newsletter chưa
     * GET /api/public/newsletter/check
     */
    checkNewsletterSubscription: async (email) => {
        const response = await axiosInstance.get('/public/newsletter/check', { params: { email } });
        return unwrapResponse(response);
    },

    // ==================== SAVED VOUCHER APIs (Kho Voucher) ====================

    /**
     * Lưu voucher vào kho cá nhân
     * POST /api/vouchers/save/{voucherId}
     */
    saveVoucher: async (voucherId) => {
        console.log(`💾 Saving voucher ${voucherId} to wallet`);
        const response = await axiosInstance.post(`/vouchers/save/${voucherId}`);
        return unwrapResponse(response);
    },

    /**
     * Xóa voucher khỏi kho
     * DELETE /api/vouchers/unsave/{voucherId}
     */
    unsaveVoucher: async (voucherId) => {
        console.log(`🗑️ Removing voucher ${voucherId} from wallet`);
        const response = await axiosInstance.delete(`/vouchers/unsave/${voucherId}`);
        return unwrapResponse(response);
    },

    /**
     * Kiểm tra voucher đã được lưu chưa
     * GET /api/vouchers/check-saved/{voucherId}
     */
    checkVoucherSaved: async (voucherId) => {
        const response = await axiosInstance.get(`/vouchers/check-saved/${voucherId}`);
        const data = unwrapResponse(response);
        return data?.isSaved || false;
    },

    /**
     * Lấy tất cả voucher trong kho của user
     * GET /api/vouchers/my-vouchers
     */
    getMySavedVouchers: async () => {
        console.log('📦 Fetching my voucher wallet');
        const response = await axiosInstance.get('/vouchers/my-vouchers');
        return unwrapResponse(response);
    },

    /**
     * Lấy voucher theo filter
     * GET /api/vouchers/my-vouchers/filter?type=available|expiring|expired|used
     */
    getMyVouchersByFilter: async (filterType = 'all') => {
        console.log(`📦 Fetching vouchers with filter: ${filterType}`);
        const response = await axiosInstance.get('/vouchers/my-vouchers/filter', {
            params: { type: filterType }
        });
        return unwrapResponse(response);
    },

    /**
     * Lấy voucher còn dùng được (cho checkout)
     * GET /api/vouchers/my-vouchers/available
     */
    getMyAvailableVouchers: async () => {
        console.log('🎟️ Fetching available vouchers for checkout');
        const response = await axiosInstance.get('/vouchers/my-vouchers/available');
        return unwrapResponse(response);
    },

    /**
     * Đếm số voucher trong kho
     * GET /api/vouchers/my-vouchers/counts
     */
    getVoucherCounts: async () => {
        const response = await axiosInstance.get('/vouchers/my-vouchers/counts');
        return unwrapResponse(response);
    },

    // ==================== ADMIN APIs ====================

    /**
     * Lấy danh sách voucher còn hạn (MẶC ĐỊNH cho admin)
     * Endpoint: GET /api/vouchers/admin
     */
    getVouchers: async () => {
        console.log('🔄 Calling GET /vouchers/admin (active vouchers only)');
        try {
            const response = await axiosInstance.get('/vouchers/admin');
            console.log('✅ getVouchers response:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ getVouchers error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy TẤT CẢ voucher (bao gồm hết hạn + đã ẩn)
     * Endpoint: GET /api/vouchers/admin/all
     */
    getAllVouchers: async () => {
        console.log('🔄 Calling GET /vouchers/admin/all');
        try {
            const response = await axiosInstance.get('/vouchers/admin/all');
            console.log('✅ getAllVouchers response:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ getAllVouchers error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy thống kê voucher
     * Endpoint: GET /api/vouchers/admin/stats
     * @returns {{ activeCount, hiddenCount, totalCount }}
     */
    getStats: async () => {
        console.log('🔄 Calling GET /vouchers/admin/stats');
        const response = await axiosInstance.get('/vouchers/admin/stats');
        return unwrapResponse(response);
    },

    /**
     * Lấy chi tiết voucher theo ID
     * Endpoint: GET /api/vouchers/admin/{id}
     */
    getVoucherById: async (id) => {
        const response = await axiosInstance.get(`/vouchers/admin/${id}`);
        return unwrapResponse(response);
    },

    /**
     * Tạo voucher mới
     * Endpoint: POST /api/vouchers/admin/create
     */
    createVoucher: async (voucherData) => {
        console.log('📤 Creating voucher:', voucherData);
        const response = await axiosInstance.post('/vouchers/admin/create', voucherData);
        return unwrapResponse(response);
    },

    /**
     * Cập nhật voucher
     * Endpoint: PUT /api/vouchers/admin/{id}
     */
    updateVoucher: async (id, voucherData) => {
        console.log('📤 Updating voucher:', id, voucherData);
        const response = await axiosInstance.put(`/vouchers/admin/${id}`, voucherData);
        return unwrapResponse(response);
    },

    /**
     * Ẩn voucher (Soft Delete)
     * Endpoint: DELETE /api/vouchers/admin/{id}
     * Response: { message: "Đã ẩn voucher" }
     */
    hideVoucher: async (id) => {
        console.log(`🗑️ Hiding voucher with ID: ${id}`);
        const response = await axiosInstance.delete(`/vouchers/admin/${id}`);
        console.log('✅ Hide voucher response:', response.data);
        return unwrapResponse(response);
    },

    /**
     * Xóa vĩnh viễn voucher (Hard Delete - không khuyến khích)
     * Endpoint: DELETE /api/vouchers/admin/{id}/permanent
     */
    deleteVoucherPermanent: async (id) => {
        console.log(`🗑️ Permanently deleting voucher with ID: ${id}`);
        const response = await axiosInstance.delete(`/vouchers/admin/${id}/permanent`);
        console.log('✅ Permanent delete response:', response.data);
        return unwrapResponse(response);
    },

    /**
     * Bật/tắt trạng thái voucher (Toggle)
     * Dùng để khôi phục voucher đã ẩn
     * Endpoint: PATCH /api/vouchers/admin/{id}/toggle
     */
    toggleVoucher: async (id) => {
        console.log(`🔄 Toggling voucher status with ID: ${id}`);
        const response = await axiosInstance.patch(`/vouchers/admin/${id}/toggle`);
        console.log('✅ Toggle voucher response:', response.data);
        return unwrapResponse(response);
    },

    // Alias for backward compatibility
    deleteVoucher: async (id) => {
        return voucherApi.hideVoucher(id);
    },

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Tính số tiền được giảm từ voucher
     */
    calculateDiscount: (voucher, orderTotal) => {
        if (!voucher || voucher.isExpired) return 0;
        if (orderTotal < voucher.minOrderValue) return 0;

        let discount = 0;

        if (voucher.isPercent) {
            discount = orderTotal * (voucher.discountValue / 100);
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        } else {
            discount = voucher.discountValue;
        }

        return Math.min(discount, orderTotal);
    },

    /**
     * Format hiển thị voucher
     */
    formatVoucherDisplay: (voucher) => {
        if (voucher.isPercent) {
            let text = `Giảm ${voucher.discountValue}%`;
            if (voucher.maxDiscount) {
                text += ` (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}đ)`;
            }
            return text;
        } else {
            return `Giảm ${voucher.discountValue.toLocaleString('vi-VN')}đ`;
        }
    },

    /**
     * Kiểm tra voucher có thể dùng cho đơn hàng không
     */
    canUseVoucher: (voucher, orderTotal) => {
        if (!voucher) {
            return { canUse: false, message: 'Voucher không tồn tại' };
        }
        if (voucher.isExpired) {
            return { canUse: false, message: 'Voucher đã hết hạn' };
        }
        if (!voucher.isActive) {
            return { canUse: false, message: 'Voucher đã bị vô hiệu hóa' };
        }
        if (orderTotal < voucher.minOrderValue) {
            return {
                canUse: false,
                message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`
            };
        }
        return { canUse: true, message: 'Có thể sử dụng' };
    },
};

export default voucherApi;
