import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../services/orderService';
import OrderCard, { OrderStatusBadge, OrderEmptyState, OrderDetailSkeleton } from '../components/OrderCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { Package, Plus, Filter, BarChart3, X, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { canCancelOrder } from '../types/order';
const OrderStatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(183,110,121,0.08)', border: '1px solid #f5d5d8' }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Jost, sans-serif' }}>{title}</p>
                <p className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
    </div>
);

const StatusFilterTab = ({ active, label, count, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            active 
                ? 'bg-[#B76E79] text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-pink-50'
        }`}
        style={{ border: '1px solid #f5d5d8', fontFamily: 'Jost, sans-serif' }}
    >
        {label}
        {count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-pink-100 text-[#B76E79]'}`}>
                {count}
            </span>
        )}
    </button>
);

const OrderDetailModal = ({ order, isOpen, onClose, onUpdateStatus, onCancel, isAdmin }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.2)' }}>
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#f5d5d8' }}>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                        Order #{order.id}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            Payment: {order.paymentStatus}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl" style={{ background: '#fffaf9' }}>
                            <p className="text-xs text-gray-400 mb-1">Customer</p>
                            <p className="text-sm font-medium text-gray-800">{order.userFirstName} {order.userLastName}</p>
                            <p className="text-xs text-gray-500">{order.userEmail}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: '#fffaf9' }}>
                            <p className="text-xs text-gray-400 mb-1">Order Date</p>
                            <p className="text-sm font-medium text-gray-800">
                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: '#fffaf9' }}>
                        <p className="text-xs text-gray-400 mb-2">Shipping Address</p>
                        <p className="text-sm text-gray-700">{order.shippingAddress || 'Not provided'}</p>
                    </div>

                    {order.notes && (
                        <div className="p-4 rounded-xl" style={{ background: '#fffaf9' }}>
                            <p className="text-xs text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{order.notes}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-gray-400 mb-3">Order Items</p>
                        <div className="space-y-3">
                            {order.orderItems && order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#fdeef0' }}>
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}>
                                        {item.productImageUrl ? (
                                            <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-contain bg-white" />
                                        ) : (
                                            <Package size={18} className="text-[#B76E79]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                                        <p className="text-xs text-gray-400">{item.productBrand}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        <p className="text-sm font-medium text-[#B76E79]">
                                            ${Number(item.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#f5d5d8' }}>
                        <div>
                            <p className="text-xs text-gray-400">Total Amount</p>
                            <p className="text-2xl font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                ${Number(order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Payment Method</p>
                            <p className="text-sm font-medium text-gray-700">{order.paymentMethod || 'Cash on Delivery'}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {isAdmin && onUpdateStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <select
                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl border text-sm bg-white"
                                style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                            >
                                <option value="">Update Status...</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                            </select>
                        )}
                        {!isAdmin && onCancel && canCancelOrder(order) && (
                            <button
                                onClick={() => onCancel(order.id)}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusUpdateModal = ({ isOpen, onClose, onConfirm, orderId }) => {
    const [status, setStatus] = useState('PROCESSING');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6" style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.2)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#3d1a22' }}>
                    Update Order Status
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">New Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-sm"
                            style={{ borderColor: '#f5d5d8' }}
                        >
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-sm"
                            style={{ borderColor: '#f5d5d8' }}
                            rows={3}
                            placeholder="Add any notes about this status change..."
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-50"
                        style={{ borderColor: '#f5d5d8' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(orderId, status, notes); onClose(); }}
                        className="flex-1 px-4 py-2 rounded-xl bg-[#B76E79] text-white text-sm font-medium hover:bg-[#9e5c67] transition-colors"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, type, isVisible }) => {
    if (!isVisible) return null;
    return (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm animate-pulse shadow-lg ${
            type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
            {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span style={{ fontFamily: 'Jost, sans-serif' }}>{message}</span>
        </div>
    );
};

const OrdersPageContent = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusOrderId, setStatusOrderId] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    // Derive isAdmin directly from localStorage (not state) to avoid race conditions
    const isAdmin = localStorage.getItem('pinkpetals_role') === 'ADMIN';

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('pinkpetals_user') || 'null');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders(isAdmin);
        if (isAdmin) fetchStats();
    }, [navigate]);

    useEffect(() => {
        fetchOrders(isAdmin);
    }, [activeTab]);

    const fetchOrders = async (adminOverride) => {
        const admin = adminOverride !== undefined ? adminOverride : isAdmin;
        setLoading(true);
        setError(null);
        try {
            let data;
            if (admin) {
                data = activeTab !== 'all' ? await orderApi.getAllOrders(activeTab) : await orderApi.getAllOrders();
            } else {
                data = await orderApi.getMyOrders();
            }
            setOrders(data || []);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to load orders. Make sure the backend is running.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await orderApi.getOrderStats();
            setStats(data);
        } catch (err) {
            // Silently fail for stats
        }
    };

    const handleViewOrder = async (order) => {
        try {
            const fullOrder = await orderApi.getOrderById(order.id);
            setSelectedOrder(fullOrder);
        } catch (err) {
            setSelectedOrder(order);
        }
    };

    const handleUpdateStatus = (orderId) => {
        setStatusOrderId(orderId);
        setShowStatusModal(true);
    };

    const handleStatusConfirm = async (orderId, status, notes) => {
        try {
            await orderApi.updateOrderStatus(orderId, status, notes);
            showToast(`Order status updated to ${status}`);
            
            // After updating, refetch orders and stats
            // If viewing a specific tab, the order will move to the correct tab
            await fetchOrders();
            if (isAdmin) {
                await fetchStats();
            }
            setSelectedOrder(null);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await orderApi.cancelOrder(orderId);
            showToast('Order cancelled successfully');
            fetchOrders();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this cancelled order permanently? This action cannot be undone.')) return;
        try {
            await orderApi.deleteOrder(orderId);
            showToast('Order deleted successfully');
            fetchOrders();
            if (isAdmin) {
                fetchStats();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete order', 'error');
        }
    };

    const statusTabs = isAdmin ? [
        { key: 'all', label: 'All Orders' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'PROCESSING', label: 'Processing' },
        { key: 'SHIPPED', label: 'Shipped' },
        { key: 'DELIVERED', label: 'Delivered' },
    ] : [
        { key: 'all', label: 'My Orders' }
    ];

    return (
        <div style={{ fontFamily: 'Jost, sans-serif', background: '#fffaf9', minHeight: '100vh' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="text-center mb-8">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#B76E79] mb-2">
                        {isAdmin ? 'Order Management' : 'Your Orders'}
                    </p>
                    <h1
                        style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            color: '#3d1a22',
                            fontWeight: 600,
                        }}
                    >
                        {isAdmin ? 'Manage Orders' : 'My Orders'}
                    </h1>
                    <div className="mx-auto mt-3 w-10 h-0.5 rounded-full" style={{ background: '#B76E79' }} />
                </div>

                {isAdmin && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <OrderStatsCard title="Total Orders" value={stats.totalOrders} icon={Package} color="bg-[#B76E79]" />
                        <OrderStatsCard title="Pending" value={stats.pendingOrders} icon={AlertCircle} color="bg-yellow-500" />
                        <OrderStatsCard title="Delivered" value={stats.deliveredOrders} icon={CheckCircle} color="bg-green-500" />
                        <OrderStatsCard title="Revenue" value={`$${Number(stats.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={BarChart3} color="bg-[#3d1a22]" />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                    {statusTabs.map(tab => (
                        <StatusFilterTab
                            key={tab.key}
                            label={tab.label}
                            active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                        />
                    ))}
                </div>

                <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <OrderDetailSkeleton />
                        <OrderDetailSkeleton />
                        <OrderDetailSkeleton />
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                        <h3 className="text-lg font-semibold text-[#3d1a22] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Something went wrong
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-6 py-2 rounded-full bg-[#B76E79] text-white text-sm hover:bg-[#9e5c67] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <OrderEmptyState message={isAdmin ? 'No orders found' : 'You haven\'t placed any orders yet'} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onView={handleViewOrder}
                                onEdit={isAdmin ? handleUpdateStatus : null}
                                onDelete={isAdmin ? handleDeleteOrder : null}
                                onCancel={!isAdmin ? handleCancelOrder : null}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                )}
            </div>

            <OrderDetailModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={isAdmin ? handleUpdateStatus : null}
                onCancel={!isAdmin ? handleCancelOrder : null}
                isAdmin={isAdmin}
            />

            <StatusUpdateModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                onConfirm={handleStatusConfirm}
                orderId={statusOrderId}
            />
        </div>
    );
};

const OrdersPage = () => (
    <ErrorBoundary>
        <OrdersPageContent />
    </ErrorBoundary>
);

export default OrdersPage;
