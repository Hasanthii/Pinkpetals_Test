package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

public record LoginRequestDTO(
        @NotBlank(message = "Username or email is required")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}
