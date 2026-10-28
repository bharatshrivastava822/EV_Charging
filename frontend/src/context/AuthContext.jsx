import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const userObj = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      operatorStatus: data.operatorStatus || 'NONE'
    };
    setUser(userObj);
    return userObj;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isOperator = () => user?.role === 'STATION_OPERATOR';
  const isApprovedOperator = () => user?.role === 'STATION_OPERATOR' && user?.operatorStatus === 'APPROVED';
  const isPendingOperator = () => user?.role === 'STATION_OPERATOR' && user?.operatorStatus === 'PENDING';
  const isDriver = () => !user || user?.role === 'DRIVER' || user?.role === 'USER';
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isOperator,
        isApprovedOperator,
        isPendingOperator,
        isDriver,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
