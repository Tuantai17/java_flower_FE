# Hướng dẫn Triển khai Backend Dashboard API

## Tổng quan

Tài liệu này hướng dẫn chi tiết cách triển khai các API trên Spring Boot để cung cấp dữ liệu thực cho biểu đồ Dashboard.

---

## 1. Cấu trúc API cần triển khai

| Endpoint | Method | Mô tả | Response |
|----------|--------|-------|----------|
| `/api/admin/dashboard/overview` | GET | Dữ liệu tổng quan + biểu đồ | DashboardOverviewDTO |
| `/api/admin/dashboard/revenue-chart` | GET | Dữ liệu biểu đồ doanh thu | List<RevenueChartDTO> |
| `/api/admin/dashboard/order-distribution` | GET | Phân bố đơn hàng theo trạng thái | List<OrderDistributionDTO> |

---

## 2. Data Transfer Objects (DTOs)

### 2.1 RevenueChartDTO.java

```java
package com.yourpackage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho dữ liệu biểu đồ doanh thu
 * Field names PHẢI khớp với frontend: date, revenue, orders
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueChartDTO {
    
    /** Ngày hiển thị (format: "dd/MM") */
    private String date;
    
    /** Tổng doanh thu trong ngày (VND) */
    private Double revenue;
    
    /** Số lượng đơn hàng trong ngày */
    private Long orders;
    
    // Constructor chỉ với date và revenue (dùng cho query trả về 2 field)
    public RevenueChartDTO(String date, Double revenue) {
        this.date = date;
        this.revenue = revenue;
        this.orders = 0L;
    }
}
```

### 2.2 OrderDistributionDTO.java

```java
package com.yourpackage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho dữ liệu phân bố đơn hàng
 * Dùng cho biểu đồ tròn (Pie Chart)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDistributionDTO {
    
    /** Trạng thái đơn hàng (PENDING, COMPLETED, ...) */
    private String status;
    
    /** Số lượng đơn hàng có trạng thái này */
    private Long count;
    
    /** Màu sắc hiển thị (optional, frontend có thể tự map) */
    private String color;
    
    // Constructor không có color
    public OrderDistributionDTO(String status, Long count) {
        this.status = status;
        this.count = count;
        this.color = getColorByStatus(status);
    }
    
    private String getColorByStatus(String status) {
        switch (status.toUpperCase()) {
            case "PENDING": return "#fbbf24";
            case "CONFIRMED": return "#3b82f6";
            case "SHIPPING": return "#6366f1";
            case "COMPLETED": return "#22c55e";
            case "CANCELLED": return "#ef4444";
            default: return "#9ca3af";
        }
    }
}
```

### 2.3 DashboardOverviewDTO.java

```java
package com.yourpackage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO tổng hợp cho API /overview
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardOverviewDTO {
    
    // ========== REVENUE STATS ==========
    private Double todayRevenue;
    private Double monthRevenue;
    private Double yearRevenue;
    private Double totalRevenue;
    private Double revenueGrowthPercent;
    
    // ========== ORDER STATS ==========
    private Long totalOrders;
    private Long todayOrders;
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long shippingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    
    // ========== PRODUCT STATS ==========
    private Long totalProducts;
    private Long activeProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    
    // ========== USER STATS ==========
    private Long totalUsers;
    private Long newUsersThisMonth;
    
    // ========== CHART DATA ==========
    /** Dữ liệu cho biểu đồ doanh thu (7 ngày gần nhất) */
    private List<RevenueChartDTO> revenueChartData;
    
    /** Dữ liệu cho biểu đồ phân bố đơn hàng */
    private List<OrderDistributionDTO> orderDistribution;
}
```

---

## 3. Repository Layer

### 3.1 OrderRepository.java - Thêm các Query

