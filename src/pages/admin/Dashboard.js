import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import {
    CubeIcon,
    FolderIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import productApi from '../../api/productApi';
// import categoryApi from '../../api/categoryApi'; // Will be used when fetching categories dynamically

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [, setLoading] = useState(true); // loading state for future use
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const products = await productApi.getPaginated(0, 5, 'createdAt', 'desc');
            setRecentProducts(products.content || []);
            setStats({
                totalProducts: products.totalElements || 0,
                totalCategories: 0,
                totalOrders: 0,
                totalRevenue: 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Không sử dụng mock data - chỉ lấy từ API
            setStats({
                totalProducts: 0,
                totalCategories: 0,
                totalOrders: 0,
                totalRevenue: 0,
            });
            setRecentProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: <CubeIcon className="h-6 w-6" />,
            color: 'pink',
            change: 12,
            changeType: 'increase',
        },
        {
            title: 'Danh mục',
            value: stats.totalCategories,
            icon: <FolderIcon className="h-6 w-6" />,
            color: 'blue',
            change: 3,
            changeType: 'increase',
        },
        {
            title: 'Đơn hàng',
            value: stats.totalOrders,
            icon: <ShoppingCartIcon className="h-6 w-6" />,
            color: 'green',
            change: 8,
            changeType: 'increase',
        },
        {
            title: 'Doanh thu',
            value: stats.totalRevenue,
            icon: <CurrencyDollarIcon className="h-6 w-6" />,
            color: 'purple',
            change: 15,
            changeType: 'increase',
            prefix: '',
            suffix: 'đ',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại, Admin! 👋</h1>
                        <p className="text-pink-100">
                            Đây là tổng quan hoạt động của cửa hàng hôm nay.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <Link to="/admin/products/create" className="px-6 py-3 bg-white text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow">
                            + Thêm sản phẩm mới
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Products */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Sản phẩm mới nhất</h2>
                        <Link to="/admin/products" className="text-sm text-pink-600 hover:text-pink-700">
                            Xem tất cả
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <img
                                    src={product.thumbnail}
                                    alt={product.name}
                                    className="w-14 h-14 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                    <p className="text-sm text-pink-600 font-medium">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </p>
                                </div>
                                <Link
                                    to={`/admin/products/edit/${product.id}`}
                                    className="text-sm text-gray-500 hover:text-pink-600"
                                >
                                    Chỉnh sửa
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Thao tác nhanh</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: CubeIcon, label: 'Thêm sản phẩm', path: '/admin/products/create', color: 'pink' },
                            { icon: FolderIcon, label: 'Thêm danh mục', path: '/admin/categories/create', color: 'blue' },
                            { icon: ShoppingCartIcon, label: 'Xem đơn hàng', path: '/admin/orders', color: 'green' },
                            { icon: UserGroupIcon, label: 'Khách hàng', path: '/admin/customers', color: 'purple' },
                            { icon: ArrowTrendingUpIcon, label: 'Thống kê', path: '/admin/analytics', color: 'orange' },
                            { icon: CubeIcon, label: 'Tất cả SP', path: '/admin/products', color: 'gray' },
                        ].map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={index}
                                    to={action.path}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${action.color}-100 text-${action.color}-600`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                        {action.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Doanh thu 7 ngày qua</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400">
                    <div className="text-center">
                        <ArrowTrendingUpIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
