import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Zap, ChevronRight, ShieldCheck } from 'lucide-react';

const CHARGER_LABELS = {
  CCS2: 'CCS2',
  CHAdeMO: 'CHAdeMO',
  TYPE2: 'Type 2',
  AC: 'AC',
  DC_FAST: 'DC Fast'
};

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayH}:${m} ${suffix}`;
}

export default function StationCard({ station }) {
  const total = station.totalChargers || station.chargers?.length || 4;
  const available = station.availableChargers !== undefined ? station.availableChargers : 3;
  const ratio = total > 0 ? available / total : 0;
  const availClass = ratio > 0.5 ? 'available' : ratio > 0 ? 'warning' : 'blocked';

  const chargerTypesList = station.chargerTypes || (station.chargers || []).map(c => c.chargerType);
  const uniqueTypes = [...new Set(chargerTypesList)];
  const maxKw = station.maxPowerKw || Math.max(...(station.chargers || []).map(c => c.powerKw || 0), 60);

  return (
    <article className="station-card">
      <div className="station-card-header">
        <div>
          <h3 className="station-name">{station.name}</h3>
          <div className="station-location">
            <MapPin size={13} color="var(--primary)" />
            <span>{station.address}, {station.city}</span>
          </div>
        </div>
        <span className={`badge badge-${availClass}`} style={{ flexShrink: 0 }}>
          ● {available} / {total} Avail.
        </span>
      </div>

      <div className="station-card-body">
        <div className="station-meta-row">
          <div className="station-meta-item">
            <Zap size={13} color="var(--primary)" />
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
              {uniqueTypes.map(t => CHARGER_LABELS[t] || t).join(' • ')}
              {maxKw ? ` • Up to ${maxKw} kW` : ''}
            </span>
          </div>
          <div className="station-meta-item">
            <Clock size={13} color="var(--muted)" />
            <span>
              {station.openingTime === '00:00:00' || station.openingTime === '00:00'
                ? 'Open 24 Hours'
                : `${formatTime(station.openingTime)} – ${formatTime(station.closingTime)}`}
            </span>
          </div>
        </div>
        {station.operator && (
          <div className="station-operator">
            <ShieldCheck size={11} color="var(--primary)" style={{ display: 'inline', marginRight: '4px' }} />
            {station.operator}
          </div>
        )}
      </div>

      <div className="station-card-footer">
        <Link to={`/stations/${station.id}`} className="btn btn-primary btn-sm btn-block" style={{ justifyContent: 'center' }}>
          Reserve Slot <ChevronRight size={14} />
        </Link>
      </div>

      <style>{`
        .station-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .station-card:hover {
          border-color: var(--primary-border);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }
        .station-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .station-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 0.25rem;
          line-height: 1.3;
        }
        .station-location {
          display: flex;
          align-items: flex-start;
          gap: 0.35rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
        .station-location svg {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .station-meta-row {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .station-meta-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
        .station-operator {
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 0.35rem;
        }
        .station-card-footer {
          display: flex;
          padding-top: 0.65rem;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
      `}</style>
    </article>
  );
}
