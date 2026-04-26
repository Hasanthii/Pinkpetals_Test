import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { orderApi } from '../services/orderService';
import { authApi } from '../services/authService';
import { PromotionService } from '../services/promotionService';
import ErrorBoundary from '../components/ErrorBoundary';
import { ShoppingBag, CreditCard, Truck, CheckCircle, ArrowLeft, Lock, Tag, X, Check } from 'lucide-react';
import Navbar from '../components/Navbar';

const CheckoutContent = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        holderName: '',
        expiry: '',
        cvv: ''
    });
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('pinkpetals_user');
        if (!user) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(user);
        setShippingAddress({
            fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            address: userData.address || '',
            city: userData.city || '',
            phone: userData.phone || ''
        });

        loadCart();
    }, [navigate]);

    const loadCart = () => {
        setLoading(false);
        setCart(cartService.getCart());
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        setPromoLoading(true);
        setPromoError('');
        setPromoSuccess('');

        try {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const result = await PromotionService.validate(promoCode.trim(), subtotal);
            
            if (result.isValid) {
                const discountAmount = Number(result.calculatedDiscount) || 0;
                setAppliedPromotion({
                    code: result.code,
                    discountType: result.discountType,
                    discountValue: result.discountValue
                });
                setDiscount(discountAmount);
                setPromoSuccess(`Promo code applied! You save $${discountAmount.toLocaleString()}`);
            } else {
                setPromoError(result.message || 'Invalid promo code');
            }
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Failed to apply promo code');
        } finally {
            setPromoLoading(false);
        }
    };

    const removePromoCode = () => {
        setAppliedPromotion(null);
        setDiscount(0);
        setPromoCode('');
        setPromoSuccess('');
        setPromoError('');
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const total = Math.max(0, subtotal + shipping - discount);

    const handlePlaceOrder = async () => {
        if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            setError('Please fill in all shipping details');
            return;
        }

        if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        if (paymentMethod === 'Card Payment') {
            if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
                setError('Please enter a valid 16-digit card number');
                return;
            }
            if (!cardDetails.holderName.trim()) {
                setError('Please enter the cardholder name');
                return;
            }
            if (!cardDetails.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
                setError('Please enter a valid expiry date (MM/YY)');
                return;
            }
            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                setError('Please enter a valid CVV');
                return;
            }
        }

        setError('');
        setProcessing(true);

        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                shippingAddress: `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}. Phone: ${shippingAddress.phone}`,
                paymentMethod: paymentMethod,
                notes: ''
            };

            const order = await orderApi.createOrder(orderData);
            cartService.clearCart();
            setOrderId(order.id);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
                <Navbar />
                <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2">Order Confirmed</p>
                    <h2
                        className="text-2xl md:text-3xl font-semibold text-[#3d1a22] mb-4"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Thank You for Your Order!
                    </h2>
                    <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
                    <p className="text-gray-500 mb-8">Order ID: <span className="font-semibold text-[#3d1a22]">#{orderId}</span></p>
                    
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/orders"
                            className="px-8 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                        >
                            View My Orders
                        </Link>
                        <Link
                            to="/shop"
                            className="px-8 py-3 border border-[#B76E79] text-[#B76E79] rounded-full hover:bg-pink-50 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-2xl font-semibold text-[#3d1a22] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Your cart is empty
                    </h2>
                    <Link
                        to="/shop"
                        className="px-8 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors"
                    >
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
                <Link
                    to="/cart"
                    className="flex items-center gap-2 text-[#B76E79] hover:text-[#9e5c67] transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm">Back to Cart</span>
                </Link>

                <h1
                    className="text-2xl md:text-3xl font-semibold text-[#3d1a22] mb-8"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    Checkout
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fdeef0' }}>
                                    <Truck size={18} className="text-[#B76E79]" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Shipping Address
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={shippingAddress.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border text-sm"
                                        style={{ borderColor: '#f5d5d8' }}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={shippingAddress.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border text-sm"
                                        style={{ borderColor: '#f5d5d8' }}
                                        placeholder="Enter your address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border text-sm"
                                        style={{ borderColor: '#f5d5d8' }}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border text-sm"
                                        style={{ borderColor: '#f5d5d8' }}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fdeef0' }}>
                                    <CreditCard size={18} className="text-[#B76E79]" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Payment Method
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all" style={{ borderColor: paymentMethod === 'Cash on Delivery' ? '#B76E79' : '#f5d5d8', background: paymentMethod === 'Cash on Delivery' ? '#fdeef0' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash on Delivery"
                                        checked={paymentMethod === 'Cash on Delivery'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-[#B76E79]"
                                    />
                                    <span className="text-sm font-medium text-[#3d1a22]">Cash on Delivery</span>
                                </label>
                                <div className={`border rounded-xl transition-all ${paymentMethod === 'Card Payment' ? 'border-[#B76E79] shadow-sm' : 'border-[#f5d5d8]'}`}>
                                    <label className="flex items-center gap-3 p-4 cursor-pointer" style={{ background: paymentMethod === 'Card Payment' ? '#fdeef0' : 'white', borderRadius: paymentMethod === 'Card Payment' ? '12px 12px 0 0' : '12px' }}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Card Payment"
                                            checked={paymentMethod === 'Card Payment'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#B76E79]"
                                        />
                                        <span className="text-sm font-medium text-[#3d1a22]">Card Payment</span>
                                    </label>
                                    
                                    {paymentMethod === 'Card Payment' && (
                                        <div className="p-4 bg-white space-y-4" style={{ borderRadius: '0 0 12px 12px' }}>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Card Number</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.number}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                                        setCardDetails(prev => ({ ...prev, number: formatted.substring(0, 19) }));
                                                    }}
                                                    placeholder="0000 0000 0000 0000"
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    style={{ borderColor: '#f5d5d8' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.holderName}
                                                    onChange={(e) => setCardDetails(prev => ({ ...prev, holderName: e.target.value }))}
                                                    placeholder="Name on card"
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    style={{ borderColor: '#f5d5d8' }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        value={cardDetails.expiry}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                            setCardDetails(prev => ({ ...prev, expiry: val }));
                                                        }}
                                                        placeholder="MM/YY"
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                        style={{ borderColor: '#f5d5d8' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                                    <input
                                                        type="password"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                                                        placeholder="***"
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                        style={{ borderColor: '#f5d5d8' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 sticky top-6" style={{ boxShadow: '0 8px 32px rgba(183,110,121,0.12)', border: '1px solid #f5d5d8' }}>
                            <h2 className="text-lg font-semibold text-[#3d1a22] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Order Summary
                            </h2>

                            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                {cart.map(item => (
                                    <div key={item.productId} className="flex gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                                            style={{ background: '#fdeef0' }}
                                        >
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain bg-white" />
                                            ) : (
                                                <ShoppingBag size={16} className="text-[#B76E79]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-[#3d1a22] truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-medium text-[#3d1a22]">
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {!appliedPromotion ? (
                                <div className="mb-4 p-3 rounded-xl" style={{ background: '#fdf8f8', border: '1px solid #f5d5d8' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag size={14} className="text-[#B76E79]" />
                                        <span className="text-xs font-medium text-[#3d1a22]">Have a promo code?</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="flex-1 px-3 py-2 text-xs rounded-lg border"
                                            style={{ borderColor: '#f5d5d8' }}
                                            onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                                        />
                                        <button
                                            onClick={applyPromoCode}
                                            disabled={promoLoading}
                                            className="px-3 py-2 text-xs bg-[#B76E79] text-white rounded-lg hover:bg-[#9e5c67] transition-colors disabled:opacity-50"
                                        >
                                            {promoLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                                    {promoSuccess && <p className="text-xs text-green-600 mt-1">{promoSuccess}</p>}
                                </div>
                            ) : (
                                <div className="mb-4 p-3 rounded-xl flex items-center justify-between" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check size={12} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-green-700">{appliedPromotion.code}</p>
                                            <p className="text-xs text-green-600">-{appliedPromotion.discountType === 'PERCENTAGE' ? `${appliedPromotion.discountValue}%` : `$${appliedPromotion.discountValue}`} OFF</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removePromoCode}
                                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                        <X size={12} className="text-gray-400" />
                                    </button>
                                </div>
                            )}

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
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="font-medium text-green-600">-${discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between py-4">
                                <span className="text-lg font-semibold text-[#3d1a22]">Total</span>
                                <span className="text-xl font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    ${total.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B76E79] text-white rounded-full hover:bg-[#9e5c67] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <Lock size={16} />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                                <Lock size={12} />
                                Secure checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => (
    <ErrorBoundary>
        <CheckoutContent />
    </ErrorBoundary>
);

export default CheckoutPage;
