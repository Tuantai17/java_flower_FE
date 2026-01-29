/**
 * ========================================
 * useCheckout Hook
 * ========================================
 * 
 * Custom hook quản lý state và logic cho trang Checkout
 * Tách biệt logic khỏi component để dễ test và tái sử dụng
 * 
 * Version 2.0: Hỗ trợ:
 * - Tính phí ship động từ API
 * - 2 voucher: ORDER (giảm tiền hàng) + SHIPPING (giảm phí ship)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import orderService, { ValidationError } from '../services/orderService';
import { shippingApi } from '../api/shippingApi';

/**
 * Hook quản lý Checkout flow
 */
export const useCheckout = () => {
    const navigate = useNavigate();
    const { state, cartTotal, cartCount, clearCart, showNotification } = useApp();
    const { cart } = state;
    const { user, isAuthenticated } = useAuth();

    // === STATE ===

    // Form data
    const [formData, setFormData] = useState(() =>
        orderService.createInitialFormData(user)
    );

    // Form errors
    const [errors, setErrors] = useState({});

    // === VOUCHER STATE (2 loại) ===
    const [orderVoucherCode, setOrderVoucherCode] = useState('');
    const [shippingVoucherCode, setShippingVoucherCode] = useState('');

    // === SHIPPING STATE (từ API) ===
    const [shippingData, setShippingData] = useState({
        shippingFee: 0,
        originalFee: 0,
        isFreeShip: false,
        freeShipThreshold: 0,
        amountToFreeShip: 0,
        estimatedTime: '',
        zone: null,
        zoneName: '',
    });
    const [shippingLoading, setShippingLoading] = useState(false);

    // === PREVIEW STATE (tổng với voucher) ===
    const [previewData, setPreviewData] = useState({
        orderDiscount: 0,
        shippingDiscount: 0,
        shippingFinal: 0,
        grandTotal: 0,
        warnings: [],
    });
    // eslint-disable-next-line no-unused-vars
    const _setPreviewData = setPreviewData; // Sẽ dùng khi tích hợp API preview

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    // API error
    const [apiError, setApiError] = useState('');

    // Success state
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);

    // Districts based on province
    const [availableDistricts, setAvailableDistricts] = useState([]);

    // === EFFECTS ===

    // Pre-fill form when user data changes
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                senderName: user.fullName || user.username || prev.senderName,
                senderPhone: user.phone || user.phoneNumber || prev.senderPhone,
                senderEmail: user.email || prev.senderEmail,
                addressDetail: user.address || prev.addressDetail,
            }));
        }
    }, [isAuthenticated, user]);

    // Update districts when province changes
    useEffect(() => {
        if (formData.province) {
            const province = orderService.PROVINCES.find(p => p.name === formData.province);
            const districts = orderService.getDistrictsByProvince(province?.id || 'default');
            setAvailableDistricts(districts);
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.province]);

    // === EFFECT: Tính phí ship từ API khi district thay đổi ===
    useEffect(() => {
        if (!formData.district || cartTotal <= 0) {
            return;
        }

        const calculateShipping = async () => {
            setShippingLoading(true);
            try {
                const response = await shippingApi.calculate({
                    city: 'TPHCM',
                    district: formData.district,
                    subtotal: cartTotal,
                    deliveryType: 'STANDARD',
                });

                if (response.success && response.data) {
                    setShippingData({
                        shippingFee: response.data.shippingFee,
                        originalFee: response.data.originalFee,
                        isFreeShip: response.data.isFreeShip,
                        freeShipThreshold: response.data.freeShipThreshold,
                        amountToFreeShip: response.data.amountToFreeShip,
                        estimatedTime: response.data.estimatedTime,
                        zone: response.data.zone,
                        zoneName: response.data.zoneName,
                    });
                }
            } catch (error) {
                console.error('Calculate shipping error:', error);
                // Fallback to local calculation
                const localFee = orderService.calculateShippingFee(formData.district, cartTotal);
                setShippingData(prev => ({
                    ...prev,
                    shippingFee: localFee,
                    originalFee: localFee,
                }));
            } finally {
                setShippingLoading(false);
            }
        };

        calculateShipping();
    }, [formData.district, cartTotal]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [cart, navigate, orderSuccess]);

    // === CALCULATED VALUES ===
    
    // Sử dụng phí ship từ API (hoặc fallback local)
    const shippingFee = shippingData.shippingFee;
    const discountAmount = previewData.orderDiscount + previewData.shippingDiscount;
    const finalTotal = previewData.grandTotal > 0 
        ? previewData.grandTotal 
        : Math.max(0, cartTotal + shippingFee);

    // === HANDLERS ===

    /**
     * Handle form field change
     */
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Special handling: copy sender info to recipient
            if (name === 'sameAsSender' && checked) {
                updated.recipientName = prev.senderName;
                updated.recipientPhone = prev.senderPhone;
            }

            // Reset district when province changes
            if (name === 'province') {
                updated.district = '';
            }

            return updated;
        });

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Clear API error
        setApiError('');
    }, [errors]);

    /**
     * Set multiple form fields at once
     */
    const setFormFields = useCallback((fields) => {
        setFormData(prev => ({ ...prev, ...fields }));
    }, []);

    /**
     * Áp dụng voucher - gọi API checkout/preview để tính giảm giá
     */
    const applyVouchers = useCallback(async () => {
        if (!formData.district) {
            showNotification('warning', 'Vui lòng chọn quận/huyện trước');
            return;
        }

        if (!orderVoucherCode && !shippingVoucherCode) {
            showNotification('warning', 'Vui lòng nhập mã giảm giá');
            return;
        }

        setShippingLoading(true);
        try {
            const response = await shippingApi.checkoutPreview({
                subtotal: cartTotal,
                district: formData.district,
                deliveryType: 'STANDARD',
                vouchers: {
                    orderVoucherCode: orderVoucherCode || null,
                    shippingVoucherCode: shippingVoucherCode || null,
                },
            });

            if (response.success && response.data) {
                setPreviewData({
                    orderDiscount: response.data.orderDiscount || 0,
                    shippingDiscount: response.data.shippingDiscount || 0,
                    shippingFinal: response.data.shippingFinal || shippingData.shippingFee,
                    grandTotal: response.data.grandTotal || 0,
                    warnings: response.data.warnings || [],
                    appliedVouchers: response.data.appliedVouchers || [],
                });

                // Update shipping fee if applicable
                if (response.data.shippingFinal !== undefined) {
                    setShippingData(prev => ({
                        ...prev,
                        shippingFee: response.data.shippingFinal,
                    }));
                }

                if (response.data.orderDiscount > 0 || response.data.shippingDiscount > 0) {
                    showNotification('success', 'Đã áp dụng mã giảm giá thành công!');
                } else if (response.data.warnings?.length > 0) {
                    showNotification('warning', response.data.warnings[0]);
                }
            }
        } catch (error) {
            console.error('Apply voucher error:', error);
            showNotification('error', error.message || 'Không thể áp dụng mã giảm giá');
        } finally {
            setShippingLoading(false);
        }
    }, [formData.district, orderVoucherCode, shippingVoucherCode, cartTotal, showNotification, shippingData.shippingFee]);


    /**
     * Validate form
     */
    const validateForm = useCallback(() => {
        const validation = orderService.validateCheckoutForm(formData);
        setErrors(validation.errors);
        return validation;
    }, [formData]);

    /**
     * Handle checkout submit
     */
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        setApiError('');

        // Check authentication
        if (!isAuthenticated) {
            showNotification({
                type: 'error',
                message: 'Vui lòng đăng nhập để tiến hành đặt hàng'
            });
            return;
        }

        // Validate form
        const validation = validateForm();
        if (!validation.isValid) {
            // Mapping field names to friendly names
            const fieldNames = {
                senderName: 'Tên người gửi',
                senderPhone: 'SĐT người gửi',
                recipientName: 'Tên người nhận',
                recipientPhone: 'SĐT người nhận',
                province: 'Tỉnh/Thành phố',
                district: 'Quận/Huyện',
                addressDetail: 'Địa chỉ chi tiết',
                deliveryDate: 'Ngày giao hàng',
                deliveryTime: 'Giờ giao hàng'
            };

            const missingFields = Object.keys(validation.errors)
                .map(key => fieldNames[key] || key)
                .join(', ');

            showNotification({
                type: 'error',
                message: 'Vui lòng điền đầy đủ: ' + missingFields,
                duration: 5000
            });
            
            return;
        }

        setLoading(true);

        try {
            // Tạo voucher object từ codes mới
            const voucherData = {
                orderVoucherCode: orderVoucherCode || null,
                shippingVoucherCode: shippingVoucherCode || null,
            };

            const result = await orderService.performCheckout({
                formData: {
                    ...formData,
                    // Thêm voucher codes vào formData
                    orderVoucherCode,
                    shippingVoucherCode,
                    // Thêm phí ship đã tính
                    shippingFee: shippingData?.shippingFee || 0,
                },
                cart,
                appliedVoucher: voucherData, // Truyền voucher data mới
                onProgress: setLoadingText,
            });

            // Handle payment redirect
            if (result.needsRedirect && result.paymentUrl) {
                // Delay để user thấy loading message
                setTimeout(() => {
                    window.location.href = result.paymentUrl;
                }, 500);
                return;
            }

            // Success - COD or fallback
            clearCart();
            setOrderData(result.orderData);
            setOrderSuccess(true);

        } catch (error) {
            console.error('❌ Checkout error:', error);

            if (error instanceof ValidationError) {
                setErrors(error.errors);
                setApiError(error.message);
            } else {
                const parsedError = orderService.parseApiError(error);
                setApiError(parsedError.message);
            }

        } finally {
            setLoading(false);
            setLoadingText('');
        }
    }, [
        isAuthenticated,
        validateForm,
        formData,
        cart,
        orderVoucherCode,
        shippingVoucherCode,
        shippingData,
        clearCart,
    ]);

    /**
     * Reset form
     */
    const resetForm = useCallback(() => {
        setFormData(orderService.createInitialFormData(user));
        setErrors({});
        setApiError('');
    }, [user]);

    // === RETURN ===

    return {
        // State
        formData,
        errors,
        loading,
        loadingText,
        apiError,
        orderSuccess,
        orderData,

        // Cart data
        cart,
        cartTotal,
        cartCount,

        // === SHIPPING (từ API) ===
        shippingData,        // { shippingFee, isFreeShip, freeShipThreshold, estimatedTime, zone, ... }
        shippingFee,         // Shortcut: shippingData.shippingFee
        shippingLoading,     // Đang loading shipping

        // === VOUCHER (2 loại) ===
        orderVoucherCode,
        shippingVoucherCode,
        setOrderVoucherCode,
        setShippingVoucherCode,
        applyVouchers,       // Function để áp dụng voucher
        previewData,         // { orderDiscount, shippingDiscount, grandTotal, warnings }
        discountAmount,      // Tổng giảm giá (order + shipping)

        // Calculated values
        finalTotal,

        // Auth
        isAuthenticated,
        user,

        // Lists
        provinces: orderService.PROVINCES,
        availableDistricts,
        deliveryTimeSlots: orderService.DELIVERY_TIME_SLOTS,

        // Handlers
        handleChange,
        setFormFields,
        handleSubmit,
        validateForm,
        resetForm,

        // Setters for direct access
        setFormData,
        setErrors,
        setApiError,
    };
};

export default useCheckout;
