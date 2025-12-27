/**
 * WelcomeBanner Component
 * 
 * Banner chào mừng với thông tin tổng quan nhanh
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ClockIcon } from '@heroicons/react/24/outline';

const WelcomeBanner = ({
    adminName = 'Admin',
    pendingOrders = 0,
    todayOrders = 0,
}) => {
    // Lấy lời chào theo thời gian trong ngày
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    // Format ngày hiện tại
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white rounded-full translate-y-1/2" />
            </div>

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left Content */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                        {getGreeting()}, {adminName}! 👋
                    </h1>
                    <p className="text-pink-100 mb-1">
                        {getCurrentDate()}
                    </p>
                    <p className="text-pink-100">
                        Đây là tổng quan hoạt động của cửa hàng hôm nay.
                    </p>

                    {/* Quick Stats */}
                    {(pendingOrders > 0 || todayOrders > 0) && (
                        <div className="flex items-center gap-4 mt-4">
                            {pendingOrders > 0 && (
                                <Link
                                    to="/admin/orders?status=PENDING"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
                                >
                                    <ClockIcon className="h-4 w-4" />
                                    <span>{pendingOrders} đơn chờ xử lý</span>
                                </Link>
                            )}
                            {todayOrders > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                                    <span className="font-semibold">+{todayOrders}</span>
                                    <span>đơn hàng hôm nay</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/products/create"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Thêm sản phẩm</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
