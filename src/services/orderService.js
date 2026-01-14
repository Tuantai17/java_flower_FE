/**
 * ========================================
 * Order Service
 * ========================================
 * 
 * Service xử lý logic nghiệp vụ cho Checkout & Orders
 * Tách biệt khỏi API layer để dễ dàng kiểm soát và bảo trì
 * 
 * Theo README_FRONTEND.md - Checkout API Documentation
 */

import orderApi, { PAYMENT_METHODS } from '../api/orderApi';
import cartApi from '../api/cartApi';

/**
 * Checkout Data Mapping theo Backend
 * 
 * Frontend Field           -> Backend (JSON) Key
 * ----------------------------------------
 * Thông tin người gửi:
 *   Họ tên                  -> senderName (Bắt buộc)
 *   Điện thoại              -> senderPhone (Regex: [(0|+84)xxx])
 *   Email                   -> senderEmail (Optional)
 * 
 * Thông tin người nhận:
 *   Họ tên                  -> recipientName (Bắt buộc)
 *   Điện thoại              -> recipientPhone (Bắt buộc)
 * 
 * Địa chỉ nhận hàng:
 *   Địa chỉ chi tiết        -> addressDetail (Số nhà, tên đường)
 *   Quận / Huyện            -> district (Dropdown)
 *   Tỉnh / Thành phố        -> province (Dropdown)
 * 
 * Lịch giao hàng:
 *   Ngày giao hàng          -> deliveryDate (Format: YYYY-MM-DD)
 *   Thời gian giao          -> deliveryTime (Ví dụ: "16:00 - 20:00")
 * 
 * Khác:
 *   Lời nhắn                -> note
 *   Mã giảm giá             -> voucherCode
 *   Thanh toán              -> paymentMethod ("COD" hoặc "MOMO")
 */

// ========================================
// CONSTANTS
// ========================================

/**
 * Danh sách thời gian giao hàng
 */
export const DELIVERY_TIME_SLOTS = [
    { id: 'morning', label: '08:00 - 12:00', value: '08:00 - 12:00' },
    { id: 'afternoon', label: '12:00 - 16:00', value: '12:00 - 16:00' },
    { id: 'evening', label: '16:00 - 20:00', value: '16:00 - 20:00' },
    { id: 'flexible', label: 'Linh hoạt', value: 'Linh hoạt' },
];

/**
 * Danh sách tỉnh/thành phố phổ biến
 */
export const PROVINCES = [
    { id: 'hcm', name: 'Hồ Chí Minh' },
    { id: 'hn', name: 'Hà Nội' },
    { id: 'dn', name: 'Đà Nẵng' },
    { id: 'hp', name: 'Hải Phòng' },
    { id: 'ct', name: 'Cần Thơ' },
    { id: 'bd', name: 'Bình Dương' },
    { id: 'dn2', name: 'Đồng Nai' },
    { id: 'other', name: 'Khác' },
];

/**
 * Danh sách quận/huyện theo tỉnh
 */
export const DISTRICTS = {
    hcm: [
        { id: 'q1', name: 'Quận 1' },
        { id: 'q2', name: 'Quận 2' },
        { id: 'q3', name: 'Quận 3' },
        { id: 'q4', name: 'Quận 4' },
        { id: 'q5', name: 'Quận 5' },
        { id: 'q6', name: 'Quận 6' },
        { id: 'q7', name: 'Quận 7' },
        { id: 'q8', name: 'Quận 8' },
        { id: 'q9', name: 'Quận 9' },
        { id: 'q10', name: 'Quận 10' },
        { id: 'q11', name: 'Quận 11' },
        { id: 'q12', name: 'Quận 12' },
        { id: 'qgv', name: 'Gò Vấp' },
        { id: 'qbt', name: 'Bình Thạnh' },
        { id: 'qpn', name: 'Phú Nhuận' },
        { id: 'qtd', name: 'Thủ Đức' },
        { id: 'qtp', name: 'Tân Phú' },
        { id: 'qbtan', name: 'Bình Tân' },
        { id: 'qcc', name: 'Củ Chi' },
        { id: 'qhm', name: 'Hóc Môn' },
    ],
    hn: [
        { id: 'hk', name: 'Hoàn Kiếm' },
        { id: 'bd', name: 'Ba Đình' },
        { id: 'dd', name: 'Đống Đa' },
        { id: 'tx', name: 'Thanh Xuân' },
        { id: 'cg', name: 'Cầu Giấy' },
        { id: 'ht', name: 'Hai Bà Trưng' },
        { id: 'hm', name: 'Hoàng Mai' },
        { id: 'lb', name: 'Long Biên' },
        { id: 'nl', name: 'Nam Từ Liêm' },
        { id: 'btl', name: 'Bắc Từ Liêm' },
    ],
    default: [
        { id: 'other', name: 'Khác' },
    ],
};

