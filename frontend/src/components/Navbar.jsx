import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Search, Flower2, UserCircle,
} from 'lucide-react';
import { cartService } from '../services/cartService';
import MiniCartDrawer from './MiniCartDrawer';

const Navbar = () => {
    const navigate = useNavigate();

    // ── Cart state ──────────────────────────────────────────────
    const [cartCount, setCartCount] = useState(() => cartService.getCartItemCount());
    const [cartItems, setCartItems] = useState(() => cartService.getCart());
    const [cartOpen, setCartOpen] = useState(false);

    const refreshCart = () => {
        setCartItems(cartService.getCart());
        setCartCount(cartService.getCartItemCount());
    };

    // ── Auth state ──────────────────────────────────────────────
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

    const openCart = () => {
        const token = localStorage.getItem('pinkpetals_token');
        if (token) {
            setCartOpen(true);
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <div className="w-full border-b border-[#f5d5d8]" style={{ background: '#fffaf9' }}>

                {/* Main nav bar */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between">
                    {/* Logo */}
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

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors" style={{ fontFamily: 'Jost, sans-serif' }}>Home</button>
                        <button onClick={() => navigate('/shop')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors" style={{ fontFamily: 'Jost, sans-serif' }}>Shop</button>
                        <button onClick={() => navigate('/shop')} className="text-sm text-[#6b3040] hover:text-[#B76E79] transition-colors" style={{ fontFamily: 'Jost, sans-serif' }}>All Products</button>
                        <button onClick={() => navigate('/deals')} className="text-sm text-[#b76e79] hover:text-[#9e5c67] transition-colors" style={{ fontFamily: 'Jost, sans-serif' }}>Deals</button>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/shop')}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b3040] hover:text-[#B76E79] hover:bg-[#fdeef0] transition-all"
                            aria-label="Search products"
                        >
                            <Search size={16} />
                        </button>
                        <button
                            onClick={openCart}
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

                {/* Promo strip */}
                <div
                    className="w-full text-center py-2 text-[11px] uppercase tracking-[0.18em] text-white"
                    style={{ background: '#c9898a', fontFamily: 'Jost, sans-serif' }}
                >
                    Free shipping on orders over $50 &nbsp;|&nbsp; Use code <strong>GLOW10</strong> for 10% off your first order
                </div>
            </div>

            {/* Mini Cart Drawer */}
            <MiniCartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cartItems}
                onUpdate={refreshCart}
            />
        </>
    );
};

export default Navbar;
