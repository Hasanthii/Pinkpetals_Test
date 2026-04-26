package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProcurementItemRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String productName,

        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.00", message = "Unit price must be zero or greater")
        BigDecimal unitPrice
) {
}
