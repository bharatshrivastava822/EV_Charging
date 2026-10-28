import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Zap, MapPin, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { LoadingState, ErrorState } from '../components/UI';
import LiveChargingSimulator from '../components/LiveChargingSimulator';

export default function BookingConfirmation() {
  const { id } = useParams();
  const { state } = useLocation();
  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking) {
      bookingService.getBookingById(id)
        .then(setBooking)
        .catch(() => setError('Could not load booking details.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="container" style={{ paddingTop: '3rem' }}><LoadingState message="Verifying reservation..." /></div>;
  if (error) return <div className="container" style={{ paddingTop: '3rem' }}><ErrorState message={error} /></div>;
  if (!booking) return null;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '580px' }}>
      {/* Confirmation badge */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--primary-light)', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--primary-border)', boxShadow: '0 0 20px var(--primary-glow)' }}>
          <CheckCircle size={32} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>Booking Confirmed</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Your charging slot has been reserved on the ChargerGo network.
        </p>
      </div>

      {/* Booking Details Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {/* Reference header bar */}
        <div style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.15rem' }}>
              Booking Reference ID
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', letterSpacing: '0.04em' }}>
              {booking.bookingReference}
            </div>
          </div>
          {/* QR Code Placeholder */}
          <div style={{ width: 48, height: 48, background: '#000000', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QRPatternPlaceholder />
          </div>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <DetailRow icon={<MapPin size={16} color="var(--primary)" />} label="Charging Station" value={booking.stationName} sub={booking.stationAddress} />
          <DetailRow icon={<Zap size={16} color="var(--primary)" />} label="Connector Details" value={`Charger ${booking.chargerNumber}`} sub={`${booking.chargerType} • ${booking.powerKw} kW`} />
          <DetailRow icon={<Calendar size={16} color="var(--primary)" />} label="Date of Reservation" value={booking.bookingDate} />
          <DetailRow icon={<Clock size={16} color="var(--primary)" />} label="Reserved Time Window" value={`${booking.startTime} – ${booking.endTime}`} sub="30-minute dedicated session" />
          
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Reservation Status</span>
            <span className="badge badge-confirmed">● {booking.status}</span>
          </div>
        </div>
      </div>

      {/* Virtual Live Charging Telemetry Simulator */}
      <div style={{ marginBottom: '1.5rem' }}>
        <LiveChargingSimulator
          bookingId={booking.id}
          powerKw={booking.powerKw || 60}
          pricePerKwh={18.5}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Link to="/bookings" className="btn btn-secondary btn-block btn-lg" style={{ justifyContent: 'center' }}>
          View My Bookings
        </Link>
        <Link to="/" className="btn btn-primary btn-block btn-lg" style={{ justifyContent: 'center' }}>
          <Zap size={16} fill="currentColor" /> Back to Map
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, sub }) {
  return (
    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
      <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

function QRPatternPlaceholder() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#B8FF00" opacity="0.9"/>
      <rect x="18" y="2" width="12" height="12" rx="1" fill="#B8FF00" opacity="0.9"/>
      <rect x="2" y="18" width="12" height="12" rx="1" fill="#B8FF00" opacity="0.9"/>
      <rect x="5" y="5" width="6" height="6" rx="0.5" fill="#000000"/>
      <rect x="21" y="5" width="6" height="6" rx="0.5" fill="#000000"/>
      <rect x="5" y="21" width="6" height="6" rx="0.5" fill="#000000"/>
      <rect x="18" y="18" width="4" height="4" rx="0.5" fill="#B8FF00" opacity="0.8"/>
      <rect x="24" y="18" width="4" height="4" rx="0.5" fill="#B8FF00" opacity="0.8"/>
      <rect x="18" y="24" width="4" height="4" rx="0.5" fill="#B8FF00" opacity="0.8"/>
      <rect x="24" y="24" width="4" height="4" rx="0.5" fill="#B8FF00" opacity="0.8"/>
    </svg>
  );
}
