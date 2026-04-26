import React from 'react';
import { Star, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { getStatusColor, getStatusBadgeStyle, formatReviewDate, getUserInitials } from '../types/review';

export const StarRating = ({ rating, size = 16, interactive = false, onRate }) => {
    const [hover, setHover] = React.useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                    onClick={() => interactive && onRate && onRate(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    disabled={!interactive}
                >
                    <Star
                        size={size}
                        className={`transition-colors duration-200 ${
                            star <= (hover || rating)
                                ? 'fill-[#B76E79] text-[#B76E79]'
                                : 'fill-[#e8c5c0] text-[#e8c5c0]'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

export const StarRatingDisplay = ({ rating, size = 14 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${
                        star <= rating
                            ? 'fill-[#B76E79] text-[#B76E79]'
                            : 'fill-[#e8c5c0] text-[#e8c5c0]'
                    }`}
                />
            ))}
        </div>
    );
};

export const ReviewCard = ({ review, onEdit, onDelete, onView, isAdmin = false, showProduct = true }) => {
    const initials = getUserInitials(review.userFirstName, review.userLastName);

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            style={{
                boxShadow: '0 4px 20px rgba(183,110,121,0.08)',
                border: '1px solid #f5d5d8'
            }}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{ background: 'linear-gradient(135deg, #B76E79 0%, #c9898a 100%)' }}
                        >
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {review.userFirstName} {review.userLastName}
                            </p>
                            <p className="text-xs text-gray-400" style={{ fontFamily: 'Jost, sans-serif' }}>
                                {formatReviewDate(review.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StarRatingDisplay rating={review.rating} />
                        {isAdmin && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(review.status)}`}>
                                {review.status}
                            </span>
                        )}
                    </div>
                </div>

                {showProduct && review.productName && (
                    <div className="mb-3">
                        <p className="text-xs text-[#B76E79] uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>
                            {review.productName}
                        </p>
                    </div>
                )}

                {review.comment && (
                    <div
                        className="p-4 rounded-xl mb-4"
                        style={{ background: '#fffaf9' }}
                    >
                        <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="text-[#B76E79] mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Jost, sans-serif' }}>
                                {review.comment}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {(onEdit || onDelete || onView || isAdmin) && (
                <div className="flex border-t" style={{ borderColor: '#f5d5d8' }}>
                    {onView && (
                        <button
                            onClick={() => onView(review)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-gray-500 hover:bg-pink-50 transition-colors"
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            <Eye size={12} />
                            View
                        </button>
                    )}
                    {onEdit && !isAdmin && (
                        <button
                            onClick={() => onEdit(review)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-[#B76E79] hover:bg-pink-50 transition-colors border-l"
                            style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                        >
                            <Edit size={12} />
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(review)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-red-400 hover:bg-red-50 transition-colors border-l"
                            style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                        >
                            <Trash2 size={12} />
                            Delete
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => onView && onView(review)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-green-600 hover:bg-green-50 transition-colors border-l"
                                style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                            >
                                <CheckCircle size={12} />
                                Approve
                            </button>
                            <button
                                onClick={() => onView && onView(review)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors border-l"
                                style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                            >
                                <XCircle size={12} />
                                Reject
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export const ReviewFormModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
    const [rating, setRating] = React.useState(initialData?.rating || 0);
    const [comment, setComment] = React.useState(initialData?.comment || '');

    React.useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setComment(initialData.comment || '');
        } else {
            setRating(0);
            setComment('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div
                className="relative bg-white rounded-2xl max-w-lg w-full p-6"
                style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.2)' }}
            >
                <h3
                    className="text-xl font-semibold text-[#3d1a22] mb-6"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    {initialData ? 'Edit Your Review' : 'Write a Review'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-600 mb-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Your Rating
                        </label>
                        <div className="flex items-center gap-4">
                            <StarRating rating={rating} size={28} interactive onRate={setRating} />
                            <span className="text-sm text-gray-500" style={{ fontFamily: 'Jost, sans-serif' }}>
                                {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Your Review (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
                            style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                            rows={5}
                            placeholder="Share your experience with this product..."
                            maxLength={2000}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {comment.length}/2000
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #B76E79 0%, #c9898a 100%)',
                                fontFamily: 'Jost, sans-serif',
                                boxShadow: rating > 0 ? '0 8px 24px rgba(183,110,121,0.40)' : 'none'
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ReviewEmptyState = ({ message = "No reviews yet" }) => (
    <div className="text-center py-16">
        <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
        >
            <Star size={28} className="text-[#B76E79]" />
        </div>
        <p className="text-sm text-gray-500" style={{ fontFamily: 'Jost, sans-serif' }}>{message}</p>
    </div>
);

export const ReviewSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid #f5d5d8' }}>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-pink-100" />
            <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-pink-100" />
                <div className="h-3 w-16 rounded bg-pink-100" />
            </div>
        </div>
        <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-pink-100" />
            ))}
        </div>
        <div className="space-y-2">
            <div className="h-3 w-full rounded bg-pink-100" />
            <div className="h-3 w-3/4 rounded bg-pink-100" />
        </div>
    </div>
);

export const RatingSummary = ({ averageRating, totalReviews }) => (
    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
        <div className="flex items-center gap-6">
            <div className="text-center">
                <p
                    className="text-5xl font-bold text-[#3d1a22]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    {Number(averageRating || 0).toFixed(1)}
                </p>
                <StarRatingDisplay rating={Math.round(averageRating || 0)} size={16} />
                <p className="text-xs text-gray-400 mt-1">{totalReviews || 0} reviews</p>
            </div>
            <div className="flex-1 h-px" style={{ background: '#f5d5d8' }} />
            <div className="text-center">
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Jost, sans-serif' }}>
                    Customers love our products
                </p>
            </div>
        </div>
    </div>
);

export default ReviewCard;
