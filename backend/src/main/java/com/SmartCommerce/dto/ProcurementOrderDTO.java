package com.SmartCommerce.dto;

import com.SmartCommerce.entity.ProcurementOrder;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record ProcurementOrderDTO(
        Long id,

        @NotNull(message = "Supplier ID is required")
        Long supplierId,

        String supplierName,

        String supplierEmail,

        @NotBlank(message = "Order number is required")
        @Size(max = 50, message = "Order number must not exceed 50 characters")
        String orderNumber,

        String status,

        @NotNull(message = "Total amount is required")
        BigDecimal totalAmount,

        @NotNull(message = "Order date is required")
        LocalDateTime orderDate,

        LocalDateTime expectedDelivery,

        LocalDateTime actualDelivery,

        String notes,

        Long createdById,

        String createdByName,

        List<ProcurementItemDTO> items,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
    public static ProcurementOrderDTO fromEntity(ProcurementOrder order) {
        return new ProcurementOrderDTO(
                order.getId(),
                order.getSupplier() != null ? order.getSupplier().getId() : null,
                order.getSupplier() != null ? order.getSupplier().getCompanyName() : null,
                order.getSupplier() != null ? order.getSupplier().getEmail() : null,
                order.getOrderNumber(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getTotalAmount(),
                order.getOrderDate(),
                order.getExpectedDelivery(),
                order.getActualDelivery(),
                order.getNotes(),
                order.getCreatedBy() != null ? order.getCreatedBy().getId() : null,
                order.getCreatedBy() != null ? order.getCreatedBy().getFullName() : null,
                order.getItems() != null 
                        ? order.getItems().stream()
                                .map(ProcurementItemDTO::fromEntity)
                                .collect(Collectors.toList())
                        : null,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
