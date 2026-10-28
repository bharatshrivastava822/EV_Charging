import React, { useState, useEffect } from 'react';
import { operatorService } from '../../services/operatorService';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Zap, 
  CheckCircle, 
  XCircle,
  FileText
} from 'lucide-react';

export default function OperatorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await operatorService.getOperatorBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
          Customer Station Reservations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Track and verify slot reservations placed at your stations
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by reference, driver name, or station..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
            <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>No matching reservations</div>
            <div style={{ fontSize: '0.85rem' }}>No customer bookings found for the selected filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Reference #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Driver</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Station</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Charger</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Slot Schedule</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
                      {b.bookingReference}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#FFFFFF' }}>
                      {b.userName || 'EV Driver'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#FFFFFF' }}>
                      {b.stationName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-secondary">{b.chargerNumber} ({b.chargerType})</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {b.bookingDate} • {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-${b.status === 'CONFIRMED' ? 'available' : 'danger'}`}>
                        ● {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

