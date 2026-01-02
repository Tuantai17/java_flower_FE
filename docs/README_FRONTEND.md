Hướng dẫn Triển khai Frontend (Checkout API)
Tài liệu này tóm tắt các bước cần thiết để tích hợp giao diện Checkout với Backend đã được nâng cấp.

1. Cấu hình API Service (Axios)
   Đảm bảo project có file service để gọi API.

// services/order-service.ts
import axios from 'axios';
const api = axios.create({
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});
// Gửi kèm JWT Token
api.interceptors.request.use((config) => {
const token = localStorage.getItem('token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});
export const checkout = async (orderData: any) => {
const response = await api.post('/orders/checkout', orderData);
return response.data;
}; 2. Mapping Dữ liệu Form (Khớp với UI Mockup)
Frontend Field Backend (JSON) Key Lưu ý
Thông tin người gửi
Họ tên senderName Bắt buộc
Điện thoại senderPhone Regex: [(0
Email senderEmail Optional
Thông tin người nhận
Họ tên recipientName Bắt buộc
Điện thoại recipientPhone Bắt buộc
Địa chỉ nhận hàng
Địa chỉ chi tiết addressDetail Số nhà, tên đường
Quận / Huyện district Dropdown
Tỉnh / Thành phố province Dropdown
Lịch giao hàng
Ngày giao hàng deliveryDate Format: YYYY-MM-DD
Thời gian giao deliveryTime Ví dụ: "16:00 - 20:00"
Khác
Lời nhắn note
Mã giảm giá voucherCode
Thanh toán paymentMethod "COD" hoặc "MOMO" 3. Xử lý logic Checkout
const handleCheckout = async (formData) => {
try {
const result = await checkout(formData);

    if (result.success) {
      // 1. Nếu là MoMo -> Chuyển hướng sang trang thanh toán
      if (result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
        return;
      }
      // 2. Nếu là COD -> Chuyển sang trang thành công
      router.push(`/order/success/${result.data.orderCode}`);
    }

} catch (error) {
// Xử lý lỗi (Hiển thị toast thông báo)
console.error("Lỗi đặt hàng:", error.message);
}
}; 4. Các mã lỗi cần lưu ý (Backend Response)
RESOURCE_NOT_FOUND: Sản phẩm hoặc Voucher không tồn tại.
STOCK_001: Sản phẩm vừa hết hàng trong lúc bạn đang checkout.
AUTH_LOGIN_REQUIRED: Cần đăng nhập lại (Token hết hạn).
