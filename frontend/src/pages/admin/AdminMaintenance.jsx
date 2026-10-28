import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building2,
  FileText
} from 'lucide-react';

export default function AdminMaintenance() {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMaintenanceReports();
      setReports(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load maintenance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      addToast('Resolution notes are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await adminService.resolveMaintenance(resolveId, {
        resolutionNotes,
        status: 'RESOLVED'
      });
      addToast('Ticket resolved! Charger restored to ACTIVE.', 'success');
      setResolveId(null);
      setResolutionNotes('');
      fetchReports();
    } catch (err) {
      addToast(err.message || 'Failed to resolve ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
          Platform Maintenance & Hardware Diagnostics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Network-wide charger status, hardware incident tickets, and repair tracking
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : reports.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle size={44} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>Network Fully Healthy</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
            No reported maintenance issues across all platform stations and chargers.
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
                        Report #{r.id} • Reported by {r.reportedByName} on {r.reportedAt?.slice(0, 10)}
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
                    onClick={() => setResolveId(r.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={14} /> Resolve Ticket & Reactivate Charger
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Dialog */}
      {resolveId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>Admin Resolution</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Document corrective repair actions. Resolving will instantly restore the charger to <strong>ACTIVE</strong> for booking.
            </p>

            <form onSubmit={handleResolve}>
              <div className="form-group">
                <label className="form-label">Technician Notes *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Firmware patch deployed, electrical safety breaker checked, gun tested OK..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setResolveId(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Resolve & Restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
