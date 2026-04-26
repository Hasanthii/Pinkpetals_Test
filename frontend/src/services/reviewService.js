import api from './api.js';
import { createReviewDTO, createReviewRequest, updateReviewRequest, updateReviewStatusRequest, createProductRatingDTO } from '../types/review.js';

export const reviewApi = {
    createReview: async (productId, rating, comment) => {
        const request = createReviewRequest(productId, rating, comment);
        const response = await api.post('/reviews', request);
        return createReviewDTO(response.data);
    },

    getReviewsByProduct: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data.map(review => createReviewDTO(review));
    },

    getProductRating: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}/rating`);
        return createProductRatingDTO(response.data);
    },

    getMyReviews: async () => {
        const response = await api.get('/reviews/my-reviews');
        return response.data.map(review => createReviewDTO(review));
    },

    getReviewById: async (reviewId) => {
        const response = await api.get(`/reviews/${reviewId}`);
        return createReviewDTO(response.data);
    },

    updateReview: async (reviewId, rating, comment) => {
        const request = updateReviewRequest(rating, comment);
        const response = await api.put(`/reviews/${reviewId}`, request);
        return createReviewDTO(response.data);
    },

    deleteReview: async (reviewId) => {
        await api.delete(`/reviews/${reviewId}`);
    },

    getAllReviews: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get('/reviews', { params });
        return response.data.map(review => createReviewDTO(review));
    },

    updateReviewStatus: async (reviewId, status, reason) => {
        const request = updateReviewStatusRequest(status, reason);
        const response = await api.put(`/reviews/${reviewId}/status`, request);
        return createReviewDTO(response.data);
    },

    replyToReview: async (reviewId, reply) => {
        const response = await api.put(`/reviews/${reviewId}/reply`, { reply });
        return createReviewDTO(response.data);
    }
};

export default reviewApi;
