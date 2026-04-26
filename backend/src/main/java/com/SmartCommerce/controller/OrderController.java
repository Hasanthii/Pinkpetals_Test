package com.SmartCommerce.controller;

import com.SmartCommerce.dto.CreateOrderRequestDTO;
import com.SmartCommerce.dto.OrderDTO;
import com.SmartCommerce.dto.OrderStatsDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequestDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
        Long userId = getCurrentUserId();
        log.info("REST request to create order for user ID: {}", userId);
        
        OrderDTO order = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<List<OrderDTO>> getAllOrders(
            @RequestParam(required = false) String status) {
        log.info("REST request to get all orders with status filter: {}", status);
        
        List<OrderDTO> orders;
        if (status != null && !status.isBlank()) {
            orders = orderService.getOrdersByStatus(status);
        } else {
            orders = orderService.getAllOrders();
        }
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders() {
        Long userId = getCurrentUserId();
        log.info("REST request to get orders for current user ID: {}", userId);
        
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        String currentRole = getCurrentUserRole();
        
        log.info("REST request to get order by ID: {}", id);
        
        OrderDTO order;
        if ("ADMIN".equals(currentRole)) {
            order = orderService.getOrderById(id);
        } else {
            order = orderService.getOrderByIdAndUserId(id, currentUserId);
        }
        
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO request) {
        log.info("REST request to update order status for order ID: {} to {}", id, request.status());
        
        OrderDTO order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        log.info("REST request to cancel order ID: {} for user ID: {}", id, userId);
        
        OrderDTO order = orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        log.info("REST request to delete order ID: {}", id);
        
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderStatsDTO> getOrderStats() {
        log.info("REST request to get order statistics");
        
        OrderStatsDTO stats = orderService.getOrderStats();
        return ResponseEntity.ok(stats);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new com.SmartCommerce.exception.ResourceNotFoundException("User not found: " + email));
        
        return user.getId();
    }

    private String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .orElse("CUSTOMER");
        }
        return "CUSTOMER";
    }
}
