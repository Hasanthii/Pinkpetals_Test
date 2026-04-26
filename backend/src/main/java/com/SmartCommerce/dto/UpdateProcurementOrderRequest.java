package com.SmartCommerce.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record UpdateProcurementOrderRequest(
        Long supplierId,

        @Size(max = 50, message = "Order number must not exceed 50 characters")
        String orderNumber,

        LocalDateTime orderDate,

        LocalDateTime expectedDelivery,

        LocalDateTime actualDelivery,

        String notes,

        List<CreateProcurementItemRequest> items
) {
}
