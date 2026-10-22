import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('solar_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking auth status
      if (!error.config.url.includes('/auth/me')) {
        console.warn('Session expired or unauthorized. Token cleared.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API Helper services
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const panelsApi = {
  getAll: (params?: any) => api.get('/panels', { params }),
  getById: (id: string) => api.get(`/panels/${id}`),
  create: (data: any) => api.post('/panels', data),
  update: (id: string, data: any) => api.put(`/panels/${id}`, data),
  delete: (id: string) => api.delete(`/panels/${id}`),
};

export const invertersApi = {
  getAll: (params?: any) => api.get('/inverters', { params }),
  getById: (id: string) => api.get(`/inverters/${id}`),
  create: (data: any) => api.post('/inverters', data),
  update: (id: string, data: any) => api.put(`/inverters/${id}`, data),
  delete: (id: string) => api.delete(`/inverters/${id}`),
};

export const readingsApi = {
  getAll: (params?: any) => api.get('/readings', { params }),
  getByDevice: (deviceId: string) => api.get(`/readings/${deviceId}`),
};

export const alertsApi = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  update: (id: string, data: any) => api.put(`/alerts/${id}`, data),
  triggerSpike: (data: any) => api.post('/alerts/test-spike', data),
};

export const maintenanceApi = {
  getAll: (params?: any) => api.get('/maintenance', { params }),
  create: (data: any) => api.post('/maintenance', data),
  update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
};

export const weatherApi = {
  getCurrent: () => api.get('/weather'),
};

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getEnergy: (params?: any) => api.get('/analytics/energy', { params }),
  getEfficiency: () => api.get('/analytics/efficiency'),
  getFaults: () => api.get('/analytics/faults'),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
