import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TicketIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ArchiveBoxIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import voucherApi from '../../api/voucherApi';
import { formatPrice } from '../../utils/formatPrice';
import Breadcrumb from '../../components/user/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

/**
 * ========================================
 * My Vouchers Page (Kho Voucher)
 * ========================================
 * 
 * Trang quản lý voucher cá nhân của user
 * Tương tự như Shopee
 */

const FILTER_TABS = [
    { id: 'all', label: 'Tất cả', icon: ArchiveBoxIcon },
    { id: 'available', label: 'Còn dùng được', icon: CheckCircleIcon },
    { id: 'expiring', label: 'Sắp hết hạn', icon: ExclamationTriangleIcon },
    { id: 'expired', label: 'Đã hết hạn', icon: XCircleIcon },
    { id: 'used', label: 'Đã sử dụng', icon: ClockIcon },
];

const MyVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [counts, setCounts] = useState({ available: 0, total: 0 });

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/my-vouchers' } });
            return;
        }
        fetchVouchers();
        fetchCounts();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchVouchers();
        }
    }, [activeFilter, isAuthenticated]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const data = await voucherApi.getMyVouchersByFilter(activeFilter);
            setVouchers(Array.isArray(data) ? data : []);
        } catch (error) {
            // Handle 404 gracefully - API chưa available hoặc chưa có voucher
            if (error.response?.status === 404) {
                console.log('Voucher API not available yet');
            } else {
                console.error('Error fetching vouchers:', error);
            }
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const data = await voucherApi.getVoucherCounts();
            setCounts(data || { available: 0, total: 0 });
        } catch (error) {
            // Handle 404 gracefully
            if (error.response?.status !== 404) {
                console.error('Error fetching counts:', error);
            }
            setCounts({ available: 0, total: 0 });
        }
    };

    const handleUnsave = async (voucherId) => {
        try {
            await voucherApi.unsaveVoucher(voucherId);
            fetchVouchers();
            fetchCounts();
        } catch (error) {
            console.error('Error unsaving voucher:', error);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Không giới hạn';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb
                        items={[
                            { label: 'Kho Voucher' },
                        ]}
                    />
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <ArchiveBoxIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Kho Voucher của tôi</h1>
                            <p className="text-gray-500">
                                {counts.available > 0 
                                    ? `Bạn có ${counts.available} voucher có thể sử dụng`
                                    : 'Chưa có voucher nào trong kho'
                                }
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/vouchers"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-pink-500/25"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        Nhận thêm voucher
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
                    <div className="flex border-b border-gray-100">
                        {FILTER_TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-4 font-medium text-sm whitespace-nowrap
                                        border-b-2 transition-all
                                        ${activeFilter === tab.id
                                            ? 'border-pink-500 text-pink-600 bg-pink-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loading text="Đang tải voucher..." />
                    </div>
                )}

                {/* Empty State */}
                {!loading && vouchers.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {activeFilter === 'all' 
                                ? 'Chưa có voucher nào trong kho'
                                : `Không có voucher nào ${FILTER_TABS.find(t => t.id === activeFilter)?.label.toLowerCase()}`
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Hãy lưu voucher từ trang mã giảm giá để sử dụng khi thanh toán!
                        </p>
                        <Link
                            to="/vouchers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-50 text-pink-600 rounded-full font-medium hover:bg-pink-100 transition-colors"
                        >
                            <SparklesIcon className="h-5 w-5" />
                            Khám phá voucher
                        </Link>
                    </div>
                )}

                {/* Voucher Grid */}
                {!loading && vouchers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vouchers.map((voucher) => (
                            <SavedVoucherCard
                                key={voucher.id}
                                voucher={voucher}
                                formatDate={formatDate}
                                onUnsave={handleUnsave}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Saved Voucher Card
 */
const SavedVoucherCard = ({ voucher, formatDate, onUnsave }) => {
    const getStatusBadge = () => {
        switch (voucher.status) {
            case 'EXPIRING':
                return (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Sắp hết hạn ({voucher.daysRemaining} ngày)
                    </span>
                );
            case 'EXPIRED':
                return (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        Đã hết hạn
                    </span>
                );
            case 'USED':
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        Đã sử dụng
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Có thể sử dụng
                    </span>
                );
        }
    };

    const isDisabled = voucher.status === 'EXPIRED' || voucher.status === 'USED';

    return (
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
            isDisabled ? 'opacity-60 border-gray-200' : 'border-gray-100 hover:shadow-md'
        }`}>
            <div className="flex">
                {/* Left - Ticket Icon */}
                <div className={`flex-shrink-0 w-24 flex flex-col items-center justify-center ${
                    isDisabled 
                        ? 'bg-gray-200' 
                        : 'bg-gradient-to-br from-rose-500 to-pink-500'
                }`}>
                    <TicketIcon className={`h-8 w-8 ${isDisabled ? 'text-gray-400' : 'text-white'}`} />
                </div>

                {/* Right - Info */}
                <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className={`font-bold text-lg ${isDisabled ? 'text-gray-400' : 'text-rose-600'}`}>
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
                        {getStatusBadge()}
                    </div>

                    {voucher.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{voucher.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                        <div>
                            <span className={`font-mono font-bold px-2 py-1 rounded ${
                                isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-rose-50 text-rose-500'
                            }`}>
                                {voucher.code}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {voucher.minOrderValue > 0 && (
                                <span className="text-xs text-gray-400">
                                    Đơn tối thiểu {formatPrice(voucher.minOrderValue)}
                                </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                HSD: {formatDate(voucher.endDate)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    {!isDisabled && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <Link
                                to="/shop"
                                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                            >
                                Dùng ngay →
                            </Link>
                            <button
                                onClick={() => onUnsave(voucher.voucherId)}
                                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Xóa khỏi kho
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyVouchersPage;
