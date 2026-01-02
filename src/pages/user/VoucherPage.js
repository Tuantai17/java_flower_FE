import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TicketIcon,
    CheckIcon,
    ClockIcon,
    TagIcon,
    GiftIcon,
    ArchiveBoxIcon,
    BookmarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import voucherApi from '../../api/voucherApi';
import { formatPrice } from '../../utils/formatPrice';
import Breadcrumb from '../../components/user/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

/**
 * ========================================
 * Voucher Page - Trang Mã Giảm Giá
 * ========================================
 * 
 * Hiển thị tất cả voucher đang hoạt động
 * Cho phép user "Lưu" voucher vào kho cá nhân
 */

const VoucherPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedVoucherIds, setSavedVoucherIds] = useState(new Set());
    const [savingId, setSavingId] = useState(null);

    const { isAuthenticated, user } = useAuth();
    const { showNotification } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchVouchers();
        if (isAuthenticated) {
            fetchSavedStatus();
        }
    }, [isAuthenticated]);

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

    const fetchSavedStatus = async () => {
        try {
            const savedVouchers = await voucherApi.getMySavedVouchers();
            const ids = new Set((savedVouchers || []).map(v => v.voucherId));
            setSavedVoucherIds(ids);
        } catch (error) {
            // Nếu API trả về 404, có thể do chưa có voucher nào được lưu hoặc API chưa available
            if (error.response?.status === 404) {
                console.log('No saved vouchers found or API not available yet');
                setSavedVoucherIds(new Set());
            } else {
                console.error('Error fetching saved status:', error);
            }
        }
    };

    const handleSaveVoucher = async (voucherId) => {
        if (!isAuthenticated) {
            showNotification({
                type: 'warning',
                message: 'Vui lòng đăng nhập để lưu voucher',
            });
            navigate('/login', { state: { from: '/vouchers' } });
            return;
        }

        setSavingId(voucherId);
        try {
            if (savedVoucherIds.has(voucherId)) {
                // Unsave
                await voucherApi.unsaveVoucher(voucherId);
                setSavedVoucherIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(voucherId);
                    return newSet;
                });
                showNotification({
                    type: 'info',
                    message: 'Đã xóa voucher khỏi kho',
                });
            } else {
                // Save
                await voucherApi.saveVoucher(voucherId);
                setSavedVoucherIds(prev => new Set(prev).add(voucherId));
                showNotification({
                    type: 'success',
                    message: 'Đã lưu voucher vào kho! 🎉',
                });
            }
        } catch (error) {
            let message = 'Có lỗi xảy ra';
            if (error.response?.status === 404) {
                message = 'Tính năng đang được cập nhật. Vui lòng thử lại sau!';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            showNotification({
                type: 'error',
                message: message,
            });
        } finally {
            setSavingId(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb
                        items={[
                            { label: 'Mã giảm giá' },
                        ]}
                    />
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4">
                        <GiftIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Mã giảm giá</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Lưu mã giảm giá vào kho và sử dụng khi thanh toán!
                    </p>

                    {/* Link to My Vouchers */}
                    {isAuthenticated && (
                        <Link
                            to="/my-vouchers"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-pink-50 text-pink-600 rounded-full font-medium hover:bg-pink-100 transition-colors"
                        >
                            <ArchiveBoxIcon className="h-5 w-5" />
                            Xem kho voucher của tôi
                        </Link>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && vouchers.length === 0 && (
                    <div className="text-center py-16">
                        <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Chưa có mã giảm giá
                        </h3>
                        <p className="text-gray-500">
                            Hãy quay lại sau để nhận các ưu đãi hấp dẫn!
                        </p>
                    </div>
                )}

                {/* Voucher Grid */}
                {!loading && vouchers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vouchers.map((voucher) => (
                            <VoucherCard
                                key={voucher.id || voucher.code}
                                voucher={voucher}
                                isSaved={savedVoucherIds.has(voucher.id)}
                                isSaving={savingId === voucher.id}
                                onSave={() => handleSaveVoucher(voucher.id)}
                                formatDate={formatDate}
                                isAuthenticated={isAuthenticated}
                            />
                        ))}
                    </div>
                )}

                {/* Tips Section */}
                <div className="mt-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TagIcon className="h-6 w-6 text-rose-500" />
                        Cách sử dụng mã giảm giá
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Lưu voucher</h4>
                                <p className="text-sm text-gray-600">
                                    Nhấn nút "Lưu ngay" để thêm voucher vào kho của bạn
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Thêm sản phẩm vào giỏ</h4>
                                <p className="text-sm text-gray-600">
                                    Mua sắm và thêm các sản phẩm yêu thích vào giỏ hàng
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Chọn voucher khi thanh toán</h4>
                                <p className="text-sm text-gray-600">
                                    Chọn voucher từ kho của bạn tại trang thanh toán
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * VoucherCard Component
 */
const VoucherCard = ({ voucher, isSaved, isSaving, onSave, formatDate, isAuthenticated }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TicketIcon className="h-6 w-6" />
                        <span className="font-mono font-bold text-lg">{voucher.code}</span>
                    </div>
                    
                    {/* Save Button */}
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSaved
                                ? 'bg-white text-rose-500'
                                : 'bg-white/20 hover:bg-white/30 text-white'
                        } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {isSaving ? (
                            <span className="animate-spin">⏳</span>
                        ) : isSaved ? (
                            <>
                                <BookmarkSolidIcon className="h-4 w-4" />
                                Đã lưu
                            </>
                        ) : (
                            <>
                                <BookmarkIcon className="h-4 w-4" />
                                Lưu ngay
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Discount Value */}
                <p className="text-2xl font-bold text-rose-600 mb-1">
                    {voucher.isPercent
                        ? `Giảm ${voucher.discountValue}%`
                        : `Giảm ${formatPrice(voucher.discountValue)}`
                    }
                </p>
                {voucher.isPercent && voucher.maxDiscount && (
                    <p className="text-sm text-gray-500 mb-2">
                        Tối đa {formatPrice(voucher.maxDiscount)}
                    </p>
                )}

                {/* Description */}
                {voucher.description && (
                    <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>
                )}

                {/* Details */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                    {voucher.minOrderValue > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Đơn tối thiểu:</span>
                            <span className="font-medium text-gray-700">
                                {formatPrice(voucher.minOrderValue)}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            Hạn sử dụng:
                        </span>
                        <span className="font-medium text-gray-700">
                            {formatDate(voucher.endDate)}
                        </span>
                    </div>
                </div>

                {/* CTA for logged in users who saved */}
                {isAuthenticated && isSaved && (
                    <Link
                        to="/my-vouchers"
                        className="mt-4 block text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                    >
                        Xem trong kho voucher →
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VoucherPage;
