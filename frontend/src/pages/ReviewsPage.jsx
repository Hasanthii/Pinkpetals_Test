import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reviewApi } from '../services/reviewService';
import { orderApi } from '../services/orderService';
import ErrorBoundary from '../components/ErrorBoundary';
import { Star, AlertCircle, CheckCircle, XCircle, X, MessageSquare, Package, ShoppingBag, Pencil, Trash2 } from 'lucide-react';

const Toast = ({ message, type, isVisible }) => {
    if (!isVisible) return null;
    return (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm animate-pulse shadow-lg ${
            type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
            {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span style={{ fontFamily: 'Jost, sans-serif' }}>{message}</span>
        </div>
    );
};

const StarRatingInput = ({ rating, onChange, size = 32 }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewFormModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting, productName }) => {
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [comment, setComment] = useState(initialData?.comment || '');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl max-w-lg w-full p-6" style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.2)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                        {initialData ? 'Edit Review' : 'Write a Review'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-full">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {productName && (
                    <div className="mb-4 p-3 rounded-xl" style={{ background: '#fdeef0' }}>
                        <p className="text-xs text-gray-500 mb-1">Reviewing</p>
                        <p className="text-sm font-medium text-[#3d1a22]">{productName}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-2">Rating *</label>
                        <StarRatingInput rating={rating} onChange={setRating} />
                        {rating === 0 && <p className="text-xs text-red-500 mt-1">Please select a rating</p>}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-2">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border text-sm"
                            style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border text-sm text-gray-600 hover:bg-gray-50"
                            style={{ borderColor: '#f5d5d8' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)' }}
                        >
                            {isSubmitting ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeliverableOrderCard = ({ order, onReview }) => {
    return (
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: '#fdeef0' }}>
                    {order.orderItems?.[0]?.productImageUrl ? (
                        <img src={order.orderItems[0].productImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Package size={24} className="text-[#B76E79]" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400">Order #{order.id}</p>
                    <p className="text-sm font-medium text-[#3d1a22]">
                        {order.orderItems?.length || 0} product(s)
                    </p>
                    <p className="text-xs text-gray-500">
                        Delivered: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {order.orderItems?.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onReview(item.productId, item.productName)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-pink-50 text-[#B76E79] hover:bg-[#B76E79] hover:text-white transition-colors"
                    >
                        <Star size={12} />
                        Review {item.productName?.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName}
                    </button>
                ))}
            </div>
        </div>
    );
};

const MyReviewCard = ({ review, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-xs text-gray-400 mb-1">{review.productName}</p>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(review)} className="p-1.5 hover:bg-pink-50 rounded-full">
                        <Pencil size={14} className="text-[#B76E79]" />
                    </button>
                    <button onClick={() => onDelete(review)} className="p-1.5 hover:bg-red-50 rounded-full">
                        <Trash2 size={14} className="text-red-400" />
                    </button>
                </div>
            </div>
            {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            )}
            {review.adminReply && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: '#f0f8f0' }}>
                    <p className="text-xs text-green-600 font-medium mb-1">Shop Reply:</p>
                    <p className="text-sm text-gray-600">{review.adminReply}</p>
                </div>
            )}
            <p className="text-xs text-gray-400 mt-3">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
            </p>
        </div>
    );
};

const AdminReviewCard = ({ review, onReply, onDelete, onApprove, onReject }) => {
    return (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #B76E79 0%, #c9898a 100%)' }}>
                        {review.userFirstName?.charAt(0)}{review.userLastName?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#3d1a22]">{review.userFirstName} {review.userLastName}</p>
                        <p className="text-xs text-gray-400">{review.productName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={12} className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                        ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                        review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        review.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {review.status}
                    </span>
                </div>
            </div>
            {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>
            )}
            {review.adminReply ? (
                <div className="p-3 rounded-xl" style={{ background: '#f0f8f0' }}>
                    <p className="text-xs text-green-600 font-medium mb-1">Your Reply:</p>
                    <p className="text-sm text-gray-600">{review.adminReply}</p>
                </div>
            ) : (
                <button
                    onClick={() => onReply(review)}
                    className="text-xs text-[#B76E79] hover:underline"
                >
                    Reply to this review
                </button>
            )}
            <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: '#f5d5d8' }}>
                <p className="text-xs text-gray-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </p>
                <div className="flex gap-2">
                    {review.status === 'PENDING' && (
                        <>
                            <button onClick={() => onApprove(review)} className="text-xs text-green-600 hover:text-green-700 font-medium">
                                Approve
                            </button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => onReject(review)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                                Reject
                            </button>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    <button onClick={() => onDelete(review)} className="text-xs text-red-400 hover:text-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReplyModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [reply, setReply] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                    Reply to Review
                </h3>
                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border text-sm mb-4"
                    style={{ borderColor: '#f5d5d8' }}
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border text-sm">Cancel</button>
                    <button
                        onClick={() => { onSubmit(reply); setReply(''); }}
                        disabled={isSubmitting || !reply.trim()}
                        className="flex-1 px-4 py-2 rounded-xl text-white text-sm bg-[#B76E79] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewsPageContent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [starFilter, setStarFilter] = useState(0);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewingProduct, setReviewingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyReview, setReplyReview] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replySubmitting, setReplySubmitting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('pinkpetals_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(userData.role === 'ADMIN');
        fetchData();
    }, [navigate, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isAdmin) {
                const reviews = activeTab !== 'all' 
                    ? await reviewApi.getAllReviews(activeTab)
                    : await reviewApi.getAllReviews();
                setAllReviews(reviews || []);
            } else {
                const [orders, reviews] = await Promise.all([
                    orderApi.getMyOrders(),
                    reviewApi.getMyReviews()
                ]);
                const delivered = (orders || []).filter(o => o.status === 'DELIVERED');
                setDeliveredOrders(delivered);
                setMyReviews(reviews || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredReviews = () => {
        if (!isAdmin) return myReviews;
        let filtered = allReviews;
        if (starFilter > 0) {
            filtered = filtered.filter(r => r.rating === starFilter);
        }
        return filtered;
    };

    const handleStartReview = (productId, productName) => {
        const existingReview = myReviews.find(r => r.productId === productId);
        if (existingReview) {
            setEditingReview(existingReview);
        } else {
            setEditingReview({ productId, productName });
        }
        setReviewingProduct(productName);
        setShowForm(true);
    };

    const handleSubmitReview = async ({ rating, comment }) => {
        setIsSubmitting(true);
        try {
            if (editingReview?.id) {
                await reviewApi.updateReview(editingReview.id, rating, comment);
                showToast('Review updated successfully');
            } else {
                await reviewApi.createReview(editingReview.productId, rating, comment);
                showToast('Review submitted successfully');
            }
            setShowForm(false);
            setEditingReview(null);
            setReviewingProduct(null);
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setReviewingProduct(review.productName);
        setShowForm(true);
    };

    const handleDeleteReview = async (review) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewApi.deleteReview(review.id);
            showToast('Review deleted successfully');
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to delete review', 'error');
        }
    };

    const handleReply = (review) => {
        setReplyReview(review);
        setShowReplyModal(true);
    };

    const handleApproveReview = async (review) => {
        try {
            await reviewApi.updateReviewStatus(review.id, 'APPROVED', '');
            showToast('Review approved');
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to approve review', 'error');
        }
    };

    const handleRejectReview = async (review) => {
        try {
            await reviewApi.updateReviewStatus(review.id, 'REJECTED', '');
            showToast('Review rejected');
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to reject review', 'error');
        }
    };

    const handleSubmitReply = async (reply) => {
        setReplySubmitting(true);
        try {
            await reviewApi.replyToReview(replyReview.id, reply);
            showToast('Reply sent successfully');
            setShowReplyModal(false);
            setReplyReview(null);
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to send reply', 'error');
        } finally {
            setReplySubmitting(false);
        }
    };

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <div className="w-full text-center py-2.5 text-xs tracking-[0.15em] uppercase text-white" style={{ background: 'linear-gradient(90deg, #b76e79, #c9898a, #b76e79)' }}>
                Customer Feedback &bull; Pink Petals
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="text-center mb-8">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2">
                        {isAdmin ? 'Review Management' : 'Your Feedback'}
                    </p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#3d1a22', fontWeight: 600 }}>
                        {isAdmin ? 'Manage Reviews' : 'My Reviews'}
                    </h1>
                    <div className="mx-auto mt-3 w-10 h-0.5 rounded-full bg-[#B76E79]" />
                </div>

                <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />

                {isAdmin && (
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-gray-500 py-2">Status:</span>
                            {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                        activeTab === tab ? 'bg-[#B76E79] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-pink-50'
                                    }`}
                                    style={{ border: '1px solid #f5d5d8' }}
                                >
                                    {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-gray-500 py-2">Rating:</span>
                            {[0, 5, 4, 3, 2, 1].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setStarFilter(star)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                        starFilter === star ? 'bg-amber-400 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-amber-50'
                                    }`}
                                    style={{ border: '1px solid #f5d5d8' }}
                                >
                                    {star === 0 ? 'All' : (
                                        <>
                                            {star} <Star size={12} className={starFilter === star ? 'text-white fill-white' : 'text-amber-400 fill-amber-400'} />
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                        <p className="text-gray-500">{error}</p>
                        <button onClick={fetchData} className="mt-4 px-6 py-2 rounded-full bg-[#B76E79] text-white text-sm">
                            Try Again
                        </button>
                    </div>
                ) : isAdmin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredReviews().length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <MessageSquare size={48} className="mx-auto mb-4 text-pink-200" />
                                <p className="text-gray-500">No reviews found</p>
                            </div>
                        ) : (
                            getFilteredReviews().map(review => (
                                <AdminReviewCard 
                                    key={review.id} 
                                    review={review} 
                                    onReply={handleReply} 
                                    onDelete={handleDeleteReview}
                                    onApprove={handleApproveReview}
                                    onReject={handleRejectReview}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {deliveredOrders.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                                    Products to Review
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">From your delivered orders</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {deliveredOrders.map(order => (
                                        <DeliverableOrderCard key={order.id} order={order} onReview={handleStartReview} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                                My Reviews ({myReviews.length})
                            </h2>
                            {myReviews.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl" style={{ border: '1px solid #f5d5d8' }}>
                                    <Star size={48} className="mx-auto mb-4 text-pink-200" />
                                    <p className="text-gray-500">You haven't written any reviews yet</p>
                                    {deliveredOrders.length > 0 && (
                                        <p className="text-sm text-gray-400 mt-2">Review products from your delivered orders above</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myReviews.map(review => (
                                        <MyReviewCard key={review.id} review={review} onEdit={handleEditReview} onDelete={handleDeleteReview} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ReviewFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingReview(null); setReviewingProduct(null); }}
                onSubmit={handleSubmitReview}
                initialData={editingReview}
                productName={reviewingProduct}
                isSubmitting={isSubmitting}
            />

            <ReplyModal
                isOpen={showReplyModal}
                onClose={() => { setShowReplyModal(false); setReplyReview(null); }}
                onSubmit={handleSubmitReply}
                isSubmitting={replySubmitting}
            />
        </div>
    );
};

const ReviewsPage = () => (
    <ErrorBoundary>
        <ReviewsPageContent />
    </ErrorBoundary>
);

export default ReviewsPage;
