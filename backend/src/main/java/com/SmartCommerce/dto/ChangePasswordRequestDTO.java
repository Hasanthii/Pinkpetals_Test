package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

public record ChangePasswordRequestDTO(
        @NotBlank(message = "Old password is required")
        String oldPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 6, max = 255, message = "New password must be between 6 and 255 characters")
        String newPassword
) {
}
