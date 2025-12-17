// API URLs
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
export const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:8080/api/upload';

// App Info
export const APP_NAME = process.env.REACT_APP_NAME || 'FlowerCorner';
export const HOTLINE = process.env.REACT_APP_HOTLINE || '1900 633 045';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];

// Product Status
export const PRODUCT_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
    OUT_OF_STOCK: -1,
};

export const PRODUCT_STATUS_LABELS = {
    [PRODUCT_STATUS.ACTIVE]: 'Đang bán',
    [PRODUCT_STATUS.INACTIVE]: 'Ngừng bán',
    [PRODUCT_STATUS.OUT_OF_STOCK]: 'Hết hàng',
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPING: 'shipping',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
    [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
    [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
    [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
    [ORDER_STATUS.DELIVERED]: 'Đã giao',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'yellow',
    [ORDER_STATUS.CONFIRMED]: 'blue',
    [ORDER_STATUS.PROCESSING]: 'purple',
    [ORDER_STATUS.SHIPPING]: 'orange',
    [ORDER_STATUS.DELIVERED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red',
};

// Payment Methods
export const PAYMENT_METHODS = {
    COD: 'cod',
    BANK_TRANSFER: 'bank_transfer',
    MOMO: 'momo',
    VNPAY: 'vnpay',
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
    [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
    [PAYMENT_METHODS.VNPAY]: 'VNPay',
};

// Image Placeholder
export const PLACEHOLDER_IMAGE = '/assets/images/placeholder.jpg';

// Sort Options
export const SORT_OPTIONS = [
    { value: 'createdAt-desc', label: 'Mới nhất' },
    { value: 'createdAt-asc', label: 'Cũ nhất' },
    { value: 'price-asc', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
    { value: 'name-asc', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'bestseller', label: 'Bán chạy nhất' },
];

// Price Ranges
export const PRICE_RANGES = [
    { min: 0, max: 500000, label: 'Dưới 500.000đ' },
    { min: 500000, max: 1000000, label: '500.000đ - 1.000.000đ' },
    { min: 1000000, max: 2000000, label: '1.000.000đ - 2.000.000đ' },
    { min: 2000000, max: 5000000, label: '2.000.000đ - 5.000.000đ' },
    { min: 5000000, max: null, label: 'Trên 5.000.000đ' },
];
