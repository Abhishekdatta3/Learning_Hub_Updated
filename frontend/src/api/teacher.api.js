import api from './axios';
export const getTeachers      = ()      => api.get('/teachers');
export const getTeacherById   = (id)    => api.get('/teachers/' + id);
export const getMyProfile     = ()      => api.get('/teachers/profile/me');
export const upsertMyProfile  = (data)  => api.post('/teachers/profile', data);
