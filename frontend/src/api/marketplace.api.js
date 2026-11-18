import api from './axios';
export const getTeachers           = (params) => api.get('/marketplace/teachers', { params });
export const createProfile         = (data)   => api.post('/marketplace/profile', data);
export const createMarketplaceSlot = (data)   => api.post('/marketplace/slots', data);
export const createOrder           = (data)   => api.post('/payments/create-order', data);
export const verifyPayment         = (data)   => api.post('/payments/verify', data);
