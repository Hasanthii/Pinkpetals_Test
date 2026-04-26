package com.SmartCommerce.dto;

import com.SmartCommerce.entity.PromotionUsage;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionUsageDTO(
        Long id,

        @NotNull
        Long promotionId,

        String promotionCode,

        @NotNull
        Long userId,

        String userEmail,

        @NotNull
        Long orderId,

        @NotNull
        BigDecimal discountAmount,

        LocalDateTime usedAt
) {
    public static PromotionUsageDTO fromEntity(PromotionUsage usage) {
        return new PromotionUsageDTO(
                usage.getId(),
                usage.getPromotion().getId(),
                usage.getPromotion().getCode(),
                usage.getUser().getId(),
                usage.getUser().getEmail(),
                usage.getOrderId(),
                usage.getDiscountAmount(),
                usage.getUsedAt()
        );
    }
}
