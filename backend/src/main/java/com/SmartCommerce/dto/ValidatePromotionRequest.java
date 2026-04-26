package com.SmartCommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ValidatePromotionRequest(
        @NotBlank(message = "Promotion code is required")
        String code,

        @NotNull(message = "Order amount is required")
        BigDecimal orderAmount
) {
}
