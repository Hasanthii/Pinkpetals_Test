import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Tag, Percent, Ticket, ArrowRight } from 'lucide-react';
import { PromotionService } from '../services/promotionService';
import { PromotionCard, PromotionCardSkeleton } from '../components/PromotionCard';
import ErrorBoundary from '../components/ErrorBoundary';
import Navbar from '../components/Navbar';

const STATIC_PROMOTIONS = [
    {
        id: 1,
        code: 'GLOW10',
        description: 'Get 10% off on your first purchase',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrderAmount: 1000,
        maxUses: 100,
        currentUses: 45,
        startDate: '2026-01-01T00:00:00',
        expiryDate: '2026-12-31T23:59:59',
        isActive: true,
        isPublic: true,
        isExpired: false,
        isValid: true,
    },
    {
        id: 2,
        code: 'FLAT500',
        description: '$500 off on orders above $3,000',
        discountType: 'FIXED_AMOUNT',
        discountValue: 500,
        minimumOrderAmount: 3000,
        maxUses: 50,
        currentUses: 28,
        startDate: '2026-01-01T00:00:00',
        expiryDate: '2026-03-31T23:59:59',
        isActive: true,
        isPublic: true,
        isExpired: false,
        isValid: true,
    },
    {
        id: 3,
        code: 'BIRTHDAY20',
        description: 'Celebrate with 20% off on your birthday month',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minimumOrderAmount: 2000,
        maxUses: 1,
        currentUses: 0,
        startDate: '2026-01-01T00:00:00',
        expiryDate: '2026-12-31T23:59:59',
        isActive: true,
        isPublic: true,
        isExpired: false,
        isValid: true,
    },
    {
        id: 4,
        code: 'SUMMER15',
        description: 'Summer special - 15% off on all skincare',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minimumOrderAmount: 2500,
        maxUses: 200,
        currentUses: 156,
        startDate: '2026-02-01T00:00:00',
        expiryDate: '2026-04-30T23:59:59',
        isActive: true,
        isPublic: true,
        isExpired: false,
        isValid: true,
    },
];

const DealsPageContent = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await PromotionService.getPublicPromotions();
            setPromotions(data && data.length > 0 ? data : STATIC_PROMOTIONS);
        } catch (err) {
            setPromotions(STATIC_PROMOTIONS);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                setToast(`Coupon code "${code}" copied to clipboard!`);
                setTimeout(() => setToast(''), 3000);
            });
        }
    };

    const handleApply = (promotion) => {
        setToast(`Apply "${promotion.code}" at checkout for ${promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `$${promotion.discountValue}`} off!`);
        setTimeout(() => setToast(''), 4000);
    };

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-rose/10 text-primary-rose text-xs uppercase tracking-widest mb-4">
                        <Gift className="w-4 h-4" />
                        <span>Limited Time Offers</span>
                    </div>
                    <h1 
                        className="text-4xl md:text-5xl font-bold text-deep-burgundy mb-4"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Exclusive Deals
                    </h1>
                    <div className="mx-auto mt-3 w-16 h-1 rounded-full bg-primary-rose" />
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        <span className="italic">Unlock radiant skin at irresistible prices</span> - 
                        Shop our curated selection of promotions and discover your perfect skincare routine.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pale-rose to-soft-blush flex items-center justify-center mx-auto mb-4">
                            <Percent className="w-6 h-6 text-primary-rose" />
                        </div>
                        <h3 className="font-bold text-deep-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>Up to 20% Off</h3>
                        <p className="text-sm text-gray-500 mt-1">On selected items</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pale-rose to-soft-blush flex items-center justify-center mx-auto mb-4">
                            <Ticket className="w-6 h-6 text-primary-rose" />
                        </div>
                        <h3 className="font-bold text-deep-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>Free Shipping</h3>
                        <p className="text-sm text-gray-500 mt-1">Orders over $5,000</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pale-rose to-soft-blush flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-6 h-6 text-primary-rose" />
                        </div>
                        <h3 className="font-bold text-deep-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>New Arrivals</h3>
                        <p className="text-sm text-gray-500 mt-1">Be the first to try</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pale-rose to-soft-blush flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-6 h-6 text-primary-rose" />
                        </div>
                        <h3 className="font-bold text-deep-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>Birthday Special</h3>
                        <p className="text-sm text-gray-500 mt-1">Exclusive rewards</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 
                        className="text-2xl font-bold text-deep-burgundy"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Active Promotions
                    </h2>
                    <Link 
                        to="/shop"
                        className="inline-flex items-center gap-2 text-primary-rose hover:text-deep-rose transition-colors font-medium"
                    >
                        Browse Products
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <PromotionCardSkeleton key={i} />
                        ))}
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <Gift className="w-16 h-16 mx-auto mb-4 text-pale-rose" />
                        <h3 
                            className="text-xl font-semibold text-deep-burgundy mb-2"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            No Active Deals Right Now
                        </h3>
                        <p className="text-gray-500">
                            Check back soon for exciting promotions!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {promotions.map(promotion => (
                            <PromotionCard
                                key={promotion.id}
                                promotion={promotion}
                                onCopy={handleCopy}
                                onApply={handleApply}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-16 bg-gradient-to-br from-pale-rose to-soft-blush rounded-3xl p-8 md:p-12 text-center">
                    <h2 
                        className="text-2xl md:text-3xl font-bold text-deep-burgundy mb-4"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Don't Miss Out!
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                        <span className="italic">Join our community</span> to receive exclusive offers, 
                        early access to new products, and personalized skincare recommendations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-rose text-white rounded-full hover:bg-deep-rose transition-all duration-300 shadow-lg shadow-primary-rose/30 font-medium"
                        >
                            Create Account
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/shop"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-deep-burgundy rounded-full hover:bg-pale-rose transition-all duration-300 font-medium border-2 border-pale-rose"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-pink-200 shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 animate-pulse">
                    <Sparkles size={16} className="text-primary-rose" />
                    <span className="text-sm text-gray-700">{toast}</span>
                </div>
            )}
        </div>
    );
};

const DealsPage = () => (
    <ErrorBoundary>
        <DealsPageContent />
    </ErrorBoundary>
);

export default DealsPage;
