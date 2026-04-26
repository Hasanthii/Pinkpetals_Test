package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdatePromotionRequest(
        @Size(max = 50, message = "Code must not exceed 50 characters")
        String code,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        String discountType,

        @DecimalMin(value = "0.01", message = "Discount value must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Discount value must have at most 8 integer digits and 2 decimal places")
        BigDecimal discountValue,

        @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
        @Digits(integer = 8, fraction = 2, message = "Minimum order amount must have at most 8 integer digits and 2 decimal places")
        BigDecimal minimumOrderAmount,

        @Min(value = 1, message = "Maximum uses must be at least 1")
        Integer maxUses,

        LocalDateTime startDate,

        LocalDateTime expiryDate,

        Boolean isActive,

        Boolean isPublic
) {
}
