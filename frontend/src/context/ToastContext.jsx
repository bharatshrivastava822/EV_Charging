import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      right: '1.25rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      maxWidth: '360px',
      width: '100%'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          background: '#FFFFFF',
          border: `1px solid ${toast.type === 'error' ? '#FECACA' : toast.type === 'success' ? '#B7E4C7' : '#DDE2DE'}`,
          borderLeft: `3px solid ${toast.type === 'error' ? '#DC2626' : toast.type === 'success' ? '#16803C' : toast.type === 'warning' ? '#D97706' : '#2563EB'}`,
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
          fontSize: '0.875rem',
          color: '#1D2421',
          animation: 'slideInRight 0.2s ease-out'
        }}>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B746F', fontSize: '1rem', lineHeight: 1, padding: 0
          }}>×</button>
        </div>
      ))}
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
