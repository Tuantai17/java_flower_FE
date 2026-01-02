import axiosInstance from "./axiosConfig";

/**
 * ========================================
 * Order API Service
 * ========================================
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

// ====================
// CONSTANTS
// ====================

/**
 * Order Status Constants (match với backend enum)
 */
export const ORDER_STATUS = {
  PENDING: "PENDING", // Chờ xác nhận
  CONFIRMED: "CONFIRMED", // Đã xác nhận
  PROCESSING: "PROCESSING", // Đang xử lý
  DELIVERING: "DELIVERING", // Đang giao hàng
  COMPLETED: "COMPLETED", // Hoàn thành
  CANCELLED: "CANCELLED", // Đã hủy
};

/**
 * Payment Method Constants (match với backend enum)
 */
export const PAYMENT_METHODS = {
  COD: "COD", // Thanh toán khi nhận hàng
  MOMO: "MOMO", // Ví MoMo
  VNPAY: "VNPAY", // VNPay
  BANK_TRANSFER: "BANK_TRANSFER", // Chuyển khoản
};

/**
 * Payment Status Constants
 */
export const PAYMENT_STATUS = {
  PENDING: "PENDING", // Chờ thanh toán
  PAID: "PAID", // Đã thanh toán
  FAILED: "FAILED", // Thanh toán thất bại
  REFUNDED: "REFUNDED", // Đã hoàn tiền
};

/**
 * MoMo Payment Types - Các hình thức thanh toán MoMo
 * Theo MoMo API documentation:
 * - WALLET: Quét mã QR bằng app MoMo
 * - CARD: Thanh toán bằng thẻ ATM/Visa/MasterCard qua MoMo
 */
export const MOMO_TYPES = {
  QR: "WALLET", // Quét mã QR MoMo (captureWallet)
  CARD: "CARD", // Thẻ ATM / Thẻ quốc tế qua MoMo (payWithATM)
};

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Trích xuất paymentUrl từ response
 * Backend có thể trả về paymentUrl ở nhiều vị trí khác nhau
 *
 * @param {Object} data - Response data từ backend
 * @returns {string|null} - Payment URL hoặc null
 */
const extractPaymentUrl = (data) => {
  if (!data) return null;

  // Thử các vị trí có thể chứa paymentUrl
  const possiblePaths = [
    data.paymentUrl,
    data.payment_url,
    data.data?.paymentUrl,
    data.data?.payment_url,
    data.order?.paymentUrl,
    data.order?.payment_url,
  ];

  for (const url of possiblePaths) {
    if (url && typeof url === "string" && url.startsWith("http")) {
      return url;
    }
  }

  return null;
};

/**
 * Unwrap response từ backend
 * Xử lý các dạng response wrapper khác nhau
 *
 * @param {Object} response - Axios response
 * @returns {Object} - Unwrapped data với paymentUrl (nếu có)
 */
const unwrapResponse = (response) => {
  if (!response.data) return null;

  const data = response.data;

  // Nếu response có dạng { data: {...}, success: true, ... }
  if (typeof data === "object" && "data" in data) {
    const innerData = data.data || {};

    // Preserve paymentUrl từ outer level
    const paymentUrl = extractPaymentUrl(data);
    if (paymentUrl) {
      innerData.paymentUrl = paymentUrl;
    }

    return innerData;
  }

  return data;
};

/**
 * Format trạng thái đơn hàng sang tiếng Việt
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: "Chờ xác nhận",
    [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
    [ORDER_STATUS.PROCESSING]: "Đang xử lý",
    [ORDER_STATUS.DELIVERING]: "Đang giao hàng",
    [ORDER_STATUS.COMPLETED]: "Hoàn thành",
    [ORDER_STATUS.CANCELLED]: "Đã hủy",
  };
  return statusMap[status] || status;
};

/**
 * Format phương thức thanh toán sang tiếng Việt
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    [PAYMENT_METHODS.COD]: "Thanh toán khi nhận hàng (COD)",
    [PAYMENT_METHODS.MOMO]: "Ví MoMo",
    [PAYMENT_METHODS.VNPAY]: "VNPay",
    [PAYMENT_METHODS.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
  };
  return methodMap[method] || method;
};

/**
 * Lấy màu badge cho trạng thái
 */
