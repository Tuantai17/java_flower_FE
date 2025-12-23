import axiosInstance from './axiosConfig';

/**
 * Stock API Service
 * Quản lý tồn kho cho Admin
 * Base path: /admin/stock
 */

// Helper function để unwrap response từ backend
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    return response.data;
};

const stockApi = {
    /**
     * Điều chỉnh tồn kho (Nhập/Xuất/Sửa)
     * @param {Object} data - { productId, changeQuantity, reason, note }
     * - changeQuantity: Số dương (+) = Tăng kho, Số âm (-) = Giảm kho
     * - reason: IMPORT, EXPORT, ADMIN_ADJUST, DAMAGED, LOST, RETURN, ORDER_FULFILLED, ORDER_CANCELLED
     */
    adjustStock: async (data) => {
        const payload = {
            productId: Number(data.productId),
            changeQuantity: Number(data.changeQuantity),
            reason: data.reason,
            note: data.note || ''
        };

        console.log('📦 Adjusting stock:', payload);
        const response = await axiosInstance.post('/admin/stock/adjust', payload);
        return unwrapResponse(response);
    },

    /**
     * Lấy số lượng tồn kho hiện tại của sản phẩm
     * @param {number} productId - ID sản phẩm
     */
    getCurrentStock: async (productId) => {
        const response = await axiosInstance.get(`/admin/stock/current/${productId}`);
        return unwrapResponse(response);
    },

    /**
     * Kiểm tra tồn kho có đủ số lượng yêu cầu không
     * @param {number} productId - ID sản phẩm
     * @param {number} quantity - Số lượng cần kiểm tra
     */
    checkStock: async (productId, quantity) => {
        const response = await axiosInstance.get(`/admin/stock/check/${productId}`, {
            params: { quantity }
        });
        return unwrapResponse(response);
    },

    /**
     * Lấy lịch sử biến động tồn kho (có phân trang)
     * @param {number} productId - ID sản phẩm
     * @param {number} page - Số trang (0-indexed)
     * @param {number} size - Số bản ghi mỗi trang
     */
    getHistory: async (productId, page = 0, size = 10) => {
        const response = await axiosInstance.get(`/admin/stock/history/${productId}/paged`, {
            params: { page, size }
        });
        return unwrapResponse(response);
    },

    /**
     * Lấy danh sách lý do điều chỉnh kho (để đổ vào dropdown)
     * Returns: ['IMPORT', 'EXPORT', 'ADMIN_ADJUST', 'DAMAGED', 'LOST', 'RETURN', 'ORDER_FULFILLED', 'ORDER_CANCELLED']
     */
    getReasons: async () => {
        const defaultReasons = [
            'IMPORT',          // Nhập hàng
            'EXPORT',          // Xuất hàng
            'ADMIN_ADJUST',    // Điều chỉnh thủ công
            'DAMAGED',         // Hàng hư hỏng
            'LOST',            // Thất lạc
            'RETURN',          // Khách trả hàng
            'ORDER_FULFILLED', // Đơn hàng hoàn thành
            'ORDER_CANCELLED'  // Đơn hàng bị hủy
        ];

        try {
            const response = await axiosInstance.get('/admin/stock/reasons');
            const data = unwrapResponse(response);

            // Normalize response to array of strings
            if (Array.isArray(data) && data.length > 0) {
                // Check if first item is object or string
                if (typeof data[0] === 'object' && data[0] !== null) {
                    // Array of objects {code, displayName} - extract codes
                    return data.map(item => item.code || item.name || String(item));
                } else if (typeof data[0] === 'string') {
                    // Already array of strings
                    return data;
                }
            }

            return defaultReasons;
        } catch (error) {
            // Fallback nếu API chưa có
            console.warn('Stock reasons API not available, using default reasons');
            return defaultReasons;
        }
    },

    /**
     * Lấy thống kê tồn kho (nếu có)
     */
    getStockStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/stock/stats');
            return unwrapResponse(response);
        } catch (error) {
            console.warn('Stock stats API not available');
            return null;
        }
    },

    /**
     * Lấy danh sách sản phẩm sắp hết hàng
     * @param {number} threshold - Ngưỡng cảnh báo (mặc định 10)
     */
    getLowStockProducts: async (threshold = 10) => {
        try {
            const response = await axiosInstance.get('/admin/stock/low-stock', {
                params: { threshold }
            });
            return unwrapResponse(response);
        } catch (error) {
            console.warn('Low stock API not available');
            return [];
        }
    }
};

// Helper object chứa thông tin về các lý do điều chỉnh kho
export const STOCK_REASON_INFO = {
    IMPORT: {
        label: 'Nhập hàng',
        color: 'green',
        icon: '📥',
        description: 'Nhập thêm hàng vào kho'
    },
    EXPORT: {
        label: 'Xuất hàng',
        color: 'blue',
        icon: '📤',
        description: 'Xuất hàng khỏi kho'
    },
    ADMIN_ADJUST: {
        label: 'Điều chỉnh',
        color: 'yellow',
        icon: '✏️',
        description: 'Admin điều chỉnh thủ công'
    },
    DAMAGED: {
        label: 'Hư hỏng',
        color: 'red',
        icon: '💔',
        description: 'Hàng bị hư hỏng'
    },
    LOST: {
        label: 'Thất lạc',
        color: 'red',
        icon: '❓',
        description: 'Hàng bị thất lạc'
    },
    RETURN: {
        label: 'Trả hàng',
        color: 'purple',
        icon: '🔄',
        description: 'Khách hàng trả lại'
    },
    ORDER_FULFILLED: {
        label: 'Bán hàng',
        color: 'blue',
        icon: '🛒',
        description: 'Đơn hàng hoàn thành'
    },
    ORDER_CANCELLED: {
        label: 'Hủy đơn',
        color: 'orange',
        icon: '❌',
        description: 'Đơn hàng bị hủy, hoàn kho'
    }
};

// Helper function để lấy màu badge dựa trên lý do
export const getReasonBadgeColor = (reason) => {
    const info = STOCK_REASON_INFO[reason];
    if (!info) return 'gray';

    const colorMap = {
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        red: 'bg-red-100 text-red-700',
        purple: 'bg-purple-100 text-purple-700',
        orange: 'bg-orange-100 text-orange-700',
        gray: 'bg-gray-100 text-gray-700'
    };

    return colorMap[info.color] || colorMap.gray;
};

// Helper function để lấy label hiển thị
export const getReasonLabel = (reason) => {
    return STOCK_REASON_INFO[reason]?.label || reason;
};

// Helper function để format số lượng thay đổi
export const formatChangeQuantity = (quantity) => {
    if (quantity > 0) {
        return { text: `+${quantity}`, className: 'text-green-600 font-semibold' };
    } else if (quantity < 0) {
        return { text: `${quantity}`, className: 'text-red-600 font-semibold' };
    }
    return { text: '0', className: 'text-gray-600' };
};

export default stockApi;
