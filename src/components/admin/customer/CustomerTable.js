import React from 'react';
import {
    UserIcon,
    LockClosedIcon,
    LockOpenIcon,
    EyeIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { getRoleName, getRoleBadgeColor, formatPhoneNumber } from '../../../api/customerApi';

/**
 * Bảng hiển thị danh sách khách hàng
 */
const CustomerTable = ({
    customers = [],
    loading = false,
    onViewDetail,     // (customer) => void
    onToggleStatus    // (customer) => void
}) => {
    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!customers || customers.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Không có khách hàng</h3>
                <p className="text-gray-500">Chưa có khách hàng nào phù hợp với bộ lọc.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Khách hàng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Liên hệ
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Vai trò
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => {
                            const isActive = customer.isActive ?? customer.active ?? true;

                            return (
                                <tr
                                    key={customer.id}
                                    className={`hover:bg-gray-50 transition-colors ${!isActive ? 'bg-red-50/30' : ''}`}
                                >
                                    {/* Customer Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${customer.role === 'ADMIN'
                                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                                                    : 'bg-gradient-to-br from-pink-500 to-rose-500'
                                                }`}>
                                                {(customer.fullName || customer.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {customer.fullName || customer.username}
                                                </h4>
                                                <p className="text-sm text-gray-500">@{customer.username}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                                {customer.email || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                {formatPhoneNumber(customer.phoneNumber)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(customer.role)}`}>
                                            {getRoleName(customer.role)}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>

                                    {/* Created Date */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            {formatDate(customer.createdAt)}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* View Detail */}
                                            <button
                                                onClick={() => onViewDetail?.(customer)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>

                                            {/* Toggle Status - Không cho phép khóa ADMIN */}
                                            {customer.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => onToggleStatus?.(customer)}
                                                    className={`p-2 rounded-lg transition-colors ${isActive
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                >
                                                    {isActive ? (
                                                        <LockClosedIcon className="w-5 h-5" />
                                                    ) : (
                                                        <LockOpenIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerTable;
