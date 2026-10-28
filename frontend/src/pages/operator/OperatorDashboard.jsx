import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operatorService } from '../../services/operatorService';
import { 
  Building2, 
  Zap, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function OperatorDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        operatorService.getStats(),
        operatorService.getOperatorBookings()
      ]);
      setStats(statsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading operator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            Operator Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage charging stations, charger availability, and customer slot bookings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/operator/stations" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Register New Station
          </Link>
          <Link to="/operator/slots" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Create Time Slots
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assigned Stations</span>
            <Building2 size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>{stats?.totalStations || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats?.activeStations || 0} Active • {stats?.pendingStations || 0} Pending Review
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Installed Chargers</span>
            <Zap size={18} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>{stats?.totalChargers || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats?.activeChargers || 0} Operational
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer Bookings</span>
            <Calendar size={18} color="#A78BFA" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>{stats?.totalBookings || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats?.todayBookings || 0} scheduled for today
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gross Revenue</span>
            <IndianRupee size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{stats?.estimatedRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Estimated at benchmark ₹240 / session
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>Recent Station Reservations</h2>
          <Link to="/operator/bookings" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>No bookings received yet</div>
            <div style={{ fontSize: '0.85rem' }}>When drivers reserve charging slots on your stations, they will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Driver</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Station</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Charger</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
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

