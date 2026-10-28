import api from './api';

export const operatorService = {
  /**
   * Get current operator status (approved, pending, rejected)
   */
  getStatus: async () => {
    try {
      const response = await api.get('/operator/status');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch operator status:', err);
      throw err;
    }
  },

  /**
   * Get operator metrics and summary stats
   */
  getStats: async () => {
    try {
      const response = await api.get('/operator/stats');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch operator stats:', err);
      throw err;
    }
  },

  /**
   * Get stations owned/assigned to this operator
   */
  getMyStations: async () => {
    try {
      const response = await api.get('/operator/stations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Failed to fetch operator stations:', err);
      throw err;
    }
  },

  /**
   * Submit a new station (pending admin approval)
   */
  createStation: async (stationData) => {
    try {
      const response = await api.post('/operator/stations', stationData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Station submission failed.';
      throw new Error(msg);
    }
  },

  /**
   * Update existing station details
   */
  updateStation: async (id, stationData) => {
    try {
      const response = await api.put(`/operator/stations/${id}`, stationData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Station update failed.';
      throw new Error(msg);
    }
  },

  /**
   * Add charger to operator station
   */
  addCharger: async (chargerData) => {
    try {
      const response = await api.post('/operator/chargers', chargerData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Add charger failed.';
      throw new Error(msg);
    }
  },

  /**
   * Remove charger from operator station
   */
  deleteCharger: async (chargerId) => {
    try {
      const response = await api.delete(`/operator/chargers/${chargerId}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Charger removal failed.';
      throw new Error(msg);
    }
  },

  /**
   * Create slot on operator charger
   */
  createSlot: async (slotData) => {
    try {
      const response = await api.post('/operator/slots', slotData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || 'Slot creation failed.';
      throw new Error(msg);
    }
  },

  /**
   * Get all bookings for operator's stations
   */
  getOperatorBookings: async () => {
    try {
      const response = await api.get('/operator/bookings');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Failed to fetch operator bookings:', err);
      throw err;
    }
  },

  /**
   * Report maintenance ticket on charger
   */
  reportMaintenance: async (reportData) => {
    const response = await api.post('/operator/maintenance', reportData);
    return response.data;
  },

  /**
   * Get maintenance tickets for operator's stations
   */
  getMaintenanceReports: async () => {
    const response = await api.get('/operator/maintenance');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Resolve maintenance ticket
   */
  resolveMaintenance: async (id, resolutionData) => {
    const response = await api.post(`/operator/maintenance/${id}/resolve`, resolutionData);
    return response.data;
  }
};

