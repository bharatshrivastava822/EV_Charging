import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, PowerOff, Zap, X, ChevronDown } from 'lucide-react';
import { stationService } from '../../services/stationService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState, Modal } from '../../components/UI';

const EMPTY_STATION = { name: '', address: '', city: '', state: '', operator: '', openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE', latitude: '', longitude: '' };
const EMPTY_CHARGER = { stationId: '', chargerNumber: '', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: '', status: 'ACTIVE' };

export default function AdminStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const [stationModal, setStationModal] = useState({ open: false, editing: null, form: EMPTY_STATION, errors: {} });
  const [chargerModal, setChargerModal] = useState({ open: false, stationId: null, form: EMPTY_CHARGER, errors: {} });
  const [expandedStation, setExpandedStation] = useState(null);

  const load = async () => {
    try {
      const data = await stationService.getAllStations();
      setStations(data);
    } catch {
      addToast('Failed to load stations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => setStationModal({ open: true, editing: null, form: EMPTY_STATION, errors: {} });
  const openEdit = async (station) => {
    const detail = await stationService.getStationById(station.id);
    setStationModal({
      open: true,
      editing: detail.id,
      form: {
        name: detail.name, address: detail.address, city: detail.city, state: detail.state,
        operator: detail.operator || '', openingTime: detail.openingTime || '06:00',
        closingTime: detail.closingTime || '22:00', status: detail.status,
        latitude: detail.latitude || '', longitude: detail.longitude || ''
      },
      errors: {}
    });
  };

  const validateStation = (form) => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.openingTime) e.openingTime = 'Required';
    if (!form.closingTime) e.closingTime = 'Required';
    return e;
  };

  const handleSaveStation = async () => {
    const { form, editing } = stationModal;
    const errs = validateStation(form);
    if (Object.keys(errs).length > 0) { setStationModal(m => ({ ...m, errors: errs })); return; }

    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null
      };
      if (editing) {
        await adminService.updateStation(editing, payload);
        addToast('Station updated successfully.', 'success');
      } else {
        await adminService.createStation(payload);
        addToast('Station created successfully.', 'success');
      }
      setStationModal({ open: false, editing: null, form: EMPTY_STATION, errors: {} });
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed.', 'error');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will no longer be visible to users.`)) return;
    try {
      await adminService.deactivateStation(id);
      addToast('Station deactivated.', 'success');
      load();
    } catch {
      addToast('Failed to deactivate station.', 'error');
    }
  };

  const openAddCharger = (stationId) => {
    setChargerModal({ open: true, stationId, form: { ...EMPTY_CHARGER, stationId }, errors: {} });
  };

  const handleSaveCharger = async () => {
    const { form } = chargerModal;
    if (!form.chargerNumber.trim() || !form.powerKw) {
      setChargerModal(m => ({ ...m, errors: { chargerNumber: !form.chargerNumber.trim() ? 'Required' : undefined, powerKw: !form.powerKw ? 'Required' : undefined } }));
      return;
    }
    try {
      await adminService.addCharger({ ...form, powerKw: parseFloat(form.powerKw) });
      addToast('Charger added.', 'success');
      setChargerModal({ open: false, stationId: null, form: EMPTY_CHARGER, errors: {} });
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add charger.', 'error');
    }
  };

  const setStationField = (field) => (e) => setStationModal(m => ({ ...m, form: { ...m.form, [field]: e.target.value } }));
  const setChargerField = (field) => (e) => setChargerModal(m => ({ ...m, form: { ...m.form, [field]: e.target.value } }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.15rem' }}>Station Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>{stations.length} stations registered</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <Plus size={14} /> Add Station
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text" className="form-control" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city" style={{ paddingLeft: '2rem' }}
          />
        </div>
      </div>

      {loading ? <LoadingState /> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <EmptyState title="No stations found" message="Add a station to get started." action={<button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Add Station</button>} />
          ) : (
            filtered.map(station => (
              <div key={station.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.15rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{station.name}</span>
                      <span className={`badge badge-${station.status === 'ACTIVE' ? 'available' : 'blocked'}`}>{station.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                      {station.address}, {station.city}, {station.state}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {station.availableChargers}/{station.totalChargers} chargers · {station.openingTime} – {station.closingTime}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setExpandedStation(expandedStation === station.id ? null : station.id)}>
                      <Zap size={13} /> Chargers <ChevronDown size={12} />
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(station)}>
                      <Edit2 size={13} /> Edit
                    </button>
                    {station.status === 'ACTIVE' && (
                      <button className="btn btn-danger-outline btn-sm" onClick={() => handleDeactivate(station.id, station.name)}>
                        <PowerOff size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {expandedStation === station.id && (
                  <div style={{ padding: '0 1.15rem 1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Chargers ({station.availableChargers} active)
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => openAddCharger(station.id)}>
                        <Plus size={12} /> Add Charger
                      </button>
                    </div>
                    <ChargerList stationId={station.id} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Station Modal */}
      <Modal isOpen={stationModal.open} onClose={() => setStationModal(m => ({ ...m, open: false }))} title={stationModal.editing ? 'Edit Station' : 'Add Charging Station'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { label: 'Station Name *', field: 'name', placeholder: 'GreenCharge Vijay Nagar' },
            { label: 'Address *', field: 'address', placeholder: '12, AB Road, Vijay Nagar' },
            { label: 'City *', field: 'city', placeholder: 'Indore' },
            { label: 'State *', field: 'state', placeholder: 'Madhya Pradesh' },
            { label: 'Operator', field: 'operator', placeholder: 'GreenCharge India' }
          ].map(({ label, field, placeholder }) => (
            <div className="form-group" key={field} style={{ margin: 0 }}>
              <label className="form-label">{label}</label>
              <input type="text" className="form-control" value={stationModal.form[field]} onChange={setStationField(field)} placeholder={placeholder} />
              {stationModal.errors[field] && <p className="form-error">{stationModal.errors[field]}</p>}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Opening Time *</label>
              <input type="time" className="form-control" value={stationModal.form.openingTime} onChange={setStationField('openingTime')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Closing Time *</label>
              <input type="time" className="form-control" value={stationModal.form.closingTime} onChange={setStationField('closingTime')} />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={stationModal.form.status} onChange={setStationField('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStationModal(m => ({ ...m, open: false }))}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveStation}>
              {stationModal.editing ? 'Update Station' : 'Create Station'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Charger Modal */}
      <Modal isOpen={chargerModal.open} onClose={() => setChargerModal(m => ({ ...m, open: false }))} title="Add Charger" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Charger Number *</label>
            <input type="text" className="form-control" value={chargerModal.form.chargerNumber} onChange={setChargerField('chargerNumber')} placeholder="C05" />
            {chargerModal.errors.chargerNumber && <p className="form-error">{chargerModal.errors.chargerNumber}</p>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Charger Type</label>
            <select className="form-control" value={chargerModal.form.chargerType} onChange={setChargerField('chargerType')}>
              <option value="CCS2">CCS2</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="TYPE2">Type 2</option>
              <option value="DC_FAST">DC Fast</option>
              <option value="AC">AC</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Charging Speed</label>
            <input type="text" className="form-control" value={chargerModal.form.chargingSpeed} onChange={setChargerField('chargingSpeed')} placeholder="DC Fast" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Power (kW) *</label>
            <input type="number" className="form-control" value={chargerModal.form.powerKw} onChange={setChargerField('powerKw')} placeholder="60" min="1" step="0.1" />
            {chargerModal.errors.powerKw && <p className="form-error">{chargerModal.errors.powerKw}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setChargerModal(m => ({ ...m, open: false }))}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveCharger}>Add Charger</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ChargerList({ stationId }) {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    stationService.getStationById(stationId)
      .then(s => setChargers(s.chargers || []))
      .finally(() => setLoading(false));
  }, [stationId]);

  const handleDeactivate = async (id) => {
    try {
      await adminService.deactivateCharger(id);
      setChargers(prev => prev.map(c => c.id === id ? { ...c, status: 'INACTIVE' } : c));
      addToast('Charger deactivated.', 'success');
    } catch {
      addToast('Failed to deactivate charger.', 'error');
    }
  };

  if (loading) return <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Loading chargers...</div>;
  if (!chargers.length) return <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>No chargers added yet.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {chargers.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.65rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text)', minWidth: '36px' }}>#{c.chargerNumber}</span>
          <span style={{ color: 'var(--muted)' }}>{c.chargerType} · {c.powerKw} kW</span>
          <span className={`badge badge-${c.status === 'ACTIVE' ? 'available' : 'blocked'}`} style={{ marginLeft: 'auto' }}>{c.status}</span>
          {c.status === 'ACTIVE' && (
            <button className="btn btn-danger-outline btn-sm" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }} onClick={() => handleDeactivate(c.id)}>
              Deactivate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
