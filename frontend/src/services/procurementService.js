import api from './api';

export const ProcurementService = {
    getAll: async () => {
        const response = await api.get('/procurement-orders');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/procurement-orders/${id}`);
        return response.data;
    },

    getBySupplierId: async (supplierId) => {
        const response = await api.get(`/procurement-orders/supplier/${supplierId}`);
        return response.data;
    },

    getByStatus: async (status) => {
        const response = await api.get(`/procurement-orders/status/${status}`);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/procurement-orders/my-orders');
        return response.data;
    },

    create: async (orderData) => {
        const response = await api.post('/procurement-orders', orderData);
        return response.data;
    },

    update: async (id, orderData) => {
        const response = await api.put(`/procurement-orders/${id}`, orderData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/procurement-orders/${id}`);
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/procurement-orders/${id}/status`, { status });
        return response.data;
    },

    confirm: async (id) => {
        const response = await api.post(`/procurement-orders/${id}/confirm`);
        return response.data;
    },

    ship: async (id) => {
        const response = await api.post(`/procurement-orders/${id}/ship`);
        return response.data;
    },

    deliver: async (id) => {
        const response = await api.post(`/procurement-orders/${id}/deliver`);
        return response.data;
    },

    cancel: async (id) => {
        const response = await api.post(`/procurement-orders/${id}/cancel`);
        return response.data;
    },
};

export const procurementApi = {
    getAll: ProcurementService.getAll,
    getById: ProcurementService.getById,
    getBySupplierId: ProcurementService.getBySupplierId,
    getByStatus: ProcurementService.getByStatus,
    create: ProcurementService.create,
    update: ProcurementService.update,
    delete: ProcurementService.delete,
    updateStatus: ProcurementService.updateStatus,
    confirm: ProcurementService.confirm,
    ship: ProcurementService.ship,
    deliver: ProcurementService.deliver,
    cancel: ProcurementService.cancel,
};

export default ProcurementService;