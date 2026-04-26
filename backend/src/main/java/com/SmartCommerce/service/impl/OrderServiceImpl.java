package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.CreateOrderRequestDTO;
import com.SmartCommerce.dto.OrderDTO;
import com.SmartCommerce.dto.OrderStatsDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequestDTO;
import com.SmartCommerce.entity.Order;
import com.SmartCommerce.entity.OrderItem;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ForbiddenException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.OrderItemRepository;
import com.SmartCommerce.repository.OrderRepository;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderDTO createOrder(Long userId, CreateOrderRequestDTO request) {
        log.info("Creating order for user ID: {}", userId);

        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });

        Order.PaymentStatus initialPaymentStatus = "Card Payment".equalsIgnoreCase(request.paymentMethod()) 
                ? Order.PaymentStatus.PAID 
                : Order.PaymentStatus.PENDING;

        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.shippingAddress())
                .paymentMethod(request.paymentMethod())
                .notes(request.notes())
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(initialPaymentStatus)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderRequestDTO.OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> {
                        log.warn("Product not found with ID: {}", itemRequest.productId());
                        return new ResourceNotFoundException("Product not found with ID: " + itemRequest.productId());
                    });

            if (product.getStockQuantity() < itemRequest.quantity()) {
                log.warn("Insufficient stock for product ID: {}. Requested: {}, Available: {}",
                        itemRequest.productId(), itemRequest.quantity(), product.getStockQuantity());
                throw new BadRequestException("Insufficient stock for product: " + product.getName() +
                        ". Requested: " + itemRequest.quantity() + ", Available: " + product.getStockQuantity());
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())))
                    .build();

            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            product.setStockQuantity(product.getStockQuantity() - itemRequest.quantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        log.info("Order created successfully with ID: {}", savedOrder.getId());

        return OrderDTO.fromEntity(savedOrder);
    }

    @Override
    public OrderDTO getOrderById(Long orderId) {
        log.debug("Fetching order by ID: {}", orderId);

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {}", orderId);
                    return new ResourceNotFoundException("Order not found with ID: " + orderId);
                });

        return OrderDTO.fromEntity(order);
    }

    @Override
    public OrderDTO getOrderByIdAndUserId(Long orderId, Long userId) {
        log.debug("Fetching order ID: {} for user ID: {}", orderId, userId);

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {}", orderId);
                    return new ResourceNotFoundException("Order not found with ID: " + orderId);
                });

        if (!order.getUser().getId().equals(userId)) {
            log.warn("Access denied: User {} attempted to access order {} owned by user {}",
                    userId, orderId, order.getUser().getId());
            throw new ForbiddenException("You do not have permission to access this order");
        }

        return OrderDTO.fromEntity(order);
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        log.debug("Fetching all orders");

        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        log.debug("Fetching orders for user ID: {}", userId);

        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(String status) {
        log.debug("Fetching orders by status: {}", status);

        Order.OrderStatus orderStatus;
        try {
            orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status provided: {}", status);
            throw new BadRequestException("Invalid status: " + status);
        }

        return orderRepository.findByStatusOrderByOrderDateDesc(orderStatus).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequestDTO request) {
        log.info("Updating order status for order ID: {} to {}", orderId, request.status());

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {}", orderId);
                    return new ResourceNotFoundException("Order not found with ID: " + orderId);
                });

        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status provided: {}", request.status());
            throw new BadRequestException("Invalid status: " + request.status());
        }

        // Admin can update to any status directly
        boolean isAdmin = request.isAdmin() != null && request.isAdmin();
        if (!isAdmin) {
            validateStatusTransition(order.getStatus(), newStatus);
        }

        order.setStatus(newStatus);
        if (request.notes() != null && !request.notes().isBlank()) {
            String existingNotes = order.getNotes() != null ? order.getNotes() + "\n" : "";
            order.setNotes(existingNotes + "Status update: " + request.notes());
        }

        if (newStatus == Order.OrderStatus.DELIVERED && order.getPaymentStatus() == Order.PaymentStatus.PENDING) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order status updated successfully for order ID: {}", orderId);

        return OrderDTO.fromEntity(updatedOrder);
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(Long orderId, Long userId) {
        log.info("Cancelling order ID: {} for user ID: {}", orderId, userId);

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {}", orderId);
                    return new ResourceNotFoundException("Order not found with ID: " + orderId);
                });

        if (!order.getUser().getId().equals(userId)) {
            log.warn("Access denied: User {} attempted to cancel order {} owned by user {}",
                    userId, orderId, order.getUser().getId());
            throw new ForbiddenException("You do not have permission to cancel this order");
        }

        if (!order.canBeCancelled()) {
            log.warn("Order {} cannot be cancelled. Current status: {}", orderId, order.getStatus());
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus().name() +
                    ". Orders can only be cancelled within 5 hours of creation and if PENDING/PROCESSING.");
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        }

        Order cancelledOrder = orderRepository.save(order);
        log.info("Order cancelled successfully: {}", orderId);

        return OrderDTO.fromEntity(cancelledOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        log.info("Deleting order ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found with ID: {}", orderId);
                    return new ResourceNotFoundException("Order not found with ID: " + orderId);
                });

        if (order.getStatus() != Order.OrderStatus.CANCELLED &&
            order.getStatus() != Order.OrderStatus.PENDING) {
            log.warn("Cannot delete order {}. Only PENDING or CANCELLED orders can be deleted.", orderId);
            throw new BadRequestException("Cannot delete order. Only PENDING or CANCELLED orders can be deleted.");
        }

        orderRepository.delete(order);
        log.info("Order deleted successfully: {}", orderId);
    }

    @Override
    public OrderStatsDTO getOrderStats() {
        log.debug("Fetching order statistics");

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long processingOrders = orderRepository.countByStatus(Order.OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(Order.OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        BigDecimal averageOrderValue = orderRepository.calculateAverageOrderValue();

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        if (averageOrderValue == null) {
            averageOrderValue = BigDecimal.ZERO;
        }

        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("PENDING", pendingOrders);
        ordersByStatus.put("PROCESSING", processingOrders);
        ordersByStatus.put("SHIPPED", shippedOrders);
        ordersByStatus.put("DELIVERED", deliveredOrders);
        ordersByStatus.put("CANCELLED", cancelledOrders);

        Map<String, BigDecimal> revenueByMonth = new HashMap<>();
        List<Object[]> revenueData = orderRepository.getRevenueByMonth();
        for (Object[] row : revenueData) {
            String month = (String) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            revenueByMonth.put(month, revenue);
        }

        return new OrderStatsDTO(
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue.setScale(2, RoundingMode.HALF_UP),
                averageOrderValue.setScale(2, RoundingMode.HALF_UP),
                ordersByStatus,
                revenueByMonth
        );
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        boolean valid = switch (currentStatus) {
            case PENDING -> newStatus == Order.OrderStatus.PROCESSING || 
                           newStatus == Order.OrderStatus.CANCELLED;
            case PROCESSING -> newStatus == Order.OrderStatus.SHIPPED || 
                              newStatus == Order.OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == Order.OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!valid) {
            log.warn("Invalid status transition attempted: {} -> {}", currentStatus, newStatus);
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }
}
