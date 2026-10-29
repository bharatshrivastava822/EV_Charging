import React, { useState, useEffect } from 'react';
import { operatorService } from '../../services/operatorService';
import { useToast } from '../../context/ToastContext';
import { 
  Wrench, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  FileText
} from 'lucide-react';

export default function OperatorMaintenance() {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [chargers, setChargers] = useState([]);
  const [reportForm, setReportForm] = useState({
    chargerId: '',
    issueDescription: '',
    severity: 'MEDIUM'
  });
  const [submitting, setSubmitting] = useState(false);

  // Resolve Modal
  const [resolveModalId, setResolveModalId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, stationsData] = await Promise.all([
        operatorService.getMaintenanceReports(),
        operatorService.getMyStations()
      ]);
      setReports(reportsData);
      setStations(stationsData);
      if (stationsData.length > 0) {
        setSelectedStationId(stationsData[0].id.toString());
        setChargers(stationsData[0].chargers || []);
        if (stationsData[0].chargers?.length > 0) {
          setReportForm(f => ({ ...f, chargerId: stationsData[0].chargers[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load maintenance records.', 'error');
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
      setReportForm(f => ({ ...f, chargerId: stationChargers[0].id.toString() }));
    } else {
      setReportForm(f => ({ ...f, chargerId: '' }));
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!reportForm.chargerId || !reportForm.issueDescription) {
      addToast('Please fill all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await operatorService.reportMaintenance({
        chargerId: Number(reportForm.chargerId),
        issueDescription: reportForm.issueDescription,
        severity: reportForm.severity
      });
      addToast('Maintenance ticket created! Charger set to MAINTENANCE mode.', 'success');
      setShowModal(false);
      setReportForm(f => ({ ...f, issueDescription: '', severity: 'MEDIUM' }));
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIssue = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      addToast('Resolution notes are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await operatorService.resolveMaintenance(resolveModalId, {
        resolutionNotes,
        status: 'RESOLVED'
      });
      addToast('Issue resolved! Charger status restored to ACTIVE.', 'success');
      setResolveModalId(null);
      setResolutionNotes('');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to resolve issue.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            Infrastructure Maintenance & Diagnostics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Report charger faults, schedule repairs, and protect drivers from offline plugs
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Report Charger Issue
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : reports.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle size={44} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>All Chargers Operational</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
            No open maintenance tickets. All charging equipment on your station network is healthy and available.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {reports.map(r => {
            const isOpen = r.status === 'OPEN';
            return (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                        {r.stationName} • {r.chargerNumber}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Report #{r.id} • Reported on {r.reportedAt?.slice(0, 10)}
                      </div>
                    </div>
                    <span className={`badge badge-${isOpen ? 'warning' : 'available'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {isOpen ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {r.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#FFFFFF', background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1rem' }}>
                    "{r.issueDescription}"
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    <div><strong>Severity:</strong> <span style={{ color: r.severity === 'CRITICAL' ? 'var(--danger)' : '#FBBF24' }}>{r.severity}</span></div>
                    {r.resolutionNotes && (
                      <div style={{ marginTop: '0.35rem', color: 'var(--primary)' }}>
                        <strong>Resolution:</strong> {r.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <button
                    onClick={() => setResolveModalId(r.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'var(--primary-border)', color: 'var(--primary)', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={14} /> Mark as Resolved & Reactivate Charger
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Report Charger Issue</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportIssue}>
              <div className="form-group">
                <label className="form-label">Station</label>
                <select className="form-control" value={selectedStationId} onChange={handleStationChange}>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.city})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Charger Connector *</label>
                <select
                  className="form-control"
                  value={reportForm.chargerId}
                  onChange={e => setReportForm({ ...reportForm, chargerId: e.target.value })}
                  required
                >
                  {chargers.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.chargerNumber} — {ch.chargerType} ({ch.powerKw} kW)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  className="form-control"
                  value={reportForm.severity}
                  onChange={e => setReportForm({ ...reportForm, severity: e.target.value })}
                >
                  <option value="LOW">Low (Cosmetic / Minor Latch Wear)</option>
                  <option value="MEDIUM">Medium (Display Flicker / Cable Stiffness)</option>
                  <option value="HIGH">High (Frequent Session Disconnect)</option>
                  <option value="CRITICAL">Critical (Total Power Trip / Safety Halt)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Diagnostics & Description *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe observed physical damage or error code..."
                  value={reportForm.issueDescription}
                  onChange={e => setReportForm({ ...reportForm, issueDescription: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Ticket & Halt Charger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>Resolve Maintenance Ticket</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Document technician repairs performed. This will return the charger connector to <strong>ACTIVE</strong> status for driver slot booking.
            </p>

            <form onSubmit={handleResolveIssue}>
              <div className="form-group">
                <label className="form-label">Resolution Notes *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Replaced connector pin, ran continuity test, verified DC handshake..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setResolveModalId(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Restoring...' : 'Resolve & Reactivate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

