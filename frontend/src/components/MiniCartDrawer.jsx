import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { cartService } from '../services/cartService';

/* ─────────────────────────────────────────────────────
   MiniCartDrawer
   Props:
     isOpen   – boolean, controls visibility
     onClose  – function, called when drawer should close
     cart     – array of cart items (from cartService.getCart())
     onUpdate – function, called after any cart mutation so parent
                can refresh its own cartCount / cart state
────────────────────────────────────────────────────── */
const MiniCartDrawer = ({ isOpen, onClose, cart = [], onUpdate }) => {
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    /* Close on Escape key */
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    /* Lock body scroll while open */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleQtyChange = (productId, delta) => {
        const item = cart.find(i => i.productId === productId);
        if (!item) return;
        cartService.updateQuantity(productId, item.quantity + delta);
        onUpdate();
    };

    const handleRemove = (productId) => {
        cartService.removeFromCart(productId);
        onUpdate();
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ background: 'rgba(61,26,34,0.35)', backdropFilter: 'blur(2px)' }}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ width: 'min(420px, 100vw)', background: '#fffaf9', boxShadow: '-8px 0 40px rgba(183,110,121,0.18)', fontFamily: 'Jost, sans-serif' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5d5d8]">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={20} className="text-[#B76E79]" />
                        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22', fontWeight: 600, fontSize: '1.15rem' }}>
                            My Bag
                        </h2>
                        {cart.length > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#B76E79] text-white text-[10px] flex items-center justify-center font-medium">
                                {cart.reduce((c, i) => c + i.quantity, 0)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b3040] hover:bg-[#fdeef0] transition-all duration-200"
                        aria-label="Close bag"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Empty state */}
                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#fdeef0] flex items-center justify-center">
                            <ShoppingBag size={32} className="text-[#B76E79] opacity-60" />
                        </div>
                        <p style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22', fontWeight: 600, fontSize: '1.1rem' }}>
                            Your bag is empty
                        </p>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Add some products to your bag and they'll appear here.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 flex items-center gap-2 text-sm font-medium px-7 py-3 rounded-full text-white transition-all duration-200 hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)', boxShadow: '0 4px 16px rgba(183,110,121,0.35)', letterSpacing: '0.04em' }}
                        >
                            Continue Shopping <ArrowRight size={14} />
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Items list */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-4 bg-white rounded-2xl p-3 border border-[#f5d5d8]"
                                    style={{ boxShadow: '0 2px 12px rgba(183,110,121,0.06)' }}
                                >
                                    {/* Image / placeholder */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#fdeef0] to-[#f5d5d8] flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-contain bg-white"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Sparkles size={20} className="text-[#B76E79] opacity-50" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#B76E79] uppercase tracking-[0.14em] mb-0.5" style={{ fontFamily: 'Jost, sans-serif' }}>
                                            {item.brand || 'Pink Petals'}
                                        </p>
                                        <p className="text-sm font-medium text-[#3d1a22] leading-snug line-clamp-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                                            {item.name}
                                        </p>
                                        <p className="text-sm font-semibold text-[#B76E79] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Qty controls + remove */}
                                    <div className="flex flex-col items-end justify-between gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => handleRemove(item.productId)}
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                        <div className="flex items-center gap-1 rounded-full border border-[#f5d5d8] bg-[#fffaf9] px-1 py-0.5">
                                            <button
                                                onClick={() => handleQtyChange(item.productId, -1)}
                                                disabled={item.quantity <= 1}
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#B76E79] hover:bg-[#fdeef0] disabled:opacity-30 transition-all"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="text-xs font-medium text-[#3d1a22] w-5 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQtyChange(item.productId, 1)}
                                                disabled={item.quantity >= (item.stockQuantity || 99)}
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#B76E79] hover:bg-[#fdeef0] disabled:opacity-30 transition-all"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer summary + CTAs */}
                        <div className="border-t border-[#f5d5d8] px-6 py-5 space-y-3" style={{ background: '#fff' }}>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500" style={{ fontFamily: 'Jost, sans-serif' }}>Subtotal</span>
                                <span className="font-semibold text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>
                                    ${total.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center" style={{ fontFamily: 'Jost, sans-serif' }}>
                                Taxes and shipping calculated at checkout
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="w-full flex items-center justify-center gap-2 text-white text-sm font-medium py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)', boxShadow: '0 4px 20px rgba(183,110,121,0.35)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em' }}
                            >
                                Checkout <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={handleViewCart}
                                className="w-full flex items-center justify-center gap-2 text-[#B76E79] text-sm font-medium py-3 rounded-full border border-[#B76E79] hover:bg-[#B76E79] hover:text-white transition-all duration-200"
                                style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em' }}
                            >
                                View Full Cart <ShoppingBag size={14} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MiniCartDrawer;
