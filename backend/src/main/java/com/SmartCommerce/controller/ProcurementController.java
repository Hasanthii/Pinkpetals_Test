package com.SmartCommerce.controller;

import com.SmartCommerce.dto.CreateProcurementOrderRequest;
import com.SmartCommerce.dto.ProcurementOrderDTO;
import com.SmartCommerce.dto.UpdateOrderStatusRequest;
import com.SmartCommerce.dto.UpdateProcurementOrderRequest;
import com.SmartCommerce.service.ProcurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*")
public class ProcurementController {

    private final ProcurementService procurementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> createProcurementOrder(
            @Valid @RequestBody CreateProcurementOrderRequest request) {
        ProcurementOrderDTO created = procurementService.createProcurementOrder(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProcurementOrderDTO>> getAllProcurementOrders() {
        List<ProcurementOrderDTO> orders = procurementService.getAllProcurementOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> getProcurementOrderById(@PathVariable Long id) {
        ProcurementOrderDTO order = procurementService.getProcurementOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProcurementOrderDTO>> getProcurementOrdersBySupplierId(@PathVariable Long supplierId) {
        List<ProcurementOrderDTO> orders = procurementService.getProcurementOrdersBySupplierId(supplierId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProcurementOrderDTO>> getProcurementOrdersByStatus(@PathVariable String status) {
        List<ProcurementOrderDTO> orders = procurementService.getProcurementOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProcurementOrderDTO>> getMyProcurementOrders() {
        List<ProcurementOrderDTO> orders = procurementService.getAllProcurementOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> updateProcurementOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProcurementOrderRequest request) {
        ProcurementOrderDTO updated = procurementService.updateProcurementOrder(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        ProcurementOrderDTO updated = procurementService.updateOrderStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcurementOrder(@PathVariable Long id) {
        procurementService.deleteProcurementOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> confirmOrder(@PathVariable Long id) {
        ProcurementOrderDTO confirmed = procurementService.confirmOrder(id);
        return ResponseEntity.ok(confirmed);
    }

    @PostMapping("/{id}/ship")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> shipOrder(@PathVariable Long id) {
        ProcurementOrderDTO shipped = procurementService.shipOrder(id);
        return ResponseEntity.ok(shipped);
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> deliverOrder(@PathVariable Long id) {
        ProcurementOrderDTO delivered = procurementService.deliverOrder(id);
        return ResponseEntity.ok(delivered);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcurementOrderDTO> cancelOrder(@PathVariable Long id) {
        ProcurementOrderDTO cancelled = procurementService.cancelOrder(id);
        return ResponseEntity.ok(cancelled);
    }
}