```java
package com.yourpackage.repository;

import com.yourpackage.entity.Order;
import com.yourpackage.dto.RevenueChartDTO;
import com.yourpackage.dto.OrderDistributionDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ========== REVENUE QUERIES ==========
    
    /**
     * Thống kê doanh thu theo ngày
     * Chỉ tính đơn hàng COMPLETED
     * 
     * @param startDate Ngày bắt đầu
     * @return List doanh thu theo ngày
     */
    @Query("SELECT new com.yourpackage.dto.RevenueChartDTO(" +
           "FUNCTION('DATE_FORMAT', o.createdAt, '%d/%m'), " +
           "COALESCE(SUM(o.finalPrice), 0.0), " +
           "COUNT(o.id)) " +
           "FROM Order o " +
           "WHERE o.createdAt >= :startDate " +
           "AND o.status = 'COMPLETED' " +
           "GROUP BY FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m-%d') " +
           "ORDER BY MIN(o.createdAt) ASC")
    List<RevenueChartDTO> getRevenueStatsByDate(@Param("startDate") LocalDateTime startDate);
    
    /**
     * Tổng doanh thu từ đơn hàng COMPLETED
     */
    @Query("SELECT COALESCE(SUM(o.finalPrice), 0.0) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();
    
    /**
     * Doanh thu hôm nay
     */
    @Query("SELECT COALESCE(SUM(o.finalPrice), 0.0) FROM Order o " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.createdAt) = CURRENT_DATE")
    Double getTodayRevenue();
    
    /**
     * Doanh thu tháng này
     */
    @Query("SELECT COALESCE(SUM(o.finalPrice), 0.0) FROM Order o " +
           "WHERE o.status = 'COMPLETED' " +
           "AND YEAR(o.createdAt) = YEAR(CURRENT_DATE) " +
           "AND MONTH(o.createdAt) = MONTH(CURRENT_DATE)")
    Double getMonthRevenue();
    
    /**
     * Doanh thu năm nay
     */
    @Query("SELECT COALESCE(SUM(o.finalPrice), 0.0) FROM Order o " +
           "WHERE o.status = 'COMPLETED' AND YEAR(o.createdAt) = YEAR(CURRENT_DATE)")
    Double getYearRevenue();
    
    // ========== ORDER DISTRIBUTION QUERIES ==========
    
    /**
     * Phân bố đơn hàng theo trạng thái
     */
    @Query("SELECT new com.yourpackage.dto.OrderDistributionDTO(o.status, COUNT(o.id)) " +
           "FROM Order o GROUP BY o.status")
    List<OrderDistributionDTO> getOrderDistribution();
    
    /**
     * Đếm đơn hàng theo trạng thái cụ thể
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);
    
    /**
     * Đếm đơn hàng hôm nay
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    Long countTodayOrders();
}
```

---

## 4. Service Layer

### 4.1 DashboardService.java

```java
package com.yourpackage.service;

import com.yourpackage.dto.*;
import com.yourpackage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");
    
    /**
     * Lấy toàn bộ dữ liệu Dashboard
     * 
     * @param period Khoảng thời gian: "7days", "30days", "3months"
     * @return DashboardOverviewDTO
     */
    public DashboardOverviewDTO getOverview(String period) {
        // Tính số ngày từ period
        int days = switch (period) {
            case "30days" -> 30;
            case "3months" -> 90;
            default -> 7;
        };
        
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        
        return DashboardOverviewDTO.builder()
                // Revenue
                .todayRevenue(orderRepository.getTodayRevenue())
                .monthRevenue(orderRepository.getMonthRevenue())
                .yearRevenue(orderRepository.getYearRevenue())
                .totalRevenue(orderRepository.getTotalRevenue())
                .revenueGrowthPercent(calculateRevenueGrowth())
                // Orders
                .totalOrders(orderRepository.count())
                .todayOrders(orderRepository.countTodayOrders())
                .pendingOrders(orderRepository.countByStatus("PENDING"))
                .confirmedOrders(orderRepository.countByStatus("CONFIRMED"))
                .shippingOrders(orderRepository.countByStatus("SHIPPING"))
                .completedOrders(orderRepository.countByStatus("COMPLETED"))
                .cancelledOrders(orderRepository.countByStatus("CANCELLED"))
                // Products
                .totalProducts(productRepository.count())
                .activeProducts(productRepository.countByActiveTrue())
                .lowStockProducts(productRepository.countByStockBetween(1, 10))
                .outOfStockProducts(productRepository.countByStock(0))
                // Users
                .totalUsers(userRepository.count())
                .newUsersThisMonth(userRepository.countNewUsersThisMonth())
                // Chart data
                .revenueChartData(getRevenueChartData(days))
                .orderDistribution(orderRepository.getOrderDistribution())
                .build();
    }
    
    /**
     * Lấy dữ liệu biểu đồ doanh thu
     * Quan trọng: Phải fill đủ các ngày không có doanh thu
     */
    public List<RevenueChartDTO> getRevenueChartData(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        
        // Lấy dữ liệu từ DB
        List<RevenueChartDTO> rawData = orderRepository.getRevenueStatsByDate(startDate);
        
        // Tạo map để lookup nhanh
        Map<String, RevenueChartDTO> dataMap = rawData.stream()
                .collect(Collectors.toMap(
                        RevenueChartDTO::getDate,
                        dto -> dto,
                        (existing, replacement) -> existing
                ));
        
        // Tạo list đầy đủ các ngày
        List<RevenueChartDTO> result = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateLabel = date.format(DATE_FORMATTER);
            
            // Nếu có dữ liệu thì dùng, không thì tạo record với revenue = 0
            RevenueChartDTO dto = dataMap.getOrDefault(
                    dateLabel,
                    new RevenueChartDTO(dateLabel, 0.0, 0L)
            );
            result.add(dto);
        }
        
        return result;
    }
    
    /**
     * Tính tỷ lệ tăng trưởng doanh thu so với tháng trước
     */
    private Double calculateRevenueGrowth() {
        Double thisMonth = orderRepository.getMonthRevenue();
        
        // Doanh thu tháng trước
        LocalDateTime lastMonthStart = LocalDateTime.now()
                .minusMonths(1)
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonthEnd = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0)
                .minusSeconds(1);
        
        // Bạn cần thêm query để lấy doanh thu tháng trước
        // Double lastMonth = orderRepository.getRevenueInRange(lastMonthStart, lastMonthEnd);
        
        // Tạm thời return demo value
        Double lastMonth = thisMonth * 0.9; // Giả sử tháng trước ít hơn 10%
        
        if (lastMonth == null || lastMonth == 0) {
            return thisMonth > 0 ? 100.0 : 0.0;
        }
        
        return ((thisMonth - lastMonth) / lastMonth) * 100;
    }
}
```

