package com.SmartCommerce.repository;

import com.SmartCommerce.entity.ProcurementItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProcurementItemRepository extends JpaRepository<ProcurementItem, Long> {

    List<ProcurementItem> findByProcurementOrderId(Long orderId);

    @Query("SELECT pi FROM ProcurementItem pi WHERE pi.product.id = :productId")
    List<ProcurementItem> findByProductId(@Param("productId") Long productId);

    @Query("SELECT SUM(pi.quantity) FROM ProcurementItem pi WHERE pi.product.id = :productId")
    Long sumQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT SUM(pi.subtotal) FROM ProcurementItem pi WHERE pi.procurementOrder.supplier.id = :supplierId")
    BigDecimal sumSubtotalBySupplierId(@Param("supplierId") Long supplierId);
}
