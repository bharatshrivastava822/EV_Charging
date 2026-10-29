import React, { useState, useEffect } from 'react';
import { featureService } from '../services/featureService';
import { Calculator, IndianRupee, Zap, X, ShieldAlert } from 'lucide-react';

export default function CostEstimatorModal({ isOpen, onClose, initialPrice = 18.50, stationName = 'ChargerGo Hub' }) {
  const [energyKwh, setEnergyKwh] = useState(30);
  const [pricePerKwh, setPricePerKwh] = useState(initialPrice);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, energyKwh, pricePerKwh]);

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await featureService.estimateCost({
        energyKwh: Number(energyKwh),
        pricePerKwh: Number(pricePerKwh),
        serviceFee: 15.0
      });
      setEstimate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', padding: '1.75rem', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(184, 255, 0, 0.1)', color: 'var(--primary)' }}>
              <Calculator size={18} />
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Charging Cost Estimator</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Calculate charging session expenditure for <strong>{stationName}</strong> based on required battery kWh.
        </p>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Desired Charge Volume:</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{energyKwh} kWh</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={energyKwh}
              onChange={e => setEnergyKwh(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <span>5 kWh (Scooter/City)</span>
              <span>30 kWh (Hatchback)</span>
              <span>100 kWh (Long Range SUV)</span>
            </div>
          </div>

          <div>
            <label className="form-label">Station Tariff (₹/kWh)</label>
            <input
              type="number"
              step="0.5"
              className="form-control"
              value={pricePerKwh}
              onChange={e => setPricePerKwh(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Breakdown Card */}
        {estimate && (
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Base Energy Cost ({energyKwh} kWh × ₹{pricePerKwh}):</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{estimate.baseCostInr?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <span>Platform & Grid Access Fee:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{estimate.serviceFeeInr?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>Total Estimated Cost:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                {estimate.formattedTotal || `₹${estimate.totalEstimatedCostInr?.toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
          <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#FBBF24' }} />
          <span>This is a mathematical estimate. Exact energy draw may vary according to EV battery management intake curve.</span>
        </div>

        <button onClick={onClose} className="btn btn-primary btn-block">
          Done
        </button>
      </div>
    </div>
  );
}

