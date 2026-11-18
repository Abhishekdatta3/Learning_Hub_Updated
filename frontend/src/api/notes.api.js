import api from './axios';
export const uploadNote        = (formData)  => api.post('/notes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getNotesBySubject = (subjectId) => api.get('/notes/subject/' + subjectId);
export const trackAccess       = (noteId)    => api.post('/notes/access/' + noteId);
export const deleteNote        = (noteId)    => api.delete('/notes/' + noteId);
