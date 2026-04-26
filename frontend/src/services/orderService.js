import api from './api.js';
import { createOrderDTO, createCheckoutRequest, createUpdateStatusRequest } from '../types/order.js';

export const orderApi = {
    createOrder: async (checkoutData) => {
        const request = createCheckoutRequest(
            checkoutData.items,
            checkoutData.shippingAddress,
            checkoutData.paymentMethod,
            checkoutData.notes,
            checkoutData.promotionCode
        );
        const response = await api.post('/orders', request);
        return createOrderDTO(response.data);
    },

    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data.map(order => createOrderDTO(order));
    },

    getAllOrders: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get('/orders', { params });
        return response.data.map(order => createOrderDTO(order));
    },

    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return createOrderDTO(response.data);
    },

    updateOrderStatus: async (orderId, status, notes) => {
        const request = createUpdateStatusRequest(status, notes, true);
        const response = await api.put(`/orders/${orderId}/status`, request);
        return createOrderDTO(response.data);
    },

    cancelOrder: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/cancel`);
        return createOrderDTO(response.data);
    },

    deleteOrder: async (orderId) => {
        await api.delete(`/orders/${orderId}`);
    },

    getOrderStats: async () => {
        const response = await api.get('/orders/stats');
        return response.data;
    }
};

export default orderApi;
