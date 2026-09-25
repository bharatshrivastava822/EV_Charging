import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Calendar, ArrowRight, Clock, MapPin, BatteryCharging, ShieldCheck, User } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, EmptyState } from '../components/UI';
import BookingCard from '../components/BookingCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(() => addToast('Could not load bookings.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this reservation? The slot will immediately be released to other drivers.')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      addToast('Reservation cancelled and slot released.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED');
  const recent = bookings.filter(b => b.status !== 'CONFIRMED').slice(0, 3);

  return (
    <div className="container-wide" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Zap size={14} fill="currentColor" /> Driver Portal Active
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Driver'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Ready to charge? Find nearby stations or manage your upcoming reserved slots.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-sm">
            <Zap size={14} fill="currentColor" /> Find Station on Map
          </Link>
          <Link to="/bookings" className="btn btn-secondary btn-sm">
            <Calendar size={14} /> My Bookings
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Upcoming & Recent Bookings */}
        <div>
          {/* Active Next Booking Focus Banner */}
          {upcoming.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(184, 255, 0, 0.08) 0%, rgba(18, 23, 34, 0.9) 100%)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.75rem', boxShadow: '0 0 20px rgba(184, 255, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-available">● Upcoming Next Reservation</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{upcoming[0].bookingReference}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>{upcoming[0].stationName}</h3>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--primary)" /> {upcoming[0].bookingDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--primary)" /> {upcoming[0].startTime} – {upcoming[0].endTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF', fontWeight: 600 }}>
                  <Zap size={14} color="var(--primary)" /> Charger {upcoming[0].chargerNumber} ({upcoming[0].powerKw} kW)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <Link to={`/stations/${upcoming[0].stationId}`} className="btn btn-primary btn-sm">
                  View Station Guide
                </Link>
                <button className="btn btn-danger-outline btn-sm" onClick={() => handleCancel(upcoming[0].id)}>
                  Cancel Slot
                </button>
              </div>
            </div>
          )}

          {/* All Upcoming List */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Confirmed Reservations</h2>
              <Link to="/bookings?status=CONFIRMED" style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <LoadingState message="Checking reservation calendar..." />
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="No active reservations"
                message="You don't have any upcoming charging slots booked right now."
                action={<Link to="/" className="btn btn-primary btn-sm"><Zap size={14} fill="currentColor" /> Reserve a Slot on Map</Link>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {upcoming.map(b => (
                  <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </section>

          {/* Recent History */}
          {recent.length > 0 && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Past Session Activity</h2>
                <Link to="/bookings" style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                  Full History <ArrowRight size={13} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recent.map(b => (
                  <BookingCard key={b.id} booking={b} showCancelButton={false} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Quick Links & Account Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Actions */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Quick Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { to: '/', label: 'Interactive Station Map', icon: <Zap size={14} color="var(--primary)" /> },
                { to: '/stations', label: 'All Charging Hubs', icon: <MapPin size={14} color="var(--primary)" /> },
                { to: '/bookings', label: 'My Reservation History', icon: <Calendar size={14} color="var(--primary)" /> },
                { to: '/profile', label: 'Driver Account Settings', icon: <User size={14} color="var(--primary)" /> }
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    transition: 'var(--transition)'
                  }}
                >
                  {icon}
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Account Metrics */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Session Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <SummaryLine label="Total Bookings" value={bookings.length} />
              <SummaryLine label="Active Upcoming" value={upcoming.length} highlight />
              <SummaryLine label="Completed Sessions" value={bookings.filter(b => b.status === 'COMPLETED').length} />
              <SummaryLine label="Cancelled Sessions" value={bookings.filter(b => b.status === 'CANCELLED').length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? 'var(--primary)' : '#FFFFFF' }}>{value}</span>
    </div>
  );
}
