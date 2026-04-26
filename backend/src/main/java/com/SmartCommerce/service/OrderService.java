package com.SmartCommerce.service;

import com.SmartCommerce.dto.CreateOrderRequestDTO;
import com.SmartCommerce.dto.OrderDTO;
import com.SmartCommerce.dto.OrderStatsDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequestDTO;

import java.util.List;

public interface OrderService {

    OrderDTO createOrder(Long userId, CreateOrderRequestDTO request);

    OrderDTO getOrderById(Long orderId);

    OrderDTO getOrderByIdAndUserId(Long orderId, Long userId);

    List<OrderDTO> getAllOrders();

    List<OrderDTO> getOrdersByUserId(Long userId);

    List<OrderDTO> getOrdersByStatus(String status);

    OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequestDTO request);

    OrderDTO cancelOrder(Long orderId, Long userId);

    void deleteOrder(Long orderId);

    OrderStatsDTO getOrderStats();
}
