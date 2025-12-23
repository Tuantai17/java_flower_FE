import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    TicketIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import voucherApi from '../../../api/voucherApi';
import Loading from '../../../components/common/Loading';
import { formatPrice } from '../../../utils/formatPrice';

const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        setError('');
        try {
            // Sử dụng endpoint MẶC ĐỊNH - chỉ lấy voucher còn hạn
            console.log('🔄 Fetching vouchers (active only)...');
            const data = await voucherApi.getVouchers();
            console.log('✅ Vouchers response:', data);

            // Handle response - có thể là array hoặc object có content/data
            let vouchersArray = [];
            if (Array.isArray(data)) {
                vouchersArray = data;
            } else if (data?.content && Array.isArray(data.content)) {
                vouchersArray = data.content;
            } else if (data?.data && Array.isArray(data.data)) {
                vouchersArray = data.data;
            }

            console.log('📦 Parsed vouchers:', vouchersArray);
            setVouchers(vouchersArray);
        } catch (err) {
            console.error('❌ Error fetching vouchers:', err);
            setError('Không thể tải danh sách voucher. Vui lòng kiểm tra backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            // Sử dụng hideVoucher (soft delete) - voucher sẽ bị ẩn
            await voucherApi.hideVoucher(id);
            setVouchers(vouchers.filter(v => v.id !== id));
            showNotification('success', 'Đã ẩn voucher thành công!');
        } catch (err) {
            console.error('❌ Error hiding voucher:', err);
            showNotification('error', 'Lỗi khi ẩn voucher: ' + (err.response?.data?.message || err.message));
        } finally {
            setDeleteConfirm(null);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    // Filter vouchers by search
    const filteredVouchers = vouchers.filter(v =>
        v.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (loading) return <Loading text="Đang tải danh sách voucher..." />;

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification.show && (
                <div className={`p-4 rounded-lg border ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TicketIcon className="h-7 w-7 text-rose-500" />
                        Quản lý Voucher
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Tổng cộng {vouchers.length} mã giảm giá đang hoạt động
                    </p>
                </div>
                <Link
                    to="/admin/vouchers/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm Voucher
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã hoặc mô tả..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Voucher Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Mã Voucher
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Giảm giá
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Đơn tối thiểu
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thời hạn
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <TicketIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>Chưa có voucher nào</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-mono font-semibold text-sm">
                                                {voucher.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {voucher.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-green-600">
                                                {voucher.isPercent
                                                    ? `${voucher.discountValue}%`
                                                    : formatPrice(voucher.discountValue)
                                                }
                                            </span>
                                            {voucher.isPercent && voucher.maxDiscount && (
                                                <p className="text-xs text-gray-400">
                                                    Tối đa: {formatPrice(voucher.maxDiscount)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatPrice(voucher.minOrderValue)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p>{formatDate(voucher.startDate)}</p>
                                            <p className="text-gray-400">đến</p>
                                            <p>{formatDate(voucher.endDate)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Sử dụng isExpired và isActive từ backend DTO */}
                                            {!voucher.isExpired && (voucher.isActive ?? voucher.is_active ?? true) ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Đang hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    <XCircleIcon className="h-4 w-4" />
                                                    {voucher.isExpired ? 'Hết hạn' : 'Đã ẩn'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    to={`/admin/vouchers/edit/${voucher.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(voucher.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hide Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận ẩn voucher</h3>
                        <p className="text-gray-600 mb-6">
                            Voucher sẽ bị ẩn khỏi danh sách và không thể sử dụng. Bạn có thể khôi phục lại sau nếu cần.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Ẩn voucher
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherList;
