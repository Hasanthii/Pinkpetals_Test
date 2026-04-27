import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Package, CreditCard, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { orderApi } from '../services/orderService';
import { cartService } from '../services/cartService';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const CustomerDashboardContent = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('pinkpetals_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchOrders();
        }
        setCartCount(cartService.getCartItemCount());
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderApi.getMyOrders();
            setOrders(data || []);
        } catch (err) {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            case 'PROCESSING': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const stats = [
        { icon: ShoppingBag, label: 'Total Orders', value: orders.length.toString(), color: 'from-pink-400 to-rose-500' },
        { icon: Star, label: 'My Reviews', value: '0', color: 'from-amber-400 to-orange-500' },
        { icon: ShoppingBag, label: 'In Bag', value: cartCount.toString(), color: 'from-pink-400 to-rose-500' },
        { icon: CreditCard, label: 'Points Earned', value: '0', color: 'from-green-400 to-emerald-500' },
    ];

    const quickActions = [
        { icon: ShoppingBag, label: 'Browse Shop', desc: 'Explore our latest products', path: '/shop', color: '#B76E79' },
        { icon: Package, label: 'My Bag', desc: 'View your cart', path: '/cart', color: '#c9898a' },
        { icon: Truck, label: 'My Orders', desc: 'Track your deliveries', path: '/orders', color: '#d4879a' },
        { icon: Star, label: 'Write Review', desc: 'Share your experience', path: '/reviews', color: '#d4a0a0' },
    ];

    return (
        <div className="p-8" style={{ 
            fontFamily: 'Jost, sans-serif', 
            minHeight: '100vh',
            background: `linear-gradient(to bottom, rgba(255,250,249,0.70), rgba(255,250,249,0.75)), url('https://images.pexels.com/photos/3762562/pexels-photo-3762562.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="text-sm text-warm-rose mb-2">
                        <span className="uppercase tracking-widest text-xs">Welcome back</span>
                    </div>
                    <h1 className="text-3xl font-bold text-deep-burgundy font-playfair">
                        Hello, {user?.firstName || 'Valued'} {user?.lastName || 'Customer'}!
                    </h1>
                    <p className="text-warm-rose/70 mt-1">Manage your account and orders</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-pale-rose/30">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-deep-burgundy font-playfair">{stat.value}</p>
                            <p className="text-xs text-warm-rose/70 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold text-deep-burgundy font-playfair mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="bg-white rounded-2xl p-5 shadow-md border border-pale-rose/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: action.color + '20' }}>
                                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                                </div>
                                <h3 className="font-semibold text-deep-burgundy text-sm mb-1">{action.label}</h3>
                                <p className="text-xs text-gray-500">{action.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pale-rose/50 to-soft-blush/50 rounded-2xl p-8 border border-pale-rose/30">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-deep-burgundy font-playfair">Recent Orders</h2>
                        <Link to="/orders" className="text-sm text-primary-rose hover:text-deep-rose flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-gray-500">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="text-sm text-gray-500">No orders yet. Start shopping!</p>
                        ) : (
                            orders.slice(0, 3).map((order) => (
                                <div key={order.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-deep-burgundy text-sm">#{order.id}</p>
                                        <p className="text-xs text-gray-500">
                                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-sm font-semibold text-deep-burgundy mt-1">
                                            ${Number(order.totalAmount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerDashboard = () => (
    <ErrorBoundary>
        <CustomerDashboardContent />
    </ErrorBoundary>
);

export default CustomerDashboard;
