import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, User, Settings } from 'lucide-react';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')} end>
        <MapPin size={18} />
        <span>Map</span>
      </NavLink>

      <NavLink to="/stations" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
        <Calendar size={18} />
        <span>Stations</span>
      </NavLink>

      {user && !isAdmin() && (
        <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Clock size={18} />
          <span>Bookings</span>
        </NavLink>
      )}

      {user ? (
        isAdmin() ? (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
            <Settings size={18} />
            <span>Admin</span>
          </NavLink>
        ) : (
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        )
      ) : (
        <NavLink to="/login" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <User size={18} />
          <span>Sign In</span>
        </NavLink>
      )}
    </nav>
  );
}
