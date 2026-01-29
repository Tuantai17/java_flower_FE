/**
 * RevenueChart Component
 * 
 * Biểu đồ doanh thu với nhiều loại hiển thị (Area, Bar, Line)
 * Kết nối với Backend API thực
 * 
 * @version 2.0.0 - Kết nối API Backend
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
} from 'recharts';
import {
    ArrowPathIcon,
    ChartBarIcon,
    Squares2X2Icon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

// ============================================
// CONSTANTS
// ============================================

/** Các loại biểu đồ */
export const CHART_TYPES = {
    AREA: 'area',
    BAR: 'bar',
    LINE: 'line',
};

/** Các khoảng thời gian */
export const TIME_PERIODS = [
    { key: '7days', label: '7 ngày', days: 7 },
    { key: '30days', label: '30 ngày', days: 30 },
    { key: '3months', label: '3 tháng', days: 90 },
];

/** Màu sắc */
const CHART_COLORS = {
    primary: '#be123c',      // Rose-700
    secondary: '#d97706',    // Amber-600
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format số tiền thành dạng ngắn gọn
 */
const formatShortCurrency = (value) => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

/**
 * Format số tiền đầy đủ
 */
const formatFullCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0);
};

/**
 * Tạo dữ liệu demo
 */
const generateDemoData = (days) => {
    const demoData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const baseRevenue = 2000000 + Math.random() * 3000000;
        const weekendBonus = [0, 6].includes(date.getDay()) ? 1.5 : 1;

        demoData.push({
            label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            revenue: Math.round(baseRevenue * weekendBonus),
            orders: Math.round(5 + Math.random() * 15 * weekendBonus),
        });
    }

    return demoData;
};

// ============================================
// SUB-COMPONENTS
// ============================================

