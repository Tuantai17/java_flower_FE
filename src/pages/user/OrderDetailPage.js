import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import orderApi, { ORDER_STATUS, PAYMENT_METHODS } from "../../api/orderApi";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/imageUrl";
import ReviewModal from "../../components/user/ReviewModal";
import CancelOrderModal from "../../components/user/CancelOrderModal";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/**
 * Order Detail Page - Trang chi tiết đơn hàng
 */
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔄 Fetching order detail:", id);
      const data = await orderApi.getOrderById(id);
      console.log("✅ Order detail:", data);
      setOrder(data);
    } catch (err) {
      console.error("❌ Error fetching order:", err);
      setError(
        err.response?.data?.message || "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (reason) => {
    const finalReason = reason || cancelReason;
    if (!finalReason.trim()) {
      alert("Vui lòng chọn hoặc nhập lý do hủy đơn hàng");
      return;
    }

    setCancelling(true);
    try {
      await orderApi.cancelOrder(id, finalReason.trim());
      setShowCancelModal(false);
      setCancelReason("");
      fetchOrderDetail(); // Reload
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  // Open review modal for a product
  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setReviewModalOpen(true);
  };

  // Handle review success
  const handleReviewSuccess = (productId) => {
    setReviewedProducts((prev) => new Set([...prev, productId]));
    setReviewModalOpen(false);
    setSelectedProduct(null);
  };

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Vui lòng đăng nhập
          </h2>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/profile/orders")}
            className="px-6 py-3 bg-rose-500 text-white rounded-full"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  // Extract order data
  const orderCode = order.orderCode || order.order_code || `#${order.id}`;
  const status = order.status || "PENDING";
  const statusInfo = getStatusInfo(status);
  const createdAt = order.createdAt || order.created_at;
  const items = order.items || order.orderItems || [];
  const totalPrice = order.totalPrice || order.total_price || 0;
  const discountAmount = order.discountAmount || order.discount_amount || 0;
  const shippingFee = order.shippingFee || order.shipping_fee || 0;
  const finalPrice = order.finalPrice || order.final_price || totalPrice;

  // Check if order is completed (can review)
  const canReview = status === ORDER_STATUS.COMPLETED;

  return (
    <div className="py-8 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/profile/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại đơn hàng
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Đơn hàng {orderCode}
              </h1>
              <p className="text-gray-500 mt-1">
                {createdAt ? formatDate(createdAt) : ""}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-medium ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-rose-500" />
                Sản phẩm đã đặt
              </h2>
              <div className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <OrderItemRow
                      key={item.id || index}
                      item={item}
                      canReview={canReview}
                      isReviewed={reviewedProducts.has(
                        item.productId || item.product?.id
                      )}
                      onReview={() => openReviewModal(item)}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 py-4">Không có sản phẩm</p>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-rose-500" />
                Trạng thái đơn hàng
              </h2>
              <OrderTimeline status={status} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sender Info - Thông tin người gửi */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-rose-500" />
                Thông tin người gửi
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>{order.senderName || order.customerName || "N/A"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>
                    {order.senderPhone || order.customerPhone || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>
                    {order.senderEmail || order.customerEmail || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Info - Thông tin người nhận */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-rose-500" />
                Thông tin giao hàng
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">
                      {order.recipientName || order.senderName || "N/A"}
                    </span>
                    <p className="text-gray-400 text-xs">Người nhận</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">
                      {order.recipientPhone || order.senderPhone || "N/A"}
                    </span>
                    <p className="text-gray-400 text-xs">SĐT người nhận</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">
                      {order.shippingAddress || buildAddress(order) || "N/A"}
                    </span>
                    <p className="text-gray-400 text-xs">Địa chỉ giao hàng</p>
                  </div>
                </div>
                {(order.deliveryDate || order.deliveryTime) && (
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">
                        {order.deliveryDate &&
                          formatDeliveryDate(order.deliveryDate)}
                        {order.deliveryTime && ` - ${order.deliveryTime}`}
                      </span>
                      <p className="text-gray-400 text-xs">Thời gian giao</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-rose-500" />
                Thanh toán
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí ship</span>
                  <span className="text-green-600">
                    {shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-rose-600">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {orderApi.canCancelOrder(status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircleIcon className="h-5 w-5" />
                {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
              </button>
            )}

            {/* Note */}
            {order.note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Ghi chú:
                </p>
                <p className="text-sm text-yellow-700">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedProduct(null);
        }}
        product={
          selectedProduct
            ? {
                id: selectedProduct.productId || selectedProduct.product?.id,
                name:
                  selectedProduct.productName ||
                  selectedProduct.product_name ||
                  selectedProduct.product?.name,
                imageUrl:
                  selectedProduct.productThumbnail ||
                  selectedProduct.product?.thumbnail,
              }
            : null
        }
        orderId={order?.id}
        onSuccess={() =>
          handleReviewSuccess(
            selectedProduct?.productId || selectedProduct?.product?.id
          )
        }
      />

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          orderCode={orderCode}
          cancelling={cancelling}
          onClose={() => {
            setShowCancelModal(false);
            setCancelReason("");
          }}
          onConfirm={(reason) => {
            setCancelReason(reason);
            handleCancelOrder();
          }}
        />
      )}
    </div>
  );
};

/**
 * Order Item Row - with Review Button
 */
const OrderItemRow = ({ item, canReview, isReviewed, onReview }) => {
  const productName =
    item.productName || item.product_name || item.product?.name || "Sản phẩm";
  const quantity = item.quantity || 1;
  const price = item.price || item.unitPrice || 0;
  const thumbnail = item.productThumbnail || item.product?.thumbnail;

  return (
    <div className="flex gap-4 py-4">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={getImageUrl(thumbnail)}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/64x64/f3f4f6/9ca3af?text=No+Image";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{productName}</p>
        <p className="text-sm text-gray-500">Số lượng: {quantity}</p>

        {/* Review Button */}
        {canReview && (
          <div className="mt-2">
            {isReviewed ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                Đã đánh giá
              </span>
            ) : (
              <button
                onClick={onReview}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all"
              >
                <StarIcon className="h-4 w-4" />
                Đánh giá
              </button>
            )}
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold text-rose-600">
          {formatPrice(price * quantity)}
        </p>
        <p className="text-xs text-gray-400">
          {formatPrice(price)} x {quantity}
        </p>
      </div>
    </div>
  );
};

/**
 * Order Timeline
 */
const OrderTimeline = ({ status }) => {
  const steps = [
    { key: ORDER_STATUS.PENDING, label: "Chờ xác nhận", icon: ClockIcon },
    {
      key: ORDER_STATUS.CONFIRMED,
      label: "Đã xác nhận",
      icon: CheckCircleIcon,
    },
    { key: ORDER_STATUS.PROCESSING, label: "Đang xử lý", icon: ClockIcon },
    { key: ORDER_STATUS.SHIPPING, label: "Đang giao", icon: TruckIcon },
    { key: ORDER_STATUS.COMPLETED, label: "Hoàn thành", icon: CheckCircleIcon },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);
  const isCancelled = status === ORDER_STATUS.CANCELLED;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
        <XCircleIcon className="h-8 w-8 text-red-500" />
        <div>
          <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
          <p className="text-sm text-red-500">
            Đơn hàng này không thể tiếp tục
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isCompleted ? "text-green-500" : "text-gray-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  isCompleted ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-green-500">Trạng thái hiện tại</p>
              )}
            </div>
            {isCompleted && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helpers
const buildAddress = (order) => {
  const parts = [order.addressDetail, order.district, order.province].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join(", ") : null;
};

const formatDeliveryDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getStatusInfo = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: {
      label: "Chờ xác nhận",
      badgeClass: "bg-yellow-100 text-yellow-700",
    },
    [ORDER_STATUS.CONFIRMED]: {
      label: "Đã xác nhận",
      badgeClass: "bg-blue-100 text-blue-700",
    },
    [ORDER_STATUS.PROCESSING]: {
      label: "Đang xử lý",
      badgeClass: "bg-purple-100 text-purple-700",
    },
    [ORDER_STATUS.SHIPPING]: {
      label: "Đang giao hàng",
      badgeClass: "bg-indigo-100 text-indigo-700",
    },
    [ORDER_STATUS.COMPLETED]: {
      label: "Hoàn thành",
      badgeClass: "bg-green-100 text-green-700",
    },
    [ORDER_STATUS.CANCELLED]: {
      label: "Đã hủy",
      badgeClass: "bg-red-100 text-red-700",
    },
  };
  return statusMap[status] || statusMap[ORDER_STATUS.PENDING];
};

const formatPaymentMethod = (method) => {
  const methods = {
    [PAYMENT_METHODS.COD]: "Thanh toán khi nhận hàng",
    [PAYMENT_METHODS.MOMO]: "Ví MoMo",
    [PAYMENT_METHODS.VNPAY]: "VNPay",
    [PAYMENT_METHODS.BANK_TRANSFER]: "Chuyển khoản",
  };
  return methods[method] || method || "COD";
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default OrderDetailPage;
