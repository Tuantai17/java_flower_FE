/**
 * OrderPieChart Component
 * 
 * Biểu đồ tròn (Donut) thống kê đơn hàng theo trạng thái
 * Kết nối với Backend API thực
 * 
 * @version 2.0.0 - Kết nối API Backend
 */

import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { ChartPieIcon } from '@heroicons/react/24/outline';

// ============================================
// CONSTANTS
// ============================================

/** Màu sắc cho từng trạng thái */
const STATUS_COLORS = {
    PENDING: '#fbbf24',
    CONFIRMED: '#3b82f6',
    PREPARING: '#8b5cf6',
    SHIPPING: '#6366f1',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
    DELIVERED: '#22c55e',
};

/** Nhãn tiếng Việt */
const STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Đang chuẩn bị',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    DELIVERED: 'Đã giao',
};

/** Demo data */
const DEMO_DATA = {
    totalOrders: 85,
    segments: [
        { name: 'Hoàn thành', status: 'COMPLETED', value: 45, percentage: 52.9, color: '#22c55e' },
        { name: 'Đang giao', status: 'SHIPPING', value: 15, percentage: 17.6, color: '#6366f1' },
        { name: 'Chờ xử lý', status: 'PENDING', value: 12, percentage: 14.1, color: '#fbbf24' },
        { name: 'Đã xác nhận', status: 'CONFIRMED', value: 8, percentage: 9.4, color: '#3b82f6' },
        { name: 'Đã hủy', status: 'CANCELLED', value: 5, percentage: 5.9, color: '#ef4444' },
    ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize data từ API hoặc legacy format
 */
const normalizeData = (data) => {
    // Nếu data đã có format mới { totalOrders, segments }
    if (data && data.segments && Array.isArray(data.segments)) {
        return {
            totalOrders: data.totalOrders || data.segments.reduce((sum, s) => sum + s.value, 0),
            segments: data.segments.map(s => ({
                ...s,
                name: s.name || STATUS_LABELS[s.status] || s.status,
                color: s.color || STATUS_COLORS[s.status] || '#9ca3af',
            })),
        };
    }

    // Nếu data là legacy format { pendingOrders, completedOrders, ... }
    if (data && (data.pendingOrders !== undefined || data.completedOrders !== undefined)) {
        const mappings = [
            { key: 'pendingOrders', status: 'PENDING' },
            { key: 'confirmedOrders', status: 'CONFIRMED' },
            { key: 'shippingOrders', status: 'SHIPPING' },
            { key: 'completedOrders', status: 'COMPLETED' },
            { key: 'cancelledOrders', status: 'CANCELLED' },
        ];

        const segments = mappings
            .map(({ key, status }) => ({
                name: STATUS_LABELS[status],
                status,
                value: data[key] || 0,
                color: STATUS_COLORS[status],
            }))
            .filter(s => s.value > 0);

        const total = segments.reduce((sum, s) => sum + s.value, 0);

        return {
            totalOrders: total,
            segments: segments.map(s => ({
                ...s,
                percentage: total > 0 ? (s.value / total) * 100 : 0,
            })),
        };
    }

    // Fallback to demo data
    return DEMO_DATA;
};

// ============================================
// SUB-COMPONENTS
// ============================================

/** Custom Tooltip */
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.color }}
                />
                <span className="font-semibold text-gray-800">{data.name}</span>
            </div>
            <p className="text-sm text-gray-500">
                {data.value} đơn hàng ({data.percentage?.toFixed(1) || 0}%)
            </p>
        </div>
    );
};

/** Custom Legend */
const ChartLegend = ({ payload }) => {
    if (!payload) return null;

    return (
        <div className="flex flex-col gap-2 ml-4">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2 text-sm">
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/** Loading Skeleton */
const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gray-100 animate-pulse" />
        </div>
    </div>
);

/** Status List */
const StatusList = ({ segments, totalOrders }) => (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        {segments.map((item) => (
            <div
                key={item.status || item.name}
                className="flex items-center justify-between text-sm"
            >
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{item.value}</span>
                    <span className="text-gray-400 text-xs">
                        ({item.percentage?.toFixed(1) || 0}%)
                    </span>
                </div>
            </div>
        ))}
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const OrderPieChart = ({
    data = null,
    loading = false,
    title = 'Phân bố đơn hàng',
}) => {
    // Normalize và xử lý data
    const chartData = useMemo(() => {
        return normalizeData(data);
    }, [data]);

    const isDemo = !data || (!data.segments && !data.pendingOrders);

    // Loading
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ChartPieIcon className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>

            {/* Summary - Center of donut */}
            <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-800">{chartData.totalOrders}</p>
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: '224px', minWidth: '200px', minHeight: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                        <Pie
                            data={chartData.segments}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            animationDuration={800}
                        >
                            {chartData.segments.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="white"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                            content={ChartLegend}
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Status List */}
            <StatusList segments={chartData.segments} totalOrders={chartData.totalOrders} />

            {/* Demo indicator */}
            {isDemo && (
                <p className="text-center text-xs text-gray-400 mt-4 italic">
                    * Dữ liệu mẫu
                </p>
            )}
        </div>
    );
};

export default OrderPieChart;
