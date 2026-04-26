import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import ErrorBoundary from '../components/ErrorBoundary';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const isOutOfStock = Number(item.stockQuantity) === 0;

    return (
        <div className="flex gap-4 p-4 bg-white rounded-2xl" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
            <div
                className="w-24 h-24 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
            >
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain bg-white" />
                ) : (
                    <div
                        className="w-12 h-16 rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #d4a0a0 0%, rgba(183,110,121,0.6) 100%)' }}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-[#B76E79] uppercase tracking-wider">{item.brand}</p>
                        <h3 className="text-sm font-medium text-[#3d1a22] truncate">{item.name}</h3>
                    </div>
                    <button
                        onClick={() => onRemove(item.productId)}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                <p className="text-lg font-semibold text-[#B76E79] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    ${Number(item.price).toLocaleString()}
                </p>

                {isOutOfStock && (
                    <p className="text-xs text-red-500 mt-1">Out of stock</p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg" style={{ borderColor: '#f5d5d8' }}>
                        <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1.5 text-[#B76E79] hover:bg-pink-50 transition-colors rounded-l-lg"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-[#3d1a22]">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1.5 text-[#B76E79] hover:bg-pink-50 transition-colors rounded-r-lg"
                            disabled={item.quantity >= item.stockQuantity}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <p className="text-sm font-semibold text-[#3d1a22]">
                        ${Number(item.price * item.quantity).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const CartContent = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        setLoading(false);
        setCart(cartService.getCart());
    };

    const handleUpdateQuantity = (productId, quantity) => {
        const updatedCart = cartService.updateQuantity(productId, quantity);
        setCart(updatedCart);
    };

    const handleRemoveItem = (productId) => {
        const updatedCart = cartService.removeFromCart(productId);
        setCart(updatedCart);
    };

    const handleClearCart = () => {
        cartService.clearCart();
        setCart([]);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const total = subtotal + shipping;

    const handleCheckout = () => {
        const user = localStorage.getItem('pinkpetals_user');
        if (!user) {
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#fdeef0' }}>
                        <ShoppingBag size={40} className="text-[#B76E79]" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2">Your Bag is Empty</p>
                    <h2
                        className="text-2xl md:text-3xl font-semibold text-[#3d1a22] mb-4"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Looks like you haven't added anything yet
                    </h2>
                    <p className="text-gray-500 mb-8">Start shopping to fill your bag with beautiful skincare</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                    >
                        <ShoppingBag size={18} />
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2">Shopping Bag</p>
                        <h1
                            className="text-2xl md:text-3xl font-semibold text-[#3d1a22]"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Your Bag ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                        </h1>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                        Clear Bag
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <CartItem
                                key={item.productId}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 sticky top-6" style={{ boxShadow: '0 8px 32px rgba(183,110,121,0.12)', border: '1px solid #f5d5d8' }}>
                            <h2 className="text-lg font-semibold text-[#3d1a22] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Order Summary
                            </h2>

                            <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid #f5d5d8' }}>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-[#3d1a22]">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-[#3d1a22]">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `$${shipping.toLocaleString()}`
                                        )}
                                    </span>
                                </div>
                                {subtotal <= 50 && (
                                    <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                        Add ${(50 - subtotal).toLocaleString()} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between py-4">
                                <span className="text-lg font-semibold text-[#3d1a22]">Total</span>
                                <span className="text-xl font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    ${total.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} />
                            </button>

                            <Link
                                to="/shop"
                                className="block text-center mt-4 text-sm text-[#B76E79] hover:text-[#9e5c67] transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartPage = () => (
    <ErrorBoundary>
        <CartContent />
    </ErrorBoundary>
);

export default CartPage;
