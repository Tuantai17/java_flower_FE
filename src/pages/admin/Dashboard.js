/**
 * Admin Dashboard Page
 * 
 * Trang tổng quan cho quản trị viên
 * Lấy dữ liệu từ các API hiện có (products, orders)
 * 
 * @version 2.1.0 - Sử dụng API thực có sẵn
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    CubeIcon,
    FolderIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// Components
import StatCard from '../../components/admin/StatCard';
import {
    WelcomeBanner,
    RecentOrdersCard,
    TopProductsCard,
    LowStockCard,
    OrderStatsCard,
    RevenueStatsCard,
    RevenueChart,
    OrderPieChart,
} from '../../components/admin/dashboard';

// API - Sử dụng các API hiện có
import productApi from '../../api/productApi';
import orderApi from '../../api/orderApi';
import categoryApi from '../../api/categoryApi';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safe fetch - Bắt lỗi và trả về giá trị mặc định nếu thất bại
 */
const safeFetch = async (apiCall, defaultValue = null) => {
    try {
        return await apiCall();
    } catch (error) {
        console.warn('API call failed:', error.message);
        return defaultValue;
    }
};

/**
 * Tính toán thống kê đơn hàng từ danh sách orders
 */
const calculateOrderStats = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return {
            total: 0,
            pending: 0,
            confirmed: 0,
            shipping: 0,
            completed: 0,
            cancelled: 0,
        };
    }

    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
        shipping: orders.filter(o => o.status === 'SHIPPING' || o.status === 'DELIVERING').length,
        completed: orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    };
};

/**
 * Tính tổng doanh thu từ các đơn hoàn thành
 */
const calculateTotalRevenue = (orders) => {
    if (!Array.isArray(orders)) return 0;
    return orders
        .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.finalPrice || o.totalAmount || 0), 0);
};

/**
 * Tính doanh thu chi tiết theo các khoảng thời gian
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Object} { todayRevenue, monthRevenue, yearRevenue, totalRevenue }
 */
const calculateRevenueStats = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return {
            todayRevenue: 0,
            monthRevenue: 0,
            yearRevenue: 0,
            totalRevenue: 0,
        };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    let todayRevenue = 0;
    let monthRevenue = 0;
    let yearRevenue = 0;
    let totalRevenue = 0;

    // Lọc các đơn hàng đã hoàn thành
    const completedOrders = orders.filter(o =>
        o.status === 'COMPLETED' || o.status === 'DELIVERED'
    );

    completedOrders.forEach(order => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        const amount = order.finalPrice || order.totalAmount || 0;

        // Tổng tất cả
        totalRevenue += amount;

        // Năm nay
        if (orderDate >= yearStart) {
            yearRevenue += amount;
        }

        // Tháng này
        if (orderDate >= monthStart) {
            monthRevenue += amount;
        }

        // Hôm nay
        if (orderDate >= todayStart) {
            todayRevenue += amount;
        }
    });

    return {
        todayRevenue,
        monthRevenue,
        yearRevenue,
        totalRevenue,
    };
};

/**
 * Tính số lượng đã bán cho mỗi sản phẩm từ danh sách Orders đã hoàn thành
 * @param {Array} products - Danh sách sản phẩm
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Array} Danh sách sản phẩm với trường totalSold được tính toán
 */
const calculateProductSoldFromOrders = (products, orders) => {
    if (!Array.isArray(products) || products.length === 0) return [];
    if (!Array.isArray(orders) || orders.length === 0) {
        // Trả về products với totalSold = 0
        return products.map(p => ({ ...p, totalSold: 0 }));
    }

    // Tạo map để đếm số lượng đã bán theo productId
    const soldCountMap = {};

    // Chỉ tính từ đơn hàng đã hoàn thành
    const completedOrders = orders.filter(o =>
        o.status === 'COMPLETED' || o.status === 'DELIVERED'
    );

    // Duyệt qua từng đơn hàng và items
    completedOrders.forEach(order => {
        // Xử lý các trường hợp khác nhau của order items
        const items = order.items || order.orderItems || order.orderDetails || [];

        items.forEach(item => {
            // Lấy productId từ các trường có thể có
            const productId = item.productId || item.product?.id || item.id;
            // Lấy quantity
            const quantity = item.quantity || item.qty || 1;

            if (productId) {
                soldCountMap[productId] = (soldCountMap[productId] || 0) + quantity;
            }
        });
    });

    // Merge số lượng đã bán vào products
    return products.map(product => ({
        ...product,
        totalSold: soldCountMap[product.id] || 0
    }));
};

