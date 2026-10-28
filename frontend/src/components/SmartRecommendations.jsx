import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { featureService } from '../services/featureService';
import { Sparkles, MapPin, Zap, ArrowRight, ShieldCheck, IndianRupee } from 'lucide-react';

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await featureService.getRecommendations({ limit: 3 });
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(184, 255, 0, 0.15)', color: 'var(--primary)' }}>
          <Sparkles size={16} />
        </span>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Smart Charging Recommendations
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ranked by proximity, connector compatibility, tariff value, and live slot availability
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {recommendations.map((rec, idx) => {
          const st = rec.station;
          return (
            <div
              key={st.id || idx}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(184, 255, 0, 0.1)', border: '1px solid var(--primary-border)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                  ★ {rec.primaryReason}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                  {st.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                  <MapPin size={13} color="var(--primary)" /> {st.city}, {st.state} • approx {rec.distanceKm} km
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {st.chargerTypes?.map(t => (
                    <span key={t} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                      {t}
                    </span>
                  ))}
                  {st.maxPowerKw && (
                    <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                      ⚡ {st.maxPowerKw} kW
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>
                  ₹{rec.pricePerKwh?.toFixed(2) || '18.50'} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ kWh</span>
                </div>

                <Link
                  to={`/stations/${st.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  View Slots <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