/**
 * Lấy danh sách quận theo tỉnh
 */
export const getDistrictsByProvince = (provinceId) => {
    return DISTRICTS[provinceId] || DISTRICTS.default;
};

// ========================================
// VALIDATION
// ========================================

/**
 * Validate phone number theo chuẩn Việt Nam
 */
export const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
        return { valid: false, message: 'Vui lòng nhập số điện thoại' };
    }

    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

    if (!phoneRegex.test(cleanPhone)) {
        return { valid: false, message: 'Số điện thoại không hợp lệ' };
    }

    return { valid: true, message: '' };
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
    if (!email || !email.trim()) {
        return { valid: true, message: '' }; // Email optional
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Email không hợp lệ' };
    }

    return { valid: true, message: '' };
};

/**
 * Validate checkout form data
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateCheckoutForm = (formData) => {
    const errors = {};

    // === THÔNG TIN NGƯỜI GỬI ===
    if (!formData.senderName?.trim()) {
        errors.senderName = 'Vui lòng nhập họ tên người gửi';
    }

    const senderPhoneValidation = validatePhone(formData.senderPhone);
    if (!senderPhoneValidation.valid) {
        errors.senderPhone = senderPhoneValidation.message;
    }

    const senderEmailValidation = validateEmail(formData.senderEmail);
    if (!senderEmailValidation.valid) {
        errors.senderEmail = senderEmailValidation.message;
    }

    // === THÔNG TIN NGƯỜI NHẬN ===
    if (!formData.recipientName?.trim()) {
        errors.recipientName = 'Vui lòng nhập họ tên người nhận';
    }

    const recipientPhoneValidation = validatePhone(formData.recipientPhone);
    if (!recipientPhoneValidation.valid) {
        errors.recipientPhone = recipientPhoneValidation.message;
    }

    // === ĐỊA CHỈ GIAO HÀNG ===
    if (!formData.addressDetail?.trim()) {
        errors.addressDetail = 'Vui lòng nhập địa chỉ chi tiết';
    }

    if (!formData.province?.trim()) {
        errors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!formData.district?.trim()) {
        errors.district = 'Vui lòng chọn Quận/Huyện';
    }

    // === LỊCH GIAO HÀNG ===
    if (!formData.deliveryDate) {
        errors.deliveryDate = 'Vui lòng chọn ngày giao hàng';
    } else {
        const selectedDate = new Date(formData.deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errors.deliveryDate = 'Ngày giao hàng phải từ hôm nay trở đi';
        }
    }

    if (!formData.deliveryTime) {
        errors.deliveryTime = 'Vui lòng chọn thời gian giao hàng';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// ========================================
// FORM DATA TRANSFORMATION
// ========================================

/**
 * Tạo initial form data với user info pre-filled
 */
export const createInitialFormData = (user = null) => {
    return {
        // Thông tin người gửi
        senderName: user?.fullName || user?.username || '',
        senderPhone: user?.phone || user?.phoneNumber || '',
        senderEmail: user?.email || '',

        // Thông tin người nhận (mặc định giống người gửi)
        recipientName: '',
        recipientPhone: '',
        sameAsSender: false, // Flag để copy thông tin người gửi

        // Địa chỉ giao hàng
        addressDetail: user?.address || '',
        district: '',
        province: '',

        // Tọa độ địa lý (từ OSM/Photon autocomplete)
        addressLine: '', // Địa chỉ đầy đủ từ autocomplete
        lat: null,
        lng: null,
        geoProvider: null,
        placeId: null,

        // Lịch giao hàng
        deliveryDate: '',
        deliveryTime: '',

        // Khác
        note: '',
        voucherCode: '',
        paymentMethod: PAYMENT_METHODS.COD,
        momoType: 'wallet', // Mặc định: QR/Ví MoMo (ổn định nhất)
    };
};

/**
 * Transform form data sang checkout API payload
 * Mapping theo README_FRONTEND.md
 */
export const transformToCheckoutPayload = (formData, appliedVoucher = null) => {
    return {
        // Thông tin người gửi
        senderName: formData.senderName?.trim(),
        senderPhone: formData.senderPhone?.trim(),
        senderEmail: formData.senderEmail?.trim() || null,

        // Thông tin người nhận
        recipientName: formData.recipientName?.trim(),
        recipientPhone: formData.recipientPhone?.trim(),

        // Địa chỉ giao hàng (ghép lại thành chuỗi)
        addressDetail: formData.addressDetail?.trim(),
        district: formData.district?.trim(),
        province: formData.province?.trim(),

        // Full shipping address (cho backend cũ nếu cần)
        shippingAddress: buildFullAddress(formData),

        // Tọa độ địa lý (từ OSM/Photon autocomplete)
        lat: formData.lat || null,
        lng: formData.lng || null,
        geoProvider: formData.geoProvider || null,
        placeId: formData.placeId || null,

        // Lịch giao hàng
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,

        // Khác
        note: formData.note?.trim() || null,
        voucherCode: appliedVoucher?.code || formData.voucherCode?.trim() || null,
        paymentMethod: formData.paymentMethod,
        momoType: formData.momoType || 'wallet', // wallet = QR, card = ATM/Visa

        // Legacy fields cho backward compatibility
        customerName: formData.senderName?.trim(),
        customerPhone: formData.senderPhone?.trim(),
        customerEmail: formData.senderEmail?.trim() || null,
    };
};

