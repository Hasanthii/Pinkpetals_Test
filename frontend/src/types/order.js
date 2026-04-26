export const OrderStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

export const PaymentStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
    FAILED: 'FAILED'
};

export const createOrderDTO = (data) => ({
    id: data.id || null,
    userId: data.userId || null,
    userEmail: data.userEmail || '',
    userFirstName: data.userFirstName || '',
    userLastName: data.userLastName || '',
    totalAmount: data.totalAmount || 0,
    status: data.status || OrderStatus.PENDING,
    shippingAddress: data.shippingAddress || '',
    paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
    paymentMethod: data.paymentMethod || '',
    notes: data.notes || '',
    orderItems: data.orderItems ? data.orderItems.map(createOrderItemDTO) : [],
    orderDate: data.orderDate || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
});

export const createOrderItemDTO = (data) => ({
    id: data.id || null,
    productId: data.productId || null,
    productName: data.productName || '',
    productBrand: data.productBrand || '',
    productImageUrl: data.productImageUrl || '',
    quantity: data.quantity || 0,
    unitPrice: data.unitPrice || 0,
    subtotal: data.subtotal || 0
});

export const createOrderItemRequest = (productId, quantity) => ({
    productId: productId,
    quantity: quantity
});

export const createCheckoutRequest = (items, shippingAddress, paymentMethod, notes, promotionCode) => ({
    items: items.map(item => createOrderItemRequest(item.productId, item.quantity)),
    shippingAddress: shippingAddress || '',
    paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
    notes: notes || '',
    promotionCode: promotionCode || null
});

export const createUpdateStatusRequest = (status, notes, isAdmin = false) => ({
    status: status,
    notes: notes || '',
    isAdmin: isAdmin
});

export const getStatusColor = (status) => {
    switch (status) {
        case OrderStatus.PENDING:
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case OrderStatus.PROCESSING:
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case OrderStatus.SHIPPED:
            return 'bg-purple-100 text-purple-700 border-purple-200';
        case OrderStatus.DELIVERED:
            return 'bg-green-100 text-green-700 border-green-200';
        case OrderStatus.CANCELLED:
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export const getStatusIcon = (status) => {
    switch (status) {
        case OrderStatus.PENDING:
            return 'Clock';
        case OrderStatus.PROCESSING:
            return 'Package';
        case OrderStatus.SHIPPED:
            return 'Truck';
        case OrderStatus.DELIVERED:
            return 'CheckCircle';
        case OrderStatus.CANCELLED:
            return 'XCircle';
        default:
            return 'Circle';
    }
};

export const getPaymentStatusColor = (status) => {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'bg-yellow-100 text-yellow-700';
        case PaymentStatus.PAID:
            return 'bg-green-100 text-green-700';
        case PaymentStatus.REFUNDED:
            return 'bg-orange-100 text-orange-700';
        case PaymentStatus.FAILED:
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${Number(price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const getOrderStatusProgress = (status) => {
    const statusOrder = [
        OrderStatus.PENDING,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED
    ];
    const currentIndex = statusOrder.indexOf(status);
    return {
        current: currentIndex,
        total: statusOrder.length,
        percentage: currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
    };
};

export const canCancelOrder = (order) => {
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
        return false;
    }
    if (!order.orderDate) return true;
    
    const orderTime = new Date(order.orderDate).getTime();
    const now = new Date().getTime();
    const hoursDifference = (now - orderTime) / (1000 * 60 * 60);
    
    return hoursDifference <= 5;
};
