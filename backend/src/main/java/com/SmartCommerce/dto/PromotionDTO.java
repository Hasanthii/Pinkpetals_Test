package com.SmartCommerce.dto;

import com.SmartCommerce.entity.Promotion;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionDTO(
        Long id,

        @NotBlank(message = "Promotion code is required")
        @Size(max = 50, message = "Code must not exceed 50 characters")
        String code,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        String discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Discount value must have at most 8 integer digits and 2 decimal places")
        BigDecimal discountValue,

        BigDecimal minimumOrderAmount,

        Integer maxUses,

        Integer currentUses,

        LocalDateTime startDate,

        LocalDateTime expiryDate,

        Boolean isActive,

        Boolean isPublic,

        Boolean isExpired,

        Boolean isValid,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
    public static PromotionDTO fromEntity(Promotion promotion) {
        return new PromotionDTO(
                promotion.getId(),
                promotion.getCode(),
                promotion.getDescription(),
                promotion.getDiscountType() != null ? promotion.getDiscountType().name() : null,
                promotion.getDiscountValue(),
                promotion.getMinimumOrderAmount(),
                promotion.getMaxUses(),
                promotion.getCurrentUses(),
                promotion.getStartDate(),
                promotion.getExpiryDate(),
                promotion.getIsActive(),
                promotion.getIsPublic(),
                promotion.isExpired(),
                promotion.isValid(),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt()
        );
    }
}
