import api from './api';

const BASE_URL = '/promotions';

export const PromotionService = {
    getAll: async () => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    getByCode: async (code) => {
        const response = await api.get(`${BASE_URL}/code/${encodeURIComponent(code)}`);
        return response.data;
    },

    getPublicPromotions: async () => {
        const response = await api.get(`${BASE_URL}/public`);
        return response.data;
    },

    getActivePromotions: async () => {
        const response = await api.get(`${BASE_URL}/active`);
        return response.data;
    },

    getExpiredPromotions: async () => {
        const response = await api.get(`${BASE_URL}/expired`);
        return response.data;
    },

    getScheduledPromotions: async () => {
        const response = await api.get(`${BASE_URL}/scheduled`);
        return response.data;
    },

    create: async (promotionData) => {
        const response = await api.post(BASE_URL, promotionData);
        return response.data;
    },

    update: async (id, promotionData) => {
        const response = await api.put(`${BASE_URL}/${id}`, promotionData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    activate: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/activate`);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/deactivate`);
        return response.data;
    },

    makePublic: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/public`);
        return response.data;
    },

    makePrivate: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/private`);
        return response.data;
    },

    validate: async (code, orderAmount) => {
        const response = await api.post(`${BASE_URL}/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
        return response.data;
    },

    calculateDiscount: async (code, orderAmount) => {
        const response = await api.post(`${BASE_URL}/calculate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
        return response.data;
    },

    recordUsage: async (usageData) => {
        const response = await api.post(`${BASE_URL}/record-usage`, usageData);
        return response.data;
    },

    getUsagesByUserId: async (userId) => {
        const response = await api.get(`${BASE_URL}/usage/user/${userId}`);
        return response.data;
    },

    getUsagesByPromotionId: async (promotionId) => {
        const response = await api.get(`${BASE_URL}/usage/promotion/${promotionId}`);
        return response.data;
    },

    getUsagesByOrderId: async (orderId) => {
        const response = await api.get(`${BASE_URL}/usage/order/${orderId}`);
        return response.data;
    },

    countUsagesByUserId: async (userId) => {
        const response = await api.get(`${BASE_URL}/usage/user/${userId}/count`);
        return response.data;
    },

    countUsagesByPromotionId: async (promotionId) => {
        const response = await api.get(`${BASE_URL}/usage/promotion/${promotionId}/count`);
        return response.data;
    },

    checkUserUsedPromotion: async (userId, code) => {
        const response = await api.get(`${BASE_URL}/check-user-usage?userId=${userId}&code=${encodeURIComponent(code)}`);
        return response.data;
    },

    getTotalDiscountByPromotionId: async (promotionId) => {
        const response = await api.get(`${BASE_URL}/usage/promotion/${promotionId}/total-discount`);
        return response.data;
    },
};
