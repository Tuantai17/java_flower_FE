/**
 * RevenueStatsCard Component
 * 
 * Hiển thị thống kê doanh thu với nhiều mốc thời gian
 */

import React from 'react';
import {
    CurrencyDollarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const RevenueStatsCard = ({
    todayRevenue = 0,
    monthRevenue = 0,
    yearRevenue = 0,
    totalRevenue = 0,
    growthPercent = 0,
    loading = false,
}) => {
    // Format giá tiền
    const formatCurrency = (value) => {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)}B`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString('vi-VN');
    };

    const formatFullCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    const revenueItems = [
        { label: 'Hôm nay', value: todayRevenue, icon: '📅' },
        { label: 'Tháng này', value: monthRevenue, icon: '📆' },
        { label: 'Năm nay', value: yearRevenue, icon: '📊' },
    ];

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-36 bg-white/20 rounded animate-pulse" />
                    <div className="h-10 w-10 bg-white/20 rounded-xl animate-pulse" />
                </div>
                <div className="h-10 w-48 bg-white/20 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-3">
                            <div className="h-4 w-16 bg-white/20 rounded animate-pulse mb-2" />
                            <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">Doanh thu</h2>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                        ${growthPercent >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}
                    >
                        {growthPercent >= 0 ? (
                            <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                        {Math.abs(growthPercent)}%
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="mb-6">
                    <p className="text-purple-100 text-sm mb-1">Tổng doanh thu</p>
                    <p className="text-3xl font-bold" title={formatFullCurrency(totalRevenue)}>
                        {formatFullCurrency(totalRevenue)}
                    </p>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    {revenueItems.map((item) => (
                        <div
                            key={item.label}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors"
                        >
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-purple-100 text-xs">{item.label}</span>
                            </div>
                            <p className="font-bold text-lg" title={formatFullCurrency(item.value)}>
                                {formatCurrency(item.value)}đ
                            </p>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-purple-100 text-sm">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

export default RevenueStatsCard;
