import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  MapPin,
  Calendar,
  History,
  ShieldCheck,
  HelpCircle,
  Globe,
  Radio
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="header-master-wrapper">
      {/* 1. TOP UTILITY BAR (Reference 2 style) */}
      <div className="top-utility-bar">
        <div className="top-utility-inner">
          <div className="utility-left">
            <span className="initiative-badge">
              <Radio size={12} color="var(--primary)" /> IN • CHARGERGO EV NETWORK
            </span>
            <span>|</span>
            <span>National Clean Energy & Mobility Infrastructure Initiative</span>
          </div>
          <div className="utility-right">
            <a href="#map-section" className="utility-link">Skip to Map</a>
            <span style={{ opacity: 0.3 }}>|</span>
            <span className="utility-link" onClick={() => alert('ChargerGo 24x7 Helpline: 1800-EV-POWER')}>
              <HelpCircle size={12} /> Help & Support
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span className="utility-link">
              <Globe size={12} /> English (IN)
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER (Reference 2 layout + Reference 1 branding) */}
      <div className="main-brand-header">
        <div className="brand-header-inner">
          {/* Logo & Product Title */}
          <Link to="/" className="brand-identity-box" onClick={closeMobile}>
            <div className="brand-icon-square">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="brand-titles">
              <div className="brand-logo-text">
                Charger<span className="green-accent">Go</span>
              </div>
              <div className="brand-subtitle-tag">
                EV Charging & Mobility Infrastructure Platform
              </div>
            </div>
          </Link>

          {/* Right Side Header Controls */}
          <div className="header-controls-box">
            {user ? (
              <>
                <span className="role-badge-pill">
                  <ShieldCheck size={13} color="var(--primary)" />
                  {isAdmin() ? 'Operator Mode' : 'Driver Mode'}
                </span>

                {/* User Dropdown */}
                <div className="user-menu-box">
                  <button
                    className="user-profile-trigger"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                  >
                    <div className="user-avatar-circle">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>{user.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={13} />
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown-popover">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{user.name}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                        <span className={`badge badge-${isAdmin() ? 'warning' : 'available'}`} style={{ marginTop: '0.35rem', fontSize: '0.7rem' }}>
                          ● {user.role === 'ADMIN' ? 'Administrator' : 'EV Driver'}
                        </span>
                      </div>

                      {!isAdmin() && (
                        <>
                          <Link to="/dashboard" className="dropdown-action-btn" onClick={() => setUserMenuOpen(false)}>
                            <Zap size={14} color="var(--primary)" /> Driver Dashboard
                          </Link>
                          <Link to="/profile" className="dropdown-action-btn" onClick={() => setUserMenuOpen(false)}>
                            <User size={14} /> My Profile
                          </Link>
                          <Link to="/history" className="dropdown-action-btn" onClick={() => setUserMenuOpen(false)}>
                            <History size={14} /> Charging History
                          </Link>
                        </>
                      )}

                      {isAdmin() && (
                        <Link to="/admin" className="dropdown-action-btn" onClick={() => setUserMenuOpen(false)}>
                          <Settings size={14} color="var(--primary)" /> Admin Console
                        </Link>
                      )}

                      <button className="dropdown-action-btn danger" onClick={handleLogout}>
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobile}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobile}>
                  Register Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY HORIZONTAL NAVIGATION (Reference 2 style) */}
      <nav className="primary-horizontal-nav">
        <div className="horizontal-nav-inner">
          <div className={`nav-links-list ${mobileOpen ? 'open' : ''}`}>
            {mobileOpen && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Navigation Menu</span>
                <button onClick={closeMobile} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            )}

            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile} end>
              HOME
            </NavLink>

            <NavLink to="/stations" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
              FIND CHARGERS
            </NavLink>

            {user && !isAdmin() && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  DASHBOARD
                </NavLink>
                <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  MY BOOKINGS
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  CHARGING HISTORY
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  PROFILE
                </NavLink>
              </>
            )}

            {isAdmin() && (
              <>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-tab-item active admin-console-link' : 'nav-tab-item admin-console-link')} onClick={closeMobile} end>
                  ADMIN DASHBOARD
                </NavLink>
                <NavLink to="/admin/stations" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  STATIONS
                </NavLink>
                <NavLink to="/admin/slots" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  SLOTS
                </NavLink>
                <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  BOOKINGS
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'nav-tab-item active' : 'nav-tab-item')} onClick={closeMobile}>
                  USERS
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {userMenuOpen && <div className="nav-backdrop" onClick={() => setUserMenuOpen(false)} />}
      {mobileOpen && <div className="nav-backdrop" onClick={closeMobile} />}
    </header>
  );
}
