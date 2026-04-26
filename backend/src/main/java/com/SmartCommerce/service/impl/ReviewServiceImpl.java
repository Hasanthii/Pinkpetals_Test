package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Review;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ForbiddenException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.OrderItemRepository;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.ReviewRepository;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public ReviewDTO createReview(Long userId, CreateReviewRequestDTO request) {
        log.info("Creating review for product ID: {} by user ID: {}", request.productId(), userId);

        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> {
                    log.warn("Product not found with ID: {}", request.productId());
                    return new ResourceNotFoundException("Product not found with ID: " + request.productId());
                });

        boolean hasPurchased = orderItemRepository.hasUserPurchasedProduct(userId, request.productId());
        if (!hasPurchased) {
            log.warn("User {} attempted to review product {} without purchasing", userId, request.productId());
            throw new BadRequestException("You must purchase this product before submitting a review.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .status(Review.ReviewStatus.PENDING)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created successfully with ID: {}", savedReview.getId());

        return ReviewDTO.fromEntity(savedReview);
    }

    @Override
    public ReviewDTO getReviewById(Long reviewId) {
        log.debug("Fetching review by ID: {}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found with ID: {}", reviewId);
                    return new ResourceNotFoundException("Review not found with ID: " + reviewId);
                });

        return ReviewDTO.fromEntity(review);
    }

    @Override
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        log.debug("Fetching all reviews for product ID: {}", productId);

        if (!productRepository.existsById(productId)) {
            log.warn("Product not found with ID: {}", productId);
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ReviewDTO> getApprovedReviewsByProductId(Long productId) {
        log.debug("Fetching approved reviews for product ID: {}", productId);

        if (!productRepository.existsById(productId)) {
            log.warn("Product not found with ID: {}", productId);
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }

        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, Review.ReviewStatus.APPROVED).stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Override
    public ProductRatingDTO getProductRating(Long productId) {
        log.debug("Fetching rating stats for product ID: {}", productId);

        if (!productRepository.existsById(productId)) {
            log.warn("Product not found with ID: {}", productId);
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }

        BigDecimal averageRating = reviewRepository.calculateAverageRatingByProductId(productId);
        long totalReviews = reviewRepository.countApprovedReviewsByProductId(productId);

        if (averageRating == null) {
            averageRating = BigDecimal.ZERO;
        } else {
            averageRating = averageRating.setScale(1, RoundingMode.HALF_UP);
        }

        return new ProductRatingDTO(productId, averageRating, totalReviews);
    }

    @Override
    public List<ReviewDTO> getReviewsByUserId(Long userId) {
        log.debug("Fetching reviews for user ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            log.warn("User not found with ID: {}", userId);
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ReviewDTO> getAllReviews() {
        log.debug("Fetching all reviews");

        return reviewRepository.findAll().stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ReviewDTO> getReviewsByStatus(Review.ReviewStatus status) {
        log.debug("Fetching reviews by status: {}", status);

        return reviewRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(ReviewDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long reviewId, Long userId, UpdateReviewRequestDTO request) {
        log.info("Updating review ID: {} by user ID: {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found with ID: {}", reviewId);
                    return new ResourceNotFoundException("Review not found with ID: " + reviewId);
                });

        if (!review.getUser().getId().equals(userId)) {
            log.warn("User {} attempted to update review {} owned by user {}", userId, reviewId, review.getUser().getId());
            throw new ForbiddenException("You do not have permission to update this review");
        }

        review.setRating(request.rating());
        review.setComment(request.comment());

        Review updatedReview = reviewRepository.save(review);
        log.info("Review updated successfully: {}", reviewId);

        return ReviewDTO.fromEntity(updatedReview);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        log.info("Deleting review ID: {} by user ID: {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found with ID: {}", reviewId);
                    return new ResourceNotFoundException("Review not found with ID: " + reviewId);
                });

        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });

        boolean isOwner = review.getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            log.warn("User {} attempted to delete review {} without permission", userId, reviewId);
            throw new ForbiddenException("You do not have permission to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted successfully: {}", reviewId);
    }

    @Override
    @Transactional
    public ReviewDTO updateReviewStatus(Long reviewId, UpdateReviewStatusRequestDTO request) {
        log.info("Updating review status for review ID: {} to {}", reviewId, request.status());

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found with ID: {}", reviewId);
                    return new ResourceNotFoundException("Review not found with ID: " + reviewId);
                });

        Review.ReviewStatus newStatus;
        try {
            newStatus = Review.ReviewStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status provided: {}", request.status());
            throw new BadRequestException("Invalid status: " + request.status());
        }

        review.setStatus(newStatus);

        if (request.reason() != null && !request.reason().isBlank()) {
            String existingNotes = review.getComment() != null ? review.getComment() + "\n\n[Admin Note]: " : "[Admin Note]: ";
            review.setComment(existingNotes + request.reason());
        }

        Review updatedReview = reviewRepository.save(review);
        log.info("Review status updated successfully: {}", reviewId);

        return ReviewDTO.fromEntity(updatedReview);
    }

    @Override
    @Transactional
    public ReviewDTO replyToReview(Long reviewId, String reply) {
        log.info("Replying to review ID: {}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found with ID: {}", reviewId);
                    return new ResourceNotFoundException("Review not found with ID: " + reviewId);
                });

        review.setAdminReply(reply);
        review.setRepliedAt(LocalDateTime.now());

        Review updatedReview = reviewRepository.save(review);
        log.info("Reply added to review successfully: {}", reviewId);

        return ReviewDTO.fromEntity(updatedReview);
    }
}
