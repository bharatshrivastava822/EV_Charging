import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, Building2, CalendarCheck, Users, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={16} />, end: true },
  { to: '/admin/stations', label: 'Station Management', icon: <Building2 size={16} /> },
  { to: '/admin/bookings', label: 'All Bookings', icon: <CalendarCheck size={16} /> },
  { to: '/admin/users', label: 'Registered Drivers', icon: <Users size={16} /> }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : 0,
        bottom: 0,
        zIndex: 900,
        transition: 'left 0.22s ease'
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--primary)', color: 'var(--primary-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Charger<span style={{ color: 'var(--primary)' }}>Go</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>
              Operations Console
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.12s'
              })}
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Operator: <strong style={{ color: '#FFFFFF' }}>{user?.name || 'Administrator'}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm btn-block"
            style={{ fontSize: '0.8rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ChargerGo Network Operations Console
          </div>
          <Link to="/" style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <ArrowLeft size={14} /> Switch to Driver Map
          </Link>
        </div>

        <main style={{ flex: 1, padding: '1.75rem 1.75rem 3rem' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { left: -240px; }
          aside.open { left: 0; }
          div[style*="margin-left: 240px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
