import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Zap, ArrowLeft, ChevronRight, ShieldCheck, Check, CalendarCheck, CheckCircle2, BatteryCharging } from 'lucide-react';
import { stationService } from '../services/stationService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState } from '../components/UI';
import SlotGrid from '../components/SlotGrid';

const CHARGER_LABELS = { CCS2: 'CCS2', CHAdeMO: 'CHAdeMO', TYPE2: 'Type 2', AC: 'AC', DC_FAST: 'DC Fast' };

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${suffix}`;
}

export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await stationService.getStationById(id);
        setStation(data);
        const firstActive = (data.chargers || []).find(c => c.status === 'ACTIVE');
        if (firstActive) setSelectedCharger(firstActive);
      } catch {
        setError('Unable to load station details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!selectedCharger || !selectedDate) return;
    let cancelled = false;
    const fetch = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const data = await stationService.getSlotsByCharger(selectedCharger.id, selectedDate);
        if (!cancelled) setSlots(data);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [selectedCharger, selectedDate]);

  const handleBook = async () => {
    if (!user) {
      addToast('Please sign in to book a slot.', 'warning');
      navigate('/login', { state: { from: `/stations/${id}` } });
      return;
    }
    if (!selectedSlot) {
      addToast('Please select an available time slot.', 'warning');
      return;
    }

    setBooking(true);
    try {
      const bookingData = {
        stationId: station.id,
        chargerId: selectedCharger.id,
        slotId: selectedSlot.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      };
      const result = await bookingService.createBooking(bookingData);
      addToast('Charging slot successfully reserved!', 'success');
      navigate(`/booking-confirmation/${result.id}`, { state: { booking: result } });
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Booking failed. Please try another slot.';
      addToast(msg, 'error');
      if (selectedCharger && selectedDate) {
        const data = await stationService.getSlotsByCharger(selectedCharger.id, selectedDate);
        setSlots(data);
        setSelectedSlot(null);
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '3rem' }}><LoadingState message="Connecting to ChargerGo Network..." /></div>;
  if (error) return <div className="container" style={{ paddingTop: '3rem' }}><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!station) return null;

  const activeChargers = (station.chargers || []).filter(c => c.status === 'ACTIVE');

  // Step calculations for Step 1 -> 5
  const step1Done = true; // Station selected
  const step2Done = !!selectedCharger; // Charger selected
  const step3Done = !!selectedDate; // Date selected
  const step4Done = !!selectedSlot; // Time slot selected
  const step5Done = false; // Confirm

  return (
    <div className="container-wide" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> Map
        </Link>
        <ChevronRight size={12} />
        <Link to="/stations" style={{ color: 'var(--text-secondary)' }}>Stations</Link>
        <ChevronRight size={12} />
        <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{station.name}</span>
      </div>

      {/* 5-Step Process Bar (Section 17 requirement) */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.75rem' }}>
          <StepBadge step="1" title="Station" completed={step1Done} />
          <div style={{ height: 1, width: 24, background: 'var(--primary)', flexShrink: 0 }} />
          <StepBadge step="2" title="Charger" completed={step2Done} />
          <div style={{ height: 1, width: 24, background: step2Done ? 'var(--primary)' : 'var(--border)', flexShrink: 0 }} />
          <StepBadge step="3" title="Date" completed={step3Done} />
          <div style={{ height: 1, width: 24, background: step3Done ? 'var(--primary)' : 'var(--border)', flexShrink: 0 }} />
          <StepBadge step="4" title="Time Slot" completed={step4Done} />
          <div style={{ height: 1, width: 24, background: step4Done ? 'var(--primary)' : 'var(--border)', flexShrink: 0 }} />
          <StepBadge step="5" title="Confirm" completed={step5Done} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Station & Slot Selection */}
        <div>
          {/* Station Overview Header Card */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-available" style={{ marginBottom: '0.45rem' }}>
                  ● Verified ChargerGo Hub
                </span>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0' }}>{station.name}</h1>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MapPin size={14} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{station.address}, {station.city}, {station.state}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '0.85rem 0', borderTop: '1px solid var(--border)' }}>
              <MetaItem icon={<Zap size={14} color="var(--primary)" />} label="Active Units" value={`${activeChargers.length} active`} />
              <MetaItem icon={<Clock size={14} color="var(--primary)" />} label="Operating Schedule" value={
                station.openingTime === '00:00:00' || station.openingTime === '00:00'
                  ? 'Open 24 Hours'
                  : `${formatTime(station.openingTime)} – ${formatTime(station.closingTime)}`
              } />
              {station.operator && <MetaItem icon={<ShieldCheck size={14} color="var(--primary)" />} label="Network Operator" value={station.operator} />}
            </div>
          </div>

          {/* Slot Reservation Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Zap size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Reserve a Charging Slot
              </h2>
            </div>

            {/* Date Selection */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Step 3: Select Date</label>
              <input
                id="booking-date"
                type="date"
                className="form-control"
                value={selectedDate}
                min={today}
                max={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ maxWidth: '240px', fontWeight: 700 }}
              />
            </div>

            {/* Charger selection */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Step 2: Select Charger / Connector Unit</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {activeChargers.map(c => {
                  const isSelected = selectedCharger?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCharger(c)}
                      style={{
                        padding: '0.85rem 1rem',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--primary-light)' : 'var(--secondary-bg)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: isSelected ? 'var(--primary)' : '#FFFFFF', fontSize: '0.9rem' }}>
                          Charger {c.chargerNumber}
                        </span>
                        <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                          {c.powerKw} kW
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {CHARGER_LABELS[c.chargerType] || c.chargerType} • {c.chargingSpeed}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slots Grid */}
            {selectedCharger && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.65rem' }}>
                  Step 4: Select 30-Minute Time Slot ({selectedCharger.chargerNumber})
                </label>
                {slotsLoading ? (
                  <LoadingState message="Fetching live slot availability..." />
                ) : (
                  <SlotGrid
                    slots={slots}
                    selectedSlotId={selectedSlot?.id}
                    onSelect={setSelectedSlot}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Summary */}
        <div style={{ position: 'sticky', top: '75px' }}>
          <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border)' }}>
              Step 5: Booking Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <SummaryRow label="Station" value={station.name} />
              <SummaryRow
                label="Connector Unit"
                value={selectedCharger ? `Charger ${selectedCharger.chargerNumber} (${selectedCharger.powerKw} kW)` : '—'}
                highlight={!!selectedCharger}
              />
              <SummaryRow
                label="Date"
                value={selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              />
              <SummaryRow
                label="Time Slot"
                value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : 'Select a slot'}
                highlight={!!selectedSlot}
              />
              <SummaryRow label="Estimated Duration" value="30 Minutes" />
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tariff Rate</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>₹18.50 / kWh</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={handleBook}
              disabled={!selectedSlot || booking}
            >
              {booking ? 'Confirming Reservation...' : <><Zap size={16} fill="currentColor" /> Confirm Booking</>}
            </button>

            {!user && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.85rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link> required to confirm slot
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBadge({ step, title, completed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: completed ? 'var(--primary)' : 'var(--surface-hover)',
        color: completed ? 'var(--primary-contrast)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 800
      }}>
        {completed ? <Check size={12} strokeWidth={3} /> : step}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: completed ? 700 : 500, color: completed ? '#FFFFFF' : 'var(--text-secondary)' }}>
        {title}
      </span>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#FFFFFF', fontWeight: 600 }}>
        {icon}
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8125rem' }}>
      <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ color: highlight ? 'var(--primary)' : '#FFFFFF', fontWeight: highlight ? 700 : 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