/** Custom Tooltip */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <p className="font-semibold text-gray-800 mb-2">{label}</p>
            <div className="space-y-1">
                <p className="text-sm flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-gray-500">Doanh thu:</span>
                    <span className="font-semibold text-pink-600">
                        {formatFullCurrency(payload[0]?.value)}
                    </span>
                </p>
                {payload[1] && (
                    <p className="text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-500">Đơn hàng:</span>
                        <span className="font-semibold text-blue-600">
                            {payload[1]?.value} đơn
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

/** Gradient Definitions */
const GradientDefs = () => (
    <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
        </linearGradient>
    </defs>
);

/** Period Selector */
const PeriodSelector = ({ period, onChange }) => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {TIME_PERIODS.map((p) => (
            <button
                key={p.key}
                onClick={() => onChange(p.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${period === p.key
                    ? 'bg-white text-pink-600 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
            >
                {p.label}
            </button>
        ))}
    </div>
);

/** Chart Type Selector */
const ChartTypeSelector = ({ chartType, onChange }) => {
    const buttons = [
        { type: CHART_TYPES.AREA, icon: Squares2X2Icon, title: 'Biểu đồ Area' },
        { type: CHART_TYPES.BAR, icon: ChartBarIcon, title: 'Biểu đồ cột' },
        { type: CHART_TYPES.LINE, icon: ArrowTrendingUpIcon, title: 'Biểu đồ đường' },
    ];

    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {buttons.map(({ type, icon: Icon, title }) => (
                <button
                    key={type}
                    onClick={() => onChange(type)}
                    className={`p-2 rounded-md transition-all ${chartType === type
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    title={title}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
};

/** Loading Skeleton */
const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
        <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl animate-pulse" />
    </div>
);

/** Chart Footer */
const ChartFooter = ({ isDemo, chartType }) => (
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                <span>Doanh thu</span>
            </div>
            {chartType === CHART_TYPES.LINE && (
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Số đơn hàng</span>
                </div>
            )}
        </div>
        {isDemo && (
            <span className="italic text-gray-400">
                * Dữ liệu mẫu - Kết nối API để xem số liệu thực
            </span>
        )}
    </div>
);

// ============================================
// CHART RENDER FUNCTIONS
// ============================================

const commonChartProps = (data) => ({
    data,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
});

const xAxisProps = {
    dataKey: 'label',
    tick: { fontSize: 12, fill: '#9CA3AF' },
    tickLine: false,
    axisLine: { stroke: '#E5E7EB' },
    dy: 10,
};

const yAxisProps = {
    tick: { fontSize: 12, fill: '#9CA3AF' },
    tickFormatter: formatShortCurrency,
    tickLine: false,
    axisLine: false,
    width: 55,
};

const renderAreaChart = (data) => (
    <AreaChart {...commonChartProps(data)}>
        <GradientDefs />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Area
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
        />
    </AreaChart>
);

const renderBarChart = (data) => (
    <BarChart {...commonChartProps(data)}>
        <GradientDefs />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Bar
            dataKey="revenue"
            name="Doanh thu"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
        />
    </BarChart>
);

const renderLineChart = (data) => (
    <LineChart {...commonChartProps(data)}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis {...xAxisProps} />
        <YAxis yAxisId="left" {...yAxisProps} />
        <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            width={30}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: CHART_COLORS.primary }}
        />
        <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Đơn hàng"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 3 }}
        />
    </LineChart>
);

// ============================================
// MAIN COMPONENT
// ============================================

const RevenueChart = ({
    data = null,
    loading = false,
    onRefresh = null,
    onPeriodChange = null,
    title = 'Biểu đồ doanh thu',
    initialPeriod = '7days',
}) => {
    // State
    const [chartType, setChartType] = useState(CHART_TYPES.AREA);
    const [period, setPeriod] = useState(initialPeriod);

    // Đồng bộ period với initialPeriod khi prop thay đổi
    useEffect(() => {
        setPeriod(initialPeriod);
    }, [initialPeriod]);

    // Xác định có phải dữ liệu demo không
    const isDemo = !data || !data.dataPoints || data.dataPoints.length === 0;

    // Xử lý dữ liệu cho chart
    const chartData = useMemo(() => {
        // Nếu có dữ liệu từ API
        if (data && data.dataPoints && data.dataPoints.length > 0) {
            return data.dataPoints;
        }

        // Tạo demo data
        const selectedPeriod = TIME_PERIODS.find(p => p.key === period);
        return generateDemoData(selectedPeriod?.days || 7);
    }, [data, period]);

    // Tính tổng
    const totalRevenue = useMemo(() => {
        if (data && data.totalRevenue) return data.totalRevenue;
        return chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    }, [data, chartData]);

    const totalOrders = useMemo(() => {
        if (data && data.totalOrders) return data.totalOrders;
        return chartData.reduce((sum, item) => sum + (item.orders || 0), 0);
    }, [data, chartData]);

    const growthPercent = data?.growthPercent || 0;

    // Handle period change
    const handlePeriodChange = useCallback((newPeriod) => {
        setPeriod(newPeriod);
        onPeriodChange?.(newPeriod);
    }, [onPeriodChange]);

    // Handle chart type change
    const handleChartTypeChange = useCallback((newType) => {
        setChartType(newType);
    }, []);

    // Render chart
    const renderChart = () => {
        switch (chartType) {
            case CHART_TYPES.BAR:
                return renderBarChart(chartData);
            case CHART_TYPES.LINE:
                return renderLineChart(chartData);
            default:
                return renderAreaChart(chartData);
        }
    };

    // Loading
    if (loading) {
        return <LoadingSkeleton />;
    }

    // Get period label
    const periodLabel = TIME_PERIODS.find(p => p.key === period)?.label || '7 ngày';

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-pink-500" />
                        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                            <span className="text-gray-400">{periodLabel}:</span>{' '}
                            <strong className="text-pink-600">{formatFullCurrency(totalRevenue)}</strong>
                        </span>
                        <span>•</span>
                        <span>{totalOrders} đơn hàng</span>
                        {growthPercent !== 0 && (
                            <>
                                <span>•</span>
                                <span className={growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {growthPercent >= 0 ? '↑' : '↓'} {Math.abs(growthPercent).toFixed(1)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <PeriodSelector period={period} onChange={handlePeriodChange} />
                    <ChartTypeSelector chartType={chartType} onChange={handleChartTypeChange} />

                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            title="Làm mới"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: '320px', minWidth: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>

            {/* Footer */}
            <ChartFooter isDemo={isDemo} chartType={chartType} />
        </div>
    );
};

export default RevenueChart;
