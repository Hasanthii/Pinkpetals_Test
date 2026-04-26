import api from './api';

export const SupplierService = {
    getAll: async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },

    getActive: async () => {
        const response = await api.get('/suppliers/active');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    },

    getByEmail: async (email) => {
        const response = await api.get(`/suppliers/email/${encodeURIComponent(email)}`);
        return response.data;
    },

    getByCategory: async (category) => {
        const response = await api.get(`/suppliers/category/${encodeURIComponent(category)}`);
        return response.data;
    },

    search: async (keyword) => {
        const response = await api.get('/suppliers/search', { params: { keyword } });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/suppliers/categories');
        return response.data;
    },

    create: async (supplierData) => {
        const response = await api.post('/suppliers', supplierData);
        return response.data;
    },

    register: async (supplierData) => {
        const response = await api.post('/suppliers/register', supplierData);
        return response.data;
    },

    update: async (id, supplierData) => {
        const response = await api.put(`/suppliers/${id}`, supplierData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/suppliers/${id}`);
    },

    activate: async (id) => {
        const response = await api.post(`/suppliers/${id}/activate`);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.post(`/suppliers/${id}/deactivate`);
        return response.data;
    },
};

export const supplierApi = {
    getAll: SupplierService.getAll,
    getActive: SupplierService.getActive,
    getById: SupplierService.getById,
    create: SupplierService.create,
    update: SupplierService.update,
    delete: SupplierService.delete,
    activate: SupplierService.activate,
    deactivate: SupplierService.deactivate,
};

export default SupplierService;
