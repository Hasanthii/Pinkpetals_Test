package com.SmartCommerce.dto;

import com.SmartCommerce.entity.Review;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record ReviewDTO(
        Long id,
        Long productId,
        String productName,
        Long userId,
        String userFirstName,
        String userLastName,
        Integer rating,
        String comment,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String adminReply,
        LocalDateTime repliedAt
) {
    public static ReviewDTO fromEntity(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getId(),
                review.getUser().getFirstName(),
                review.getUser().getLastName(),
                review.getRating(),
                review.getComment(),
                review.getStatus().name(),
                review.getCreatedAt(),
                review.getUpdatedAt(),
                review.getAdminReply(),
                review.getRepliedAt()
        );
    }
}
