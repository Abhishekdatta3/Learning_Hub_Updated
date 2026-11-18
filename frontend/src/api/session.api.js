import api from './axios';
export const createSlot  = (data) => api.post('/sessions/slots', data);
export const getSlots    = ()     => api.get('/sessions/slots');
export const bookSlot    = (id)   => api.post('/sessions/book/' + id);
export const getHistory  = ()     => api.get('/sessions/history');
export const rateSession = (id, data) => api.post('/sessions/rate/' + id, data);
