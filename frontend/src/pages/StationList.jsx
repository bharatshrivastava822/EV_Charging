import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { stationService } from '../services/stationService';
import StationCard from '../components/StationCard';
import { LoadingState, EmptyState, ErrorState } from '../components/UI';
import { Search, Filter, MapPin, Zap } from 'lucide-react';

const CHARGER_FILTER_OPTIONS = [
  { value: '', label: 'All Charger Types' },
  { value: 'CCS2', label: 'CCS2 (DC Fast)' },
  { value: 'TYPE2', label: 'Type 2 (AC)' },
  { value: 'CHAdeMO', label: 'CHAdeMO (DC)' },
  { value: 'DC_FAST', label: 'DC Fast (High Capacity)' }
];

export default function StationList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = searchParams.get('city') || '';
  const search = searchParams.get('search') || '';
  const chargerType = searchParams.get('chargerType') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [selectedChargerType, setSelectedChargerType] = useState(chargerType);

  useEffect(() => {
    fetchStations();
  }, [city, search, chargerType]);

  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stationService.getAllStations({
        city: city || undefined,
        search: search || undefined,
        chargerType: chargerType || undefined
      });
      setStations(data);
    } catch {
      setError('Unable to load charging stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (selectedChargerType) params.chargerType = selectedChargerType;
    if (city) params.city = city;
    setSearchParams(params);
  };

  const handleClear = () => {
    setSearchInput('');
    setSelectedChargerType('');
    setSearchParams({});
  };

  return (
    <div className="container-wide" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            EV Charging Stations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Browse verified high-speed charging hubs with real-time connector status.
          </p>
        </div>
        <Link to="/" className="btn btn-primary btn-sm">
          <Zap size={14} fill="currentColor" /> Open Interactive Map
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px auto auto', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search station name, city (e.g. Indore, Bhopal), or address..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={selectedChargerType}
            onChange={e => setSelectedChargerType(e.target.value)}
          >
            {CHARGER_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">
            Search
          </button>

          {(search || chargerType || city) && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Results Header */}
      {!loading && !error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span>Showing <strong>{stations.length}</strong> verified stations</span>
        </div>
      )}

      {/* States */}
      {loading && <LoadingState message="Locating charging stations..." />}
      {error && <ErrorState message={error} onRetry={fetchStations} />}

      {!loading && !error && stations.length === 0 && (
        <EmptyState
          title="No charging stations match your search"
          message="Try searching for another city like Indore, Bhopal, Bengaluru, or reset your filters."
          action={<button className="btn btn-primary btn-sm" onClick={handleClear}>View All Stations</button>}
        />
      )}

      {!loading && !error && stations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {stations.map(station => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          form div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
