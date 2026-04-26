package com.SmartCommerce.dto;

import com.SmartCommerce.entity.Supplier;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SupplierDTO(
        Long id,

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

        String notes,

        BigDecimal rating,

        Boolean isActive,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
    public static SupplierDTO fromEntity(Supplier supplier) {
        return new SupplierDTO(
                supplier.getId(),
                supplier.getCompanyName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getAddress(),
                supplier.getCity(),
                supplier.getCountry(),
                supplier.getCategory(),
                supplier.getTaxId(),
                supplier.getBankDetails(),
                supplier.getNotes(),
                supplier.getRating(),
                supplier.getIsActive(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt()
        );
    }
}
