import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useToast } from '../context/ToastContext';
import { LoadingState, EmptyState, ErrorState } from '../components/UI';
import BookingCard from '../components/BookingCard';
import { Zap, Clock, BatteryCharging, Calendar, CheckCircle2 } from 'lucide-react';

const TABS = [
  { key: 'CONFIRMED', label: 'Upcoming Slots' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' }
];

export default function MyBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('status') || 'CONFIRMED';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setAllBookings)
      .catch(() => setError('Could not load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ status: tab });
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this reservation? The charging slot will immediately be made available to other drivers.')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      addToast('Booking cancelled successfully and slot released.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const filtered = allBookings.filter(b => b.status === activeTab);
  const totalSessions = allBookings.length;
  const completedSessions = allBookings.filter(b => b.status === 'COMPLETED').length;
  const estimatedKwh = Math.round((completedSessions || 1) * 32.5);

  return (
    <div className="container-wide" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      {/* Header & Stats Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>My Charging Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage your reserved slots and track past sessions across the ChargerGo network.
          </p>
        </div>
        <Link to="/" className="btn btn-primary btn-sm">
          <Zap size={15} fill="currentColor" /> Reserve New Slot
        </Link>
      </div>

      {/* Summary Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Reservations</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>{totalSessions}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Upcoming Active</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
            {allBookings.filter(b => b.status === 'CONFIRMED').length}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Energy Delivered</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>{estimatedKwh} kWh</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map(tab => {
          const count = allBookings.filter(b => b.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? 'var(--primary)' : 'var(--surface-hover)',
                color: isActive ? 'var(--primary-contrast)' : 'var(--text-secondary)',
                borderRadius: '99px',
                fontSize: '0.7rem',
                padding: '0.1rem 0.5rem',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && <LoadingState message="Loading your bookings..." />}
      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title={`No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase() || ''} found`}
          message={activeTab === 'CONFIRMED' ? 'You have no upcoming charging slot reservations.' : 'No sessions recorded in this status.'}
          action={activeTab === 'CONFIRMED' ? <Link to="/" className="btn btn-primary btn-sm"><Zap size={14} fill="currentColor" /> Reserve a Slot on Map</Link> : null}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} showCancelButton={activeTab === 'CONFIRMED'} />
          ))}
        </div>
      )}
    </div>
  );
}
