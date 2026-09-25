import api from './api';
import { getStoredStations, saveStoredStations } from './stationService';

export const adminService = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data) return response.data;
    } catch (e) {
      // offline fallback
    }

    const stations = getStoredStations();
    const totalStations = stations.length;
    let totalChargers = 0;
    let activeChargers = 0;
    stations.forEach(s => {
      totalChargers += s.totalChargers || s.chargers?.length || 4;
      activeChargers += s.availableChargers !== undefined ? s.availableChargers : 3;
    });

    const bookings = JSON.parse(localStorage.getItem('chargergo_bookings') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.bookingDate === today).length;

    return {
      totalStations,
      activeStations: totalStations,
      totalChargers,
      activeChargers,
      totalBookings: bookings.length,
      todayBookings: todayBookings || 3,
      confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
      completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
      totalUsers: 8
    };
  },

  getAllBookings: async (params = {}) => {
    try {
      const response = await api.get('/admin/bookings', { params });
      if (response.data && Array.isArray(response.data)) return response.data;
    } catch (e) {
      // fallback
    }

    let bookings = JSON.parse(localStorage.getItem('chargergo_bookings') || '[]');
    if (params.status) {
      bookings = bookings.filter(b => b.status === params.status);
    }
    if (params.stationId) {
      bookings = bookings.filter(b => b.stationId === Number(params.stationId));
    }
    if (params.date) {
      bookings = bookings.filter(b => b.bookingDate === params.date);
    }
    return bookings;
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data && Array.isArray(response.data)) return response.data;
    } catch (e) {
      // fallback
    }

    return [
      { id: 1, name: 'Admin Manager', email: 'admin@evcharge.in', phone: '9876543210', role: 'ADMIN', createdAt: '2026-09-01' },
      { id: 2, name: 'Aryan Sharma', email: 'aryan@example.com', phone: '9876543211', role: 'USER', createdAt: '2026-09-10' },
      { id: 3, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543212', role: 'USER', createdAt: '2026-09-15' },
      { id: 4, name: 'Rahul Verma', email: 'rahul@example.com', phone: '9876543213', role: 'USER', createdAt: '2026-09-20' }
    ];
  },

  createStation: async (stationData) => {
    try {
      const response = await api.post('/stations', stationData);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const stations = getStoredStations();
    const newStation = {
      id: Date.now(),
      name: stationData.name,
      address: stationData.address,
      city: stationData.city,
      state: stationData.state,
      operator: stationData.operator || 'ChargerGo Express',
      openingTime: stationData.openingTime ? `${stationData.openingTime}:00` : '06:00:00',
      closingTime: stationData.closingTime ? `${stationData.closingTime}:00` : '23:00:00',
      latitude: stationData.latitude || 22.7533,
      longitude: stationData.longitude || 75.8937,
      status: 'ACTIVE',
      totalChargers: 2,
      availableChargers: 2,
      chargers: [
        { id: Date.now() + 1, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
        { id: Date.now() + 2, chargerNumber: 'C02', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' }
      ]
    };
    stations.unshift(newStation);
    saveStoredStations(stations);
    return newStation;
  },

  updateStation: async (id, stationData) => {
    try {
      const response = await api.put(`/stations/${id}`, stationData);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const stations = getStoredStations();
    const index = stations.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      stations[index] = { ...stations[index], ...stationData };
      saveStoredStations(stations);
      return stations[index];
    }
  },

  deactivateStation: async (id) => {
    try {
      const response = await api.delete(`/stations/${id}`);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const stations = getStoredStations();
    const index = stations.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      stations[index].status = stations[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      saveStoredStations(stations);
      return stations[index];
    }
  },

  addCharger: async (chargerData) => {
    try {
      const response = await api.post('/stations/chargers', chargerData);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }

    const stations = getStoredStations();
    const station = stations.find(s => s.id === Number(chargerData.stationId));
    if (station) {
      if (!station.chargers) station.chargers = [];
      const newCharger = {
        id: Date.now(),
        chargerNumber: chargerData.chargerNumber,
        chargerType: chargerData.chargerType,
        chargingSpeed: chargerData.chargingSpeed,
        powerKw: Number(chargerData.powerKw),
        status: 'ACTIVE'
      };
      station.chargers.push(newCharger);
      station.totalChargers = station.chargers.length;
      station.availableChargers = (station.availableChargers || 0) + 1;
      saveStoredStations(stations);
      return newCharger;
    }
  },

  deactivateCharger: async (id) => {
    try {
      const response = await api.delete(`/stations/chargers/${id}`);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }
  },

  createSlot: async (slotData) => {
    try {
      const response = await api.post('/slots', slotData);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }
  },

  updateSlotStatus: async (slotId, status) => {
    try {
      const response = await api.patch(`/slots/${slotId}/status`, null, { params: { status } });
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }
  },

  cancelBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      if (response.data) return response.data;
    } catch (e) {
      // fallback
    }
  }
};
