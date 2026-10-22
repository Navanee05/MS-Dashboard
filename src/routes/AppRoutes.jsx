import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import DashboardLayout from '../dashboard/DashboardLayout';
import Overview  from '../dashboard/pages/Overview';
import Geography from '../dashboard/pages/Geography';
import Health    from '../dashboard/pages/Health';
import Partners  from '../dashboard/pages/Partners';
import { isAuthenticated } from '../services/authService';

/**
 * Route protection wrapper.
 * Redirects to /login if user is not authenticated.
 */
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Root redirect */}
    <Route
      path="/"
      element={
        isAuthenticated()
          ? <Navigate to="/dashboard/overview" replace />
          : <Navigate to="/login" replace />
      }
    />

    {/* Login */}
    <Route path="/login" element={<Login />} />

    {/* Protected Dashboard — nested routes rendered via <Outlet> in DashboardLayout */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      {/* Default → Overview */}
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"  element={<Overview />}  />
      <Route path="geo"       element={<Geography />} />
      <Route path="health"    element={<Health />}    />
      <Route path="partner"   element={<Partners />}  />
    </Route>

    {/* Wildcard fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
