import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StationList from './pages/StationList';
import StationDetail from './pages/StationDetail';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import ChargingHistory from './pages/ChargingHistory';
import BookingConfirmation from './pages/BookingConfirmation';
import Profile from './pages/Profile';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStations from './pages/admin/AdminStations';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSlots from './pages/admin/AdminSlots';

function UserLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes with horizontal navbar */}
            <Route path="/" element={<UserLayout><Home /></UserLayout>} />
            <Route path="/stations" element={<UserLayout><StationList /></UserLayout>} />
            <Route path="/stations/:id" element={<UserLayout><StationDetail /></UserLayout>} />

            {/* Auth routes */}
            <Route path="/login" element={<UserLayout><PublicRoute><Login /></PublicRoute></UserLayout>} />
            <Route path="/register" element={<UserLayout><PublicRoute><Register /></PublicRoute></UserLayout>} />

            {/* Protected user routes */}
            <Route path="/dashboard" element={<UserLayout><ProtectedRoute><Dashboard /></ProtectedRoute></UserLayout>} />
            <Route path="/bookings" element={<UserLayout><ProtectedRoute><MyBookings /></ProtectedRoute></UserLayout>} />
            <Route path="/history" element={<UserLayout><ProtectedRoute><ChargingHistory /></ProtectedRoute></UserLayout>} />
            <Route path="/bookings/:id" element={<UserLayout><ProtectedRoute><BookingConfirmation /></ProtectedRoute></UserLayout>} />
            <Route path="/booking-confirmation/:id" element={<UserLayout><ProtectedRoute><BookingConfirmation /></ProtectedRoute></UserLayout>} />
            <Route path="/profile" element={<UserLayout><ProtectedRoute><Profile /></ProtectedRoute></UserLayout>} />

            {/* Admin enterprise routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="stations" element={<AdminStations />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="slots" element={<AdminSlots />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
