import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stationService } from '../services/stationService';
import GoogleMapView from '../components/GoogleMapView';
import {
  Zap,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  BatteryCharging,
  Star,
  Navigation,
  ArrowRight,
  Radio,
  Layers,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const FILTER_CHIPS = [
  { id: 'ALL', label: 'All Stations' },
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'FAST', label: 'Fast Charging' },
  { id: 'CCS2', label: 'CCS2' },
  { id: 'TYPE2', label: 'Type 2' },
  { id: 'ULTRA', label: '120 kW+' }
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await stationService.getAllStations();
      setStations(data);
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0]);
      }
    } catch (err) {
      console.error('Failed to load stations', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter calculation
  const filteredStations = stations.filter(station => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      station.name.toLowerCase().includes(q) ||
      station.address.toLowerCase().includes(q) ||
      station.city.toLowerCase().includes(q) ||
      station.state.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'AVAILABLE') {
      return (station.availableChargers || 0) > 0;
    }
    if (activeFilter === 'FAST') {
      return station.chargers?.some(c => c.chargingSpeed?.toLowerCase().includes('fast') || c.powerKw >= 50);
    }
    if (activeFilter === 'CCS2') {
      return station.chargers?.some(c => c.chargerType === 'CCS2');
    }
    if (activeFilter === 'TYPE2') {
      return station.chargers?.some(c => c.chargerType === 'TYPE2');
    }
    if (activeFilter === 'ULTRA') {
      return station.chargers?.some(c => c.powerKw >= 120);
    }

    return true;
  });

  const handleSelectStation = (station) => {
    setSelectedStation(station);
  };

  // Calculate dynamic stats from stations list
  const totalAvailable = stations.reduce((acc, s) => acc + (s.availableChargers || 3), 0);
  const totalNearby = stations.length;
  const totalFast = stations.filter(s => s.chargers?.some(c => c.powerKw >= 50)).length;

  return (
    <div className="container-wide home-container-stack">
      {/* 1. ENTERPRISE HERO CONTAINER (Reference 2 style) */}
      <section className="enterprise-hero-card">
        <div className="hero-tags-line">
          <span className="initiative-tag">
            <Radio size={12} fill="currentColor" /> National Clean EV Mobility Initiative
          </span>
          <span className="prototype-tag">
            PUBLIC CHARGING REGISTRY
          </span>
        </div>

        <h1 className="hero-main-title">
          Find Your Charging Station
        </h1>

        <p className="hero-sub-text">
          Locate high-power verified EV charging hubs across the national grid, inspect real-time connector availability, and guarantee your 30-minute charging window before you arrive.
        </p>

        <div className="hero-action-buttons-row">
          <Link to="/stations" className="btn btn-primary btn-lg">
            <Zap size={16} fill="currentColor" /> Start Charging Search
          </Link>
          <a href="#map-section" className="btn btn-secondary btn-lg">
            <Navigation size={16} /> Explore Live Map
          </a>
          <Link to="/bookings" className="btn btn-secondary btn-lg">
            <CalendarCheck size={16} /> View My Bookings
          </Link>
        </div>
      </section>

      {/* 2. STATS TRIO (Reference 1) & SEARCH CONTROLS STRIP */}
      <div className="stats-and-search-strip" id="map-section">
        {/* Quick Stats Trio from Reference 1 */}
        <div className="stats-blocks-trio">
          <div className="stat-pill-box highlight-primary">
            <span className="stat-title">Available</span>
            <span className="stat-num">{totalAvailable || 24}</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-title">Near by</span>
            <span className="stat-num">{totalNearby || 8}</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-title">Fast</span>
            <span className="stat-num">{totalFast || 5}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-filter-container">
          <div className="search-input-box">
            <Search className="search-icon-pos" size={17} />
            <input
              type="text"
              placeholder="Search location, city (e.g. Indore, Bhopal, Bengaluru) or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-chips-row">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                className={`filter-chip-btn ${activeFilter === chip.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAP-FIRST SPLIT VIEW */}
      <div className="map-first-layout-grid">
        {/* Dark Map Canvas */}
        <div className="map-wrapper-card">
          <GoogleMapView
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
          />
        </div>

        {/* Nearest Stations Spotlight Side Panel (Reference 1 Card Style) */}
        <div className="side-stations-panel">
          <div className="panel-section-header">
            <h3 className="panel-heading">Nearest Stations</h3>
            <Link to="/stations" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          {selectedStation ? (
            <div className="station-spotlight-card">
              <div className="spotlight-top-row">
                <div className="power-icon-green-square">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div className="spotlight-info-column">
                  <div className="spotlight-name">{selectedStation.name}</div>
                  <div className="spotlight-meta-sub">
                    0.5 km • {selectedStation.availableChargers || 4} available
                  </div>
                  <div className="rating-badge">
                    <Star size={12} fill="currentColor" /> 4.8 (120+ reviews)
                  </div>
                </div>
                <div className="spotlight-pricing-pill">
                  <div className="rate-amount">₹18.50</div>
                  <div className="rate-unit">/ kWh</div>
                </div>
              </div>

              <div className="spotlight-connectors-list">
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Available Connectors & Speeds
                </div>
                {(selectedStation.chargers || []).slice(0, 3).map((c) => (
                  <div key={c.id} className="connector-chip-line">
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{c.chargerNumber} — {c.chargerType}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.powerKw} kW ({c.chargingSpeed})</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Link
                  to={`/stations/${selectedStation.id}`}
                  className="btn btn-primary btn-block btn-lg"
                >
                  <Zap size={16} fill="currentColor" /> Reserve Slot Now
                </Link>
                <Link
                  to={`/stations/${selectedStation.id}`}
                  className="btn btn-secondary btn-block btn-sm"
                >
                  View Connector Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
              <Navigation size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>Select a Station on Map</div>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click any marker to inspect real-time connector speeds and reserve a slot.</p>
            </div>
          )}

          {/* Quick list of other stations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Other Nearby Stations
            </div>
            {stations.filter(s => s.id !== selectedStation?.id).slice(0, 3).map(s => (
              <div
                key={s.id}
                onClick={() => handleSelectStation(s)}
                style={{
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.65rem 0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.city} • {s.availableChargers || 3} Available</div>
                </div>
                <ChevronRight size={15} color="var(--primary)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PUBLIC EV SERVICES MODULES (Reference 2 style) */}
      <section className="core-services-section">
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            PUBLIC EV CHARGING SERVICES
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Core infrastructure modules for individual drivers, fleet operators, and institutional evaluators.
          </p>
        </div>

        <div className="services-cards-grid">
          <div className="service-module-card">
            <div>
              <div className="service-tag-badge">SERVICE 01</div>
              <h3 className="service-title">High-Speed Station Locator</h3>
              <p className="service-desc">
                Real-time geospatial discovery of verified EV fast-charging stations across national highways and metropolitan expressways with live connector statuses.
              </p>
            </div>
            <Link to="/stations" className="service-link-action">
              Explore Station Network <ArrowRight size={14} />
            </Link>
          </div>

          <div className="service-module-card">
            <div>
              <div className="service-tag-badge">SERVICE 02</div>
              <h3 className="service-title">Guaranteed Slot Reservation</h3>
              <p className="service-desc">
                Transaction-safe 30-minute time window bookings with unique reference verification. Eliminates arrival uncertainty and physical station congestion.
              </p>
            </div>
            <Link to="/stations" className="service-link-action">
              Reserve Dedicated Slot <ArrowRight size={14} />
            </Link>
          </div>

          <div className="service-module-card">
            <div>
              <div className="service-tag-badge">SERVICE 03</div>
              <h3 className="service-title">Fleet & Energy Analytics</h3>
              <p className="service-desc">
                Complete charging history recording kWh delivered, session receipts, and dynamic slot cancellations that automatically release power units back to the network.
              </p>
            </div>
            <Link to="/history" className="service-link-action">
              Inspect Charging History <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