/**
 * Build full address từ các thành phần
 */
export const buildFullAddress = (formData) => {
    const parts = [
        formData.addressDetail,
        formData.district,
        formData.province,
    ].filter(Boolean);

    return parts.join(', ');
};

// ========================================
// CHECKOUT PROCESS
// ========================================

/**
 * Thực hiện checkout
 * 
 * Flow:
 * 1. Validate form data
 * 2. Sync cart lên server
 * 3. Gọi API checkout
 * 4. Xử lý response (redirect nếu MOMO/VNPAY)
 * 
 * @param {Object} params
 * @param {Object} params.formData - Dữ liệu form checkout
 * @param {Array} params.cart - Giỏ hàng từ local
 * @param {Object} params.appliedVoucher - Voucher đã áp dụng
 * @param {Function} params.onProgress - Callback báo tiến trình
 * 
 * @returns {Promise<Object>} Kết quả checkout
 */
export const performCheckout = async ({
    formData,
    cart,
    appliedVoucher,
    onProgress = () => {},
}) => {
    // Step 1: Validate
    onProgress('Đang kiểm tra thông tin...');
    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
        throw new ValidationError('Vui lòng kiểm tra lại thông tin', validation.errors);
    }

    // Step 2: Sync cart
    onProgress('Đang đồng bộ giỏ hàng...');
    try {
        await cartApi.ensureCartSynced(cart);
        console.log('✅ Cart synced successfully');
    } catch (syncError) {
        console.warn('⚠️ Cart sync warning:', syncError.message);
        // Continue - backend might already have cart
    }

    // Step 3: Transform data & checkout
    onProgress('Đang tạo đơn hàng...');
    const checkoutPayload = transformToCheckoutPayload(formData, appliedVoucher);

    console.log('📤 Checkout payload:', checkoutPayload);

    const result = await orderApi.checkout(checkoutPayload);

    console.log('✅ Checkout result:', result);

    // Step 4: Handle payment redirect
    if (result.paymentUrl && formData.paymentMethod !== PAYMENT_METHODS.COD) {
        onProgress('Đang chuyển đến trang thanh toán...');
        return {
            success: true,
            needsRedirect: true,
            paymentUrl: result.paymentUrl,
            orderData: result,
        };
    }

    // COD or fallback
    return {
        success: true,
        needsRedirect: false,
        paymentUrl: null,
        orderData: result,
    };
};

// ========================================
// ERROR HANDLING
// ========================================

/**
 * Custom Validation Error
 */
export class ValidationError extends Error {
    constructor(message, errors = {}) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Parse error message từ API response
 */
export const parseApiError = (error) => {
    if (error instanceof ValidationError) {
        return {
            message: error.message,
            errors: error.errors,
            code: 'VALIDATION_ERROR',
        };
    }

    const response = error.response?.data;

    // Các mã lỗi đặc biệt từ backend
    const errorCodes = {
        'RESOURCE_NOT_FOUND': 'Sản phẩm hoặc Voucher không tồn tại.',
        'STOCK_001': 'Sản phẩm vừa hết hàng trong lúc bạn đang checkout.',
        'AUTH_LOGIN_REQUIRED': 'Cần đăng nhập lại (Token hết hạn).',
    };

    const code = response?.code || response?.errorCode;
    if (code && errorCodes[code]) {
        return {
            message: errorCodes[code],
            code,
        };
    }

    return {
        message: response?.message || response?.error || error.message || 'Đặt hàng thất bại. Vui lòng thử lại.',
        code: 'UNKNOWN_ERROR',
    };
};

// ========================================
// EXPORTS
// ========================================

const orderService = {
    // Constants
    DELIVERY_TIME_SLOTS,
    PROVINCES,
    DISTRICTS,
    getDistrictsByProvince,

    // Validation
    validatePhone,
    validateEmail,
    validateCheckoutForm,

    // Form helpers
    createInitialFormData,
    transformToCheckoutPayload,
    buildFullAddress,

    // Checkout
    performCheckout,

    // Error handling
    ValidationError,
    parseApiError,
};

export default orderService;
