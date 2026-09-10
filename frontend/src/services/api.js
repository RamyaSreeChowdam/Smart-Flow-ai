import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartflow_token');
      localStorage.removeItem('smartflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateSettings: (data) => api.put('/auth/settings', data)
};

// Automations
export const automationsAPI = {
  getAll:     ()          => api.get('/automations'),
  getById:    (id)        => api.get(`/automations/${id}`),
  create:     (data)      => api.post('/automations', data),
  update:     (id, data)  => api.put(`/automations/${id}`, data),
  delete:     (id)        => api.delete(`/automations/${id}`),
  runNow:     (id)        => api.post(`/automations/${id}/run`),
  runDetail:  (id)        => api.post(`/automations/${id}/run-detail`),
  toggle:     (id)        => api.post(`/automations/${id}/toggle`),
};

// Activity
export const activityAPI = {
  getLogs: (params) => api.get('/activity', { params })
};

// Alerts
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all/mark'),
  delete: (id) => api.delete(`/alerts/${id}`)
};

// Analytics
export const analyticsAPI = {
  getStats: () => api.get('/analytics')
};

// AI
export const aiAPI = {
  suggest: (text) => api.post('/ai/suggest', { text })
};

export default api;
