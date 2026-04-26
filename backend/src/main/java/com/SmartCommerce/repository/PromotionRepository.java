package com.SmartCommerce.repository;

import com.SmartCommerce.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.isPublic = true " +
           "AND p.startDate <= :now AND p.expiryDate >= :now " +
           "AND (p.maxUses IS NULL OR p.currentUses < p.maxUses) " +
           "ORDER BY p.createdAt DESC")
    List<Promotion> findAllActiveAndPublicPromotions(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND p.startDate <= :now AND p.expiryDate >= :now " +
           "AND (p.maxUses IS NULL OR p.currentUses < p.maxUses) " +
           "ORDER BY p.createdAt DESC")
    List<Promotion> findAllActivePromotions(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE p.expiryDate < :now ORDER BY p.expiryDate DESC")
    List<Promotion> findExpiredPromotions(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE p.startDate > :now ORDER BY p.startDate ASC")
    List<Promotion> findScheduledPromotions(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE p.maxUses IS NOT NULL AND p.currentUses >= p.maxUses " +
           "AND p.isActive = true ORDER BY p.updatedAt DESC")
    List<Promotion> findFullyRedeemedPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = false ORDER BY p.updatedAt DESC")
    List<Promotion> findInactivePromotions();

    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true AND p.expiryDate >= :now")
    long countActivePromotions(@Param("now") LocalDateTime now);

    List<Promotion> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Promotion> findByIsPublicTrueOrderByCreatedAtDesc();
}
