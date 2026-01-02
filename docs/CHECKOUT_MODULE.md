# Checkout Module Documentation

## Tổng quan

Module Checkout được triển khai theo tài liệu **README_FRONTEND.md (Checkout API)**. Module này bao gồm:

- **CheckoutPage** - Component chính của trang thanh toán
- **useCheckout** - Custom hook quản lý state và logic
- **orderService** - Service xử lý nghiệp vụ, validation, mapping dữ liệu

## Cấu trúc Files

```
src/
├── pages/user/
│   └── CheckoutPage.js          # Component UI chính
├── hooks/
│   └── useCheckout.js           # Custom hook quản lý state
├── services/
│   └── orderService.js          # Service nghiệp vụ & validation
└── api/
    ├── orderApi.js              # API calls cho orders
    └── cartApi.js               # API calls cho cart
```

## Mapping Dữ Liệu (Theo README_FRONTEND.md)

### Thông tin người gửi

| Frontend Field | Backend Key   | Lưu ý                |
| -------------- | ------------- | -------------------- |
| Họ tên         | `senderName`  | Bắt buộc             |
| Điện thoại     | `senderPhone` | Regex: `(0\|+84)xxx` |
| Email          | `senderEmail` | Optional             |

### Thông tin người nhận

| Frontend Field | Backend Key      | Lưu ý    |
| -------------- | ---------------- | -------- |
| Họ tên         | `recipientName`  | Bắt buộc |
| Điện thoại     | `recipientPhone` | Bắt buộc |

### Địa chỉ nhận hàng

| Frontend Field   | Backend Key     | Lưu ý             |
| ---------------- | --------------- | ----------------- |
| Địa chỉ chi tiết | `addressDetail` | Số nhà, tên đường |
| Quận / Huyện     | `district`      | Dropdown          |
| Tỉnh / Thành phố | `province`      | Dropdown          |

### Lịch giao hàng

| Frontend Field | Backend Key    | Lưu ý                    |
| -------------- | -------------- | ------------------------ |
| Ngày giao hàng | `deliveryDate` | Format: `YYYY-MM-DD`     |
| Thời gian giao | `deliveryTime` | Ví dụ: `"16:00 - 20:00"` |

### Khác

| Frontend Field | Backend Key     | Lưu ý                 |
| -------------- | --------------- | --------------------- |
| Lời nhắn       | `note`          | Optional              |
| Mã giảm giá    | `voucherCode`   | Optional              |
| Thanh toán     | `paymentMethod` | `"COD"` hoặc `"MOMO"` |

## Sử dụng

### 1. Component CheckoutPage

Component chính hiển thị UI trang thanh toán, bao gồm:

- **SenderInfoSection** - Thông tin người gửi
- **RecipientInfoSection** - Thông tin người nhận
- **ShippingAddressSection** - Địa chỉ giao hàng
- **DeliveryScheduleSection** - Lịch giao hàng
- **PaymentMethodSection** - Phương thức thanh toán
- **NoteSection** - Lời nhắn
- **OrderSummary** - Tóm tắt đơn hàng

### 2. useCheckout Hook

```javascript
import useCheckout from '../../hooks/useCheckout';

const MyComponent = () => {
    const checkout = useCheckout();

    // State
    const { formData, errors, loading, loadingText, apiError } = checkout;
    const { orderSuccess, orderData } = checkout;

    // Cart data
    const { cart, cartTotal, cartCount } = checkout;

    // Voucher
    const { appliedVoucher, discountAmount } = checkout;

    // Calculated values
    const { shippingFee, finalTotal } = checkout;

    // Lists
    const { provinces, availableDistricts, deliveryTimeSlots } = checkout;

    // Handlers
    const { handleChange, setFormFields, handleSubmit } = checkout;
    const { applyVoucher, removeVoucher, resetForm } = checkout;

    return (/* ... */);
};
```

### 3. orderService

```javascript
import orderService, { ValidationError } from "../../services/orderService";

// Constants
const { DELIVERY_TIME_SLOTS, PROVINCES, DISTRICTS } = orderService;

// Get districts by province
const districts = orderService.getDistrictsByProvince("hcm");

// Validate form
const { isValid, errors } = orderService.validateCheckoutForm(formData);

// Transform form data to API payload
const payload = orderService.transformToCheckoutPayload(
  formData,
  appliedVoucher
);

// Perform checkout
try {
  const result = await orderService.performCheckout({
    formData,
    cart,
    appliedVoucher,
    onProgress: (text) => console.log(text),
  });

  if (result.needsRedirect) {
    window.location.href = result.paymentUrl;
  } else {
    // Show success
  }
} catch (error) {
  if (error instanceof ValidationError) {
    setErrors(error.errors);
  }
}
```

## Checkout Flow

```
1. User điền thông tin
   ↓
2. Click "Đặt hàng"
   ↓
3. Validate form (frontend)
   ↓ (valid)
4. Sync giỏ hàng lên server
   ↓
5. Gọi API POST /orders/checkout
   ↓
6a. COD → Hiển thị trang thành công
6b. MOMO/VNPAY → Redirect đến trang thanh toán
```

## Mã lỗi Backend

| Code                  | Mô tả                                |
| --------------------- | ------------------------------------ |
| `RESOURCE_NOT_FOUND`  | Sản phẩm hoặc Voucher không tồn tại  |
| `STOCK_001`           | Sản phẩm hết hàng trong lúc checkout |
| `AUTH_LOGIN_REQUIRED` | Cần đăng nhập lại (Token hết hạn)    |

## Thêm tỉnh/thành phố mới

Chỉnh sửa file `src/services/orderService.js`:

```javascript
export const PROVINCES = [
  { id: "hcm", name: "Hồ Chí Minh" },
  { id: "hn", name: "Hà Nội" },
  // Thêm tỉnh mới
  { id: "new_province", name: "Tên Tỉnh Mới" },
];

export const DISTRICTS = {
  // ...existing districts
  new_province: [
    { id: "district1", name: "Quận 1" },
    { id: "district2", name: "Quận 2" },
  ],
};
```

## Thêm khung giờ giao hàng mới

```javascript
export const DELIVERY_TIME_SLOTS = [
  { id: "morning", label: "08:00 - 12:00", value: "08:00 - 12:00" },
  // Thêm khung giờ mới
  { id: "custom", label: "20:00 - 22:00", value: "20:00 - 22:00" },
];
```

## Customization

### Thay đổi validation rules

```javascript
// src/services/orderService.js

export const validateCheckoutForm = (formData) => {
  const errors = {};

  // Thêm validation rule mới
  if (formData.deliveryDate) {
    const date = new Date(formData.deliveryDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    if (date > maxDate) {
      errors.deliveryDate = "Không thể đặt trước quá 30 ngày";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Thay đổi UI components

Các components UI được memo-ized và tách biệt, dễ dàng thay thế hoặc customize:

```javascript
// Custom SenderInfoSection
const CustomSenderInfo = memo(({ formData, errors, onChange }) => (
  <div className="custom-style">{/* Your custom UI */}</div>
));

// Sử dụng trong CheckoutPage
<CustomSenderInfo
  formData={checkout.formData}
  errors={checkout.errors}
  onChange={checkout.handleChange}
/>;
```
