package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

public record UpdateOrderStatusRequestDTO(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED)$", 
                 message = "Invalid status. Must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED")
        String status,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,

        Boolean isAdmin
) {
}