export const getStatusColor = (status) => {
  const colorMap = {
    [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-700",
    [ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-700",
    [ORDER_STATUS.PROCESSING]: "bg-purple-100 text-purple-700",
    [ORDER_STATUS.DELIVERING]: "bg-indigo-100 text-indigo-700",
    [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-700",
    [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  };
  return colorMap[status] || "bg-gray-100 text-gray-700";
};

/**
 * Kiểm tra đơn hàng có thể hủy không
 */
export const canCancelOrder = (status) => {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
};

// ====================
// API FUNCTIONS
// ====================

const orderApi = {
  // ==================== USER APIs ====================

  /**
   * Tạo đơn hàng mới (Checkout)
   * Endpoint: POST /api/orders/checkout
   *
   * Theo README_FRONTEND.md - Checkout API Documentation:
   *
   * @param {Object} checkoutData - Thông tin checkout
   *
   * === Thông tin người gửi ===
   * @param {string} checkoutData.senderName - Họ tên người gửi (Bắt buộc)
   * @param {string} checkoutData.senderPhone - Số điện thoại người gửi (Regex: 0|+84)
   * @param {string} checkoutData.senderEmail - Email người gửi (Optional)
   *
   * === Thông tin người nhận ===
   * @param {string} checkoutData.recipientName - Họ tên người nhận (Bắt buộc)
   * @param {string} checkoutData.recipientPhone - Số điện thoại người nhận (Bắt buộc)
   *
   * === Địa chỉ giao hàng ===
   * @param {string} checkoutData.addressDetail - Địa chỉ chi tiết (Số nhà, tên đường)
   * @param {string} checkoutData.district - Quận/Huyện
   * @param {string} checkoutData.province - Tỉnh/Thành phố
   * @param {string} checkoutData.shippingAddress - Địa chỉ giao hàng đầy đủ (legacy)
   *
   * === Lịch giao hàng ===
   * @param {string} checkoutData.deliveryDate - Ngày giao (Format: YYYY-MM-DD)
   * @param {string} checkoutData.deliveryTime - Thời gian giao (Ví dụ: "16:00 - 20:00")
   *
   * === Khác ===
   * @param {string} checkoutData.note - Lời nhắn/Ghi chú
   * @param {string} checkoutData.voucherCode - Mã giảm giá
   * @param {string} checkoutData.paymentMethod - Phương thức thanh toán ("COD" hoặc "MOMO")
   *
   * @returns {Promise<Object>} OrderDTO với paymentUrl (nếu là MOMO/VNPAY)
   */
  checkout: async (checkoutData) => {
    console.log("📤 Creating order (checkout):", checkoutData);
    console.log("📤 Payment method:", checkoutData.paymentMethod);

    // Log MoMo specific info
    if (checkoutData.paymentMethod === PAYMENT_METHODS.MOMO) {
      console.log(
        "📤 MoMo Type:",
        checkoutData.momoType || checkoutData.requestType
      );
    }

    try {
      const response = await axiosInstance.post(
        "/orders/checkout",
        checkoutData
      );

      console.log("✅ Raw checkout response:", response.data);

      const data = response.data;

      // Trích xuất paymentUrl
      const paymentUrl = extractPaymentUrl(data);

      // Xử lý đặc biệt cho MOMO
      if (checkoutData.paymentMethod === PAYMENT_METHODS.MOMO) {
        console.log("🔍 Looking for paymentUrl in MOMO response...");

        if (paymentUrl) {
          console.log("✅ Found paymentUrl:", paymentUrl);

          // Trả về object với paymentUrl ở top level
          const result = {
            ...unwrapResponse(response),
            paymentUrl,
          };

          return result;
        } else {
          console.warn("⚠️ No paymentUrl found in MOMO response!");
          console.warn("⚠️ Response structure:", JSON.stringify(data, null, 2));
        }
      }

      return unwrapResponse(response);
    } catch (error) {
      console.error(
        "❌ Checkout error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của user đang đăng nhập
   * Endpoint: GET /api/orders/me
   */
  getMyOrders: async (page = 0, size = 10) => {
    console.log("🔄 Fetching my orders...");
    const response = await axiosInstance.get("/orders/me", {
      params: { page, size },
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
  cancelOrder: async (orderId, reason = "") => {
    console.log(`🔄 Cancelling order #${orderId}...`);
    const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
      reason,
    });
    return unwrapResponse(response);
  },

  // ==================== ADMIN APIs ====================

  /**
   * Lấy tất cả đơn hàng (Admin)
   */
  getAllOrders: async (params = {}) => {
    console.log("🔄 Fetching all orders (admin)...");
    const response = await axiosInstance.get("/admin/orders", { params });
    return unwrapResponse(response);
  },

  /**
   * Lấy chi tiết đơn hàng theo ID (Admin)
   * Endpoint: GET /api/admin/orders/{id}
   * Sử dụng endpoint admin để đảm bảo có quyền xem tất cả đơn hàng
   */
  getAdminOrderById: async (orderId) => {
    console.log(`🔄 Fetching order #${orderId} (admin)...`);
    const response = await axiosInstance.get(`/admin/orders/${orderId}`);
    return unwrapResponse(response);
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  updateOrderStatus: async (orderId, status) => {
    console.log(`🔄 Updating order #${orderId} status to ${status}...`);
    const response = await axiosInstance.put(
      `/admin/orders/${orderId}/status`,
      { status }
    );
    return unwrapResponse(response);
  },

  // ==================== EXPORTED HELPERS ====================
  // (Giữ lại cho backward compatibility)

  formatOrderStatus,
  formatPaymentMethod,
  getStatusColor,
  canCancelOrder,
};

export default orderApi;
