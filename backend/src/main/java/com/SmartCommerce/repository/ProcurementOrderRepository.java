package com.SmartCommerce.repository;

import com.SmartCommerce.entity.ProcurementOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProcurementOrderRepository extends JpaRepository<ProcurementOrder, Long> {

    Optional<ProcurementOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    List<ProcurementOrder> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);

    List<ProcurementOrder> findByStatusOrderByCreatedAtDesc(ProcurementOrder.OrderStatus status);

    List<ProcurementOrder> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT po FROM ProcurementOrder po WHERE po.supplier.id = :supplierId AND po.status = :status")
    List<ProcurementOrder> findBySupplierIdAndStatus(
            @Param("supplierId") Long supplierId,
            @Param("status") ProcurementOrder.OrderStatus status);

    @Query("SELECT po FROM ProcurementOrder po WHERE po.status IN :statuses ORDER BY po.createdAt DESC")
    List<ProcurementOrder> findByStatusIn(@Param("statuses") List<ProcurementOrder.OrderStatus> statuses);

    @Query("SELECT po FROM ProcurementOrder po WHERE po.orderDate BETWEEN :startDate AND :endDate ORDER BY po.orderDate DESC")
    List<ProcurementOrder> findByOrderDateBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT po FROM ProcurementOrder po JOIN FETCH po.supplier JOIN FETCH po.items WHERE po.id = :id")
    Optional<ProcurementOrder> findByIdWithDetails(@Param("id") Long id);

    long countByStatus(ProcurementOrder.OrderStatus status);
}
