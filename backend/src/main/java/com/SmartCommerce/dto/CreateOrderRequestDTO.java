package com.SmartCommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequestDTO(
        @NotNull(message = "Order items are required")
        @Size(min = 1, message = "At least one order item is required")
        List<OrderItemRequest> items,

        @NotBlank(message = "Shipping address is required")
        @Size(max = 500, message = "Shipping address must not exceed 500 characters")
        String shippingAddress,

        @Size(max = 100, message = "Payment method must not exceed 100 characters")
        String paymentMethod,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,

        String promotionCode
) {
    public record OrderItemRequest(
            @NotNull(message = "Product ID is required")
            Long productId,

            @NotNull(message = "Quantity is required")
            @Min(value = 1, message = "Quantity must be at least 1")
            Integer quantity
    ) {}
}
