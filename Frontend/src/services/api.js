import axios from 'axios';
import { auth } from '../firebaseConfig';

// In Docker development: frontend on :5173, backend on :5000
// In Production/Docker deployment: relative path /api (via nginx reverse proxy)
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Events ────────────────────────────────────────────────────────────
export const getEvents = (categoryId) => {
  const params = categoryId ? { category: categoryId } : {};
  return api.get('/events', { params }).then(r => r.data);
};

export const getEvent = (id) =>
  api.get(`/events/${id}`).then(r => r.data);

export const createEvent = (data) =>
  api.post('/events', data).then(r => r.data);

export const participar = (eventId) =>
  api.post(`/events/${eventId}/participar`);

export const cancelarParticipacion = (eventId) =>
  api.delete(`/events/${eventId}/participar`);

// ─── Users ─────────────────────────────────────────────────────────────
export const getUsers = () =>
  api.get('/users').then(r => r.data);

export const searchUsers = (q) =>
  api.get('/users/search', { params: { q } }).then(r => r.data);

export const getUser = (id) =>
  api.get(`/users/${id}`).then(r => r.data);

export const getUserByUsername = (username) =>
  api.get(`/users/by-username/${username}`).then(r => r.data);

/**
 * Create a new user in the backend (registration).
 * Matches CreateUserDto: { id, nombreCompleto, username, email, fechaNacimiento?, biografia? }
 */
export const createUser = (data) =>
  api.post('/users', data).then(r => r.data);

/**
 * Update user profile.
 * Matches UpdateUserDto: { nombreCompleto?, username?, biografia?, fechaNacimiento?,
 *   instagram?, x?, youTube?, tikTok?, hobbyIds: int[] }
 */
export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then(r => r.data);

// ─── Categories ────────────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/categories').then(r => r.data);

// ─── Event Management & Code Verification ───────────────────────────────
export const updateEvent = (id, data) =>
  api.put(`/events/${id}`, data).then(r => r.data);

export const validateAttendanceCode = (id, code) =>
  api.post(`/events/${id}/validate-code`, { code }).then(r => r.data);

export const getEventManagement = (id) =>
  api.get(`/events/${id}/management`).then(r => r.data);

export const updateParticipantAttendance = (id, usuarioId, asistio) =>
  api.put(`/events/${id}/attendance`, { usuarioId, asistio }).then(r => r.data);

// ─── Announcements (Avisos) ─────────────────────────────────────────────
export const postAnnouncement = (id, title, content) =>
  api.post(`/events/${id}/announcements`, { titulo: title, contenido: content }).then(r => r.data);

export const getEventAnnouncements = (id) =>
  api.get(`/events/${id}/announcements`).then(r => r.data);

export const getUserAnnouncements = () =>
  api.get(`/users/my-announcements`).then(r => r.data);

// ─── Support (Soporte) ──────────────────────────────────────────────────
export const submitSupportTicket = (data) =>
  api.post('/support', data).then(r => r.data);

// ─── Upload (Subida) ────────────────────────────────────────────────────
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data.url);
};

export default api;
