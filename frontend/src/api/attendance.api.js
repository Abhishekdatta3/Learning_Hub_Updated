import api from './axios';
// teacher / admin
export const startSession    = (data)      => api.post('/attendance/sessions', data);
export const closeSession    = (id)        => api.patch('/attendance/sessions/' + id + '/close');
export const listSessions    = ()          => api.get('/attendance/sessions');
export const getQueue        = (id)        => api.get('/attendance/sessions/' + id + '/queue');
// student
export const getOpenSessions = ()          => api.get('/attendance/sessions/open');
export const markPresent     = (id, data)  => api.post('/attendance/sessions/' + id + '/mark', data || {});
export const getMyAttendance = ()          => api.get('/attendance/my');
