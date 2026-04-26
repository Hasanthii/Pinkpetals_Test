package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CreateProcurementOrderRequest(
        @NotNull(message = "Supplier ID is required")
        Long supplierId,

        @NotBlank(message = "Order number is required")
        @Size(max = 50, message = "Order number must not exceed 50 characters")
        String orderNumber,

        @NotNull(message = "Order date is required")
        LocalDateTime orderDate,

        LocalDateTime expectedDelivery,

        String notes,

        @NotNull(message = "Items are required")
        @Size(min = 1, message = "At least one item is required")
        List<CreateProcurementItemRequest> items
) {
}
