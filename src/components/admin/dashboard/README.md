# Dashboard Charts Documentation

## Tổng quan

Thư mục `src/components/admin/dashboard/` chứa tất cả các component liên quan đến trang Admin Dashboard, bao gồm các biểu đồ Recharts.

## Cấu trúc thư mục

```
src/
├── types/
│   └── dashboard.js              # Types & Constants cho Dashboard
├── api/
│   └── dashboardApi.js           # API Service kết nối Backend
├── components/
│   └── admin/
│       └── dashboard/
│           ├── index.js          # Export tất cả components
│           ├── WelcomeBanner.js  # Banner chào mừng
│           ├── QuickActionCard.js # Card thao tác nhanh
│           ├── RecentOrdersCard.js # Đơn hàng gần đây
│           ├── TopProductsCard.js  # Sản phẩm bán chạy
│           ├── LowStockCard.js     # Cảnh báo hết hàng
│           ├── OrderStatsCard.js   # Thống kê đơn theo status
│           ├── RevenueStatsCard.js # Card thống kê doanh thu
│           ├── RevenueChart.js     # **Biểu đồ doanh thu (Recharts)**
│           └── OrderPieChart.js    # **Biểu đồ tròn đơn hàng (Recharts)**
└── pages/
    └── admin/
        └── Dashboard.js           # Trang Dashboard chính
```

---

## API Endpoints

Dashboard kết nối với các Backend API sau:

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/admin/dashboard/quick-stats` | GET | Thống kê nhanh (tổng quan) |
| `/api/admin/dashboard/revenue-chart?period=7days` | GET | Dữ liệu biểu đồ doanh thu |
| `/api/admin/dashboard/order-distribution` | GET | Phân bố đơn hàng theo trạng thái |
| `/api/admin/dashboard/recent-orders?limit=5` | GET | Đơn hàng gần đây |
| `/api/admin/dashboard/top-products?limit=5` | GET | Sản phẩm bán chạy |
| `/api/admin/dashboard/low-stock?limit=5` | GET | Sản phẩm sắp hết hàng |

---

## RevenueChart Component

### Mô tả
Biểu đồ doanh thu hỗ trợ 3 loại: Area, Bar, Line. Có thể chọn khoảng thời gian.

### Import
```jsx
import { RevenueChart } from '../../components/admin/dashboard';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RevenueChartData` | `null` | Dữ liệu từ API |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `onRefresh` | `function` | `null` | Callback khi click refresh |
| `onPeriodChange` | `function` | `null` | Callback khi thay đổi period |
| `title` | `string` | `'Biểu đồ doanh thu'` | Tiêu đề |
| `initialPeriod` | `string` | `'7days'` | Period mặc định |

### Cấu trúc data từ API
```javascript
{
    period: '7days',
    totalRevenue: 32651282,
    totalOrders: 179,
    growthPercent: 12.5,
    dataPoints: [
        { label: '21/12', revenue: 5000000, orders: 12 },
        { label: '22/12', revenue: 3500000, orders: 8 },
        // ...
    ]
}
```

### Ví dụ sử dụng
```jsx
<RevenueChart
    data={revenueChartData}
    loading={isLoading}
    onRefresh={() => fetchRevenueChart(period)}
    onPeriodChange={(newPeriod) => handlePeriodChange(newPeriod)}
    title="Biểu đồ doanh thu"
    initialPeriod="7days"
/>
```

---

## OrderPieChart Component

### Mô tả
Biểu đồ tròn (Donut) thống kê đơn hàng theo trạng thái.

### Import
```jsx
import { OrderPieChart } from '../../components/admin/dashboard';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `OrderDistribution` | `null` | Dữ liệu từ API |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `title` | `string` | `'Phân bố đơn hàng'` | Tiêu đề |

### Cấu trúc data từ API
```javascript
{
    totalOrders: 85,
    segments: [
        { name: 'Hoàn thành', status: 'COMPLETED', value: 45, percentage: 52.9, color: '#22c55e' },
        { name: 'Đang giao', status: 'SHIPPING', value: 15, percentage: 17.6, color: '#6366f1' },
        { name: 'Chờ xử lý', status: 'PENDING', value: 12, percentage: 14.1, color: '#fbbf24' },
        // ...
    ]
}
```

### Ví dụ sử dụng
```jsx
<OrderPieChart
    data={orderDistributionData}
    loading={isLoading}
    title="Phân bố đơn hàng"
/>
```

---

## Fallback & Demo Data

Cả hai component đều có cơ chế fallback:

1. **Nếu API thất bại**: Component sẽ tự động hiển thị dữ liệu demo
2. **Indicator "Dữ liệu mẫu"**: Hiển thị text nhỏ ở footer khi dùng demo data
3. **Không break UI**: Dashboard vẫn hoạt động ngay cả khi Backend chưa sẵn sàng

---

## Cấu trúc Code Pattern

Mỗi component tuân theo cấu trúc sau:

```javascript
// ============================================
// CONSTANTS - Định nghĩa bên ngoài component
// ============================================
const CHART_COLORS = { ... };
const STATUS_LABELS = { ... };

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatCurrency = (value) => { ... };
const generateDemoData = (days) => { ... };

// ============================================
// SUB-COMPONENTS
// ============================================
const LoadingSkeleton = () => ( ... );
const ChartTooltip = ({ active, payload }) => ( ... );
const ChartLegend = ({ payload }) => ( ... );

// ============================================
// MAIN COMPONENT
// ============================================
const ComponentName = ({ props }) => {
    // State
    const [state, setState] = useState(...);
    
    // Memoized values
    const data = useMemo(() => { ... }, [deps]);
    
    // Callbacks
    const handleClick = useCallback(() => { ... }, [deps]);
    
    // Render
    if (loading) return <LoadingSkeleton />;
    
    return (
        <div>
            {/* Component content */}
        </div>
    );
};

export default ComponentName;
```

---

## Dependencies

```json
{
    "recharts": "^2.x.x",
    "@heroicons/react": "^2.x.x"
}
```

---

## Troubleshooting

### Warning: width(-1) and height(-1)

Đã được fix bằng cách thêm `minWidth` và `minHeight` vào `ResponsiveContainer`:

```jsx
<ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
    {/* Chart */}
</ResponsiveContainer>
```

### API trả về 500 Error

1. Kiểm tra Backend đã chạy chưa
2. Kiểm tra token authentication
3. Dashboard sẽ fallback sang demo data nếu API lỗi

---

## Version History

- **v2.0.0** - Kết nối Backend API thực, cấu trúc sạch sẽ
- **v1.0.0** - Phiên bản đầu tiên với demo data
