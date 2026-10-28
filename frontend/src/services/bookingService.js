import api from './api';

export const bookingService = {
  /**
   * Create a new booking through the Spring Boot API
   * @param {{ stationId: number, chargerId: number, slotId: number }} bookingData
   */
  createBooking: async (bookingData) => {
    try {
      const payload = {
        stationId: Number(bookingData.stationId),
        chargerId: Number(bookingData.chargerId),
        slotId: Number(bookingData.slotId)
      };

      const response = await api.post('/bookings', payload);
      if (response.data) {
        return response.data;
      }
      throw new Error('Booking could not be confirmed.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Sorry, this charging slot could not be booked.';
      throw new Error(msg);
    }
  },

  /**
   * Retrieve current user's bookings with optional status filter
   * @param {string} [status]
   */
  getMyBookings: async (status) => {
    try {
      const response = await api.get('/bookings/my', {
        params: status ? { status } : {}
      });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (apiError) {
      console.error('Failed to fetch user bookings from API:', apiError.message);
      throw apiError;
    }
  },

  /**
   * Get booking details by ID
   * @param {number|string} id
   */
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      if (response.data) return response.data;
      throw new Error('Booking not found');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Booking not found.';
      throw new Error(msg);
    }
  },

  /**
   * Get booking details by unique reference code
   * @param {string} reference
   */
  getBookingByReference: async (reference) => {
    try {
      const response = await api.get(`/bookings/ref/${reference}`);
      if (response.data) return response.data;
      throw new Error('Booking not found');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Booking reference invalid.';
      throw new Error(msg);
    }
  },

  /**
   * Cancel an existing booking
   * @param {number|string} id
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
  }
};
