import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconWorld,
  IconActivity,
  IconUsers,
} from '@tabler/icons-react';
import { logoutUser } from '../services/authService';
import { fetchAccounts } from '../api/accountService';
import { getOverviewData, getGeographyData } from '../api/dashboardApi';
import { fetchVersiumPartnerKpis } from '../api/partnerService';
import './DashboardLayout.css';
import './Dashboard.css';

const navItems = [
  { path: '/dashboard/overview', label: 'Portfolio Overview', icon: IconLayoutDashboard },
  { path: '/dashboard/partner', label: 'Partners', icon: IconUsers },
  { path: '/dashboard/geo', label: 'Geography', icon: IconWorld },
  { path: '/dashboard/health', label: 'Health & Risk', icon: IconActivity },
];

const DashboardLayout = () => {

  // Background warm-up / prefetch all dashboard data so tab switches are instantaneous
  useEffect(() => {
    fetchAccounts().catch(() => { });
    getOverviewData().catch(() => { });
    getGeographyData().catch(() => { });
    fetchVersiumPartnerKpis().catch(() => { });
  }, []);

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img
            src={`${import.meta.env.BASE_URL}image/logo.jpg`}
            alt="MarketingStar Logo"
            className="sidebar-logo-img"
            style={{
              width: '55px',
              height: '55px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
          <div>
            <div className="logo-brand">SmartVue</div>
            <div className="logo-text">MarketingStar</div>
            <div className="logo-sub">Customer Intelligence</div>
          </div>
        </div>

        <div className="nav-section">Analytics & Insights</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} stroke={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

      </aside>

      {/* ── Main Content Area ── */}
      <main className="main">
        {/* ── Nested Route View ── */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

