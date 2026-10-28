import React, { useState, useEffect } from 'react';
import { featureService } from '../services/featureService';
import { useToast } from '../context/ToastContext';
import { 
  Zap, 
  BatteryCharging, 
  Play, 
  Square, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  Clock
} from 'lucide-react';

export default function LiveChargingSimulator({ bookingId, stationName, chargerNumber, powerKw = 60, pricePerKwh = 18.5 }) {
  const { addToast } = useToast();
  const [session, setSession] = useState(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState(20);
  const [targetBattery, setTargetBattery] = useState(80);
  const [energyDelivered, setEnergyDelivered] = useState(0.0);
  const [elapsedSec, setElapsedSec] = useState(0);

  // Check for existing session
  useEffect(() => {
    if (bookingId) {
      checkExistingSession();
    }
  }, [bookingId]);

  const checkExistingSession = async () => {
    try {
      const data = await featureService.getSimulation(bookingId);
      if (data) {
        setSession(data);
        setBattery(data.batteryCurrentPct || 20);
        setTargetBattery(data.batteryTargetPct || 80);
        setEnergyDelivered(data.energyDeliveredKwh || 0);
        if (data.status === 'IN_PROGRESS') {
          setActive(true);
        }
      }
    } catch (err) {
      // No active session yet
    }
  };

  // Timer loop for simulation ticks
  useEffect(() => {
    let interval = null;
    if (active && session && session.status === 'IN_PROGRESS') {
      interval = setInterval(async () => {
        setElapsedSec(s => s + 1);
        try {
          const updated = await featureService.tickSimulation(session.id);
          setSession(updated);
          setBattery(updated.batteryCurrentPct);
          setEnergyDelivered(updated.energyDeliveredKwh);
          if (updated.status !== 'IN_PROGRESS') {
            setActive(false);
            addToast(`Charging completed! Target ${updated.batteryTargetPct}% reached.`, 'success');
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000); // 3 sec tick
    }
    return () => clearInterval(interval);
  }, [active, session]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const newSession = await featureService.startSimulation({
        bookingId,
        startBatteryPct: battery,
        targetBatteryPct: targetBattery
      });
      setSession(newSession);
      setActive(true);
      addToast('Virtual charging session initiated!', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to start simulation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!session) return;
    try {
      const stopped = await featureService.stopSimulation(session.id);
      setSession(stopped);
      setActive(false);
      addToast('Charging session stopped.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to stop session.', 'error');
    }
  };

  const cost = session?.estimatedCostInr || Math.round(energyDelivered * pricePerKwh * 100) / 100;
  const isComplete = session?.status === 'COMPLETED';

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header with Simulator Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(184, 255, 0, 0.1)', border: '1px solid var(--primary-border)', padding: '0.2rem 0.65rem', borderRadius: '14px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Zap size={13} fill="currentColor" /> Virtual Cockpit
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Live Charging Session Simulator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
            {stationName || 'Charging Station'} • Connector {chargerNumber || 'C01'} ({powerKw} kW)
          </p>
        </div>

        <span className={`badge badge-${active ? 'available' : isComplete ? 'info' : 'secondary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}>
          {active ? <BatteryCharging size={14} className="pulse" /> : <CheckCircle2 size={14} />}
          {active ? 'CHARGING IN PROGRESS' : isComplete ? 'COMPLETED' : 'STANDBY READY'}
        </span>
      </div>

      {/* Main Cockpit Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Battery Level Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            State of Charge (SoC)
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: battery >= 75 ? 'var(--primary)' : battery >= 40 ? '#60A5FA' : '#FBBF24' }}>
            {battery}%
          </div>
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ height: '100%', width: `${battery}%`, background: 'var(--primary)', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Target: {targetBattery}%
          </div>
        </div>

        {/* Energy Delivered Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            Energy Dispensed
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF' }}>
            {energyDelivered.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
            {active ? `${powerKw} kW DC Active Flow` : 'Power Output 0 kW'}
          </div>
        </div>

        {/* Live Running Cost Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            Estimated Charge Cost
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)' }}>
            ₹{cost.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tariff: ₹{pricePerKwh}/kWh
          </div>
        </div>
      </div>

      {/* Simulator Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!active && !isComplete && (
            <button onClick={handleStart} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
              <Play size={16} fill="currentColor" /> Start Virtual Session
            </button>
          )}

          {active && (
            <button onClick={handleStop} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)' }}>
              <Square size={16} fill="currentColor" /> Stop Session
            </button>
          )}

          {isComplete && (
            <button onClick={handleStart} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCw size={15} /> Restart Simulation
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '380px' }}>
          * Virtual Simulation Cockpit: Real-time mathematical simulation calculated from power curves and tariff rates. No hardware attachment.
        </div>
      </div>
    </div>
  );
}
