import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle, 
  XCircle, 
  Building2, 
  User, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function AdminApprovals() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('operators'); // 'operators' or 'stations'
  const [operators, setOperators] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    setLoading(true);
    try {
      const [opsData, stData] = await Promise.all([
        adminService.getPendingOperators(),
        adminService.getPendingStations()
      ]);
      setOperators(opsData);
      setStations(stData);
    } catch (err) {
      console.error(err);
      addToast('Failed to load pending approvals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewOperator = async (userId, status) => {
    setActionLoading(true);
    try {
      await adminService.reviewOperator(userId, status, `Reviewed by Administrator`);
      addToast(`Operator application ${status.toLowerCase()} successfully!`, 'success');
      loadPendingItems();
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewStation = async (stationId, status) => {
    setActionLoading(true);
    try {
      await adminService.reviewStation(stationId, status, `Reviewed by Administrator`);
      addToast(`Station submission ${status.toLowerCase()} successfully!`, 'success');
      loadPendingItems();
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
          Verification & Approvals Console
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Review and approve station operator partner accounts and submitted EV hubs
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('operators')}
          className={`btn ${activeTab === 'operators' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <User size={15} /> Operator Partner Applications ({operators.length})
        </button>

        <button
          onClick={() => setActiveTab('stations')}
          className={`btn ${activeTab === 'stations' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Building2 size={15} /> Station Submissions ({stations.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : activeTab === 'operators' ? (
        /* Operators Tab */
        operators.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center' }}>
            <ShieldCheck size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>No Pending Operator Applications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
              All station operator registration applications have been verified and processed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {operators.map(op => (
              <div key={op.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{op.name}</h3>
                    <div style={{ color: 'var(--primary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>{op.email}</div>
                  </div>
                  <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    ● PENDING
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Phone:</strong> {op.phone || 'Not provided'}</div>
                  <div><strong>Account Type:</strong> Station Operator Partner</div>
                  <div><strong>Applied On:</strong> {op.createdAt ? op.createdAt.slice(0, 10) : 'Recent'}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleReviewOperator(op.id, 'APPROVED')}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={15} /> Approve Partner
                  </button>
                  <button
                    onClick={() => handleReviewOperator(op.id, 'REJECTED')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    disabled={actionLoading}
                  >
                    <XCircle size={15} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Stations Tab */
        stations.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center' }}>
            <Building2 size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>No Pending Station Submissions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
              All operator-submitted charging locations have been reviewed and approved.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {stations.map(st => (
              <div key={st.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{st.name}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="var(--primary)" /> {st.address}, {st.city}, {st.state}
                    </div>
                  </div>
                  <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    ● PENDING
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Submitted By:</strong> {st.ownerName || 'Station Operator'}</div>
                  <div><strong>Operating Hours:</strong> {st.openingTime} - {st.closingTime}</div>
                  <div><strong>Total Connectors:</strong> {st.totalChargers || 0}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleReviewStation(st.id, 'APPROVED')}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={15} /> Approve & Publish
                  </button>
                  <button
                    onClick={() => handleReviewStation(st.id, 'REJECTED')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    disabled={actionLoading}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
