import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, adminOnly = false, operatorOnly = false, requireApprovedOperator = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to={user.role === 'STATION_OPERATOR' ? '/operator' : '/dashboard'} replace />;
  }

  if (operatorOnly && user.role !== 'STATION_OPERATOR' && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireApprovedOperator && user.role === 'STATION_OPERATOR' && user.operatorStatus !== 'APPROVED') {
    return <Navigate to="/operator/status" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'STATION_OPERATOR') {
      return <Navigate to={user.operatorStatus === 'APPROVED' ? '/operator' : '/operator/status'} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
