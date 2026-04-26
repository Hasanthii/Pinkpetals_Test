package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

public record CreateSupplierRequest(
        @NotBlank(message = "Company name is required")
        @Size(max = 255, message = "Company name must not exceed 255 characters")
        String companyName,

        @Size(max = 255, message = "Contact person name must not exceed 255 characters")
        String contactPerson,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        String email,

        @Size(max = 50, message = "Phone must not exceed 50 characters")
        String phone,

        String address,

        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country,

        @Size(max = 100, message = "Category must not exceed 100 characters")
        String category,

        @Size(max = 100, message = "Tax ID must not exceed 100 characters")
        String taxId,

        String bankDetails,

        String notes
) {
}
