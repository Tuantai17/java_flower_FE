import React, { useState, useEffect } from 'react';
import {
    TicketIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import voucherApi from '../../api/voucherApi';
import { formatPrice } from '../../utils/formatPrice';

/**
 * VoucherCard Component
 * Hiển thị một voucher dưới dạng card có thể copy mã
 */
const VoucherCard = ({ voucher, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        onCopy?.(voucher.code);
        setTimeout(() => setCopied(false), 2000);
    };

    // Format thời hạn
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex">
                {/* Left - Icon */}
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-4 flex items-center justify-center min-w-[80px]">
                    <TicketIcon className="h-8 w-8 text-white" />
                </div>

                {/* Right - Info */}
                <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="font-bold text-lg text-rose-600">
                                {voucher.isPercent
                                    ? `Giảm ${voucher.discountValue}%`
                                    : `Giảm ${formatPrice(voucher.discountValue)}`
                                }
                            </p>
                            {voucher.isPercent && voucher.maxDiscount && (
                                <p className="text-xs text-gray-500">
                                    Tối đa {formatPrice(voucher.maxDiscount)}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="h-4 w-4" />
                                    Đã copy
                                </>
                            ) : (
                                <>
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">{voucher.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                        <span className="font-mono font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                            {voucher.code}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4" />
                            <span>HSD: {formatDate(voucher.endDate)}</span>
                        </div>
                    </div>

                    {voucher.minOrderValue > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                            Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * VoucherList Component cho User
 * Hiển thị danh sách voucher đang hoạt động
 */
const VoucherListUser = ({ onSelectVoucher, selectedCode }) => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const data = await voucherApi.getActiveVouchers();
            setVouchers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code) => {
        onSelectVoucher?.(code);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <TicketIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Chưa có mã giảm giá nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {vouchers.map(voucher => (
                <VoucherCard
                    key={voucher.id || voucher.code}
                    voucher={voucher}
                    onCopy={handleCopy}
                />
            ))}
        </div>
    );
};

/**
 * VoucherInput Component
 * Input để nhập và kiểm tra mã voucher tại checkout
 */
export const VoucherInput = ({ orderTotal, onApply, appliedVoucher }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showVouchers, setShowVouchers] = useState(false);

    const handleCheck = async () => {
        if (!code.trim()) {
            setError('Vui lòng nhập mã voucher');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const voucher = await voucherApi.checkVoucher(code.trim());

            // Kiểm tra điều kiện sử dụng
            const canUse = voucherApi.canUseVoucher(voucher, orderTotal);

            if (!canUse.canUse) {
                setError(canUse.message);
                return;
            }

            // Tính số tiền giảm
            const discount = voucherApi.calculateDiscount(voucher, orderTotal);

            onApply?.({
                ...voucher,
                discountAmount: discount,
            });

            setCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Mã voucher không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onApply?.(null);
        setError('');
    };

    const handleSelectVoucher = (selectedCode) => {
        setCode(selectedCode);
        setShowVouchers(false);
    };

    return (
        <div className="space-y-4">
            {/* Applied Voucher */}
            {appliedVoucher ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TicketIcon className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-700">{appliedVoucher.code}</p>
                                <p className="text-sm text-green-600">
                                    Giảm {formatPrice(appliedVoucher.discountAmount)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="text-green-600 hover:text-green-800 text-sm underline"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã giảm giá"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none uppercase"
                        />
                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Show vouchers toggle */}
                    <button
                        onClick={() => setShowVouchers(!showVouchers)}
                        className="text-rose-500 text-sm hover:underline flex items-center gap-1"
                    >
                        <TicketIcon className="h-4 w-4" />
                        {showVouchers ? 'Ẩn mã giảm giá' : 'Xem mã giảm giá có sẵn'}
                    </button>

                    {/* Voucher List */}
                    {showVouchers && (
                        <VoucherListUser onSelectVoucher={handleSelectVoucher} />
                    )}
                </>
            )}
        </div>
    );
};

export default VoucherListUser;
