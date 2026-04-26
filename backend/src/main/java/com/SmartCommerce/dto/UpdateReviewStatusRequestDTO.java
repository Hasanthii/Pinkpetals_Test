package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

public record UpdateReviewStatusRequestDTO(
        @NotNull(message = "Status is required")
        String status,

        String reason
) {
}
