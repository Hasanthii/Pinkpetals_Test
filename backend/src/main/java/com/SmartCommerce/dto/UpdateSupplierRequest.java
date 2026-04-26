package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateSupplierRequest(
        @Size(max = 255, message = "Company name must not exceed 255 characters")
        String companyName,

        @Size(max = 255, message = "Contact person name must not exceed 255 characters")
        String contactPerson,

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

        String notes,

        @DecimalMin(value = "0.0", message = "Rating must be zero or greater")
        @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
        BigDecimal rating,

        Boolean isActive
) {
}
