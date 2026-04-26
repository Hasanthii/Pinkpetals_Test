import React from 'react';
import { Clock, Package, Truck, CheckCircle, XCircle, Circle, CreditCard, MapPin, User, Eye, Edit, Trash2, X } from 'lucide-react';
import { getStatusColor, getStatusIcon, getPaymentStatusColor, formatOrderDate, formatPrice, OrderStatus, canCancelOrder } from '../types/order';

const iconMap = {
    Clock: Clock,
    Package: Package,
    Truck: Truck,
    CheckCircle: CheckCircle,
    XCircle: XCircle,
    Circle: Circle
};

export const OrderCard = ({ order, onView, onEdit, onDelete, onCancel, isAdmin = false }) => {
    const StatusIcon = iconMap[getStatusIcon(order.status)] || Circle;
    
    return (
        <div 
            className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            style={{ 
                boxShadow: '0 4px 20px rgba(183,110,121,0.08)',
                border: '1px solid #f5d5d8'
            }}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Order #{order.id}
                        </p>
                        <p className="text-sm font-medium text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {formatOrderDate(order.orderDate)}
                        </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <StatusIcon size={12} />
                        {order.status}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fdeef0' }}>
                        <User size={14} className="text-[#B76E79]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Customer</p>
                        <p className="text-sm text-gray-700">
                            {order.userFirstName} {order.userLastName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fdeef0' }}>
                        <MapPin size={14} className="text-[#B76E79]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Shipping Address</p>
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">
                            {order.shippingAddress || 'N/A'}
                        </p>
                    </div>
                </div>

                {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl" style={{ background: '#fffaf9' }}>
                        <p className="text-xs text-gray-400 mb-2">Items ({order.orderItems.length})</p>
                        <div className="space-y-2">
                            {order.orderItems.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
                                    >
                                        {item.productImageUrl ? (
                                            <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={12} className="text-[#B76E79]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 truncate">{item.productName}</p>
                                        <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-medium text-[#B76E79]">
                                        {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            ))}
                            {order.orderItems.length > 2 && (
                                <p className="text-xs text-center text-gray-400">
                                    +{order.orderItems.length - 2} more items
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#f5d5d8' }}>
                    <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-lg font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {formatPrice(order.totalAmount)}
                        </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <CreditCard size={10} />
                        {order.paymentStatus}
                    </div>
                </div>
            </div>

            <div className="flex border-t" style={{ borderColor: '#f5d5d8' }}>
                {onView && (
                    <button
                        onClick={() => onView(order)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-[#B76E79] hover:bg-pink-50 transition-colors"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        <Eye size={12} />
                        View
                    </button>
                )}
                {isAdmin && onEdit && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                    <button
                        onClick={() => onEdit(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-blue-600 hover:bg-blue-50 transition-colors border-l"
                        style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                    >
                        <Edit size={12} />
                        Update
                    </button>
                )}
                {!isAdmin && onCancel && canCancelOrder(order) && (
                    <button
                        onClick={() => onCancel(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-red-500 hover:bg-red-50 transition-colors border-l"
                        style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                    >
                        <XCircle size={12} />
                        Cancel
                    </button>
                )}
                {isAdmin && onDelete && order.status === OrderStatus.CANCELLED && (
                    <button
                        onClick={() => onDelete(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors border-l"
                        style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export const OrderStatusBadge = ({ status, showIcon = true }) => {
    const StatusIcon = iconMap[getStatusIcon(status)] || Circle;
    
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {showIcon && <StatusIcon size={12} />}
            {status}
        </div>
    );
};

export const PaymentBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(status)}`}>
        <CreditCard size={10} />
        {status}
    </span>
);

export const OrderItemRow = ({ item }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#fffaf9' }}>
        <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
        >
            {item.productImageUrl ? (
                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
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
            <p className="text-sm font-medium text-[#B76E79]">{formatPrice(item.unitPrice)}</p>
        </div>
        <div className="text-right min-w-[80px]">
            <p className="text-xs text-gray-400">Subtotal</p>
            <p className="text-sm font-semibold text-gray-800">{formatPrice(item.subtotal)}</p>
        </div>
    </div>
);

export const OrderEmptyState = ({ message = "No orders found" }) => (
    <div className="text-center py-12">
        <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
        >
            <Package size={24} className="text-[#B76E79]" />
        </div>
        <p className="text-sm text-gray-400" style={{ fontFamily: 'Jost, sans-serif' }}>{message}</p>
    </div>
);

export const OrderDetailSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-32 rounded bg-pink-100" />
            <div className="h-6 w-24 rounded-full bg-pink-100" />
        </div>
        <div className="space-y-3">
            <div className="h-4 w-full rounded bg-pink-100" />
            <div className="h-4 w-3/4 rounded bg-pink-100" />
            <div className="h-4 w-1/2 rounded bg-pink-100" />
        </div>
    </div>
);

export default OrderCard;
