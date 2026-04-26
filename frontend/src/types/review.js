export const ReviewStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

export const createReviewDTO = (data) => ({
    id: data.id || null,
    productId: data.productId || null,
    productName: data.productName || '',
    userId: data.userId || null,
    userFirstName: data.userFirstName || '',
    userLastName: data.userLastName || '',
    rating: data.rating || 0,
    comment: data.comment || '',
    status: data.status || ReviewStatus.APPROVED,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    adminReply: data.adminReply || null,
    repliedAt: data.repliedAt || null
});

export const createReviewRequest = (productId, rating, comment) => ({
    productId: productId,
    rating: rating,
    comment: comment || ''
});

export const updateReviewRequest = (rating, comment) => ({
    rating: rating,
    comment: comment || ''
});

export const updateReviewStatusRequest = (status, reason) => ({
    status: status,
    reason: reason || ''
});

export const getStatusColor = (status) => {
    switch (status) {
        case ReviewStatus.PENDING:
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case ReviewStatus.APPROVED:
            return 'bg-green-100 text-green-700 border-green-200';
        case ReviewStatus.REJECTED:
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export const getStatusBadgeStyle = (status) => {
    switch (status) {
        case ReviewStatus.PENDING:
            return 'bg-yellow-50 text-yellow-600';
        case ReviewStatus.APPROVED:
            return 'bg-green-50 text-green-600';
        case ReviewStatus.REJECTED:
            return 'bg-red-50 text-red-600';
        default:
            return 'bg-gray-50 text-gray-600';
    }
};

export const formatReviewDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const getUserInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
};

export const createProductRatingDTO = (data) => ({
    productId: data.productId || null,
    averageRating: data.averageRating || 0,
    totalReviews: data.totalReviews || 0
});
