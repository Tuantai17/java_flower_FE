/**
 * ========================================
 * useCheckout Hook
 * ========================================
 * 
 * Custom hook quản lý state và logic cho trang Checkout
 * Tách biệt logic khỏi component để dễ test và tái sử dụng
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import orderService, { ValidationError } from '../services/orderService';

/**
 * Hook quản lý Checkout flow
 */
export const useCheckout = () => {
    const navigate = useNavigate();
    const { state, cartTotal, cartCount, clearCart } = useApp();
    const { cart } = state;
    const { user, isAuthenticated } = useAuth();

    // === STATE ===

    // Form data
    const [formData, setFormData] = useState(() =>
        orderService.createInitialFormData(user)
    );

    // Form errors
    const [errors, setErrors] = useState({});

    // Voucher
    const [appliedVoucher, setAppliedVoucher] = useState(null);

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

    // Load voucher from session storage
    useEffect(() => {
        const savedVoucher = sessionStorage.getItem('appliedVoucher');
        if (savedVoucher) {
            try {
                setAppliedVoucher(JSON.parse(savedVoucher));
            } catch (e) {
                console.error('Error parsing voucher:', e);
            }
        }
    }, []);

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

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [cart, navigate, orderSuccess]);

    // === CALCULATED VALUES ===

    const shippingFee = 0; // Free shipping
    const discountAmount = appliedVoucher?.discountAmount || 0;
    const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

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
     * Validate form
     */
    const validateForm = useCallback(() => {
        const validation = orderService.validateCheckoutForm(formData);
        setErrors(validation.errors);
        return validation.isValid;
    }, [formData]);

    /**
     * Handle checkout submit
     */
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        setApiError('');

        // Check authentication
        if (!isAuthenticated) {
            setApiError('Vui lòng đăng nhập để tiến hành đặt hàng');
            return;
        }

        // Validate form
        if (!validateForm()) {
            setApiError('Vui lòng kiểm tra lại thông tin đơn hàng');
            return;
        }

        setLoading(true);

        try {
            const result = await orderService.performCheckout({
                formData,
                cart,
                appliedVoucher,
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
            sessionStorage.removeItem('appliedVoucher');
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
        appliedVoucher,
        clearCart,
    ]);

    /**
     * Apply voucher code
     */
    const applyVoucher = useCallback((voucher) => {
        setAppliedVoucher(voucher);
        sessionStorage.setItem('appliedVoucher', JSON.stringify(voucher));
        setFormData(prev => ({ ...prev, voucherCode: voucher.code }));
    }, []);

    /**
     * Remove applied voucher
     */
    const removeVoucher = useCallback(() => {
        setAppliedVoucher(null);
        sessionStorage.removeItem('appliedVoucher');
        setFormData(prev => ({ ...prev, voucherCode: '' }));
    }, []);

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

        // Voucher
        appliedVoucher,
        discountAmount,

        // Calculated values
        shippingFee,
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
        applyVoucher,
        removeVoucher,
        resetForm,

        // Setters for direct access
        setFormData,
        setErrors,
        setApiError,
    };
};

export default useCheckout;
