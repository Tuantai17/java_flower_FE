/**
 * Dashboard Types/Interfaces
 * 
 * Định nghĩa các kiểu dữ liệu cho Dashboard
 * Khớp 100% với Backend DTOs
 * 
 * @version 2.0.0 - Cập nhật theo Backend mới
 */

// ============================================
// QUICK STATS
// ============================================

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalRevenue - Tổng doanh thu
 * @property {number} todayRevenue - Doanh thu hôm nay
 * @property {number} monthRevenue - Doanh thu tháng này
 * @property {number} revenueGrowth - Tỷ lệ tăng trưởng doanh thu (%)
 * @property {number} totalOrders - Tổng số đơn hàng
 * @property {number} todayOrders - Số đơn hàng hôm nay
 * @property {number} pendingOrders - Số đơn chờ xử lý
 * @property {number} ordersGrowth - Tỷ lệ tăng trưởng đơn hàng (%)
 * @property {number} totalProducts - Tổng số sản phẩm
 * @property {number} activeProducts - Số sản phẩm đang bán
 * @property {number} lowStockCount - Số sản phẩm sắp hết hàng
 */

// ============================================
// REVENUE CHART
// ============================================

/**
 * @typedef {Object} RevenueDataPoint
 * @property {string} label - Nhãn hiển thị (ví dụ: "21/12")
 * @property {number} revenue - Doanh thu
 * @property {number} orders - Số đơn hàng
 */

/**
 * @typedef {Object} RevenueChartData
 * @property {string} period - Khoảng thời gian ("7days", "30days", "3months")
 * @property {number} totalRevenue - Tổng doanh thu trong khoảng thời gian
 * @property {number} totalOrders - Tổng số đơn trong khoảng thời gian
 * @property {number} growthPercent - Tỷ lệ tăng trưởng (%)
 * @property {RevenueDataPoint[]} dataPoints - Dữ liệu từng ngày
 */

// ============================================
// ORDER DISTRIBUTION
// ============================================

/**
 * @typedef {Object} OrderSegment
 * @property {string} name - Tên trạng thái (tiếng Việt)
 * @property {string} status - Mã trạng thái (PENDING, COMPLETED,...)
 * @property {number} value - Số lượng đơn
 * @property {number} percentage - Phần trăm (%)
 * @property {string} color - Mã màu hex
 */

/**
 * @typedef {Object} OrderDistribution
 * @property {number} totalOrders - Tổng số đơn hàng
 * @property {OrderSegment[]} segments - Phân đoạn theo trạng thái
 */

// ============================================
// CONSTANTS
// ============================================

/** Màu sắc cho từng trạng thái đơn hàng */
export const ORDER_STATUS_COLORS = {
    PENDING: '#fbbf24',      // Yellow
    CONFIRMED: '#3b82f6',    // Blue
    PREPARING: '#8b5cf6',    // Purple
    SHIPPING: '#6366f1',     // Indigo
    COMPLETED: '#22c55e',    // Green
    CANCELLED: '#ef4444',    // Red
    DELIVERED: '#22c55e',    // Green (same as COMPLETED)
};

/** Nhãn tiếng Việt cho các trạng thái */
export const ORDER_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Đang chuẩn bị',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    DELIVERED: 'Đã giao',
};

/** Các period options */
export const TIME_PERIODS = [
    { key: '7days', label: '7 ngày', days: 7 },
    { key: '30days', label: '30 ngày', days: 30 },
    { key: '3months', label: '3 tháng', days: 90 },
];

/** Dữ liệu mặc định cho Dashboard Stats */
export const DEFAULT_STATS = {
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    ordersGrowth: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockCount: 0,
};

/** Dữ liệu mặc định cho Revenue Chart */
export const DEFAULT_REVENUE_CHART = {
    period: '7days',
    totalRevenue: 0,
    totalOrders: 0,
    growthPercent: 0,
    dataPoints: [],
};

/** Dữ liệu mặc định cho Order Distribution */
export const DEFAULT_ORDER_DISTRIBUTION = {
    totalOrders: 0,
    segments: [],
};
