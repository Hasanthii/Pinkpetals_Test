package com.SmartCommerce.dto;

import java.math.BigDecimal;
import java.util.Map;

public record OrderStatsDTO(
        long totalOrders,
        long pendingOrders,
        long processingOrders,
        long shippedOrders,
        long deliveredOrders,
        long cancelledOrders,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue,
        Map<String, Long> ordersByStatus,
        Map<String, BigDecimal> revenueByMonth
) {
}
