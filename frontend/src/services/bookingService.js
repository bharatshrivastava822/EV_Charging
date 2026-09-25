import api from './api';
import { getStoredStations } from './stationService';

const BOOKINGS_KEY = 'chargergo_bookings';
const SLOTS_KEY = 'chargergo_slots_override';

const getStoredBookings = () => {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    if (!data) {
      const today = new Date().toISOString().split('T')[0];
      const initialBookings = [
        {
          id: 101,
          userId: 2,
          userName: 'Aryan Sharma',
          userEmail: 'aryan@example.com',
          stationId: 1,
          stationName: 'ChargerGo Vijay Nagar Hub',
          stationAddress: '12, Vijay Nagar Square, AB Road, Indore',
          chargerId: 2,
          chargerNumber: 'C02',
          chargerType: 'CCS2',
          powerKw: 120,
          slotId: 2005,
          bookingReference: 'CG-20260925-8842',
          bookingDate: today,
          startTime: '10:30',
          endTime: '11:00',
          durationMinutes: 30,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
      return initialBookings;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveStoredBookings = (bookings) => {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
};

const updateSlotOverride = (chargerId, date, startTime, status) => {
  try {
    const overridesStr = localStorage.getItem(SLOTS_KEY);
    const overrides = overridesStr ? JSON.parse(overridesStr) : {};
    const key = `${chargerId}-${date}-${startTime}`;
    overrides[key] = status;
    localStorage.setItem(SLOTS_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to override slot status', e);
  }
};

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      if (response.data) {
        return response.data;
      }
    } catch (apiError) {
      if (apiError.response && apiError.response.status >= 400 && apiError.response.status < 500) {
        throw new Error(apiError.response.data?.message || 'Sorry, this charging slot has already been booked.');
      }
    }

    // Offline fallback booking logic
    const { stationId, chargerId, slotId, date, startTime, endTime } = bookingData;
    const stations = getStoredStations();
    const station = stations.find(s => s.id === Number(stationId));
    const charger = station?.chargers?.find(c => c.id === Number(chargerId));

    if (!station || !charger) {
      throw new Error('Invalid station or charger selected.');
    }

    // Check slot availability override
    const key = `${chargerId}-${date}-${startTime}`;
    const overrides = JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}');
    if (overrides[key] === 'BOOKED' || overrides[key] === 'BLOCKED') {
      throw new Error('Sorry, this charging slot has already been booked.');
    }

    // Mark slot as booked
    updateSlotOverride(chargerId, date, startTime, 'BOOKED');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const dateNum = (date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `CG-${dateNum}-${randCode}`;

    const newBooking = {
      id: Date.now(),
      userId: currentUser.id || 2,
      userName: currentUser.name || 'EV Driver',
      userEmail: currentUser.email || 'driver@example.com',
      stationId: station.id,
      stationName: station.name,
      stationAddress: station.address + ', ' + station.city,
      chargerId: charger.id,
      chargerNumber: charger.chargerNumber,
      chargerType: charger.chargerType,
      powerKw: charger.powerKw,
      slotId: slotId || Date.now(),
      bookingReference: bookingReference,
      bookingDate: date,
      startTime: startTime,
      endTime: endTime || startTime,
      durationMinutes: 30,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const bookings = getStoredBookings();
    bookings.unshift(newBooking);
    saveStoredBookings(bookings);

    return newBooking;
  },

  getMyBookings: async (status) => {
    try {
      const response = await api.get('/bookings/my', { params: status ? { status } : {} });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (e) {
      // fallback
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    let bookings = getStoredBookings();
    if (currentUser.email) {
      bookings = bookings.filter(b => b.userEmail === currentUser.email || b.userId === currentUser.id);
    }
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    return bookings;
  },

  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const bookings = getStoredBookings();
    const b = bookings.find(item => item.id === Number(id));
    if (!b) throw new Error('Booking not found');
    return b;
  },

  getBookingByReference: async (reference) => {
    try {
      const response = await api.get(`/bookings/ref/${reference}`);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const bookings = getStoredBookings();
    const b = bookings.find(item => item.bookingReference === reference);
    if (!b) throw new Error('Booking not found');
    return b;
  },

  cancelBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      if (response.data) return response.data;
    } catch (apiError) {
      if (apiError.response && apiError.response.status >= 400 && apiError.response.status < 500) {
        throw new Error(apiError.response.data?.message || 'Unable to cancel booking.');
      }
    }

    const bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.id === Number(id));
    if (index === -1) throw new Error('Booking not found');

    const booking = bookings[index];
    if (booking.status !== 'CONFIRMED') {
      throw new Error(`Cannot cancel a booking with status ${booking.status}`);
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    bookings[index] = booking;
    saveStoredBookings(bookings);

    // Release slot back to AVAILABLE
    updateSlotOverride(booking.chargerId, booking.bookingDate, booking.startTime, 'AVAILABLE');

    return booking;
  }
};
