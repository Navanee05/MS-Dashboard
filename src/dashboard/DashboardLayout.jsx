import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconWorld,
  IconActivity,
  IconUsers,
  IconLogout
} from '@tabler/icons-react';
import { logoutUser } from '../services/authService';
import { fetchAccounts } from '../api/accountService';
import { getOverviewData, getGeographyData } from '../api/dashboardApi';
import { fetchVersiumPartnerKpis } from '../api/partnerService';
import './DashboardLayout.css';
import './Dashboard.css';

const navItems = [
  { path: '/dashboard/overview', label: 'Portfolio Overview', icon: IconLayoutDashboard },
  { path: '/dashboard/geo', label: 'Geography', icon: IconWorld },
  { path: '/dashboard/health', label: 'Health & Risk', icon: IconActivity },
  { path: '/dashboard/partner', label: 'Partners', icon: IconUsers },
];

const DashboardLayout = () => {
  const navigate = useNavigate();

  // Background warm-up / prefetch all dashboard data so tab switches are instantaneous
  useEffect(() => {
    fetchAccounts().catch(() => {});
    getOverviewData().catch(() => {});
    getGeographyData().catch(() => {});
    fetchVersiumPartnerKpis().catch(() => {});
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img
            src="/image/logo.jpg"
            alt="MarketingStar Logo"
            className="sidebar-logo-img"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
          <div>
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

        <div className="sidebar-bottom">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <IconLogout size={18} stroke={2} />
            <span>Sign Out</span>
          </button>
        </div>
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

