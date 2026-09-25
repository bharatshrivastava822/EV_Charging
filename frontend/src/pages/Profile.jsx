import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, ShieldCheck, Zap, LogOut, Car, Lock, Settings, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    model: 'Tata Nexon EV Max / Long Range',
    batteryCapacity: '40.5 kWh',
    connector: 'CCS2 (DC Fast)',
    regNumber: 'MP 09 EV 4821'
  });

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleSaveSettings = () => {
    addToast('Profile & Vehicle settings saved successfully.', 'success');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '780px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <div className="gov-pill-tag">
            <User size={13} /> Driver ID Account
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Driver Profile & Vehicle Configuration
          </h1>
        </div>
        <button className="btn btn-danger-outline btn-sm" onClick={handleSignOut}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Personal Information */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
              <User size={16} color="var(--primary)" /> Personal Information
            </div>
            <span className={`badge badge-${user?.role === 'ADMIN' ? 'warning' : 'available'}`}>
              ● {user?.role === 'ADMIN' ? 'Platform Administrator' : 'Verified EV Driver'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <InfoBlock label="Full Legal Name" value={user?.name || 'Aryan Sharma'} />
            <InfoBlock label="Registered Email" value={user?.email || 'aryan@example.com'} />
            <InfoBlock label="Phone Number" value={user?.phone || '+91 98765 43211'} />
            <InfoBlock label="Account Status" value="Active / Verified" />
          </div>
        </div>

        {/* Section 2: Vehicle Information (Image 1 style) */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
              <Car size={16} color="var(--primary)" /> Registered Vehicle Information
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Default Vehicle</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <InfoBlock label="EV Model & Trim" value={vehicle.model} />
            <InfoBlock label="Battery Pack Size" value={vehicle.batteryCapacity} />
            <InfoBlock label="Primary Fast Connector" value={vehicle.connector} />
            <InfoBlock label="Vehicle Registration" value={vehicle.regNumber} />
          </div>
        </div>

        {/* Section 3: Account & Notification Settings */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
              <Settings size={16} color="var(--primary)" /> Charging Preferences & Notifications
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', color: '#FFFFFF' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
              <span>SMS notifications on confirmed slot reservations and reminders 15 mins prior</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', color: '#FFFFFF' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
              <span>Prefer high-power DC Fast stations (120 kW+) in route recommendations</span>
            </label>
          </div>
        </div>

        {/* Section 4: Security */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
              <Lock size={16} color="var(--primary)" /> Security & Session Credentials
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>Password Protection</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last updated 3 weeks ago • BCrypt encryption active</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => addToast('Password reset link sent to your registered email.', 'info')}>
              <Key size={13} /> Update Password
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Link to="/bookings" className="btn btn-secondary">
            View My Bookings
          </Link>
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
        {value}
      </div>
    </div>
  );
}
