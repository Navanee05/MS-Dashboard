import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';
import Overview from '../dashboard/pages/Overview';
import Geography from '../dashboard/pages/Geography';
import Health from '../dashboard/pages/Health';
import Partners from '../dashboard/pages/Partners';

const AppRoutes = () => (
  <Routes>
    {/* Root redirect */}
    <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />

    {/* Dashboard */}
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<Overview />} />
      <Route path="geo" element={<Geography />} />
      <Route path="health" element={<Health />} />
      <Route path="partner" element={<Partners />} />
    </Route>

    {/* Wildcard fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;