---

## 5. Controller Layer

### 5.1 AdminDashboardController.java

```java
package com.yourpackage.controller;

import com.yourpackage.dto.DashboardOverviewDTO;
import com.yourpackage.dto.RevenueChartDTO;
import com.yourpackage.dto.OrderDistributionDTO;
import com.yourpackage.service.DashboardService;
import com.yourpackage.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;
    
    /**
     * Lấy toàn bộ dữ liệu Dashboard
     * 
     * @param period Khoảng thời gian ("7days", "30days", "3months")
     * @return DashboardOverviewDTO
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewDTO>> getOverview(
            @RequestParam(defaultValue = "7days") String period) {
        
        DashboardOverviewDTO data = dashboardService.getOverview(period);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    
    /**
     * Lấy dữ liệu biểu đồ doanh thu
     * 
     * @param period Khoảng thời gian
     * @return List<RevenueChartDTO>
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<List<RevenueChartDTO>>> getRevenueChart(
            @RequestParam(defaultValue = "7days") String period) {
        
        int days = switch (period) {
            case "30days" -> 30;
            case "3months" -> 90;
            default -> 7;
        };
        
        List<RevenueChartDTO> data = dashboardService.getRevenueChartData(days);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    
    /**
     * Lấy dữ liệu phân bố đơn hàng
     * 
     * @return List<OrderDistributionDTO>
     */
    @GetMapping("/order-distribution")
    public ResponseEntity<ApiResponse<List<OrderDistributionDTO>>> getOrderDistribution() {
        List<OrderDistributionDTO> data = dashboardService.orderRepository.getOrderDistribution();
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
```

---

## 6. Lưu ý quan trọng

### 6.1 Chuẩn hóa Field Names

Frontend đã code sẵn để đọc các field names sau, **PHẢI** giữ nguyên:

| Field | Ý nghĩa | Type |
|-------|---------|------|
| `date` | Ngày hiển thị (dd/MM) | String |
| `revenue` | Doanh thu | Double |
| `orders` | Số đơn hàng | Long/Integer |
| `status` | Trạng thái | String |
| `count` | Số lượng | Long |

### 6.2 Fill Missing Dates

**Rất quan trọng!** Nếu ngày nào không có đơn hàng, phải trả về record với `revenue = 0`.

Ví dụ: Nếu query 7 ngày (21/12 đến 27/12), nhưng ngày 24/12 không có đơn, thì response vẫn phải có:
```json
[
    {"date": "21/12", "revenue": 5000000, "orders": 12},
    {"date": "22/12", "revenue": 3500000, "orders": 8},
    {"date": "23/12", "revenue": 4200000, "orders": 10},
    {"date": "24/12", "revenue": 0, "orders": 0},  // <= Ngày này phải có!
    {"date": "25/12", "revenue": 8500000, "orders": 20},
    {"date": "26/12", "revenue": 6000000, "orders": 15},
    {"date": "27/12", "revenue": 4500000, "orders": 11}
]
```

### 6.3 Response Format

Frontend expect response theo wrapper format:
```json
{
    "success": true,
    "data": { ... },
    "message": null,
    "timestamp": "2024-12-27T16:00:00"
}
```

---

## 7. Test với Postman

### 7.1 Get Overview
```
GET http://localhost:8080/api/admin/dashboard/overview?period=7days
Authorization: Bearer <admin_token>
```

### 7.2 Get Revenue Chart
```
GET http://localhost:8080/api/admin/dashboard/revenue-chart?period=30days
Authorization: Bearer <admin_token>
```

---

## 8. Sau khi triển khai Backend

Sau khi Backend đã có API, cập nhật Frontend `Dashboard.js` để gọi API thay vì dùng fallback/demo data:

1. Bỏ comment dòng gọi `dashboardApi.getOverview()`
2. Truyền `period` từ RevenueChart lên Dashboard để gọi API đúng period
3. Test lại toàn bộ flow

Nếu cần hỗ trợ cập nhật Frontend sau khi Backend xong, hãy liên hệ lại!
