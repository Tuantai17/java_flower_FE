/**
 * useCheckoutShipping Hook
 * 
 * Hook quản lý tính phí vận chuyển động và voucher trong checkout
 * Tự động gọi API khi district/subtotal thay đổi
 */

import { useState, useEffect, useCallback } from 'react';
import { shippingApi, checkoutPreviewApi } from '../api/shippingApi';

/**
 * Hook tính phí vận chuyển và preview checkout
 * 
 * @param {Object} options - Các tùy chọn
 * @param {number} options.subtotal - Tổng tiền hàng
 * @param {string} options.district - Quận/huyện đã chọn
 * @param {string} options.deliveryType - Loại giao hàng (STANDARD/RUSH)
 */
const useCheckoutShipping = ({ 
    subtotal = 0, 
    district = '', 
    deliveryType = 'STANDARD' 
} = {}) => {
    // === STATE: Shipping ===
    const [shippingData, setShippingData] = useState({
        shippingFee: 0,
        originalFee: 0,
        isFreeShip: false,
        freeShipThreshold: 0,
        amountToFreeShip: 0,
        estimatedTime: '',
        zone: null,
        zoneName: '',
        ruleId: null,
    });

    // === STATE: Vouchers ===
    const [vouchers, setVouchers] = useState({
        orderVoucherCode: '',
        shippingVoucherCode: '',
    });

    // === STATE: Preview/Totals ===
    const [preview, setPreview] = useState({
        orderDiscount: 0,
        shippingDiscount: 0,
        subtotalAfterDiscount: 0,
        shippingFinal: 0,
        grandTotal: 0,
        appliedVouchers: [],
        warnings: [],
    });

    // === STATE: UI ===
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // === EFFECT: Tính phí ship khi district/subtotal thay đổi ===
    useEffect(() => {
        if (!district || subtotal < 0) {
            return;
        }

        const calculateShipping = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await shippingApi.calculate({
                    city: 'TPHCM',
                    district,
                    subtotal,
                    deliveryType,
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
                        ruleId: response.data.ruleId,
                    });
                }
            } catch (err) {
                console.error('Calculate shipping error:', err);
                setError(err.response?.data?.message || 'Không thể tính phí vận chuyển');
                // Fallback to 0
                setShippingData(prev => ({
                    ...prev,
                    shippingFee: 0,
                    originalFee: 0,
                    isFreeShip: false,
                }));
            } finally {
                setLoading(false);
            }
        };

        calculateShipping();
    }, [district, subtotal, deliveryType]);

    // === FUNCTION: Preview checkout với voucher ===
    const previewCheckout = useCallback(async () => {
        if (!district) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await checkoutPreviewApi.preview({
                district,
                deliveryType,
                subtotal,
                orderVoucherCode: vouchers.orderVoucherCode,
                shippingVoucherCode: vouchers.shippingVoucherCode,
            });

            if (response.success && response.data) {
                setPreview({
                    orderDiscount: response.data.orderDiscount || 0,
                    shippingDiscount: response.data.shippingDiscount || 0,
                    subtotalAfterDiscount: response.data.subtotalAfterDiscount || subtotal,
                    shippingFinal: response.data.shippingFinal || 0,
                    grandTotal: response.data.grandTotal || subtotal,
                    appliedVouchers: response.data.appliedVouchers || [],
                    warnings: response.data.warnings || [],
                });

                // Cập nhật shipping từ preview
                setShippingData(prev => ({
                    ...prev,
                    shippingFee: response.data.shippingFinal || prev.shippingFee,
                }));
            }
        } catch (err) {
            console.error('Preview checkout error:', err);
            setError(err.response?.data?.message || 'Không thể tính tổng tiền');
        } finally {
            setLoading(false);
        }
    }, [district, deliveryType, subtotal, vouchers]);

    // === EFFECT: Preview khi voucher thay đổi ===
    useEffect(() => {
        if (district && (vouchers.orderVoucherCode || vouchers.shippingVoucherCode)) {
            const timeoutId = setTimeout(() => {
                previewCheckout();
            }, 500); // Debounce 500ms

            return () => clearTimeout(timeoutId);
        }
    }, [vouchers, previewCheckout, district]);

    // === FUNCTION: Set voucher ===
    const setOrderVoucher = useCallback((code) => {
        setVouchers(prev => ({ ...prev, orderVoucherCode: code }));
    }, []);

    const setShippingVoucher = useCallback((code) => {
        setVouchers(prev => ({ ...prev, shippingVoucherCode: code }));
    }, []);

    const clearVouchers = useCallback(() => {
        setVouchers({ orderVoucherCode: '', shippingVoucherCode: '' });
        setPreview(prev => ({
            ...prev,
            orderDiscount: 0,
            shippingDiscount: 0,
            appliedVouchers: [],
            warnings: [],
        }));
    }, []);

    // === Tính grandTotal (nếu không có voucher) ===
    const grandTotal = preview.grandTotal > 0 
        ? preview.grandTotal 
        : subtotal + shippingData.shippingFee;

    // === RETURN ===
    return {
        // Shipping data
        shipping: shippingData,
        
        // Vouchers
        vouchers,
        setOrderVoucher,
        setShippingVoucher,
        clearVouchers,

        // Preview/Totals
        preview: {
            ...preview,
            grandTotal,
        },

        // Actions
        previewCheckout,

        // UI state
        loading,
        error,
        
        // Helper values
        isReady: !!district && subtotal >= 0,
    };
};

export default useCheckoutShipping;