/**
 * Tính doanh thu theo ngày cho biểu đồ từ danh sách Orders
 * @param {Array} orders - Danh sách đơn hàng
 * @param {number} days - Số ngày cần lấy (mặc định 7 ngày)
 * @returns {Object} Dữ liệu cho RevenueChart
 */
const calculateRevenueChartData = (orders, days = 7) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Helper function để tạo date key từ Date object (dùng local date)
    const getLocalDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Tạo danh sách các ngày
    const dateList = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dateList.push(date);
    }

    // Tạo map để lưu doanh thu và số đơn theo ngày
    const revenueByDate = {};

    // Khởi tạo tất cả các ngày với giá trị 0
    dateList.forEach(date => {
        const dateKey = getLocalDateKey(date);
        revenueByDate[dateKey] = { revenue: 0, orders: 0 };
    });

    // Chỉ tính từ đơn hàng hoàn thành trong khoảng thời gian
    if (Array.isArray(orders)) {
        const startDate = new Date(dateList[0]);
        startDate.setHours(0, 0, 0, 0);

        const completedOrders = orders.filter(order =>
            order.status === 'COMPLETED' || order.status === 'DELIVERED'
        );

        console.log(`[RevenueChart] Period: ${days} days, Completed orders: ${completedOrders.length}`);

        completedOrders.forEach(order => {
            const orderDateStr = order.createdAt || order.orderDate;
            if (!orderDateStr) return;

            const orderDate = new Date(orderDateStr);

            // Kiểm tra đơn hàng trong khoảng thời gian
            if (orderDate >= startDate && orderDate <= today) {
                const dateKey = getLocalDateKey(orderDate);

                if (revenueByDate[dateKey] !== undefined) {
                    const amount = order.finalPrice || order.totalAmount || 0;
                    revenueByDate[dateKey].revenue += amount;
                    revenueByDate[dateKey].orders += 1;
                    console.log(`[RevenueChart] Order on ${dateKey}: +${amount}đ`);
                }
            }
        });
    }

    // Chuyển thành mảng dataPoints
    const dataPoints = dateList.map(date => {
        const dateKey = getLocalDateKey(date);
        const data = revenueByDate[dateKey] || { revenue: 0, orders: 0 };

        return {
            label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            revenue: data.revenue,
            orders: data.orders,
        };
    });

    // Tính tổng
    const totalRevenue = dataPoints.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = dataPoints.reduce((sum, d) => sum + d.orders, 0);

    console.log(`[RevenueChart] Total for ${days} days: ${totalRevenue}đ, ${totalOrders} orders`);

    return {
        period: days === 7 ? '7days' : days === 30 ? '30days' : '3months',
        totalRevenue,
        totalOrders,
        growthPercent: 0, // Có thể tính thêm so với kỳ trước
        dataPoints,
    };
};

// ============================================
// MAIN COMPONENT
// ============================================

