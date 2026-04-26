package com.SmartCommerce.service;

import com.SmartCommerce.dto.CreateProcurementOrderRequest;
import com.SmartCommerce.dto.ProcurementOrderDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequest;
import com.SmartCommerce.dto.UpdateProcurementOrderRequest;

import java.util.List;

public interface ProcurementService {

    ProcurementOrderDTO createProcurementOrder(CreateProcurementOrderRequest request, Long userId);

    List<ProcurementOrderDTO> getAllProcurementOrders();

    ProcurementOrderDTO getProcurementOrderById(Long id);

    List<ProcurementOrderDTO> getProcurementOrdersBySupplierId(Long supplierId);

    List<ProcurementOrderDTO> getProcurementOrdersByStatus(String status);

    List<ProcurementOrderDTO> getProcurementOrdersByUserId(Long userId);

    ProcurementOrderDTO updateProcurementOrder(Long id, UpdateProcurementOrderRequest request);

    ProcurementOrderDTO updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    void deleteProcurementOrder(Long id);

    ProcurementOrderDTO confirmOrder(Long id);

    ProcurementOrderDTO shipOrder(Long id);

    ProcurementOrderDTO deliverOrder(Long id);

    ProcurementOrderDTO cancelOrder(Long id);
}
