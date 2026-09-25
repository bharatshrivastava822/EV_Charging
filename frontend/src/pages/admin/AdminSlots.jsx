import React, { useState, useEffect } from 'react';
import { Plus, Lock, Unlock, Search } from 'lucide-react';
import { stationService } from '../../services/stationService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState, Modal } from '../../components/UI';

const STATUS_CLASS = {
  AVAILABLE: 'badge-available',
  BOOKED: 'badge-warning',
  BLOCKED: 'badge-cancelled'
};

export default function AdminSlots() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [chargers, setChargers] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(true);
  const { addToast } = useToast();

  const [createModal, setCreateModal] = useState({ open: false, form: { chargerId: '', slotDate: '', startTime: '08:00', endTime: '08:30' }, errors: {} });

  useEffect(() => {
    stationService.getAllStations()
      .then(data => {
        setStations(data);
        if (data.length > 0) setSelectedStation(String(data[0].id));
      })
      .finally(() => setStationsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    stationService.getStationById(selectedStation)
      .then(data => {
        const active = (data.chargers || []).filter(c => c.status === 'ACTIVE');
        setChargers(active);
        if (active.length > 0) setSelectedCharger(String(active[0].id));
        else { setSelectedCharger(''); setSlots([]); }
      });
  }, [selectedStation]);

  useEffect(() => {
    if (!selectedCharger || !selectedDate) { setSlots([]); return; }
    setLoading(true);
    stationService.getSlotsByCharger(selectedCharger, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [selectedCharger, selectedDate]);

  const handleStatusChange = async (slotId, newStatus) => {
    const label = newStatus === 'BLOCKED' ? 'block' : 'reopen';
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} this slot?`)) return;
    try {
      await adminService.updateSlotStatus(slotId, newStatus);
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: newStatus } : s));
      addToast(`Slot ${label}ed successfully.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${label} slot.`, 'error');
    }
  };

  const handleCreateSlot = async () => {
    const { form } = createModal;
    const errs = {};
    if (!form.chargerId) errs.chargerId = 'Select a charger';
    if (!form.slotDate) errs.slotDate = 'Select a date';
    if (!form.startTime) errs.startTime = 'Required';
    if (!form.endTime) errs.endTime = 'Required';
    if (Object.keys(errs).length > 0) { setCreateModal(m => ({ ...m, errors: errs })); return; }

    try {
      await adminService.createSlot({
        chargerId: parseInt(form.chargerId),
        slotDate: form.slotDate,
        startTime: form.startTime,
        endTime: form.endTime
      });
      addToast('Slot created successfully.', 'success');
      setCreateModal({ open: false, form: { chargerId: selectedCharger, slotDate: selectedDate, startTime: '08:00', endTime: '08:30' }, errors: {} });
      // Refresh
      if (selectedCharger && selectedDate) {
        const data = await stationService.getSlotsByCharger(selectedCharger, selectedDate);
        setSlots(data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create slot.', 'error');
    }
  };

  const setCreateField = (field) => (e) => setCreateModal(m => ({ ...m, form: { ...m.form, [field]: e.target.value } }));

  if (stationsLoading) return <LoadingState message="Loading stations..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.15rem' }}>Slot Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>Create, block, and manage charging slots</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreateModal({
          open: true,
          form: { chargerId: selectedCharger, slotDate: selectedDate, startTime: '08:00', endTime: '08:30' },
          errors: {}
        })}>
          <Plus size={14} /> Create Slot
        </button>
      </div>

      {/* Selection controls */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="form-label">Station</label>
            <select className="form-control" value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
              {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">Charger</label>
            <select className="form-control" value={selectedCharger} onChange={e => setSelectedCharger(e.target.value)}>
              {chargers.length === 0 && <option value="">No chargers</option>}
              {chargers.map(c => <option key={c.id} value={c.id}>#{c.chargerNumber} · {c.chargerType} · {c.powerKw} kW</option>)}
            </select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Slot grid */}
      {loading ? <LoadingState message="Loading slots..." /> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>
              Slots for {selectedDate}
            </h2>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>Available: {slots.filter(s => s.status === 'AVAILABLE').length}</span>
              <span>Booked: {slots.filter(s => s.status === 'BOOKED').length}</span>
              <span>Blocked: {slots.filter(s => s.status === 'BLOCKED').length}</span>
            </div>
          </div>

          {slots.length === 0 ? (
            <EmptyState title="No slots for this date" message="Create slots to allow bookings for this charger and date." action={
              <button className="btn btn-primary btn-sm" onClick={() => setCreateModal({
                open: true,
                form: { chargerId: selectedCharger, slotDate: selectedDate, startTime: '08:00', endTime: '08:30' },
                errors: {}
              })}>
                <Plus size={14} /> Create Slot
              </button>
            } />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{slot.startTime}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{slot.endTime}</td>
                      <td><span className={`badge ${STATUS_CLASS[slot.status] || 'badge-neutral'}`}>{slot.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {slot.status === 'AVAILABLE' && (
                            <button className="btn btn-danger-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleStatusChange(slot.id, 'BLOCKED')}>
                              <Lock size={12} /> Block
                            </button>
                          )}
                          {slot.status === 'BLOCKED' && (
                            <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleStatusChange(slot.id, 'AVAILABLE')}>
                              <Unlock size={12} /> Reopen
                            </button>
                          )}
                          {slot.status === 'BOOKED' && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Booked</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Slot Modal */}
      <Modal isOpen={createModal.open} onClose={() => setCreateModal(m => ({ ...m, open: false }))} title="Create Charging Slot" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Charger *</label>
            <select className="form-control" value={createModal.form.chargerId} onChange={setCreateField('chargerId')}>
              <option value="">Select charger</option>
              {chargers.map(c => <option key={c.id} value={c.id}>#{c.chargerNumber} · {c.chargerType} · {c.powerKw} kW</option>)}
            </select>
            {createModal.errors.chargerId && <p className="form-error">{createModal.errors.chargerId}</p>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" value={createModal.form.slotDate} onChange={setCreateField('slotDate')} />
            {createModal.errors.slotDate && <p className="form-error">{createModal.errors.slotDate}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Time *</label>
              <input type="time" className="form-control" value={createModal.form.startTime} onChange={setCreateField('startTime')} />
              {createModal.errors.startTime && <p className="form-error">{createModal.errors.startTime}</p>}
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Time *</label>
              <input type="time" className="form-control" value={createModal.form.endTime} onChange={setCreateField('endTime')} />
              {createModal.errors.endTime && <p className="form-error">{createModal.errors.endTime}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setCreateModal(m => ({ ...m, open: false }))}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateSlot}>Create Slot</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
