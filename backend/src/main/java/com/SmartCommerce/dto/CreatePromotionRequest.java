package com.SmartCommerce.dto;

import com.SmartCommerce.entity.Promotion;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreatePromotionRequest(
        @NotBlank(message = "Promotion code is required")
        @Size(max = 50, message = "Code must not exceed 50 characters")
        String code,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        @NotBlank(message = "Discount type is required")
        String discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Discount value must have at most 8 integer digits and 2 decimal places")
        BigDecimal discountValue,

        @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
        @Digits(integer = 8, fraction = 2, message = "Minimum order amount must have at most 8 integer digits and 2 decimal places")
        BigDecimal minimumOrderAmount,

        @Min(value = 1, message = "Maximum uses must be at least 1")
        Integer maxUses,

        @NotNull(message = "Start date is required")
        LocalDateTime startDate,

        @NotNull(message = "Expiry date is required")
        LocalDateTime expiryDate,

        Boolean isActive,

        Boolean isPublic
) {
    public Promotion toEntity() {
        Promotion.DiscountType type;
        try {
            type = Promotion.DiscountType.valueOf(discountType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid discount type. Must be PERCENTAGE or FIXED_AMOUNT");
        }

        if (startDate != null && expiryDate != null && startDate.isAfter(expiryDate)) {
            throw new IllegalArgumentException("Start date must be before expiry date");
        }

        return Promotion.builder()
                .code(code.toUpperCase().trim())
                .description(description)
                .discountType(type)
                .discountValue(discountValue)
                .minimumOrderAmount(minimumOrderAmount != null ? minimumOrderAmount : BigDecimal.ZERO)
                .maxUses(maxUses)
                .currentUses(0)
                .startDate(startDate)
                .expiryDate(expiryDate)
                .isActive(isActive != null ? isActive : true)
                .isPublic(isPublic != null ? isPublic : false)
                .build();
    }
}
