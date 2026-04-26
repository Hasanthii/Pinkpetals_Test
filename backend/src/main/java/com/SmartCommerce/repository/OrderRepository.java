package com.SmartCommerce.repository;

import com.SmartCommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    List<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status);

    List<Order> findAllByOrderByOrderDateDesc();

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findOrdersByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT AVG(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal calculateAverageOrderValue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusGroupBy();

    @Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m'), SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID' GROUP BY FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') ORDER BY FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') DESC")
    List<Object[]> getRevenueByMonth();

    boolean existsByIdAndUserId(Long id, Long userId);
}
