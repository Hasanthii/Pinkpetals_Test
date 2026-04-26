import api from './api.js';
import { createRegisterRequest, createLoginRequest, createAuthResponse } from '../types/user.js';

export const authApi = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('pinkpetals_token');
        localStorage.removeItem('pinkpetals_user');
        localStorage.removeItem('pinkpetals_role');
    },

    getToken: () => {
        return localStorage.getItem('pinkpetals_token');
    },

    setAuth: (token, user) => {
        localStorage.setItem('pinkpetals_token', token);
        localStorage.setItem('pinkpetals_user', JSON.stringify(user));
        localStorage.setItem('pinkpetals_role', user.role);
    },

    getStoredUser: () => {
        const userStr = localStorage.getItem('pinkpetals_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getStoredRole: () => {
        return localStorage.getItem('pinkpetals_role');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('pinkpetals_token');
    },

    isAdmin: () => {
        return localStorage.getItem('pinkpetals_role') === 'ADMIN';
    },

    isCustomer: () => {
        return localStorage.getItem('pinkpetals_role') === 'CUSTOMER';
    },

    isSupplier: () => {
        return localStorage.getItem('pinkpetals_role') === 'SUPPLIER';
    }
};

export const handleAuthSuccess = (response) => {
    authApi.setAuth(response.token, response.user);
    return response;
};

export default authApi;
