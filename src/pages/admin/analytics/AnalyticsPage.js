/**
 * Analytics Page - Trang Thống Kê Admin
 * 
 * Cấu trúc sạch, dễ bảo trì và mở rộng
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ChartBarIcon,
    ArrowPathIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    CubeIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

// API
import productApi from '../../../api/productApi';
import orderApi from '../../../api/orderApi';
import categoryApi from '../../../api/categoryApi';

// ============================================
// CONSTANTS
// ============================================

const TIME_PERIODS = [
    { key: '7days', label: '7 ngày qua', days: 7 },
    { key: '30days', label: '30 ngày qua', days: 30 },
    { key: '3months', label: '3 tháng qua', days: 90 },
    { key: '6months', label: '6 tháng qua', days: 180 },
];

const CHART_COLORS = {
    primary: '#ec4899',
    secondary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
};

const ORDER_STATUS_COLORS = {
    PENDING: '#fbbf24',
    CONFIRMED: '#3b82f6',
    SHIPPING: '#8b5cf6',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
};

const ORDER_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

const formatShortCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
};

const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Loading Skeleton
const LoadingSkeleton = ({ height = 'h-80' }) => (
    <div className={`bg-white rounded-2xl shadow-soft p-6 ${height}`}>
        <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl" />
        </div>
    </div>
);

// Summary Card
const SummaryCard = ({ title, value, change, icon: Icon, color, subValue }) => {
    const isPositive = change >= 0;
    const colorClasses = {
        pink: 'from-pink-500 to-rose-500',
        blue: 'from-blue-500 to-indigo-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-violet-500',
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
                {change !== undefined && change !== null && (
                    <div className={`flex items-center gap-1 text-sm font-medium
                        ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {isPositive ? (
                            <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        {Math.abs(change).toFixed(1)}%
                    </div>
                )}
            </div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
    );
};

// Date Range Dropdown
const DateRangeDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentPeriod = TIME_PERIODS.find(p => p.key === value) || TIME_PERIODS[1];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 
                           rounded-xl hover:bg-gray-50 transition-colors min-w-[160px]"
            >
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{currentPeriod.label}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 ml-auto transition-transform
                    ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg 
                                border border-gray-100 py-2 z-50">
                    {TIME_PERIODS.map((period) => (
                        <button
                            key={period.key}
                            onClick={() => { onChange(period.key); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors
                                ${value === period.key
                                    ? 'bg-pink-50 text-pink-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Chart Tooltip
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <p className="font-semibold text-gray-800 mb-2">{label}</p>
            <div className="space-y-1">
                {payload.map((item, idx) => (
                    <p key={idx} className="text-sm flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-500">{item.name}:</span>
                        <span className="font-semibold" style={{ color: item.color }}>
                            {item.dataKey === 'revenue'
                                ? formatCurrency(item.value)
                                : formatNumber(item.value)
                            }
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AnalyticsPage = () => {
    // ========== STATE ==========
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30days');

    // Raw data
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);

    // Get period days
    const periodDays = useMemo(() => {
        const found = TIME_PERIODS.find(p => p.key === period);
        return found?.days || 30;
    }, [period]);

    // ========== FETCH DATA ==========
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [productsRes, ordersRes, categoriesRes] = await Promise.allSettled([
                productApi.getPaginated(0, 500),
                orderApi.getAllOrders({ size: 500 }),
                categoryApi.getAll(),
            ]);

            const productsData = productsRes.status === 'fulfilled'
                ? (productsRes.value?.content || productsRes.value || [])
                : [];
            setProducts(Array.isArray(productsData) ? productsData : []);

            const ordersData = ordersRes.status === 'fulfilled'
                ? (ordersRes.value?.content || ordersRes.value || [])
                : [];
            setOrders(Array.isArray(ordersData) ? ordersData : []);

            const categoriesData = categoriesRes.status === 'fulfilled'
                ? (categoriesRes.value || [])
                : [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ========== COMPUTED DATA ==========

    // Summary Statistics
    const summaryStats = useMemo(() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - periodDays);
        startDate.setHours(0, 0, 0, 0);

        const periodOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt || o.orderDate);
            return orderDate >= startDate && orderDate <= today;
        });

        const completedOrders = periodOrders.filter(o =>
            o.status === 'COMPLETED' || o.status === 'DELIVERED'
        );

        const totalRevenue = completedOrders.reduce(
            (sum, o) => sum + (o.finalPrice || o.totalAmount || 0), 0
        );

        // Previous period for comparison
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - periodDays);

        const prevPeriodOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt || o.orderDate);
            return orderDate >= prevStartDate && orderDate < startDate;
        });

        const prevCompleted = prevPeriodOrders.filter(o =>
            o.status === 'COMPLETED' || o.status === 'DELIVERED'
        );

        const prevRevenue = prevCompleted.reduce(
            (sum, o) => sum + (o.finalPrice || o.totalAmount || 0), 0
        );

        const revenueGrowth = prevRevenue > 0
            ? ((totalRevenue - prevRevenue) / prevRevenue * 100)
            : (totalRevenue > 0 ? 100 : 0);

        const ordersGrowth = prevPeriodOrders.length > 0
            ? ((periodOrders.length - prevPeriodOrders.length) / prevPeriodOrders.length * 100)
            : (periodOrders.length > 0 ? 100 : 0);

        return {
            totalRevenue,
            revenueGrowth,
            totalOrders: periodOrders.length,
            ordersGrowth,
            completedOrders: completedOrders.length,
            cancelledOrders: periodOrders.filter(o => o.status === 'CANCELLED').length,
            avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
            totalProducts: products.length,
            activeProducts: products.filter(p => p.active).length,
        };
    }, [orders, products, periodDays]);

    // Revenue Chart Data
    const revenueChartData = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const dateList = [];
        for (let i = periodDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dateList.push(date);
        }

        const revenueByDate = {};
        dateList.forEach(date => {
            const dateKey = getLocalDateKey(date);
            revenueByDate[dateKey] = { revenue: 0, orders: 0 };
        });

        const startDate = new Date(dateList[0]);
        startDate.setHours(0, 0, 0, 0);

        const completedOrders = orders.filter(o =>
            o.status === 'COMPLETED' || o.status === 'DELIVERED'
        );

        completedOrders.forEach(order => {
            const orderDateStr = order.createdAt || order.orderDate;
            if (!orderDateStr) return;

            const orderDate = new Date(orderDateStr);
            if (orderDate >= startDate && orderDate <= today) {
                const dateKey = getLocalDateKey(orderDate);
                if (revenueByDate[dateKey] !== undefined) {
                    revenueByDate[dateKey].revenue += order.finalPrice || order.totalAmount || 0;
                    revenueByDate[dateKey].orders += 1;
                }
            }
        });

        return dateList.map(date => {
            const dateKey = getLocalDateKey(date);
            const data = revenueByDate[dateKey] || { revenue: 0, orders: 0 };
            return {
                label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                revenue: data.revenue,
                orders: data.orders,
            };
        });
    }, [orders, periodDays]);

    // Order Status Distribution
    const orderStatusData = useMemo(() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - periodDays);

        const periodOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt || o.orderDate);
            return orderDate >= startDate && orderDate <= today;
        });

        const statusCount = { PENDING: 0, CONFIRMED: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 };

        periodOrders.forEach(order => {
            const status = order.status;
            if (status === 'DELIVERED') statusCount.COMPLETED++;
            else if (status === 'DELIVERING') statusCount.SHIPPING++;
            else if (statusCount[status] !== undefined) statusCount[status]++;
        });

        return Object.entries(statusCount)
            .filter(([_, count]) => count > 0)
            .map(([status, count]) => ({
                name: ORDER_STATUS_LABELS[status],
                value: count,
                color: ORDER_STATUS_COLORS[status],
            }));
    }, [orders, periodDays]);

    // Top Products
    const topProducts = useMemo(() => {
        const completedOrders = orders.filter(o =>
            o.status === 'COMPLETED' || o.status === 'DELIVERED'
        );

        const soldCountMap = {};
        const revenueMap = {};

        completedOrders.forEach(order => {
            const items = order.items || order.orderItems || order.orderDetails || [];
            items.forEach(item => {
                const productId = item.productId || item.product?.id || item.id;
                const quantity = item.quantity || item.qty || 1;
                const price = item.price || item.unitPrice || 0;

                if (productId) {
                    soldCountMap[productId] = (soldCountMap[productId] || 0) + quantity;
                    revenueMap[productId] = (revenueMap[productId] || 0) + (price * quantity);
                }
            });
        });

        return products
            .map(product => ({
                ...product,
                totalSold: soldCountMap[product.id] || 0,
                totalRevenue: revenueMap[product.id] || 0,
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
    }, [products, orders]);

    // Top Categories
    const topCategories = useMemo(() => {
        const completedOrders = orders.filter(o =>
            o.status === 'COMPLETED' || o.status === 'DELIVERED'
        );

        const categoryStats = {};

        // Tạo map category từ danh sách categories
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat;
        });

        completedOrders.forEach(order => {
            const items = order.items || order.orderItems || order.orderDetails || [];
            items.forEach(item => {
                // Lấy thông tin product từ item hoặc từ danh sách products
                const productId = item.productId || item.product?.id;
                const product = products.find(p => p.id === productId);

                // Lấy category info từ nhiều nguồn
                let catId = null;
                let catName = 'Khác';

                // 1. Thử lấy từ product.category (nếu có)
                if (product?.category?.id) {
                    catId = product.category.id;
                    catName = product.category.name || 'Khác';
                }
                // 2. Thử lấy từ product.categoryId và map với categories
                else if (product?.categoryId) {
                    catId = product.categoryId;
                    const catFromList = categoryMap[catId];
                    catName = catFromList?.name || 'Khác';
                }
                // 3. Thử lấy từ item.product nếu có
                else if (item.product?.category?.id) {
                    catId = item.product.category.id;
                    catName = item.product.category.name || 'Khác';
                }
                else if (item.product?.categoryId) {
                    catId = item.product.categoryId;
                    const catFromList = categoryMap[catId];
                    catName = catFromList?.name || 'Khác';
                }

                // Nếu tìm được category, thêm vào thống kê
                if (catId) {
                    if (!categoryStats[catId]) {
                        categoryStats[catId] = { id: catId, name: catName, revenue: 0, count: 0 };
                    }

                    const quantity = item.quantity || item.qty || 1;
                    const price = item.price || item.unitPrice || product?.price || 0;
                    categoryStats[catId].revenue += price * quantity;
                    categoryStats[catId].count += quantity;
                }
            });
        });

        console.log('[Analytics] Category stats:', categoryStats);
        console.log('[Analytics] Products sample:', products.slice(0, 2));
        console.log('[Analytics] Categories:', categories);

        // Nếu không có dữ liệu từ orders, tính từ products trực tiếp
        if (Object.keys(categoryStats).length === 0 && products.length > 0) {
            console.log('[Analytics] Fallback: Calculating category stats from products');

            products.forEach(product => {
                let catId = product.category?.id || product.categoryId;
                let catName = product.category?.name;

                if (catId && !catName) {
                    const catFromList = categoryMap[catId];
                    catName = catFromList?.name || 'Khác';
                }

                if (catId) {
                    if (!categoryStats[catId]) {
                        categoryStats[catId] = { id: catId, name: catName || 'Khác', revenue: 0, count: 0 };
                    }
                    // Sử dụng giá sản phẩm làm doanh thu ước tính
                    categoryStats[catId].revenue += product.price || 0;
                    categoryStats[catId].count += 1;
                }
            });
        }

        return Object.values(categoryStats)
            .filter(cat => cat.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders, products, categories]);

    // ========== RENDER ==========

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <LoadingSkeleton key={i} height="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <ChartBarIcon className="h-8 w-8 text-pink-500" />
                        Thống kê & Phân tích
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Xem báo cáo chi tiết về hoạt động kinh doanh
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <DateRangeDropdown value={period} onChange={setPeriod} />
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 
                                   transition-colors"
                        title="Làm mới dữ liệu"
                    >
                        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Tổng doanh thu"
                    value={formatCurrency(summaryStats.totalRevenue)}
                    change={summaryStats.revenueGrowth}
                    icon={CurrencyDollarIcon}
                    color="pink"
                />
                <SummaryCard
                    title="Tổng đơn hàng"
                    value={formatNumber(summaryStats.totalOrders)}
                    change={summaryStats.ordersGrowth}
                    icon={ShoppingCartIcon}
                    color="blue"
                />
                <SummaryCard
                    title="Đơn hoàn thành"
                    value={formatNumber(summaryStats.completedOrders)}
                    icon={ArrowTrendingUpIcon}
                    color="green"
                    subValue={`${summaryStats.cancelledOrders} đơn đã hủy`}
                />
                <SummaryCard
                    title="Giá trị TB/đơn"
                    value={formatCurrency(summaryStats.avgOrderValue)}
                    icon={CubeIcon}
                    color="purple"
                    subValue={`${summaryStats.activeProducts} sản phẩm đang bán`}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-pink-500" />
                                Biểu đồ doanh thu
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Tổng: <strong className="text-pink-600">
                                    {formatCurrency(revenueChartData.reduce((s, d) => s + d.revenue, 0))}
                                </strong>
                            </p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={revenueChartData}>
                                <defs>
                                    <linearGradient id="colorRevenueAn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#E5E7EB' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                    tickFormatter={formatShortCurrency}
                                    tickLine={false}
                                    axisLine={false}
                                    width={50}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Doanh thu"
                                    stroke={CHART_COLORS.primary}
                                    strokeWidth={2}
                                    fill="url(#colorRevenueAn)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
                        Phân bố đơn hàng
                    </h3>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    iconSize={10}
                                    formatter={(value) => (
                                        <span className="text-sm text-gray-600">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <CubeIcon className="h-5 w-5 text-purple-500" />
                        Sản phẩm bán chạy
                    </h3>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center gap-4">
                                    <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full 
                                                   flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Đã bán: {formatNumber(product.totalSold)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-pink-600">
                                        {formatCurrency(product.totalRevenue)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                Chưa có dữ liệu
                            </p>
                        )}
                    </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <ChartBarIcon className="h-5 w-5 text-green-500" />
                        Danh mục bán chạy
                    </h3>
                    {topCategories.length > 0 ? (
                        <div style={{ width: '100%', height: '250px' }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={topCategories}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis
                                        type="number"
                                        tickFormatter={formatShortCurrency}
                                        tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#374151' }}
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        labelFormatter={(label) => `Danh mục: ${label}`}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        fill={CHART_COLORS.success}
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">
                            Chưa có dữ liệu
                        </p>
                    )}
                </div>
            </div>

            {/* Order Trend Chart */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                    <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
                    Xu hướng đơn hàng
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                        <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickLine={false}
                                axisLine={{ stroke: '#E5E7EB' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar
                                dataKey="orders"
                                name="Đơn hàng"
                                fill={CHART_COLORS.secondary}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                    <p className="font-medium">Đã có lỗi xảy ra</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
