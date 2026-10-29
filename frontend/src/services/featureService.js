import api from './api';

export const featureService = {
  // --- 1. Cost Estimator ---
  estimateCost: async (params) => {
    const response = await api.post('/features/estimate-cost', params);
    return response.data;
  },

  // --- 2. Smart Recommendations ---
  getRecommendations: async (params = {}) => {
    const response = await api.get('/features/recommendations', { params });
    return Array.isArray(response.data) ? response.data : [];
  },

  // --- 3. Reviews & Ratings ---
  getReviews: async (stationId) => {
    const response = await api.get(`/features/reviews/station/${stationId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  submitReview: async (reviewData) => {
    const response = await api.post('/features/reviews', reviewData);
    return response.data;
  },

  // --- 4. Simulation Engine ---
  startSimulation: async (sessionData) => {
    const response = await api.post('/features/simulation/start', sessionData);
    return response.data;
  },

  tickSimulation: async (sessionId) => {
    const response = await api.post(`/features/simulation/${sessionId}/tick`);
    return response.data;
  },

  stopSimulation: async (sessionId) => {
    const response = await api.post(`/features/simulation/${sessionId}/stop`);
    return response.data;
  },

  getSimulation: async (bookingId) => {
    const response = await api.get(`/features/simulation/booking/${bookingId}`);
    return response.data;
  },

  // --- 5. Notifications ---
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return Array.isArray(response.data) ? response.data : [];
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return typeof response.data === 'number' ? response.data : 0;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};

