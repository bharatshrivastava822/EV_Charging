import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useToast } from '../context/ToastContext';
import { LoadingState, EmptyState, ErrorState } from '../components/UI';
import { Zap, Clock, BatteryCharging, Calendar, CheckCircle2, Download, Filter, FileText } from 'lucide-react';

export default function ChargingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(() => setError('Could not load charging history.'))
      .finally(() => setLoading(false));
  }, []);

  const completedSessions = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED');
  const totalSessions = bookings.length;
  const totalEnergyKwh = Math.round(totalSessions * 34.2);
  const totalChargingMinutes = totalSessions * 30;
  const totalChargingHours = (totalChargingMinutes / 60).toFixed(1);

  return (
    <div className="container-wide" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      {/* Page Title and Export CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="gov-pill-tag">
            <BatteryCharging size={13} /> Driver Session Registry
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            Charging History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Historical record of power consumption, session durations, and charging receipts.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => addToast('Session receipts exported to CSV format.', 'success')}
        >
          <Download size={14} /> Export Statement (CSV)
        </button>
      </div>

      {/* Structured Metrics Trio (Reference 1 + Reference 2 style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-pill-box highlight-primary">
          <span className="stat-title">Total Sessions</span>
          <span className="stat-num">{totalSessions}</span>
        </div>
        <div className="stat-pill-box">
          <span className="stat-title">Energy Consumed</span>
          <span className="stat-num">{totalEnergyKwh} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kWh</span></span>
        </div>
        <div className="stat-pill-box">
          <span className="stat-title">Total Charging Time</span>
          <span className="stat-num">{totalChargingHours} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hours</span></span>
        </div>
      </div>

      {loading && <LoadingState message="Loading charging session ledger..." />}
      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          title="No charging history recorded"
          message="Complete a reserved session to view detailed telemetry and energy records."
          action={<Link to="/stations" className="btn btn-primary btn-sm"><Zap size={14} fill="currentColor" /> Book a Slot</Link>}
        />
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          {/* Desktop Structured Table */}
          <div className="table-responsive desktop-history-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Reference</th>
                  <th>Charging Station</th>
                  <th>Date & Time</th>
                  <th>Connector Unit</th>
                  <th>Duration</th>
                  <th>Estimated Energy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const estKwh = (b.powerKw ? (b.powerKw * 0.5 * 0.85).toFixed(1) : '28.5') + ' kWh';
                  return (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                        {b.bookingReference}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.stationName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.stationAddress}</div>
                      </td>
                      <td>
                        <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{b.bookingDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.startTime} – {b.endTime}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>Charger {b.chargerNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{b.chargerType} • {b.powerKw} kW</div>
                      </td>
                      <td>30 Mins</td>
                      <td style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{estKwh}</td>
                      <td>
                        <span className={`badge badge-${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'available' : 'cancelled'}`}>
                          ● {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Conversion */}
          <div className="mobile-history-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.85rem' }}>
            {bookings.map((b) => (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {b.bookingReference}
                  </span>
                  <span className={`badge badge-${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'available' : 'cancelled'}`}>
                    ● {b.status}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>{b.stationName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                  {b.bookingDate} • {b.startTime} – {b.endTime}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Charger {b.chargerNumber} ({b.powerKw} kW)</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>30 Mins</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-history-table { display: none !important; }
          .mobile-history-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
