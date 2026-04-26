package com.SmartCommerce.controller;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.Review;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody CreateReviewRequestDTO request) {
        Long userId = getCurrentUserId();
        log.info("REST request to create review for product ID: {} by user ID: {}", request.productId(), userId);
        
        ReviewDTO review = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProduct(@PathVariable Long productId) {
        log.info("REST request to get reviews for product ID: {}", productId);
        
        List<ReviewDTO> reviews = reviewService.getApprovedReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ProductRatingDTO> getProductRating(@PathVariable Long productId) {
        log.info("REST request to get rating for product ID: {}", productId);
        
        ProductRatingDTO rating = reviewService.getProductRating(productId);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewDTO>> getMyReviews() {
        Long userId = getCurrentUserId();
        log.info("REST request to get reviews for current user ID: {}", userId);
        
        List<ReviewDTO> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        log.info("REST request to get review by ID: {}", id);
        
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequestDTO request) {
        Long userId = getCurrentUserId();
        log.info("REST request to update review ID: {} by user ID: {}", id, userId);
        
        ReviewDTO review = reviewService.updateReview(id, userId, request);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        log.info("REST request to delete review ID: {} by user ID: {}", id, userId);
        
        reviewService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewDTO>> getAllReviews(
            @RequestParam(required = false) String status) {
        log.info("REST request to get all reviews with status filter: {}", status);
        
        List<ReviewDTO> reviews;
        if (status != null && !status.isBlank()) {
            Review.ReviewStatus reviewStatus = Review.ReviewStatus.valueOf(status.toUpperCase());
            reviews = reviewService.getReviewsByStatus(reviewStatus);
        } else {
            reviews = reviewService.getAllReviews();
        }
        
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> updateReviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewStatusRequestDTO request) {
        log.info("REST request to update review status for review ID: {} to {}", id, request.status());
        
        ReviewDTO review = reviewService.updateReviewStatus(id, request);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> replyToReview(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("REST request to reply to review ID: {}", id);
        
        String reply = request.get("reply");
        ReviewDTO review = reviewService.replyToReview(id, reply);
        return ResponseEntity.ok(review);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new com.SmartCommerce.exception.ResourceNotFoundException("User not found: " + email));
        
        return user.getId();
    }
}
