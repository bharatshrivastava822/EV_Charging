import React from 'react';
import { Zap, AlertTriangle, X } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.85rem' }}>
      <div style={{ width: 34, height: 34, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', gap: '0.85rem', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ width: 50, height: 50, border: '1px solid var(--primary-border)', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
        <Zap size={24} fill="currentColor" />
      </div>
      <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{title}</h3>
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '380px', margin: 0 }}>{message}</p>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', gap: '0.85rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ width: 48, height: 48, background: 'var(--danger-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={24} />
      </div>
      <p style={{ color: '#FFFFFF', fontWeight: 600, margin: 0 }}>{message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = '1rem' }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 4,
      background: 'linear-gradient(90deg, #18202F 25%, #222D3E 50%, #18202F 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite'
    }}>
      <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const widths = { sm: 400, md: 560, lg: 740 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: 'var(--surface-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: widths[size], maxHeight: '90vh', overflow: 'auto',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem', borderRadius: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}
