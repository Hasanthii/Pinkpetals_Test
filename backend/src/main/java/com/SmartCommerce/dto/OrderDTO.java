package com.SmartCommerce.dto;

import com.SmartCommerce.entity.Order;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
        Long id,
        Long userId,
        String userEmail,
        String userFirstName,
        String userLastName,
        BigDecimal totalAmount,
        String status,
        String shippingAddress,
        String paymentStatus,
        String paymentMethod,
        String notes,
        List<OrderItemDTO> orderItems,
        LocalDateTime orderDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static OrderDTO fromEntity(Order order) {
        List<OrderItemDTO> itemDTOs = order.getOrderItems() != null
                ? order.getOrderItems().stream()
                        .map(OrderItemDTO::fromEntity)
                        .toList()
                : List.of();

        return new OrderDTO(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getUser().getFirstName(),
                order.getUser().getLastName(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getShippingAddress(),
                order.getPaymentStatus().name(),
                order.getPaymentMethod(),
                order.getNotes(),
                itemDTOs,
                order.getOrderDate(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
