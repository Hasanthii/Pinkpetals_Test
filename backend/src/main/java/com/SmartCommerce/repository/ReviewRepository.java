package com.SmartCommerce.repository;

import com.SmartCommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, Review.ReviewStatus status);

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Review> findByStatusOrderByCreatedAtDesc(Review.ReviewStatus status);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    long countByProductIdAndStatus(Long productId, Review.ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    BigDecimal calculateAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    long countApprovedReviewsByProductId(@Param("productId") Long productId);

    @Query("SELECT r.product.id, AVG(r.rating), COUNT(r) FROM Review r WHERE r.status = 'APPROVED' GROUP BY r.product.id")
    List<Object[]> getRatingStatsByProduct();

    long countByStatus(Review.ReviewStatus status);

    void deleteByProductId(Long productId);
}
