package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.CreateProcurementOrderRequest;
import com.SmartCommerce.dto.CreateProcurementItemRequest;
import com.SmartCommerce.dto.ProcurementOrderDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequest;
import com.SmartCommerce.dto.UpdateProcurementOrderRequest;
import com.SmartCommerce.entity.ProcurementItem;
import com.SmartCommerce.entity.ProcurementOrder;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Supplier;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.ProcurementItemRepository;
import com.SmartCommerce.repository.ProcurementOrderRepository;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.SupplierRepository;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.ProcurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcurementServiceImpl implements ProcurementService {

    private final ProcurementOrderRepository procurementOrderRepository;
    private final ProcurementItemRepository procurementItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public ProcurementOrderDTO createProcurementOrder(CreateProcurementOrderRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));

        if (!supplier.getIsActive()) {
            throw new BadRequestException("Cannot create order with inactive supplier");
        }

        if (procurementOrderRepository.existsByOrderNumber(request.orderNumber())) {
            throw new BadRequestException("Order number already exists: " + request.orderNumber());
        }

        User createdBy = null;
        if (userId != null) {
            createdBy = userRepository.findById(userId).orElse(null);
        }

        ProcurementOrder order = ProcurementOrder.builder()
                .supplier(supplier)
                .orderNumber(request.orderNumber())
                .status(ProcurementOrder.OrderStatus.PENDING)
                .orderDate(request.orderDate() != null ? request.orderDate() : LocalDateTime.now())
                .expectedDelivery(request.expectedDelivery())
                .notes(request.notes())
                .createdBy(createdBy)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateProcurementItemRequest itemRequest : request.items()) {
            Product product = null;
            if (itemRequest.productId() != null) {
                product = productRepository.findById(itemRequest.productId()).orElse(null);
            }

            BigDecimal subtotal = itemRequest.unitPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            ProcurementItem item = ProcurementItem.builder()
                    .productName(itemRequest.productName())
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(itemRequest.unitPrice())
                    .subtotal(subtotal)
                    .build();

            order.addItem(item);
            totalAmount = totalAmount.add(subtotal);
        }
        order.setTotalAmount(totalAmount);

        ProcurementOrder saved = procurementOrderRepository.save(order);
        return ProcurementOrderDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementOrderDTO> getAllProcurementOrders() {
        return procurementOrderRepository.findAll().stream()
                .map(ProcurementOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProcurementOrderDTO getProcurementOrderById(Long id) {
        ProcurementOrder order = procurementOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement order not found with id: " + id));
        return ProcurementOrderDTO.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementOrderDTO> getProcurementOrdersBySupplierId(Long supplierId) {
        return procurementOrderRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId).stream()
                .map(ProcurementOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementOrderDTO> getProcurementOrdersByStatus(String status) {
        try {
            ProcurementOrder.OrderStatus orderStatus = ProcurementOrder.OrderStatus.valueOf(status.toUpperCase());
            return procurementOrderRepository.findByStatusOrderByCreatedAtDesc(orderStatus).stream()
                    .map(ProcurementOrderDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementOrderDTO> getProcurementOrdersByUserId(Long userId) {
        return procurementOrderRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).stream()
                .map(ProcurementOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ProcurementOrderDTO updateProcurementOrder(Long id, UpdateProcurementOrderRequest request) {
        ProcurementOrder order = procurementOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement order not found with id: " + id));

        if (!order.canBeUpdated()) {
            throw new BadRequestException("Cannot update order with status: " + order.getStatus());
        }

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));
            order.setSupplier(supplier);
        }

        if (request.orderNumber() != null) {
            if (!request.orderNumber().equals(order.getOrderNumber()) &&
                    procurementOrderRepository.existsByOrderNumber(request.orderNumber())) {
                throw new BadRequestException("Order number already exists: " + request.orderNumber());
            }
            order.setOrderNumber(request.orderNumber());
        }

        if (request.orderDate() != null) {
            order.setOrderDate(request.orderDate());
        }

        if (request.expectedDelivery() != null) {
            order.setExpectedDelivery(request.expectedDelivery());
        }

        if (request.actualDelivery() != null) {
            order.setActualDelivery(request.actualDelivery());
        }

        if (request.notes() != null) {
            order.setNotes(request.notes());
        }

        if (request.items() != null && !request.items().isEmpty()) {
            order.getItems().clear();
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CreateProcurementItemRequest itemRequest : request.items()) {
                Product product = null;
                if (itemRequest.productId() != null) {
                    product = productRepository.findById(itemRequest.productId()).orElse(null);
                }

                BigDecimal itemSubtotal = itemRequest.unitPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
                ProcurementItem item = ProcurementItem.builder()
                        .productName(itemRequest.productName())
                        .product(product)
                        .quantity(itemRequest.quantity())
                        .unitPrice(itemRequest.unitPrice())
                        .subtotal(itemSubtotal)
                        .build();

                order.addItem(item);
                totalAmount = totalAmount.add(itemSubtotal);
            }
            order.setTotalAmount(totalAmount);
        } else {
            order.recalculateTotal();
        }

        ProcurementOrder updated = procurementOrderRepository.save(order);
        return ProcurementOrderDTO.fromEntity(updated);
    }

    @Override
    public ProcurementOrderDTO updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        ProcurementOrder order = procurementOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement order not found with id: " + id));

        try {
            ProcurementOrder.OrderStatus newStatus = ProcurementOrder.OrderStatus.valueOf(request.status().toUpperCase());
            
            if (!isValidStatusTransition(order.getStatus(), newStatus)) {
                throw new BadRequestException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
            }

            order.setStatus(newStatus);

            if (newStatus == ProcurementOrder.OrderStatus.DELIVERED) {
                order.setActualDelivery(LocalDateTime.now());
                restockInventory(order);
            }

            ProcurementOrder updated = procurementOrderRepository.save(order);
            return ProcurementOrderDTO.fromEntity(updated);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.status());
        }
    }

    @Override
    public void deleteProcurementOrder(Long id) {
        ProcurementOrder order = procurementOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement order not found with id: " + id));

        if (order.getStatus() != ProcurementOrder.OrderStatus.PENDING &&
                order.getStatus() != ProcurementOrder.OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot delete order with status: " + order.getStatus());
        }

        procurementOrderRepository.deleteById(id);
    }

    @Override
    public ProcurementOrderDTO confirmOrder(Long id) {
        return updateOrderStatus(id, new UpdateOrderStatusRequest("CONFIRMED"));
    }

    @Override
    public ProcurementOrderDTO shipOrder(Long id) {
        return updateOrderStatus(id, new UpdateOrderStatusRequest("SHIPPED"));
    }

    @Override
    public ProcurementOrderDTO deliverOrder(Long id) {
        return updateOrderStatus(id, new UpdateOrderStatusRequest("DELIVERED"));
    }

    @Override
    public ProcurementOrderDTO cancelOrder(Long id) {
        return updateOrderStatus(id, new UpdateOrderStatusRequest("CANCELLED"));
    }

    private boolean isValidStatusTransition(ProcurementOrder.OrderStatus current, ProcurementOrder.OrderStatus next) {
        return switch (current) {
            case PENDING -> next == ProcurementOrder.OrderStatus.CONFIRMED || next == ProcurementOrder.OrderStatus.CANCELLED;
            case CONFIRMED -> next == ProcurementOrder.OrderStatus.SHIPPED || next == ProcurementOrder.OrderStatus.CANCELLED;
            case SHIPPED -> next == ProcurementOrder.OrderStatus.DELIVERED || next == ProcurementOrder.OrderStatus.CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private void restockInventory(ProcurementOrder order) {
        for (ProcurementItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                product.setStockQuantity(currentStock + item.getQuantity());
                productRepository.save(product);
            }
        }
    }
}
