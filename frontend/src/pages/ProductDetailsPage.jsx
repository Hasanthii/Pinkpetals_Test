import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { cartService } from '../services/cartService';
import { reviewApi } from '../services/reviewService';
import ErrorBoundary from '../components/ErrorBoundary';
import { Star, ArrowLeft, ShoppingBag, Check, Truck, Shield, RotateCcw, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const ProductDetailsContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [toast, setToast] = useState('');
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ProductService.getById(id);
            setProduct(data);
        } catch (err) {
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const [reviewsData, ratingData] = await Promise.all([
                reviewApi.getReviewsByProduct(id),
                reviewApi.getProductRating(id)
            ]);
            setReviews(reviewsData || []);
            setRating(ratingData || { averageRating: 0, totalReviews: 0 });
        } catch (err) {
            setReviews([]);
            setRating({ averageRating: 0, totalReviews: 0 });
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddToCart = () => {
        const user = localStorage.getItem('pinkpetals_user');
        if (!user) {
            setToast('Please sign in to add items to your cart.');
            setTimeout(() => {
                setToast('');
                navigate('/login');
            }, 2000);
            return;
        }

        cartService.addToCart(product, quantity);
        setToast(`${product.name} added to bag!`);
        setTimeout(() => setToast(''), 2500);
    };

    const handleBuyNow = () => {
        const user = localStorage.getItem('pinkpetals_user');
        if (!user) {
            setToast('Please sign in to purchase.');
            setTimeout(() => {
                setToast('');
                navigate('/login');
            }, 2000);
            return;
        }

        cartService.addToCart(product, quantity);
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="animate-pulse">
                        <div className="h-6 w-32 bg-pink-100 rounded mb-8"></div>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="h-96 bg-pink-100 rounded-2xl"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-pink-100 rounded w-3/4"></div>
                                <div className="h-6 bg-pink-100 rounded w-1/4"></div>
                                <div className="h-10 bg-pink-100 rounded w-1/3"></div>
                                <div className="h-24 bg-pink-100 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
                <div className="max-w-7xl mx-auto px-6 py-10 text-center">
                    <h2 className="text-2xl font-semibold text-[#3d1a22] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Product Not Found
                    </h2>
                    <button
                        onClick={() => navigate('/shop')}
                        className="px-6 py-2 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    const isOutOfStock = Number(product.stockQuantity) === 0;

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 text-[#B76E79] hover:text-[#9e5c67] transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm">Back to Shop</span>
                </button>

                {toast && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-pink-200 shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 text-sm animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#B76E79] flex-shrink-0" />
                        <span className="text-gray-700">{toast}</span>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-10">
                    <div
                        className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)', boxShadow: '0 8px 32px rgba(183,110,121,0.15)' }}
                    >
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain bg-white mix-blend-multiply"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="w-32 h-56 rounded-2xl shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #d4a0a0 0%, rgba(183,110,121,0.6) 100%)' }}
                                />
                                <div
                                    className="w-20 h-20 rounded-xl shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #e8c5c0 0%, rgba(201,137,138,0.6) 100%)' }}
                                />
                            </div>
                        )}

                        {isOutOfStock && (
                            <span
                                className="absolute top-4 left-4 bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-widest uppercase"
                            >
                                Sold Out
                            </span>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p
                                className="text-xs uppercase tracking-[0.18em] text-[#B76E79] mb-2"
                            >
                                {product.brand || product.category}
                            </p>
                            <h1
                                className="text-3xl md:text-4xl font-semibold text-[#3d1a22] leading-tight"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={18}
                                        className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-pink-200'}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400">(12 reviews)</span>
                        </div>

                        <p
                            className="text-3xl font-semibold text-[#B76E79]"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            ${Number(product.price).toLocaleString()}
                        </p>

                        {product.description && (
                            <p className="text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 py-4" style={{ borderTop: '1px solid #f5d5d8', borderBottom: '1px solid #f5d5d8' }}>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Category</p>
                                <p className="text-sm font-medium text-[#3d1a22]">{product.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">In Stock</p>
                                <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                    {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} units available`}
                                </p>
                            </div>
                            {product.supplierName && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Supplier</p>
                                    <p className="text-sm font-medium text-[#3d1a22]">{product.supplierName}</p>
                                </div>
                            )}
                            {product.supplierContact && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Supplier Contact</p>
                                    <p className="text-sm font-medium text-[#3d1a22]">{product.supplierContact}</p>
                                </div>
                            )}
                            {product.benefits && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400 mb-1">Good For</p>
                                    <p className="text-sm font-medium text-[#3d1a22]">{product.benefits}</p>
                                </div>
                            )}
                        </div>

                        {!isOutOfStock && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-xl" style={{ borderColor: '#f5d5d8' }}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 text-[#B76E79] hover:bg-pink-50 transition-colors rounded-l-xl"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-3 font-medium text-[#3d1a22]">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                        className="px-4 py-3 text-[#B76E79] hover:bg-pink-50 transition-colors rounded-r-xl"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                    Add to Bag
                                </button>
                            </div>
                        )}

                        {isOutOfStock && (
                            <button
                                disabled
                                className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed"
                            >
                                Out of Stock
                            </button>
                        )}

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Truck size={16} />
                                <span>Free shipping on orders over $50</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Shield size={16} />
                                <span>Secure payment</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <RotateCcw size={16} />
                                <span>Easy returns within 7 days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare size={24} className="text-[#B76E79]" />
                        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                            Customer Reviews
                        </h2>
                    </div>

                    {!reviewsLoading && (rating.totalReviews > 0) && (
                        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {Number(rating.averageRating).toFixed(1)}
                                    </p>
                                    <div className="flex gap-0.5 my-2 justify-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={star <= Math.round(rating.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">{rating.totalReviews} review(s)</p>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = reviews.filter(r => r.rating === star).length;
                                        const percentage = rating.totalReviews > 0 ? (count / rating.totalReviews) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 w-8">{star} star</span>
                                                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400 w-8">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {reviewsLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl" style={{ border: '1px solid #f5d5d8' }}>
                            <Star size={48} className="mx-auto mb-4 text-pink-200" />
                            <p className="text-gray-500">No reviews yet</p>
                            <p className="text-sm text-gray-400 mt-1">Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #B76E79 0%, #c9898a 100%)' }}>
                                                {review.userFirstName?.charAt(0)}{review.userLastName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#3d1a22]">{review.userFirstName} {review.userLastName}</p>
                                                <p className="text-xs text-gray-400">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={14} className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                                            ))}
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductDetailsPage = () => (
    <ErrorBoundary>
        <ProductDetailsContent />
    </ErrorBoundary>
);

export default ProductDetailsPage;
