import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight, Star, ShoppingBag, Instagram, Facebook, Twitter,
    Shield, Truck, Gift, ChevronRight, Search, Menu, X, Flower2, UserCircle,
} from 'lucide-react';
import { productApi } from '../services/api';
import { cartService } from '../services/cartService';
import MiniCartDrawer from '../components/MiniCartDrawer';

/* ─────────────────────────────────────────────────────────────────
   Google Fonts injection (Playfair Display + Jost)
───────────────────────────────────────────────────────────────── */
const FontInjector = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
            'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap';
        document.head.appendChild(link);
    }, []);
    return null;
};

/* ─────────────────────────────────────────────────────────────────
   Star Row helper
───────────────────────────────────────────────────────────────── */
const StarRow = ({ n = 5 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={13}
                className={s <= n ? 'fill-amber-400 text-amber-400' : 'text-pink-200'} />
        ))}
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   Product Card
───────────────────────────────────────────────────────────────── */
const ProductCard = ({ product, onClick, onAddToCart }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
            style={{ boxShadow: '0 4px 24px rgba(183,110,121,0.10)' }}
        >

            <div
                className="relative h-56 bg-gradient-to-br from-[#fdeef0] to-[#f5d5d8] overflow-hidden flex items-center justify-center"
            >
                {product.imageUrl && !imgError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain bg-white object-center transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-50 transition-opacity duration-300">
                        <div className="w-16 h-28 rounded-2xl bg-gradient-to-br from-[#d4a0a0] to-[#b76e79]/60 shadow-lg transform group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500" />
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8c5c0] to-[#c9898a]/60 shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 -mt-4 ml-8" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={e => { e.stopPropagation(); onAddToCart(); }}
                        disabled={Number(product.stockQuantity) === 0}
                        className="bg-[#B76E79] text-white text-xs font-medium px-8 py-2.5 rounded-full shadow-lg hover:bg-[#9e5c67] disabled:bg-pink-200 disabled:cursor-not-allowed transition-colors tracking-wide"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        {Number(product.stockQuantity) === 0 ? 'Sold Out' : 'Add to Bag'}
                    </button>
                </div>
                {Number(product.stockQuantity) === 0 && (
                    <span className="absolute top-3 left-3 bg-gray-700 text-white text-[9px] font-medium px-2.5 py-1 rounded-full tracking-widest uppercase"
                        style={{ fontFamily: 'Jost, sans-serif' }}>
                        Sold Out
                    </span>
                )}
            </div>

            <div className="p-4">
                <p className="text-[10px] text-[#B76E79] uppercase tracking-[0.18em] mb-1"
                    style={{ fontFamily: 'Jost, sans-serif' }}>
                    {product.brand || product.category}
                </p>
                <h3 className="text-sm text-gray-800 leading-snug mb-2 font-medium line-clamp-2"
                    style={{ fontFamily: 'Jost, sans-serif' }}>
                    {product.name}
                </h3>
                <StarRow n={4} />
                <div className="flex items-center justify-between mt-3">
                    <p className="font-semibold text-[#B76E79] text-sm"
                        style={{ fontFamily: 'Playfair Display, serif' }}>
                        ${Number(product.price).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────
   Static placeholder products
───────────────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────────────
   Category tiles data
───────────────────────────────────────────────────────────────── */
const CATEGORIES = [
    { label: 'Exfoliator', gradient: 'from-[#fdeef0] to-[#f8d7db]', accent: '#e8a5b0' },
    { label: 'Face Mask', gradient: 'from-[#fce4e8] to-[#f5c6cc]', accent: '#d4879a' },
    { label: 'Serum', gradient: 'from-[#fdf0f4] to-[#f9dde3]', accent: '#c9898a' },
    { label: 'Moisturizer', gradient: 'from-[#fff0f3] to-[#fbdadf]', accent: '#b76e79' },
];

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
const StoreLanding = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [cartCount, setCartCount] = useState(() => cartService.getCartItemCount());
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState(() => cartService.getCart());
    const [email, setEmail] = useState('');

    const refreshCart = () => {
        setCartItems(cartService.getCart());
        setCartCount(cartService.getCartItemCount());
    };

    // ── Auth state (reactive) ──────────────────────────────────
    const getAuthState = () => {
        const token = localStorage.getItem('pinkpetals_token');
        const user = JSON.parse(localStorage.getItem('pinkpetals_user') || 'null');
        const role = user?.role || localStorage.getItem('pinkpetals_role') || '';
        const path = role === 'ADMIN' ? '/admin/products'
            : role === 'SUPPLIER' ? '/supplier/dashboard'
            : '/customer/dashboard';
        return { isLoggedIn: !!token, storedUser: user, accountPath: path };
    };
    const [authState, setAuthState] = useState(getAuthState);
    useEffect(() => {
        // Sync if login/logout happens in another tab
        const onStorage = () => {
            setAuthState(getAuthState());
            setCartCount(cartService.getCartItemCount());
            setCartItems(cartService.getCart());
        };
        const onCartUpdated = () => {
            setCartCount(cartService.getCartItemCount());
            setCartItems(cartService.getCart());
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('cartUpdated', onCartUpdated);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('cartUpdated', onCartUpdated);
        };
    }, []);
    const { isLoggedIn, storedUser, accountPath } = authState;

    const requireCart = () => {
        const token = localStorage.getItem('pinkpetals_token');
        if (token) {
            setCartOpen(true);
        } else {
            setToast('Please sign in to add items to your cart.');
            setTimeout(() => setToast(''), 3500);
            setTimeout(() => navigate('/login'), 1500);
        }
    };

    useEffect(() => {
        productApi.getAll()
            .then(r => setProducts(r.data.length ? r.data.slice(0, 4) : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const displayProducts = products;

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9' }}>
            <FontInjector />

            {/* ── Toast ─────────────────────────────────────────── */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-pink-200 shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#B76E79] flex-shrink-0 animate-pulse" />
                    <span className="text-gray-700">{toast}</span>
                    <span className="text-pink-400 text-xs">Redirecting...</span>
                </div>
            )}

            {/* ════════════════════════════════════════════════════
                TOP HEADER (Info + Navigation + Promo strip)
            ════════════════════════════════════════════════════ */}
            <div className="w-full border-b border-[#f5d5d8]" style={{ background: '#fffaf9' }}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5d5d8] to-[#fdeef0] flex items-center justify-center border border-[#f0c8d0]">
                            <Flower2 size={18} className="text-[#B76E79]" />
                        </div>
                        <div className="text-left">
                            <p className="text-[1.75rem] leading-none text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
                                Pink Petals
                            </p>
                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#b98994]" style={{ fontFamily: 'Jost, sans-serif' }}>
                                AI Beauty
                            </p>
                        </div>
                    </button>

                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors">Home</button>
                        <button onClick={() => navigate('/shop')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors">Shop</button>
                        <button onClick={() => navigate('/shop')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors">All Products</button>
                        <button onClick={() => navigate('/deals')} className="text-sm text-[#b76e79] hover:text-[#9e5c67] transition-colors">Deals</button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/shop')}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b3040] hover:text-[#B76E79] hover:bg-[#fdeef0] transition-all"
                            aria-label="Search products"
                        >
                            <Search size={16} />
                        </button>
                        <button
                            onClick={requireCart}
                            className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#6b3040] hover:text-[#B76E79] hover:bg-[#fdeef0] transition-all"
                            aria-label="Cart"
                        >
                            <ShoppingBag size={16} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B76E79] text-white text-[10px] flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </button>
                        {isLoggedIn ? (
                            <button
                                onClick={() => navigate(accountPath)}
                                title={storedUser?.firstName ? `Hi, ${storedUser.firstName}` : 'My Account'}
                                className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-[#B76E79] hover:bg-[#fdeef0] border border-[#f5d5d8] hover:border-[#B76E79] transition-all duration-200 hover:scale-110"
                                aria-label="My Account"
                            >
                                <UserCircle size={22} />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="ml-1 px-5 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)', fontFamily: 'Jost, sans-serif' }}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>

                <div
                    className="w-full text-center py-2 text-[11px] uppercase tracking-[0.18em] text-white"
                    style={{ background: '#c9898a', fontFamily: 'Jost, sans-serif' }}
                >
                    Free shipping on orders over $50 &nbsp;|&nbsp; Use code <strong>GLOW10</strong> for 10% off your first order
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                HERO — Full-Width Photo Banner
            ════════════════════════════════════════════════════ */}
            <section className="relative w-full overflow-hidden" style={{ minHeight: '88vh' }}>
                <img
                    src="https://i.pinimg.com/1200x/cf/e9/6a/cfe96aca38b049ddbfde022d92fbeec8.jpg"
                    alt="Pink Petals Beauty"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: 'center center' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to right, rgba(255,240,243,0.97) 0%, rgba(255,240,243,0.80) 30%, rgba(255,240,243,0.35) 55%, rgba(255,240,243,0.05) 75%, transparent 100%)',
                    }}
                />

                {/* Hero content */}
                <div
                    className="relative z-10 flex flex-col justify-center h-full px-10 md:px-20"
                    style={{ minHeight: '88vh' }}
                >
                    <div className="max-w-lg">
                        {/* Eyebrow pill */}
                        <div
                            className="inline-flex items-center mb-6 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#9e5c67]"
                            style={{ background: 'rgba(183,110,121,0.12)', fontFamily: 'Jost, sans-serif' }}
                        >
                            New Collection 2026
                        </div>

                        {/* Headline */}
                        <h1
                            style={{
                                fontFamily: 'Playfair Display, serif',
                                fontWeight: 700,
                                fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                                lineHeight: 1.12,
                                color: '#3d1a22',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Bloom into Your
                            <br />
                            <em style={{ fontStyle: 'italic', color: '#B76E79' }}>Most Radiant</em>
                            <br />
                            Self
                        </h1>

                        <p
                            className="mt-6 text-base leading-relaxed text-[#6b3040] max-w-sm"
                            style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
                        >
                            Premium skincare and cosmetics, handpicked for every skin story.
                            Crafted with botanicals, powered by science.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-3 mt-8">
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem('pinkpetals_token');
                                    navigate(token ? '/shop' : '/login');
                                }}
                                className="flex items-center gap-2 text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                                style={{
                                    background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)',
                                    fontFamily: 'Jost, sans-serif',
                                    letterSpacing: '0.04em',
                                    boxShadow: '0 8px 24px rgba(183,110,121,0.40)',
                                }}
                            >
                                Shop Now <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => navigate('/deals')}
                                className="flex items-center gap-2 text-sm font-medium px-8 py-3.5 rounded-full border border-[#b76e79] text-[#b76e79] transition-all duration-300 hover:bg-[#b76e79] hover:text-white"
                                style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.7)' }}
                            >
                                View Deals
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════
                CATEGORY TILES
            ════════════════════════════════════════════════════ */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2"
                        style={{ fontFamily: 'Jost, sans-serif' }}>
                        Explore by Category
                    </p>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                        color: '#3d1a22',
                        fontWeight: 600,
                    }}>
                        Find Your Perfect Ritual
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            onClick={() => {
                                const token = localStorage.getItem('pinkpetals_token');
                                if (token) {
                                    navigate('/login');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 border border-white/60`}
                            style={{ minHeight: '170px', boxShadow: '0 4px 20px rgba(183,110,121,0.10)' }}
                        >
                            {/* decorative circle */}
                            <div
                                className="w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                style={{ background: cat.accent + '30' }}
                            >
                                <div className="w-10 h-10 rounded-full" style={{ background: cat.accent + '60' }} />
                            </div>
                            <h3
                                className="text-sm font-semibold text-[#3d1a22]"
                                style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em' }}
                            >
                                {cat.label}
                            </h3>
                            <span
                                className="mt-2 flex items-center gap-1 text-xs text-[#B76E79] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ fontFamily: 'Jost, sans-serif' }}
                            >
                                Shop now <ChevronRight size={12} />
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════════════════
                BESTSELLERS
            ════════════════════════════════════════════════════ */}
            <section className="py-16 px-6" style={{ background: '#fff5f6' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2"
                            style={{ fontFamily: 'Jost, sans-serif' }}>
                            Customer Favourites
                        </p>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                            color: '#3d1a22',
                            fontWeight: 600,
                        }}>
                            Bestsellers
                        </h2>
                        <div className="mx-auto mt-3 w-10 h-0.5 rounded-full" style={{ background: '#B76E79' }} />
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-6 mb-8">
                        {['Best Sellers', 'New Arrivals', 'Super Savers'].map((tab, i) => (
                            <button
                                key={tab}
                                className={`text-xs uppercase tracking-widest pb-1 transition-all duration-200 ${i === 0 ? 'text-[#B76E79] border-b-2 border-[#B76E79]' : 'text-gray-400 hover:text-[#B76E79]'}`}
                                style={{ fontFamily: 'Jost, sans-serif' }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-72" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {displayProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onClick={() => {
                                        const token = localStorage.getItem('pinkpetals_token');
                                        if (token) {
                                            navigate('/login');
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                    onAddToCart={requireCart}
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <button
                            onClick={() => {
                                const token = localStorage.getItem('pinkpetals_token');
                                if (token) {
                                    navigate('/login');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            className="inline-flex items-center gap-2 text-sm font-medium px-8 py-3 rounded-full border border-[#B76E79] text-[#B76E79] hover:bg-[#B76E79] hover:text-white transition-all duration-200"
                            style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.05em' }}
                        >
                            View All Products <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>


            {/* ════════════════════════════════════════════════════
                SOCIAL LINKS FOOTER BAR
            ════════════════════════════════════════════════════ */}
            <section className="bg-white border-t py-6 px-6" style={{ borderColor: '#f5d5d8' }}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <p
                        className="text-sm text-gray-400"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        © 2026 Pink Petals. All rights reserved.
                    </p>
                    <div className="flex gap-3">
                        {[Instagram, Facebook, Twitter].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[#B76E79] border border-pink-200 hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79] transition-all duration-200"
                            >
                                <Icon size={15} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mini Cart Drawer ───────────────────────── */}
            <MiniCartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cartItems}
                onUpdate={refreshCart}
            />
        </div>
    );
};

export default StoreLanding;
