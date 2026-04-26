import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { cartService } from '../services/cartService';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import { Sparkles, ShoppingBag } from 'lucide-react';
import MiniCartDrawer from '../components/MiniCartDrawer';
import Navbar from '../components/Navbar';



const sortProducts = (products, sortBy) => {
    if (!products || products.length === 0) return [];
    const sorted = [...products];
    switch (sortBy) {
        case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'price-asc': return sorted.sort((a, b) => Number(a.price) - Number(b.price));
        case 'price-desc': return sorted.sort((a, b) => Number(b.price) - Number(a.price));
        case 'newest': return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        default: return sorted;
    }
};

const ShopPageContent = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState(() => cartService.getCart());
    const [cartCount, setCartCount] = useState(() => cartService.getCartItemCount());

    const refreshCart = () => {
        setCartItems(cartService.getCart());
        setCartCount(cartService.getCartItemCount());
    };

    useEffect(() => {
        const onCartUpdated = () => refreshCart();
        window.addEventListener('cartUpdated', onCartUpdated);
        return () => window.removeEventListener('cartUpdated', onCartUpdated);
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ProductService.getAll();
            setProducts(data && data.length > 0 ? data : []);
        } catch (err) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchProducts();
            return;
        }
        setLoading(true);
        try {
            const data = await ProductService.search(query);
            setProducts(data || []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    const handleCategoryChange = useCallback(async (category) => {
        setActiveCategory(category);
        setLoading(true);
        try {
            if (!category) {
                fetchProducts();
                return;
            }
            const data = await ProductService.getByCategory(category);
            setProducts(data || []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    const handleSortChange = useCallback((sort) => {
        setSortBy(sort);
    }, []);

    const handleAddToCart = useCallback((product) => {
        const user = localStorage.getItem('pinkpetals_user');
        if (!user) {
            setToast('Please sign in to add items to your cart.');
            setToastVisible(true);
            setTimeout(() => {
                setToastVisible(false);
                navigate('/login');
            }, 1500);
            return;
        }
        cartService.addToCart(product, 1);
        setToast(`${product.name} added to bag!`);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    }, [navigate]);

    const displayedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

    return (
        <>
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="text-center mb-8">
                    <p
                        className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        Our Collection
                    </p>
                    <h1
                        style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            color: '#3d1a22',
                            fontWeight: 600,
                        }}
                    >
                        Shop All Products
                    </h1>
                    <div className="mx-auto mt-3 w-10 h-0.5 rounded-full" style={{ background: '#B76E79' }} />
                </div>

                <ProductFilters
                    onSearch={handleSearch}
                    onCategoryChange={handleCategoryChange}
                    onSortChange={handleSortChange}
                    activeCategory={activeCategory}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                />

                {toastVisible && toast && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-pink-200 shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 text-sm"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        <span className="w-2 h-2 rounded-full bg-[#B76E79] flex-shrink-0" />
                        <span className="text-gray-700">{toast}</span>
                    </div>
                )}

                {loading ? (
                    <div className="mt-10">
                        <ProductGridSkeleton count={8} />
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles size={40} className="mx-auto mb-4 text-[#B76E79]" />
                        <h3
                            className="text-lg font-semibold text-[#3d1a22] mb-2"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            No products found
                        </h3>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                ) : (
                    <>
                        <p
                            className="mt-6 text-xs text-gray-400 mb-4"
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            Showing {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {displayedProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Floating cart button */}
        {cartCount > 0 && (
            <button
                onClick={() => setCartOpen(true)}
                className="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 text-white text-sm font-medium px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(183,110,121,0.55)]"
                style={{ background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em', boxShadow: '0 8px 28px rgba(183,110,121,0.45)' }}
                aria-label="View bag"
            >
                <ShoppingBag size={18} />
                <span>My Bag</span>
                <span className="w-5 h-5 rounded-full bg-white text-[#B76E79] text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            </button>
        )}

        {/* Mini cart drawer */}
        <MiniCartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cartItems}
            onUpdate={refreshCart}
        />
        </>
    );
};

const ShopPage = () => (
    <ErrorBoundary>
        <ShopPageContent />
    </ErrorBoundary>
);

export default ShopPage;
