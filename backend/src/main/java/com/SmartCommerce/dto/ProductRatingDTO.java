package com.SmartCommerce.dto;

import java.math.BigDecimal;

public record ProductRatingDTO(
        Long productId,
        BigDecimal averageRating,
        long totalReviews
) {
}
