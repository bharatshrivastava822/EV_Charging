import React, { useState, useEffect } from 'react';
import { operatorService } from '../../services/operatorService';
import { useToast } from '../../context/ToastContext';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Clock, 
  Zap, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';

export default function OperatorStations() {
  const { addToast } = useToast();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showStationModal, setShowStationModal] = useState(false);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState(null);

  // Station Form
  const [stationForm, setStationForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    openingTime: '06:00',
    closingTime: '23:00'
  });

  // Charger Form
  const [chargerForm, setChargerForm] = useState({
    chargerNumber: '',
    chargerType: 'CCS2',
    chargingSpeed: 'DC Fast',
    powerKw: 60
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await operatorService.getMyStations();
      setStations(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load stations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    if (!stationForm.name || !stationForm.address || !stationForm.city || !stationForm.state) {
      addToast('Please fill all mandatory station fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await operatorService.createStation({
        ...stationForm,
        latitude: stationForm.latitude ? parseFloat(stationForm.latitude) : 22.7196,
        longitude: stationForm.longitude ? parseFloat(stationForm.longitude) : 75.8577
      });
      addToast('Station submitted! It is now pending administrator approval.', 'success');
      setShowStationModal(false);
      setStationForm({
        name: '',
        address: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        openingTime: '06:00',
        closingTime: '23:00'
      });
      fetchStations();
    } catch (err) {
      addToast(err.message || 'Failed to submit station.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCharger = async (e) => {
    e.preventDefault();
    if (!chargerForm.chargerNumber) {
      addToast('Charger number is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await operatorService.addCharger({
        stationId: selectedStationId,
        chargerNumber: chargerForm.chargerNumber,
        chargerType: chargerForm.chargerType,
        chargingSpeed: chargerForm.chargingSpeed,
        powerKw: parseFloat(chargerForm.powerKw)
      });
      addToast('Charger added successfully!', 'success');
      setShowChargerModal(false);
      setChargerForm({ chargerNumber: '', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60 });
      fetchStations();
    } catch (err) {
      addToast(err.message || 'Failed to add charger.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCharger = async (chargerId) => {
    if (!window.confirm('Are you sure you want to remove this charger connector?')) return;
    try {
      await operatorService.deleteCharger(chargerId);
      addToast('Charger connector removed.', 'info');
      fetchStations();
    } catch (err) {
      addToast(err.message || 'Failed to delete charger.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            My Charging Stations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register new locations and manage connector equipment
          </p>
        </div>

        <button onClick={() => setShowStationModal(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Register New Station
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : stations.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center' }}>
          <Building2 size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>No Stations Registered Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Submit your first EV charging hub. Once verified by the platform admin, EV drivers will be able to discover and book slots.
          </p>
          <button onClick={() => setShowStationModal(true)} className="btn btn-primary">
            Register Station Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {stations.map(st => {
            const isApproved = st.approvalStatus === 'APPROVED';
            return (
              <div key={st.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{st.name}</h2>
                      {isApproved ? (
                        <span className="badge badge-available" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={13} /> Active & Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          <AlertTriangle size={13} /> Pending Admin Approval
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <MapPin size={14} color="var(--primary)" /> {st.address}, {st.city}, {st.state}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedStationId(st.id);
                        setShowChargerModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Plus size={14} /> Add Connector
                    </button>
                  </div>
                </div>

                {/* Chargers Section */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Station Connectors ({st.chargers?.length || 0})
                  </div>

                  {!st.chargers || st.chargers.length === 0 ? (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      No connectors added yet. Click "+ Add Connector" to configure charging plugs.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {st.chargers.map(ch => (
                        <div key={ch.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
                              <Zap size={15} color="var(--primary)" /> {ch.chargerNumber} — {ch.chargerType}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {ch.powerKw} kW • {ch.chargingSpeed}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCharger(ch.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', opacity: 0.8 }}
                            title="Remove Connector"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Station Modal */}
      {showStationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '540px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Register New Charging Station</h3>
              <button onClick={() => setShowStationModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStation}>
              <div className="form-group">
                <label className="form-label">Station Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ChargePoint Supercharge Hub"
                  value={stationForm.name}
                  onChange={e => setStationForm({ ...stationForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Plot 10, Ring Road"
                  value={stationForm.address}
                  onChange={e => setStationForm({ ...stationForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Indore"
                    value={stationForm.city}
                    onChange={e => setStationForm({ ...stationForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Madhya Pradesh"
                    value={stationForm.state}
                    onChange={e => setStationForm({ ...stationForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Opening Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={stationForm.openingTime}
                    onChange={e => setStationForm({ ...stationForm, openingTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={stationForm.closingTime}
                    onChange={e => setStationForm({ ...stationForm, closingTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Latitude (optional)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="22.7533"
                    value={stationForm.latitude}
                    onChange={e => setStationForm({ ...stationForm, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude (optional)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="75.8937"
                    value={stationForm.longitude}
                    onChange={e => setStationForm({ ...stationForm, longitude: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowStationModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Charger Connector Modal */}
      {showChargerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Add Charger Connector</h3>
              <button onClick={() => setShowChargerModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCharger}>
              <div className="form-group">
                <label className="form-label">Charger Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. C01, C02"
                  value={chargerForm.chargerNumber}
                  onChange={e => setChargerForm({ ...chargerForm, chargerNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Connector Standard *</label>
                <select
                  className="form-control"
                  value={chargerForm.chargerType}
                  onChange={e => setChargerForm({ ...chargerForm, chargerType: e.target.value })}
                >
                  <option value="CCS2">CCS2 (Combined Charging System - DC Fast)</option>
                  <option value="TYPE2">Type 2 (AC Standard Mennekes)</option>
                  <option value="CHAdeMO">CHAdeMO (DC Fast)</option>
                  <option value="DC_FAST">DC Fast (Ultra Fast Dual)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Charging Speed</label>
                  <select
                    className="form-control"
                    value={chargerForm.chargingSpeed}
                    onChange={e => setChargerForm({ ...chargerForm, chargingSpeed: e.target.value })}
                  >
                    <option value="DC Fast">DC Fast</option>
                    <option value="Ultra Fast">Ultra Fast</option>
                    <option value="AC Slow">AC Slow</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Power (kW) *</label>
                  <input
                    type="number"
                    step="1"
                    className="form-control"
                    value={chargerForm.powerKw}
                    onChange={e => setChargerForm({ ...chargerForm, powerKw: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowChargerModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Connector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

