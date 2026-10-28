import React from 'react';
import { Calendar, MapPin, Zap, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_LABEL = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show'
};

const STATUS_CLASS = {
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
  COMPLETED: 'badge-available',
  NO_SHOW: 'badge-warning'
};

export default function BookingCard({ booking, onCancel, showCancelButton = true }) {
  const canCancel = booking.status === 'CONFIRMED' && showCancelButton;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
            {booking.bookingReference}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{booking.stationName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            <MapPin size={13} color="var(--primary)" />
            <span>{booking.stationAddress}</span>
          </div>
        </div>
        <span className={`badge ${STATUS_CLASS[booking.status] || 'badge-neutral'}`}>
          ● {STATUS_LABEL[booking.status] || booking.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{booking.bookingDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <Clock size={14} color="var(--primary)" />
          <span>{booking.startTime} – {booking.endTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text)', gridColumn: '1/-1' }}>
          <Zap size={14} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>Charger {booking.chargerNumber} • {booking.chargerType} • {booking.powerKw} kW</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
        {booking.status === 'CONFIRMED' && (
          <Link to={`/bookings/${booking.id}`} className="btn btn-primary btn-sm">
            <Zap size={13} fill="currentColor" /> Live Telemetry
          </Link>
        )}
        {canCancel && onCancel && (
          <button className="btn btn-danger-outline btn-sm" onClick={() => onCancel(booking.id)}>
            <XCircle size={14} /> Cancel Slot
          </button>
        )}
        <Link to={`/stations/${booking.stationId}`} className="btn btn-secondary btn-sm">
          Station Details
        </Link>
      </div>
    </div>
  );
}
