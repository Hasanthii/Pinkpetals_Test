package com.SmartCommerce.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RecordPromotionUsageRequest(
        @NotNull(message = "Promotion code is required")
        String code,

        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Order ID is required")
        Long orderId,

        @NotNull(message = "Order amount is required")
        BigDecimal orderAmount
) {
}
