import axios from 'axios';

// Resolve base URL from environment or fallback to relative '/api' for local Vite proxy
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor: attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiry and standardize error reporting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      const token = localStorage.getItem('token');
      // Only redirect if a session existed and user wasn't on the login/register screen
      if (token && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }

    // Enhance error object with backend response message if available
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    if (backendMessage && typeof backendMessage === 'string') {
      error.customMessage = backendMessage;
    }

    return Promise.reject(error);
  }
);

export default api;
