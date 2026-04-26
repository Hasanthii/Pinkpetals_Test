import api from './api';

export const ProductService = {
    getAll: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/products/${id}`);
    },

    search: async (query) => {
        const response = await api.get('/products/search', { params: { q: query } });
        return response.data;
    },

    getByCategory: async (category) => {
        const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
        return response.data;
    },

    getLowStock: async (threshold = 10) => {
        const response = await api.get('/products/low-stock', { params: { threshold } });
        return response.data;
    },

    updateStock: async (id, stockQuantity) => {
        const response = await api.patch(`/products/${id}/stock`, { stockQuantity });
        return response.data;
    },
};
