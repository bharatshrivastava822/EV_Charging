import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Clock, 
  LogOut, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Wrench
} from 'lucide-react';

export default function OperatorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: '#FFFFFF' }}>
      {/* Top Banner / Operator Navigation Bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.85rem 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--primary-contrast)' }}>
                <Zap size={20} fill="currentColor" />
              </span>
              Charger<span style={{ color: 'var(--primary)' }}>Go</span>
            </Link>

            <span style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', color: '#60A5FA', fontWeight: 600 }}>
              <Building2 size={14} /> Station Operator Hub
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>

            <Link to="/stations" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={14} /> Public Map
            </Link>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Nav Tabs */}
      <div style={{ background: '#0F131C', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <NavLink
            to="/operator"
            end
            className={({ isActive }) => `operator-tab ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              padding: '0.85rem 1.25rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            })}
          >
            <LayoutDashboard size={16} /> Dashboard Overview
          </NavLink>

          <NavLink
            to="/operator/stations"
            className={({ isActive }) => `operator-tab ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              padding: '0.85rem 1.25rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            })}
          >
            <MapPin size={16} /> My Stations & Chargers
          </NavLink>

          <NavLink
            to="/operator/slots"
            className={({ isActive }) => `operator-tab ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              padding: '0.85rem 1.25rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            })}
          >
            <Clock size={16} /> Time Slot Manager
          </NavLink>

          <NavLink
            to="/operator/bookings"
            className={({ isActive }) => `operator-tab ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              padding: '0.85rem 1.25rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            })}
          >
            <Calendar size={16} /> Station Reservations
          </NavLink>

          <NavLink
            to="/operator/maintenance"
            className={({ isActive }) => `operator-tab ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              padding: '0.85rem 1.25rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            })}
          >
            <Wrench size={16} /> Maintenance & Faults
          </NavLink>
        </div>
      </div>

      {/* Main Page Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

