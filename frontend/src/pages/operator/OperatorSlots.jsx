import React, { useState, useEffect } from 'react';
import { operatorService } from '../../services/operatorService';
import { stationService } from '../../services/stationService';
import { useToast } from '../../context/ToastContext';
import { 
  Clock, 
  Calendar, 
  Zap, 
  Plus, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

export default function OperatorSlots() {
  const { addToast } = useToast();
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [chargers, setChargers] = useState([]);
  const [selectedChargerId, setSelectedChargerId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slot form
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '09:30'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    try {
      const data = await operatorService.getMyStations();
      setStations(data);
      if (data.length > 0) {
        setSelectedStationId(data[0].id.toString());
        setChargers(data[0].chargers || []);
        if (data[0].chargers?.length > 0) {
          setSelectedChargerId(data[0].chargers[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load stations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (e) => {
    const sId = e.target.value;
    setSelectedStationId(sId);
    const found = stations.find(s => s.id.toString() === sId);
    const stationChargers = found?.chargers || [];
    setChargers(stationChargers);
    if (stationChargers.length > 0) {
      setSelectedChargerId(stationChargers[0].id.toString());
    } else {
      setSelectedChargerId('');
      setSlots([]);
    }
  };

  useEffect(() => {
    if (selectedChargerId && selectedDate) {
      fetchSlots();
    }
  }, [selectedChargerId, selectedDate]);

  const fetchSlots = async () => {
    if (!selectedChargerId) return;
    try {
      const data = await stationService.getSlotsByCharger(selectedChargerId, selectedDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!selectedChargerId) {
      addToast('Please select a charger first.', 'error');
      return;
    }
    setCreating(true);
    try {
      await operatorService.createSlot({
        chargerId: Number(selectedChargerId),
        slotDate: selectedDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime
      });
      addToast('Charging slot created successfully!', 'success');
      fetchSlots();
    } catch (err) {
      addToast(err.message || 'Slot creation failed.', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
          Time Slot Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Publish available charging slots for drivers on your station network
        </p>
      </div>

      {/* Filter / Selector Controls */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div>
          <label className="form-label">Charging Station</label>
          <select
            className="form-control"
            value={selectedStationId}
            onChange={handleStationChange}
            disabled={stations.length === 0}
          >
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.city})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Charger Connector</label>
          <select
            className="form-control"
            value={selectedChargerId}
            onChange={e => setSelectedChargerId(e.target.value)}
            disabled={chargers.length === 0}
          >
            {chargers.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.chargerNumber} — {ch.chargerType} ({ch.powerKw} kW)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Calendar Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Two Column Layout: Create Slot Form + Existing Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Create Slot Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="var(--primary)" /> Generate Time Slot
          </h3>

          <form onSubmit={handleCreateSlot}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={newSlot.startTime}
                  onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={newSlot.endTime}
                  onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={creating || !selectedChargerId}>
              {creating ? 'Creating Slot...' : 'Create 30-Min Slot'}
            </button>
          </form>
        </div>

        {/* Existing Slots Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#60A5FA" /> Slots on {selectedDate} ({slots.length})
          </h3>

          {slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              No time slots published for this connector on this date.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem', maxHeight: '380px', overflowY: 'auto' }}>
              {slots.map(sl => {
                const isAvail = sl.status === 'AVAILABLE';
                return (
                  <div
                    key={sl.id}
                    style={{
                      background: isAvail ? 'rgba(184, 255, 0, 0.06)' : 'rgba(239, 68, 68, 0.08)',
                      border: isAvail ? '1px solid var(--primary-border)' : '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius)',
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isAvail ? '#FFFFFF' : 'var(--text-secondary)' }}>
                      {sl.startTime?.slice(0, 5)} - {sl.endTime?.slice(0, 5)}
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: isAvail ? 'var(--primary)' : 'var(--danger)', textTransform: 'uppercase', marginTop: '0.2rem', display: 'inline-block' }}>
                      {sl.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
