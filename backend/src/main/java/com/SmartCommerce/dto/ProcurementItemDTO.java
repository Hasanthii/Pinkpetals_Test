package com.SmartCommerce.dto;

import com.SmartCommerce.entity.ProcurementItem;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProcurementItemDTO(
        Long id,

        @NotNull(message = "Procurement order ID is required")
        Long procurementOrderId,

        @NotNull(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String productName,

        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.00", message = "Unit price must be zero or greater")
        BigDecimal unitPrice,

        @NotNull(message = "Subtotal is required")
        @DecimalMin(value = "0.00", message = "Subtotal must be zero or greater")
        BigDecimal subtotal,

        LocalDateTime createdAt
) {
    public static ProcurementItemDTO fromEntity(ProcurementItem item) {
        return new ProcurementItemDTO(
                item.getId(),
                item.getProcurementOrder() != null ? item.getProcurementOrder().getId() : null,
                item.getProductName(),
                item.getProduct() != null ? item.getProduct().getId() : null,
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                item.getCreatedAt()
        );
    }
}
