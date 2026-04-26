import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method, config.url, config.data);
        const token = localStorage.getItem('pinkpetals_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log('=== API Error Full ===');
        console.log('Message:', error.message);
        console.log('Config URL:', error.config?.url);
        console.log('Config Method:', error.config?.method);
        console.log('Response Status:', error.response?.status);
        console.log('Response Data:', error.response?.data);
        console.log('Response Headers:', error.response?.headers);
        
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                localStorage.removeItem('pinkpetals_token');
                localStorage.removeItem('pinkpetals_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            let message = data?.message || data?.error || 'An unexpected error occurred.';
            // Check for field-specific errors
            if (data?.fieldErrors) {
                const fieldErrors = Object.values(data.fieldErrors);
                if (fieldErrors.length > 0) {
                    message = fieldErrors[0];
                }
            }
            console.error('API Error:', status, data, message);
            const errorToThrow = new Error(message);
            errorToThrow.status = status;
            errorToThrow.data = data;
            return Promise.reject(errorToThrow);
        }

        if (error.code === 'ECONNABORTED') {
            const timeoutError = new Error('Request timed out. Please check your connection.');
            return Promise.reject(timeoutError);
        }

        if (!error.response) {
            const networkError = new Error('Network error. Please check your internet connection.');
            return Promise.reject(networkError);
        }

        return Promise.reject(error);
    }
);

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

export const productApi = {
    getAll: ProductService.getAll,
};

export default api;
