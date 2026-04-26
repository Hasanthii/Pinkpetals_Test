package com.SmartCommerce.service;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.Review;

import java.util.List;

public interface ReviewService {

    ReviewDTO createReview(Long userId, CreateReviewRequestDTO request);

    ReviewDTO getReviewById(Long reviewId);

    List<ReviewDTO> getReviewsByProductId(Long productId);

    List<ReviewDTO> getApprovedReviewsByProductId(Long productId);

    ProductRatingDTO getProductRating(Long productId);

    List<ReviewDTO> getReviewsByUserId(Long userId);

    List<ReviewDTO> getAllReviews();

    List<ReviewDTO> getReviewsByStatus(Review.ReviewStatus status);

    ReviewDTO updateReview(Long reviewId, Long userId, UpdateReviewRequestDTO request);

    void deleteReview(Long reviewId, Long userId);

    ReviewDTO updateReviewStatus(Long reviewId, UpdateReviewStatusRequestDTO request);

    ReviewDTO replyToReview(Long reviewId, String reply);
}
