import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Loans
export const loansAPI = {
  getAll: () => api.get('/loans/'),
  add: (data) => api.post('/loans/', data),
  update: (id, data) => api.put(`/loans/${id}`, data),
  delete: (id) => api.delete(`/loans/${id}`),
  get: (id) => api.get(`/loans/${id}`),
};

// Financial
export const financialAPI = {
  getProfile: () => api.get('/financial/profile'),
  updateProfile: (data) => api.post('/financial/profile', data),
  getHealth: () => api.get('/financial/health'),
  getSettlement: (loanId) => api.post(`/financial/settlement/${loanId}`),
  getAllSettlements: () => api.get('/financial/settlements'),
};

// AI
export const aiAPI = {
  generate: (data) => api.post('/ai/generate', data),
  getHistory: () => api.get('/ai/history'),
  getHistoryItem: (id) => api.get(`/ai/history/${id}`),
  deleteHistory: (id) => api.delete(`/ai/history/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};
