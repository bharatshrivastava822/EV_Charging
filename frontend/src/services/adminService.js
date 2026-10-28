import api from './api';

export const adminService = {
  /**
   * Retrieve aggregate metrics for the Admin Dashboard
   */
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data) return response.data;
      throw new Error('Failed to retrieve system statistics.');
    } catch (apiError) {
      console.error('Admin stats fetch error:', apiError.message);
      throw apiError;
    }
  },

  /**
   * Retrieve all bookings with optional query filters (date, stationId, status)
   */
  getAllBookings: async (params = {}) => {
    try {
      const response = await api.get('/admin/bookings', { params });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (apiError) {
      console.error('Admin bookings fetch error:', apiError.message);
      throw apiError;
    }
  },

  /**
   * Retrieve registered users
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (apiError) {
      console.error('Admin users fetch error:', apiError.message);
      throw apiError;
    }
  },

  /**
   * Create a new charging station
   */
  createStation: async (stationData) => {
    try {
      const response = await api.post('/stations', stationData);
      if (response.data) return response.data;
      throw new Error('Failed to create station.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Station creation failed.';
      throw new Error(msg);
    }
  },

  /**
   * Update existing station details
   */
  updateStation: async (id, stationData) => {
    try {
      const response = await api.put(`/stations/${id}`, stationData);
      if (response.data) return response.data;
      throw new Error('Failed to update station.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Station update failed.';
      throw new Error(msg);
    }
  },

  /**
   * Delete or deactivate station
   */
  deactivateStation: async (id) => {
    try {
      const response = await api.delete(`/stations/${id}`);
      return response.data;
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Station deactivation failed.';
      throw new Error(msg);
    }
  },

  /**
   * Add a new charger connector to a station
   */
  addCharger: async (chargerData) => {
    try {
      const payload = {
        stationId: Number(chargerData.stationId),
        chargerNumber: chargerData.chargerNumber,
        chargerType: chargerData.chargerType,
        chargingSpeed: chargerData.chargingSpeed,
        powerKw: Number(chargerData.powerKw)
      };
      const response = await api.post('/stations/chargers', payload);
      if (response.data) return response.data;
      throw new Error('Failed to add charger.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Add charger failed.';
      throw new Error(msg);
    }
  },

  /**
   * Delete a charger unit
   */
  deactivateCharger: async (id) => {
    try {
      const response = await api.delete(`/stations/chargers/${id}`);
      return response.data;
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Charger deactivation failed.';
      throw new Error(msg);
    }
  },

  /**
   * Create a 30-minute booking time slot
   */
  createSlot: async (slotData) => {
    try {
      const response = await api.post('/slots', slotData);
      if (response.data) return response.data;
      throw new Error('Failed to create slot.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Slot creation failed.';
      throw new Error(msg);
    }
  },

  /**
   * Update slot status (AVAILABLE / BOOKED / BLOCKED / MAINTENANCE)
   */
  updateSlotStatus: async (slotId, status) => {
    try {
      const response = await api.patch(`/slots/${slotId}/status`, null, { params: { status } });
      if (response.data) return response.data;
      throw new Error('Failed to update slot status.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Slot status update failed.';
      throw new Error(msg);
    }
  },

  /**
   * Admin booking cancellation
   */
  cancelBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      if (response.data) return response.data;
      throw new Error('Failed to cancel booking.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Unable to cancel booking.';
      throw new Error(msg);
    }
  },

  /**
   * Get pending operator applications
   */
  getPendingOperators: async () => {
    try {
      const response = await api.get('/admin/operators/pending');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Failed to fetch pending operators:', err);
      throw err;
    }
  },

  /**
   * Review operator application (APPROVED / REJECTED)
   */
  reviewOperator: async (userId, status, reason = '') => {
    try {
      const response = await api.post(`/admin/operators/${userId}/review`, { status, reason });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Operator review failed.';
      throw new Error(msg);
    }
  },

  /**
   * Get pending station submissions
   */
  getPendingStations: async () => {
    try {
      const response = await api.get('/admin/stations/pending');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Failed to fetch pending stations:', err);
      throw err;
    }
  },

  /**
   * Review station submission (APPROVED / REJECTED)
   */
  reviewStation: async (stationId, status, comments = '') => {
    try {
      const response = await api.post(`/admin/stations/${stationId}/review`, { status, comments });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Station review failed.';
      throw new Error(msg);
    }
  }
};
