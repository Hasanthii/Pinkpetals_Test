import React, { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, Clock, Sparkles, Tag } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { orderApi } from '../services/orderService.js';

const SupplierDashboardContent = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalValue: 0, activeProducts: 0 });
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('pinkpetals_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await orderApi.getAllOrders();
            const ordersList = Array.isArray(data) ? data : [];
            setOrders(ordersList);
            
            const delivered = ordersList.filter(o => o.status === 'DELIVERED').length;
            const pending = ordersList.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
            const shipped = ordersList.filter(o => o.status === 'SHIPPED').length;
            const totalValue = ordersList.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
            
            setStats({
                totalOrders: ordersList.length,
                pendingOrders: pending + shipped,
                totalValue: totalValue,
                activeProducts: delivered
            });
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders([]);
            setStats({ totalOrders: 0, pendingOrders: 0, totalValue: 0, activeProducts: 0 });
        } finally {
            setLoadingOrders(false);
        }
    };

    const statsCards = [
        { icon: Package, label: 'Total Orders', value: stats.totalOrders, color: 'from-blue-400 to-indigo-500' },
        { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders, color: 'from-amber-400 to-orange-500' },
        { icon: DollarSign, label: 'Total Value', value: '$' + stats.totalValue.toLocaleString(), color: 'from-green-400 to-emerald-500' },
        { icon: TrendingUp, label: 'Delivered', value: stats.totalOrders - stats.pendingOrders, color: 'from-purple-400 to-pink-500' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return { class: 'bg-green-100 text-green-700', label: 'Delivered' };
            case 'SHIPPED':
                return { class: 'bg-blue-100 text-blue-700', label: 'Shipped' };
            case 'PROCESSING':
                return { class: 'bg-amber-100 text-amber-700', label: 'Processing' };
            case 'CANCELLED':
                return { class: 'bg-red-100 text-red-700', label: 'Cancelled' };
            default:
                return { class: 'bg-gray-100 text-gray-700', label: 'Pending' };
        }
    };

    return (
        <div className="p-8" style={{ 
            fontFamily: 'Jost, sans-serif', 
            minHeight: '100vh',
            background: `linear-gradient(to bottom, rgba(255,250,249,0.70), rgba(255,250,249,0.75)), url('https://images.pexels.com/photos/7622799/pexels-photo-7622799.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="text-sm text-warm-rose mb-2">
                        <span className="uppercase tracking-widest text-xs">Supplier Portal</span>
                    </div>
                    <h1 className="text-3xl font-bold text-deep-burgundy font-playfair">
                        Hello, {user?.firstName || 'Supplier'}!
                    </h1>
                    <p className="text-warm-rose/70 mt-1">View all orders and manage your inventory</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statsCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-pale-rose/30">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-deep-burgundy font-playfair">{stat.value}</p>
                            <p className="text-xs text-warm-rose/70 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-pale-rose/50 to-soft-blush/50 rounded-2xl p-8 border border-pale-rose/30">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-deep-burgundy font-playfair">All Orders</h2>
                        <span className="text-sm text-gray-500">{orders.length} orders total</span>
                    </div>
                    
                    {loadingOrders ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8">
                            <Tag size={40} className="mx-auto mb-4 text-pink-200" />
                            <p className="text-gray-500">No orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {orders.map((order) => {
                                const status = getStatusBadge(order.status);
                                return (
                                    <div key={order.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-deep-burgundy text-sm">#{order.id}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.customerFirstName} {order.customerLastName} • {order.orderItems?.length || 0} items
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${status.class}`}>
                                                {status.label}
                                            </span>
                                            <p className="text-sm font-semibold text-deep-burgundy mt-1">
                                                ${Number(order.totalAmount || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SupplierDashboard = () => (
    <ErrorBoundary>
        <SupplierDashboardContent />
    </ErrorBoundary>
);

export default SupplierDashboard;