const Dashboard = () => {
    // ========== STATE ==========
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Data states
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [categories, setCategories] = useState([]);

    // Computed stats
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        totalCategories: 0,
    });

    // ========== FETCH DATA ==========

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Gọi song song các API có sẵn
            const [productsRes, ordersRes, categoriesRes] = await Promise.allSettled([
                safeFetch(() => productApi.getPaginated(0, 100), { content: [] }),
                safeFetch(() => orderApi.getAllOrders({ size: 100 }), { content: [] }),
                safeFetch(() => categoryApi.getAll(), []),
            ]);

            // Xử lý Products
            const productsData = productsRes.status === 'fulfilled'
                ? (productsRes.value?.content || productsRes.value || [])
                : [];
            setProducts(Array.isArray(productsData) ? productsData : []);

            // Xử lý Orders
            let ordersData = [];
            if (ordersRes.status === 'fulfilled') {
                ordersData = ordersRes.value?.content || ordersRes.value || [];
            }
            setOrders(Array.isArray(ordersData) ? ordersData : []);

            // Xử lý Categories
            const categoriesData = categoriesRes.status === 'fulfilled'
                ? (categoriesRes.value || [])
                : [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);

            // Tính toán stats
            const productsList = Array.isArray(productsData) ? productsData : [];
            const ordersList = Array.isArray(ordersData) ? ordersData : [];
            const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];

            const orderStats = calculateOrderStats(ordersList);
            const totalRevenue = calculateTotalRevenue(ordersList);

            // Đếm đơn hàng hôm nay
            const today = new Date().toDateString();
            const todayOrders = ordersList.filter(o => {
                const orderDate = new Date(o.createdAt).toDateString();
                return orderDate === today;
            }).length;

            setStats({
                totalProducts: productsList.length,
                activeProducts: productsList.filter(p => p.active).length,
                totalOrders: orderStats.total,
                pendingOrders: orderStats.pending,
                todayOrders,
                totalRevenue,
                totalCategories: categoriesList.length,
                // Order stats for OrderStatsCard
                confirmedOrders: orderStats.confirmed,
                shippingOrders: orderStats.shipping,
                completedOrders: orderStats.completed,
                cancelledOrders: orderStats.cancelled,
            });

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== COMPUTED VALUES ==========

    // Đơn hàng gần đây (5 đơn mới nhất)
    const recentOrders = React.useMemo(() => {
        if (!Array.isArray(orders)) return [];
        return [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [orders]);

    // Sản phẩm bán chạy (tính từ Orders đã hoàn thành)
    const topProducts = React.useMemo(() => {
        if (!Array.isArray(products)) return [];

        // Tính số lượng đã bán từ orders
        const productsWithSold = calculateProductSoldFromOrders(products, orders);

        // Lọc sản phẩm active, sắp xếp theo totalSold giảm dần
        return productsWithSold
            .filter(p => p.active)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5);
    }, [products, orders]);

    // Sản phẩm sắp hết hàng (stockQuantity <= 10)
    const lowStockProducts = React.useMemo(() => {
        if (!Array.isArray(products)) return [];
        return [...products]
            .filter(p => p.active && (p.stockQuantity || p.stock || 0) <= 10)
            .sort((a, b) => (a.stockQuantity || a.stock || 0) - (b.stockQuantity || b.stock || 0))
            .slice(0, 5)
            .map(p => ({
                ...p,
                stockQuantity: p.stockQuantity || p.stock || 0,
                threshold: 10,
            }));
    }, [products]);

    // Order Distribution cho Pie Chart
    const orderDistribution = React.useMemo(() => {
        const orderStats = calculateOrderStats(orders);
        return {
            totalOrders: orderStats.total,
            segments: [
                { name: 'Hoàn thành', status: 'COMPLETED', value: orderStats.completed, percentage: orderStats.total > 0 ? (orderStats.completed / orderStats.total * 100) : 0, color: '#22c55e' },
                { name: 'Đang giao', status: 'SHIPPING', value: orderStats.shipping, percentage: orderStats.total > 0 ? (orderStats.shipping / orderStats.total * 100) : 0, color: '#6366f1' },
                { name: 'Chờ xử lý', status: 'PENDING', value: orderStats.pending, percentage: orderStats.total > 0 ? (orderStats.pending / orderStats.total * 100) : 0, color: '#fbbf24' },
                { name: 'Đã xác nhận', status: 'CONFIRMED', value: orderStats.confirmed, percentage: orderStats.total > 0 ? (orderStats.confirmed / orderStats.total * 100) : 0, color: '#3b82f6' },
                { name: 'Đã hủy', status: 'CANCELLED', value: orderStats.cancelled, percentage: orderStats.total > 0 ? (orderStats.cancelled / orderStats.total * 100) : 0, color: '#ef4444' },
            ].filter(s => s.value > 0),
        };
    }, [orders]);

    // Revenue Chart Data (tính từ Orders đã hoàn thành)
    const [chartPeriod, setChartPeriod] = React.useState(7);

    const revenueChartData = React.useMemo(() => {
        return calculateRevenueChartData(orders, chartPeriod);
    }, [orders, chartPeriod]);

    // Handle period change for revenue chart
    const handlePeriodChange = React.useCallback((periodKey) => {
        const periodMap = { '7days': 7, '30days': 30, '3months': 90 };
        setChartPeriod(periodMap[periodKey] || 7);
    }, []);

    // Revenue Stats (Hôm nay, Tháng này, Năm nay, Tổng)
    const revenueStats = React.useMemo(() => {
        return calculateRevenueStats(orders);
    }, [orders]);

    // ========== EFFECTS ==========

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Auto refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchAllData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchAllData]);

    // ========== STAT CARDS CONFIG ==========

    const statCards = [
        {
            title: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: <CubeIcon className="h-6 w-6" />,
            color: 'pink',
            change: stats.totalProducts > 0 ? Math.round((stats.activeProducts / stats.totalProducts) * 100) : 0,
            changeType: 'increase',
        },
        {
            title: 'Đơn hàng',
            value: stats.totalOrders,
            icon: <ShoppingCartIcon className="h-6 w-6" />,
            color: 'blue',
            change: 0,
            changeType: 'neutral',
        },
        {
            title: 'Chờ xử lý',
            value: stats.pendingOrders,
            icon: <FolderIcon className="h-6 w-6" />,
            color: 'yellow',
            change: stats.todayOrders,
            changeType: 'neutral',
            suffix: ' hôm nay',
        },
        {
            title: 'Doanh thu',
            value: stats.totalRevenue,
            icon: <CurrencyDollarIcon className="h-6 w-6" />,
            color: 'green',
            change: 100,
            changeType: 'increase',
            suffix: 'đ',
        },
    ];

    // ========== ERROR STATE ==========

    if (error && !loading && stats.totalProducts === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <ExclamationCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // ========== RENDER ==========

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <WelcomeBanner
                adminName="Admin"
                pendingOrders={stats.pendingOrders}
                todayOrders={stats.todayOrders}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Revenue & Order Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueStatsCard
                    todayRevenue={revenueStats.todayRevenue}
                    monthRevenue={revenueStats.monthRevenue}
                    yearRevenue={revenueStats.yearRevenue}
                    totalRevenue={revenueStats.totalRevenue}
                    growthPercent={revenueStats.totalRevenue > 0 ? 100 : 0}
                    loading={loading}
                />
                <OrderStatsCard
                    stats={{
                        pendingOrders: stats.pendingOrders,
                        confirmedOrders: stats.confirmedOrders || 0,
                        shippingOrders: stats.shippingOrders || 0,
                        completedOrders: stats.completedOrders || 0,
                        cancelledOrders: stats.cancelledOrders || 0,
                        totalOrders: stats.totalOrders,
                    }}
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart - 2/3 */}
                <div className="lg:col-span-2">
                    <RevenueChart
                        data={revenueChartData}
                        loading={loading}
                        onRefresh={fetchAllData}
                        onPeriodChange={handlePeriodChange}
                        title="Biểu đồ doanh thu"
                        initialPeriod={chartPeriod === 7 ? '7days' : chartPeriod === 30 ? '30days' : '3months'}
                    />
                </div>

                {/* Order Pie Chart - 1/3 */}
                <div className="lg:col-span-1">
                    <OrderPieChart
                        data={orderDistribution}
                        loading={loading}
                        title="Phân bố đơn hàng"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="space-y-8">
                {/* Top Products - Full Width */}
                <TopProductsCard products={topProducts} loading={loading} />

                {/* Recent Orders & Low Stock - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RecentOrdersCard orders={recentOrders} loading={loading} />
                    <LowStockCard products={lowStockProducts} loading={loading} />
                </div>
            </div>

            {/* Last Updated Info */}
            {lastUpdated && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span>Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}</span>
                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Làm mới dữ liệu"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-400 py-4">
                <p>Dashboard tự động làm mới mỗi 5 phút</p>
            </div>
        </div>
    );
};

export default Dashboard;
