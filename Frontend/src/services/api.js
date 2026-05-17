import axios from 'axios';
import { auth } from '../firebaseConfig';

// In Docker: frontend on :80, backend on :5000
const API_BASE = 'http://localhost:5000/api';

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

export default api;
