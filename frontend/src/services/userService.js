import api from './api.js';
import { createUserDTO, createUpdateUserRequest, createChangePasswordRequest } from '../types/user.js';

export const userApi = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data.map(user => createUserDTO(user));
    },

    getActiveUsers: async () => {
        const response = await api.get('/users/active');
        return response.data.map(user => createUserDTO(user));
    },

    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return createUserDTO(response.data);
    },

    getUserByEmail: async (email) => {
        const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
        return createUserDTO(response.data);
    },

    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return createUserDTO(response.data);
    },

    updateUser: async (id, userData) => {
        const request = createUpdateUserRequest(userData);
        const response = await api.put(`/users/${id}`, request);
        return createUserDTO(response.data);
    },

    adminUpdateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return createUserDTO(response.data);
    },

    changePassword: async (id, passwordData) => {
        const request = createChangePasswordRequest(passwordData);
        await api.put(`/users/${id}/password`, request);
    },

    deleteUser: async (id) => {
        await api.delete(`/users/${id}`);
    },

    deactivateUser: async (id) => {
        await api.delete(`/users/${id}`);
    },

    activateUser: async (id) => {
        await api.post(`/users/${id}/activate`);
    },

    searchUsers: async (name) => {
        const response = await api.get('/users/search', { params: { name } });
        return response.data.map(user => createUserDTO(user));
    },

    getUsersByRole: async (role) => {
        const response = await api.get(`/users/role/${role}`);
        return response.data.map(user => createUserDTO(user));
    }
};

export default userApi;
