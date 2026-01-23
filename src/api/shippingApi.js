/**
 * Shipping API Service
 * Gọi API tính phí vận chuyển và preview checkout
 */

import axios from 'axios';

// Xử lý API_BASE để tránh duplicate /api
const getBaseUrl = () => {
    const envUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    // Nếu đã có /api ở cuối thì bỏ đi
    return envUrl.replace(/\/api\/?$/, '');
};

const API_BASE = getBaseUrl();

/**
 * API tính phí vận chuyển
 */
const shippingApi = {
    /**
     * Tính phí vận chuyển theo quận/huyện
     * @param {Object} params - { city, district, subtotal, deliveryType }
     * @returns {Promise} ShippingCalculateResponse
     */
    calculate: async ({ city = 'TPHCM', district, subtotal, deliveryType = 'STANDARD' }) => {
        try {
            const response = await axios.post(`${API_BASE}/api/shipping/calculate`, {
                city,
                district,
                subtotal,
                deliveryType,
            });
            return response.data;
        } catch (error) {
            console.error('Error calculating shipping:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách quận/huyện
     * @param {string} city - Thành phố (mặc định TPHCM)
     * @returns {Promise} List of districts
     */
    getDistricts: async (city = 'TPHCM') => {
        try {
            const response = await axios.get(`${API_BASE}/api/shipping/districts`, {
                params: { city }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching districts:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách tên quận/huyện cho dropdown
     * @param {string} city - Thành phố
     * @returns {Promise} List of district names
     */
    getDistrictNames: async (city = 'TPHCM') => {
        try {
            const response = await axios.get(`${API_BASE}/api/shipping/districts/names`, {
                params: { city }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching district names:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra quận có được hỗ trợ không
     * @param {string} district - Tên quận
     * @param {string} city - Thành phố
     * @returns {Promise} { supported: boolean }
     */
    checkSupport: async (district, city = 'TPHCM') => {
        try {
            const response = await axios.get(`${API_BASE}/api/shipping/check-support`, {
                params: { district, city }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking district support:', error);
            throw error;
        }
    },

    /**
     * Preview checkout với voucher - tính tổng tiền sau khi áp dụng mã giảm giá
     * @param {Object} params - { subtotal, district, deliveryType, vouchers }
     * @returns {Promise} CheckoutPreviewResponse
     */
    checkoutPreview: async ({ subtotal, district, deliveryType = 'STANDARD', vouchers = {} }) => {
        try {
            const response = await axios.post(`${API_BASE}/api/checkout/preview`, {
                subtotal,
                district,
                deliveryType,
                vouchers: {
                    orderVoucherCode: vouchers.orderVoucherCode || null,
                    shippingVoucherCode: vouchers.shippingVoucherCode || null,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error previewing checkout:', error);
            throw error;
        }
    },
};

/**
 * API preview checkout với voucher
 */
const checkoutPreviewApi = {
    /**
     * Preview checkout - tính tổng tiền với voucher
     * @param {Object} params - { district, deliveryType, subtotal, vouchers }
     * @returns {Promise} CheckoutPreviewResponse
     */
    preview: async ({ district, deliveryType = 'STANDARD', subtotal, orderVoucherCode, shippingVoucherCode }) => {
        try {
            const response = await axios.post(`${API_BASE}/api/checkout/preview`, {
                district,
                deliveryType,
                subtotal,
                vouchers: {
                    orderVoucherCode: orderVoucherCode || null,
                    shippingVoucherCode: shippingVoucherCode || null,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error previewing checkout:', error);
            throw error;
        }
    },
};

export { shippingApi, checkoutPreviewApi };
export default shippingApi;
