import React, { useState, useEffect } from 'react';
import { TicketIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import authService from '../../api/authService';

// Xử lý API_BASE để tránh duplicate /api
const getApiBase = () => {
    const envUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    return envUrl.replace(/\/api\/?$/, '');
};

// API để lấy voucher đã lưu (sử dụng endpoint đúng từ backend)
const fetchSavedVouchers = async (token) => {
    if (!token) {
        console.log('No token provided');
        return [];
    }
    try {
        // Endpoint đúng: /api/vouchers/my-vouchers/available (chỉ lấy voucher còn dùng được)
        const response = await fetch(`${getApiBase()}/api/vouchers/my-vouchers/available`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Saved vouchers response:', data);
            return data.data || data || [];
        }
        console.log('Failed to fetch vouchers:', response.status);
        return [];
    } catch (error) {
        console.error('Error fetching saved vouchers:', error);
        return [];
    }
};

/**
 * VoucherInputSection Component
 * 
 * Hiển thị 2 ô nhập voucher: ORDER (giảm tiền hàng) và SHIPPING (giảm phí ship)
 * Cho phép áp dụng đồng thời 2 voucher
 * Có thể nhập mã HOẶC chọn từ danh sách đã lưu
 */
const VoucherInputSection = ({
    orderVoucherCode,
    shippingVoucherCode,
    onOrderVoucherChange,
    onShippingVoucherChange,
    previewData,
    shippingData,
    onApplyVouchers,
    loading,
}) => {
    const { isAuthenticated } = useAuth();
    
    // State
    const [savedVouchers, setSavedVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [showOrderPicker, setShowOrderPicker] = useState(false);
    const [showShippingPicker, setShowShippingPicker] = useState(false);

    const hasOrderDiscount = previewData?.orderDiscount > 0;
    const hasShippingDiscount = previewData?.shippingDiscount > 0;
    const warnings = previewData?.warnings || [];

    // Fetch saved vouchers khi component mount
    useEffect(() => {
        if (isAuthenticated) {
            // Lấy token trực tiếp từ authService
            const token = authService.getUserToken();
            console.log('Auth state:', { isAuthenticated, hasToken: !!token });
            
            if (token) {
                setLoadingVouchers(true);
                fetchSavedVouchers(token)
                    .then(vouchers => {
                        console.log('Loaded vouchers:', vouchers);
                        setSavedVouchers(vouchers);
                    })
                    .finally(() => setLoadingVouchers(false));
            }
        }
    }, [isAuthenticated]);

    // Phân loại voucher theo type từ SavedVoucherDTO.voucherType
    // ORDER: Giảm giá đơn hàng (tiền sản phẩm)
    // SHIPPING: Giảm phí vận chuyển
    const orderVouchers = savedVouchers.filter(v => {
        const type = v.voucherType;
        // Nếu không có type hoặc type = ORDER thì vào danh sách ORDER
        const isOrder = !type || type === 'ORDER';
        console.log(`Voucher ${v.code}: type=${type}, isOrder=${isOrder}`);
        return isOrder;
    });
    const shippingVouchers = savedVouchers.filter(v => {
        const type = v.voucherType;
        // Chỉ voucher có type = SHIPPING mới vào danh sách SHIPPING
        return type === 'SHIPPING';
    });
    
    console.log('Order vouchers:', orderVouchers.map(v => v.code));
    console.log('Shipping vouchers:', shippingVouchers.map(v => v.code));

    // Handle select voucher - SavedVoucherDTO có field code trực tiếp
    const handleSelectOrderVoucher = (voucher) => {
        const code = voucher.code || voucher.voucher?.code;
        if (code) {
            onOrderVoucherChange(code);
        }
        setShowOrderPicker(false);
    };

    const handleSelectShippingVoucher = (voucher) => {
        const code = voucher.code || voucher.voucher?.code;
        if (code) {
            onShippingVoucherChange(code);
        }
        setShowShippingPicker(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <TicketIcon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Mã giảm giá</h2>
                    <p className="text-sm text-gray-500">Bạn có thể áp dụng 2 mã cùng lúc</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* === VOUCHER ORDER (Giảm tiền hàng) === */}
                <VoucherTypeInput
                    type="ORDER"
                    label="🛒 Mã giảm giá đơn hàng"
                    placeholder="Nhập mã giảm giá..."
                    value={orderVoucherCode}
                    onChange={onOrderVoucherChange}
                    onApply={onApplyVouchers}
                    hasDiscount={hasOrderDiscount}
                    discountAmount={previewData?.orderDiscount}
                    savedVouchers={orderVouchers}
                    showPicker={showOrderPicker}
                    onTogglePicker={() => setShowOrderPicker(!showOrderPicker)}
                    onSelectVoucher={handleSelectOrderVoucher}
                    loadingVouchers={loadingVouchers}
                    isAuthenticated={isAuthenticated}
                    loading={loading}
                />

                {/* === VOUCHER SHIPPING (Giảm phí ship) === */}
                <VoucherTypeInput
                    type="SHIPPING"
                    label="🚚 Mã giảm phí vận chuyển"
                    placeholder="Nhập mã giảm phí ship..."
                    value={shippingVoucherCode}
                    onChange={onShippingVoucherChange}
                    onApply={onApplyVouchers}
                    hasDiscount={hasShippingDiscount}
                    discountAmount={previewData?.shippingDiscount}
                    savedVouchers={shippingVouchers}
                    showPicker={showShippingPicker}
                    onTogglePicker={() => setShowShippingPicker(!showShippingPicker)}
                    onSelectVoucher={handleSelectShippingVoucher}
                    loadingVouchers={loadingVouchers}
                    isAuthenticated={isAuthenticated}
                    disabled={shippingData?.isFreeShip}
                    disabledMessage="Đơn hàng đã được miễn phí vận chuyển"
                    loading={loading}
                />

                {/* Warnings */}
                {warnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        {warnings.map((warning, index) => (
                            <p key={index} className="text-yellow-700 text-sm flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {warning}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * VoucherTypeInput - Component nhập/chọn voucher cho 1 loại
 */
const VoucherTypeInput = ({
    type,
    label,
    placeholder,
    value,
    onChange,
    onApply,
    hasDiscount,
    discountAmount,
    savedVouchers = [],
    showPicker,
    onTogglePicker,
    onSelectVoucher,
    loadingVouchers,
    isAuthenticated,
    disabled,
    disabledMessage,
    loading,
}) => {
    const [showInput, setShowInput] = useState(false);

    if (disabled) {
        return (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-500">{label}</span>
                </div>
                <p className="text-green-600 text-sm">✅ {disabledMessage}</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">{label}</span>
                {hasDiscount && (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Đã áp dụng
                    </span>
                )}
            </div>

            {/* Input field + Apply button */}
            {(showInput || value) ? (
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm uppercase"
                    />
                    {value && !hasDiscount && onApply && (
                        <button
                            type="button"
                            onClick={onApply}
                            disabled={loading}
                            className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : 'Áp dụng'}
                        </button>
                    )}
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setShowInput(false);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="text-rose-500 hover:text-rose-600 text-sm font-medium mb-3"
                >
                    + Nhập mã giảm giá
                </button>
            )}

            {/* Discount amount */}
            {hasDiscount && (
                <p className="text-green-600 text-sm mb-3">
                    🎁 Giảm {formatPrice(discountAmount)}
                </p>
            )}

            {/* Saved vouchers picker */}
            {isAuthenticated && savedVouchers.length > 0 && (
                <div className="border-t pt-3">
                    <button
                        type="button"
                        onClick={onTogglePicker}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-rose-500"
                    >
                        <span>📋 Chọn từ mã đã lưu ({savedVouchers.length})</span>
                        {showPicker ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </button>

                    {showPicker && (
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                            {loadingVouchers ? (
                                <p className="text-gray-400 text-sm text-center py-2">Đang tải...</p>
                            ) : (
                                savedVouchers.map((saved) => (
                                    <SavedVoucherItem
                                        key={saved.id}
                                        voucher={saved}
                                        isSelected={value === (saved.code || saved.voucher?.code)}
                                        onSelect={() => onSelectVoucher(saved)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* No saved vouchers */}
            {isAuthenticated && savedVouchers.length === 0 && !loadingVouchers && (
                <p className="text-gray-400 text-xs mt-2">
                    Chưa có mã {type === 'SHIPPING' ? 'giảm phí ship' : 'giảm giá'} đã lưu
                </p>
            )}
        </div>
    );
};

/**
 * SavedVoucherItem - Hiển thị 1 voucher đã lưu
 */
const SavedVoucherItem = ({ voucher, isSelected, onSelect }) => {
    if (!voucher) return null;

    const isPercent = voucher.isPercent;
    const discountText = isPercent 
        ? `Giảm ${voucher.discountValue}%${voucher.maxDiscount ? ` (tối đa ${formatPrice(voucher.maxDiscount)})` : ''}`
        : `Giảm ${formatPrice(voucher.discountValue)}`;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
                isSelected 
                    ? 'border-rose-500 bg-rose-50' 
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`font-medium ${isSelected ? 'text-rose-600' : 'text-gray-800'}`}>
                        {voucher.code}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{discountText}</p>
                    {voucher.minOrderValue > 0 && (
                        <p className="text-xs text-gray-400">
                            Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                        </p>
                    )}
                </div>
                {isSelected && (
                    <CheckCircleIcon className="h-5 w-5 text-rose-500" />
                )}
            </div>
        </button>
    );
};

export default VoucherInputSection;
