import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { stationService } from '../../services/stationService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState } from '../../components/UI';

const STATUS_CLASS = {
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
  COMPLETED: 'badge-available',
  NO_SHOW: 'badge-warning'
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [filters, setFilters] = useState({ status: '', stationId: '', date: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([adminService.getAllBookings(), stationService.getAllStations()])
      .then(([b, s]) => { setBookings(b); setStations(s); })
      .catch(() => addToast('Failed to load bookings.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking? The slot will be released.')) return;
    try {
      await adminService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      addToast('Booking cancelled.', 'success');
    } catch {
      addToast('Failed to cancel booking.', 'error');
    }
  };

  const filtered = bookings.filter(b => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.stationId && b.stationId !== parseInt(filters.stationId)) return false;
    if (filters.date && b.bookingDate !== filters.date) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (b.bookingReference?.toLowerCase().includes(q) ||
              b.userName?.toLowerCase().includes(q) ||
              b.stationName?.toLowerCase().includes(q));
    }
    return true;
  });

  const clearFilters = () => setFilters({ status: '', stationId: '', date: '', search: '' });
  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.15rem' }}>Booking Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>{bookings.length} total bookings</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> Filters {hasFilters && `(${Object.values(filters).filter(v => v).length})`}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '2', minWidth: '160px' }}>
              <label className="form-label">Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input type="text" className="form-control" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Reference, user, station" style={{ paddingLeft: '2rem' }} />
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '130px' }}>
              <label className="form-label">Status</label>
              <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '130px' }}>
              <label className="form-label">Station</label>
              <select className="form-control" value={filters.stationId} onChange={e => setFilters(f => ({ ...f, stationId: e.target.value }))}>
                <option value="">All stations</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '130px' }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
            </div>
            {hasFilters && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginBottom: '1px' }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? <LoadingState /> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <EmptyState title="No bookings found" message="No bookings match your current filters." />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>User</th>
                    <th>Station</th>
                    <th>Charger</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td><code style={{ fontSize: '0.75rem' }}>{b.bookingReference}</code></td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        <div style={{ fontWeight: 500 }}>{b.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{b.userEmail}</div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.stationName}</td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {b.chargerNumber && `#${b.chargerNumber}`} {b.chargerType && `· ${b.chargerType}`}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{b.bookingDate}</td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{b.startTime} – {b.endTime}</td>
                      <td><span className={`badge ${STATUS_CLASS[b.status] || 'badge-neutral'}`}>{b.status}</span></td>
                      <td>
                        {b.status === 'CONFIRMED' && (
                          <button className="btn btn-danger-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleCancel(b.id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  );
}
