import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { stationService } from '../../services/stationService';
import { LoadingState, ErrorState } from '../../components/UI';

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '1.1rem 1.25rem',
      borderLeft: `3px solid ${accent || 'var(--border)'}`
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.35rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getAllBookings(),
      stationService.getAllStations()
    ])
      .then(([s, b, st]) => {
        setStats(s);
        setRecentBookings(b.slice(0, 8));
        setStations(st.slice(0, 6));
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading operations data..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>Operations Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard label="Active Stations" value={stats?.activeStations} sub={`${stats?.totalStations} total`} accent="var(--primary)" />
        <StatCard label="Active Chargers" value={stats?.activeChargers} sub={`${stats?.totalChargers} total`} accent="#2563EB" />
        <StatCard label="Today's Bookings" value={stats?.todayBookings} sub="Confirmed slots" accent="var(--accent)" />
        <StatCard label="Registered Users" value={stats?.totalUsers} sub={`${stats?.confirmedBookings} active reservations`} accent="#9333EA" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Recent bookings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>Recent Bookings</h2>
            <a href="/admin/bookings" style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>View all</a>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Station</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '1.5rem' }}>No bookings today</td></tr>
                ) : recentBookings.map(b => (
                  <tr key={b.id}>
                    <td><code style={{ fontSize: '0.75rem' }}>{b.bookingReference}</code></td>
                    <td style={{ fontSize: '0.8125rem' }}>{b.userName}</td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.stationName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{b.bookingDate}</td>
                    <td><span className={`badge badge-${b.status === 'CONFIRMED' ? 'confirmed' : b.status === 'CANCELLED' ? 'cancelled' : 'neutral'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Station status */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.9375rem' }}>Station Status</h2>
            <a href="/admin/stations" style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>Manage</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stations.map(s => (
              <div key={s.id} style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{s.availableChargers}/{s.totalChargers}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>chargers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
