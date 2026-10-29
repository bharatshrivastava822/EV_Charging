import React, { useEffect, useRef, useState } from 'react';
import { Zap, Navigation, MapPin, BatteryCharging, Radio, AlertTriangle, Globe, Map as MapIcon } from 'lucide-react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

// Helper to load Leaflet dynamically on demand
function loadLeafletLibrary() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Failed to load map engine'));
      document.body.appendChild(script);
    } else {
      const existing = document.getElementById('leaflet-js');
      existing.addEventListener('load', () => resolve(window.L));
    }
  });
}

// Satellite Imagery and Road Tile Endpoints
const SATELLITE_TILES = {
  imagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  placesOverlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  roadsOverlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
  roadmap: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
};

function hasValidCoords(station) {
  return Number.isFinite(station?.latitude) && Number.isFinite(station?.longitude);
}

export default function GoogleMapView({
  stations = [],
  selectedStation = null,
  onSelectStation,
  center = [22.7533, 75.8937], // Default Indore center
  zoom = 13
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const activeTileLayersRef = useRef([]);
  const markersRef = useRef([]);
  const routeLayerRef = useRef([]);
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [viewMode, setViewMode] = useState('satellite'); // 'satellite' | 'roadmap' (Defaults to SATELLITE)
  const [mapError, setMapError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Helper to apply satellite or roadmap tile layers in Leaflet
  const applyLeafletTileLayers = (map, mode) => {
    const L = window.L;
    if (!L || !map) return;

    // Remove existing tile layers
    activeTileLayersRef.current.forEach(layer => map.removeLayer(layer));
    activeTileLayersRef.current = [];

    if (mode === 'satellite') {
      // Genuine Photographic Satellite Imagery
      const baseImagery = L.tileLayer(SATELLITE_TILES.imagery, {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, USDA, USGS',
        maxZoom: 19
      }).addTo(map);

      // Real Geographic Boundaries & Places labels (Hybrid view matching Image 1)
      const placesOverlay = L.tileLayer(SATELLITE_TILES.placesOverlay, {
        maxZoom: 19,
        pane: 'overlayPane'
      }).addTo(map);

      // Roads & Highways overlay over satellite
      const roadsOverlay = L.tileLayer(SATELLITE_TILES.roadsOverlay, {
        maxZoom: 19,
        pane: 'overlayPane'
      }).addTo(map);

      activeTileLayersRef.current = [baseImagery, placesOverlay, roadsOverlay];
    } else {
      // Clean Road Map
      const roadLayer = L.tileLayer(SATELLITE_TILES.roadmap, {
        attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, TomTom',
        maxZoom: 19
      }).addTo(map);

      activeTileLayersRef.current = [roadLayer];
    }
  };

  // Initialize Map Engine (Defaults to SATELLITE imagery)
  useEffect(() => {
    let isMounted = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_MAPS_API_KEY;

    async function initLeaflet() {
      try {
        const L = await loadLeafletLibrary();
        if (!isMounted || !mapContainerRef.current) return;

        if (mapRef.current && mapRef.current.remove) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [center[0], center[1]],
          zoom: zoom,
          zoomControl: false,
        });

        // Bottom-right Google Maps style zoom control
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Apply genuine satellite imagery initially
        applyLeafletTileLayers(map, 'satellite');

        mapRef.current = map;
        setMapEngine('leaflet');
        setMapLoaded(true);
        setMapError(null);
      } catch (err) {
        console.error('Leaflet initialization error:', err);
        if (isMounted) {
          setMapError({
            type: 'LOAD_ERROR',
            title: 'Satellite Engine Offline',
            message: 'Unable to initialize satellite raster tiles.',
            action: 'Please verify your internet connection and reload.'
          });
        }
      }
    }

    async function initGoogle() {
      try {
        setOptions({
          apiKey: apiKey,
          version: "weekly",
        });

        window.gm_authFailure = () => {
          console.warn("Google Maps Auth Failed. Switching to satellite imagery layer.");
          initLeaflet();
        };

        const { Map } = await importLibrary("maps");
        await importLibrary("marker");

        if (!isMounted || !mapContainerRef.current) return;

        // Initialize with real Google Maps HYBRID satellite imagery (Image 1 style)
        const map = new Map(mapContainerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: zoom,
          mapTypeId: 'hybrid', // Real satellite imagery with roads and labels
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps?.ControlPosition?.RIGHT_BOTTOM || 9,
          },
          mapId: 'DEMO_MAP_ID',
        });

        mapRef.current = map;
        setMapEngine('google');
        setMapLoaded(true);
        setMapError(null);
      } catch (e) {
        console.warn("Google Maps init failed, switching to satellite imagery:", e?.message || e);
        initLeaflet();
      }
    }

    if (apiKey && apiKey.startsWith('AIza')) {
      initGoogle();
    } else {
      initLeaflet();
    }

    return () => {
      isMounted = false;
      if (mapRef.current && mapRef.current.remove) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Satellite <-> Roadmap Mode Switch
  const handleSwitchViewMode = (newMode) => {
    if (newMode === viewMode) return;
    setViewMode(newMode);

    if (mapEngine === 'google' && mapRef.current) {
      if (newMode === 'satellite') {
        mapRef.current.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      } else {
        mapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      }
    } else if (mapEngine === 'leaflet' && mapRef.current) {
      applyLeafletTileLayers(mapRef.current, newMode);
    }
  };

  // Update Markers and Routes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (mapEngine === 'google') {
      const map = mapRef.current;
      markersRef.current.forEach(m => m.map = null);
      markersRef.current = [];
      routeLayerRef.current.forEach(r => r.setMap(null));
      routeLayerRef.current = [];

      // Only plot stations with valid numeric coordinates so one bad record can't crash the map
      const mappableStations = stations.filter(hasValidCoords);
      if (mappableStations.length === 0) return;

      const bounds = new window.google.maps.LatLngBounds();

      mappableStations.forEach(station => {
        const isSelected = selectedStation?.id === station.id;
        const isAvailable = (station.availableChargers || 0) > 0;
        const maxKw = Math.max(...(station.chargers || []).map(c => c.powerKw || 0), 60);

        const markerContent = document.createElement('div');
        markerContent.className = `custom-ev-marker ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'occupied'}`;
        markerContent.innerHTML = `
          <div class="marker-pulse-ring"></div>
          <div class="marker-inner-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          ${isSelected ? `<div class="marker-kw-pill">${maxKw} kW</div>` : ''}
        `;

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: station.latitude, lng: station.longitude },
          content: markerContent,
          title: station.name,
        });

        marker.addListener('click', () => {
          if (onSelectStation) onSelectStation(station);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: station.latitude, lng: station.longitude });
      });

      if (selectedStation && hasValidCoords(selectedStation)) {
        const targetLat = selectedStation.latitude;
        const targetLng = selectedStation.longitude;
        const originLat = targetLat - 0.012;
        const originLng = targetLng - 0.014;

        const routePoints = [
          { lat: originLat, lng: originLng },
          { lat: originLat + 0.004, lng: originLng + 0.002 },
          { lat: originLat + 0.008, lng: originLng + 0.009 },
          { lat: targetLat, lng: targetLng }
        ];

        // High-contrast casing outline over satellite imagery
        const routeCasing = new window.google.maps.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: '#000000',
          strokeOpacity: 0.9,
          strokeWeight: 7,
          map: map
        });

        // Vibrant electric-lime route line
        const routeLine = new window.google.maps.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: '#B8FF00',
          strokeOpacity: 1,
          strokeWeight: 4,
          map: map
        });

        routeLayerRef.current.push(routeCasing, routeLine);

        const vehicleContent = document.createElement('div');
        vehicleContent.innerHTML = `
          <div class="ev-car-marker-container">
            <div class="battery-status-tag">45%</div>
            <div class="car-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `;

        const vehicleMarker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: originLat, lng: originLng },
          content: vehicleContent,
        });

        routeLayerRef.current.push(vehicleMarker);
        map.panTo({ lat: targetLat, lng: targetLng });
        map.setZoom(14);
      } else if (stations.length > 0) {
        map.fitBounds(bounds);
      }
    } else if (mapEngine === 'leaflet') {
      const L = window.L;
      if (!L) return;
      const map = mapRef.current;

      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
      routeLayerRef.current.forEach(r => map.removeLayer(r));
      routeLayerRef.current = [];

      // Only plot stations with valid numeric coordinates so one bad record can't crash the map
      const mappableStations = stations.filter(hasValidCoords);
      if (mappableStations.length === 0) return;

      const group = [];

      mappableStations.forEach(station => {
        const isSelected = selectedStation?.id === station.id;
        const isAvailable = (station.availableChargers || 0) > 0;
        const maxKw = Math.max(...(station.chargers || []).map(c => c.powerKw || 0), 60);

        const markerHtml = `
          <div class="custom-ev-marker ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'occupied'}">
            <div class="marker-pulse-ring"></div>
            <div class="marker-inner-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            ${isSelected ? `<div class="marker-kw-pill">${maxKw} kW</div>` : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'leaflet-custom-div-icon',
          html: markerHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([station.latitude, station.longitude], { icon, title: station.name }).addTo(map);
        marker.on('click', () => {
          if (onSelectStation) onSelectStation(station);
        });

        markersRef.current.push(marker);
        group.push([station.latitude, station.longitude]);
      });

      if (selectedStation && hasValidCoords(selectedStation)) {
        const targetLat = selectedStation.latitude;
        const targetLng = selectedStation.longitude;
        const originLat = targetLat - 0.012;
        const originLng = targetLng - 0.014;

        const routePoints = [
          [originLat, originLng],
          [originLat + 0.004, originLng + 0.002],
          [originLat + 0.008, originLng + 0.009],
          [targetLat, targetLng]
        ];

        // High-contrast black casing outline for clear visibility on satellite photography
        const casingLine = L.polyline(routePoints, {
          color: '#000000',
          weight: 6.5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // Glowing electric-lime route line
        const routeLine = L.polyline(routePoints, {
          color: '#B8FF00',
          weight: 3.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        routeLayerRef.current.push(casingLine, routeLine);

        const carHtml = `
          <div class="ev-car-marker-container">
            <div class="battery-status-tag">45%</div>
            <div class="car-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `;

        const carIcon = L.divIcon({
          className: 'leaflet-custom-div-icon',
          html: carHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const vehicleMarker = L.marker([originLat, originLng], { icon: carIcon }).addTo(map);
        routeLayerRef.current.push(vehicleMarker);

        map.setView([targetLat, targetLng], 14, { animate: true });
      } else if (group.length > 0) {
        map.fitBounds(group, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [stations, selectedStation, onSelectStation, mapLoaded, mapEngine]);

  if (mapError) {
    return (
      <div className="satellite-map-outer-container map-fallback-error-state">
        <div className="fallback-content">
          <AlertTriangle className="error-icon" size={44} />
          <h3>{mapError.title || 'Satellite Map Unavailable'}</h3>
          <p className="fallback-desc">{mapError.message || "We're unable to load satellite imagery."}</p>
          <button className="fallback-retry-btn" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="satellite-map-outer-container">
      {/* Top Floating Header with Status & Mode Toggle */}
      <div className="map-live-status-badge">
        <span className="live-pulsing-dot"></span>
        <span className="live-status-title">ChargerGo Live GPS Grid</span>
        <span className="live-count-divider">•</span>
        <span className="live-station-count">{stations.length} Active Stations</span>
        <span className="map-provider-tag">
          {mapEngine === 'google' ? 'Google Maps' : 'Satellite Imagery'}
        </span>

        {/* Compact Satellite | Roadmap Switcher */}
        <div className="map-view-toggle-pill">
          <button
            type="button"
            className={`view-toggle-tab ${viewMode === 'satellite' ? 'active' : ''}`}
            onClick={() => handleSwitchViewMode('satellite')}
            title="Real Satellite Imagery"
          >
            <Globe size={12} />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            className={`view-toggle-tab ${viewMode === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleSwitchViewMode('roadmap')}
            title="Standard Road Map"
          >
            <MapIcon size={12} />
            <span>Roadmap</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="satellite-map-canvas-node" />

      <style>{`
        .satellite-map-outer-container {
          width: 100%;
          height: 100%;
          min-height: 520px;
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #050B14;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        }

        .satellite-map-canvas-node {
          width: 100%;
          height: 100%;
          min-height: 520px;
          background: #050B14;
        }

        .leaflet-custom-div-icon {
          background: transparent !important;
          border: none !important;
        }

        /* Floating Top Bar (High Contrast Glassmorphism over Satellite Imagery) */
        .map-live-status-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 500;
          background: rgba(8, 11, 15, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(184, 255, 0, 0.3);
          padding: 0.45rem 0.9rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
        }

        .live-pulsing-dot {
          width: 8px;
          height: 8px;
          background-color: #B8FF00;
          border-radius: 50%;
          box-shadow: 0 0 10px #B8FF00;
          animation: pulse-dot 2s infinite;
        }

        .live-status-title {
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.3px;
        }

        .live-count-divider {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.8rem;
        }

        .live-station-count {
          color: #9CA3AF;
          font-size: 0.8rem;
        }

        .map-provider-tag {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #9CA3AF;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        /* Compact Satellite | Roadmap Toggle Pill */
        .map-view-toggle-pill {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px;
          border-radius: 16px;
          margin-left: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .view-toggle-tab {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #9CA3AF;
          padding: 3px 9px;
          border-radius: 14px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-toggle-tab:hover {
          color: #FFFFFF;
        }

        .view-toggle-tab.active {
          background: #B8FF00;
          color: #080B0F;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(184, 255, 0, 0.4);
        }

        @keyframes pulse-dot {
          0% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(184, 255, 0, 0.7); }
          70% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(184, 255, 0, 0); }
          100% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(184, 255, 0, 0); }
        }

        /* Electric Lime Station Markers Glowing on Satellite Imagery */
        .custom-ev-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          cursor: pointer;
        }

        .marker-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid rgba(184, 255, 0, 0.6);
          animation: map-pulse 2s infinite;
        }

        .marker-inner-icon {
          width: 30px;
          height: 30px;
          background: #080B0F;
          border: 2px solid #374151;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
          transition: all 0.2s ease;
          z-index: 2;
        }

        .custom-ev-marker.available .marker-inner-icon {
          background: #080B0F;
          border-color: #B8FF00;
          color: #B8FF00;
          box-shadow: 0 0 14px rgba(184, 255, 0, 0.5);
        }

        .custom-ev-marker.selected .marker-inner-icon {
          background: #B8FF00;
          border-color: #080B0F;
          color: #080B0F;
          transform: scale(1.15);
          box-shadow: 0 0 20px rgba(184, 255, 0, 0.8);
        }

        .custom-ev-marker.selected .marker-pulse-ring {
          border-color: #B8FF00;
          inset: -8px;
          animation: map-pulse-strong 1.5s infinite;
        }

        .marker-kw-pill {
          position: absolute;
          top: -26px;
          background: #080B0F;
          border: 1.5px solid #B8FF00;
          color: #B8FF00;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.7);
          z-index: 4;
        }

        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes map-pulse-strong {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        /* Vehicle Navigation Marker */
        .ev-car-marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
        }

        .battery-status-tag {
          position: absolute;
          top: -18px;
          background: #080B0F;
          border: 1.5px solid #B8FF00;
          color: #B8FF00;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        }

        .car-icon-badge {
          width: 34px;
          height: 34px;
          background: #080B0F;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.7);
        }

        /* Google Maps Style Clean Zoom Controls */
        .leaflet-container .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          overflow: hidden;
          background: rgba(8, 11, 15, 0.9) !important;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
          margin-right: 14px !important;
          margin-bottom: 14px !important;
        }

        .leaflet-container .leaflet-control-zoom a {
          background: transparent !important;
          color: #F3F4F6 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }

        .leaflet-container .leaflet-control-zoom a:hover {
          background: #18202F !important;
          color: #B8FF00 !important;
        }

        .leaflet-container .leaflet-control-attribution {
          background: rgba(8, 11, 15, 0.85) !important;
          color: #9CA3AF !important;
          font-size: 10px !important;
          border-top-left-radius: 4px;
          padding: 2px 8px !important;
        }

        .leaflet-container .leaflet-control-attribution a {
          color: #B8FF00 !important;
          text-decoration: none;
        }

        .leaflet-container .leaflet-control-attribution a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
