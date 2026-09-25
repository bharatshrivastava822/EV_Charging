import api from './api';
import { INITIAL_STATIONS, generateMockSlots } from './mockData';

const STATIONS_KEY = 'chargergo_stations';
const SLOTS_KEY = 'chargergo_slots_override';

export const getStoredStations = () => {
  try {
    const data = localStorage.getItem(STATIONS_KEY);
    if (!data) {
      localStorage.setItem(STATIONS_KEY, JSON.stringify(INITIAL_STATIONS));
      return INITIAL_STATIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_STATIONS;
  }
};

export const saveStoredStations = (stations) => {
  try {
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
  } catch (e) {
    console.error('Failed to save stations', e);
  }
};

export const stationService = {
  getAllStations: async (params = {}) => {
    try {
      const response = await api.get('/stations', { params });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (e) {
      // Offline fallback
    }

    let stations = getStoredStations();
    if (params.city) {
      stations = stations.filter(s => s.city.toLowerCase() === params.city.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      stations = stations.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }
    if (params.chargerType) {
      stations = stations.filter(s =>
        s.chargers?.some(c => c.chargerType.toLowerCase() === params.chargerType.toLowerCase())
      );
    }
    return stations;
  },

  getStationById: async (id) => {
    try {
      const response = await api.get(`/stations/${id}`);
      if (response.data) {
        return response.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const stations = getStoredStations();
    const station = stations.find(s => s.id === Number(id));
    if (!station) throw new Error('Charging station not found');
    return station;
  },

  getSlotsByCharger: async (chargerId, date) => {
    try {
      const response = await api.get(`/slots/charger/${chargerId}`, {
        params: { date }
      });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (e) {
      // Offline fallback
    }

    // Get generated slots
    let slots = generateMockSlots(chargerId, date);
    
    // Check if slots are modified in local storage overrides
    try {
      const overridesStr = localStorage.getItem(SLOTS_KEY);
      if (overridesStr) {
        const overrides = JSON.parse(overridesStr);
        slots = slots.map(slot => {
          const key = `${slot.chargerId}-${slot.slotDate}-${slot.startTime}`;
          if (overrides[key]) {
            return { ...slot, status: overrides[key] };
          }
          return slot;
        });
      }
    } catch (err) {
      // ignore
    }

    return slots;
  },

  getSlotsByStation: async (stationId, date) => {
    try {
      const response = await api.get(`/slots/station/${stationId}`, {
        params: { date }
      });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (e) {
      // Fallback
    }

    const station = await stationService.getStationById(stationId);
    let allSlots = [];
    for (const charger of (station.chargers || [])) {
      const slots = await stationService.getSlotsByCharger(charger.id, date);
      allSlots = [...allSlots, ...slots];
    }
    return allSlots;
  }
};
