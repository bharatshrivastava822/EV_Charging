import React, { useEffect, useRef, useState } from 'react';
import { Zap, Navigation, MapPin, BatteryCharging, Radio, AlertTriangle } from 'lucide-react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#021019" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
  { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] }
];

export default function GoogleMapView({
  stations = [],
  selectedStation = null,
  onSelectStation,
  center = [22.7533, 75.8937], // Default Indore center
  zoom = 13
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef([]);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Custom auth failure handler
    window.gm_authFailure = () => {
      setMapError(true);
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError(true);
      return;
    }

    let isMounted = true;

    async function initMap() {
      try {
        setOptions({
          apiKey: apiKey,
          version: "weekly",
        });

        const { Map } = await importLibrary("maps");
        await importLibrary("marker");

        if (!isMounted || !mapContainerRef.current) return;

        const map = new Map(mapContainerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: zoom,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps?.ControlPosition?.RIGHT_BOTTOM || 9,
          },
          styles: DARK_MAP_STYLES,
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        });

        mapRef.current = map;
        setMapLoaded(true);
      } catch (e) {
        console.error("Google Maps failed to load", e);
        if (isMounted) {
          setMapError(true);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Clear existing
    markersRef.current.forEach(m => m.map = null);
    markersRef.current = [];
    routeLayerRef.current.forEach(r => r.setMap(null));
    routeLayerRef.current = [];

    if (stations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    stations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const isAvailable = (station.availableChargers || 0) > 0;
      const maxKw = Math.max(...(station.chargers || []).map(c => c.powerKw || 0), 60);

      const markerContent = document.createElement('div');
      markerContent.className = `custom-ev-marker ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'occupied'}`;
      markerContent.innerHTML = `
        <div class="marker-pulse-ring"></div>
        <div class="marker-inner-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
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
        if (onSelectStation) {
          onSelectStation(station);
        }
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: station.latitude, lng: station.longitude });
    });

    if (selectedStation) {
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

      const routeLine = new window.google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: '#B8FF00',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map: map
      });

      const routeGlow = new window.google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: '#B8FF00',
        strokeOpacity: 0.35,
        strokeWeight: 8,
        map: map
      });

      routeLayerRef.current.push(routeLine, routeGlow);

      // Vehicle Marker
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
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 14) map.setZoom(14);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [stations, selectedStation, onSelectStation, mapLoaded]);

  if (mapError) {
    return (
      <div className="dark-map-outer-container map-fallback-error-state">
        <div className="fallback-content">
          <AlertTriangle className="error-icon" size={48} />
          <h3>Map unavailable</h3>
          <p>We're unable to load the live map right now. Please check your map service configuration.</p>
          <button className="fallback-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
        <style>{`
          .map-fallback-error-state {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #050505;
            min-height: 520px;
            border-radius: var(--radius-md);
            border: 1px solid rgba(255,255,255,0.05);
          }
          .fallback-content {
            text-align: center;
            color: #888;
            max-width: 400px;
            padding: 2rem;
          }
          .error-icon {
            color: #ff3366;
            margin-bottom: 1rem;
          }
          .fallback-content h3 {
            color: #fff;
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }
          .fallback-content p {
            margin-bottom: 1.5rem;
            line-height: 1.5;
            font-size: 0.95rem;
          }
          .fallback-retry-btn {
            background: #111;
            border: 1px solid #333;
            color: #fff;
            padding: 0.5rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .fallback-retry-btn:hover {
            background: #222;
            border-color: #555;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dark-map-outer-container">
      <div className="map-live-status-badge">
        <span className="live-pulsing-dot"></span>
        <span className="live-status-title">ChargerGo Live GPS Grid</span>
        <span className="live-count-divider">•</span>
        <span className="live-station-count">{stations.length} Active Stations</span>
      </div>

      <div ref={mapContainerRef} className="leaflet-map-canvas-node" />

      <style>{`
        .dark-map-outer-container {
          width: 100%;
          height: 100%;
          min-height: 520px;
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #050505;
        }

        .leaflet-map-canvas-node {
          width: 100%;
          height: 100%;
          min-height: 520px;
          background: #050505;
        }

        .map-live-status-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 500;
          background: rgba(13, 15, 14, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(184, 255, 0, 0.15);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .live-pulsing-dot {
          width: 8px;
          height: 8px;
          background-color: #B8FF00;
          border-radius: 50%;
          box-shadow: 0 0 8px #B8FF00;
          animation: pulse-dot 2s infinite;
        }

        .live-status-title {
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }

        .live-count-divider {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
        }

        .live-station-count {
          color: #888;
          font-size: 0.8rem;
        }

        @keyframes pulse-dot {
          0% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(184, 255, 0, 0.7); }
          70% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(184, 255, 0, 0); }
          100% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(184, 255, 0, 0); }
        }

        /* Marker CSS preserved from original */
        .custom-ev-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          cursor: pointer;
        }

        .marker-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(184, 255, 0, 0.3);
          animation: map-pulse 2s infinite;
        }

        .marker-inner-icon {
          width: 28px;
          height: 28px;
          background: #111;
          border: 2px solid #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .custom-ev-marker.available .marker-inner-icon {
          border-color: #B8FF00;
          color: #B8FF00;
          background: rgba(184, 255, 0, 0.1);
        }

        .custom-ev-marker.selected .marker-inner-icon {
          background: #B8FF00;
          color: #000;
          transform: scale(1.15);
          box-shadow: 0 0 15px rgba(184, 255, 0, 0.5);
        }

        .custom-ev-marker.selected .marker-pulse-ring {
          border-color: #B8FF00;
          inset: -8px;
          animation: map-pulse-strong 1.5s infinite;
        }

        .marker-kw-pill {
          position: absolute;
          top: -24px;
          background: #B8FF00;
          color: #000;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          z-index: 3;
        }

        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes map-pulse-strong {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        /* Vehicle Marker preserved from original */
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
          top: -16px;
          background: rgba(184, 255, 0, 0.15);
          border: 1px solid rgba(184, 255, 0, 0.5);
          color: #B8FF00;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .car-icon-badge {
          width: 32px;
          height: 32px;
          background: #000;
          border: 2px solid #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
