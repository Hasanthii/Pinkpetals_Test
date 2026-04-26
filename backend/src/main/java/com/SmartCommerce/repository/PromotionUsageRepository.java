package com.SmartCommerce.repository;

import com.SmartCommerce.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {

    List<PromotionUsage> findByUserId(Long userId);

    List<PromotionUsage> findByPromotionId(Long promotionId);

    List<PromotionUsage> findByOrderId(Long orderId);

    @Query("SELECT pu FROM PromotionUsage pu WHERE pu.user.id = :userId AND pu.promotion.id = :promotionId")
    List<PromotionUsage> findByUserIdAndPromotionId(@Param("userId") Long userId, @Param("promotionId") Long promotionId);

    @Query("SELECT COUNT(pu) FROM PromotionUsage pu WHERE pu.promotion.id = :promotionId")
    long countByPromotionId(@Param("promotionId") Long promotionId);

    @Query("SELECT COUNT(pu) FROM PromotionUsage pu WHERE pu.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT pu FROM PromotionUsage pu WHERE pu.promotion.code = :code AND pu.user.id = :userId")
    Optional<PromotionUsage> findByCodeAndUserId(@Param("code") String code, @Param("userId") Long userId);

    @Query("SELECT pu FROM PromotionUsage pu JOIN FETCH pu.promotion WHERE pu.user.id = :userId ORDER BY pu.usedAt DESC")
    List<PromotionUsage> findByUserIdWithPromotion(@Param("userId") Long userId);

    boolean existsByPromotionIdAndUserId(Long promotionId, Long userId);

    @Query("SELECT SUM(pu.discountAmount) FROM PromotionUsage pu WHERE pu.promotion.id = :promotionId")
    java.math.BigDecimal sumDiscountAmountByPromotionId(@Param("promotionId") Long promotionId);
}
