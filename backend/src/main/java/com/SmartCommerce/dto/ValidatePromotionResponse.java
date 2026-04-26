package com.SmartCommerce.dto;

import java.math.BigDecimal;

public record ValidatePromotionResponse(
        Boolean isValid,
        String code,
        String discountType,
        BigDecimal discountValue,
        BigDecimal calculatedDiscount,
        String message
) {
}
