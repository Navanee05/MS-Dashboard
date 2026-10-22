import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  TrendingUp, 
  Layers, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  Activity 
} from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const user = getCurrentUser() || {
    name: 'Admin User',
    email: 'admin@marketingstar.io',
    role: 'Admin'
  };

  // Static mock stats for dashboard visual premium feel
  const stats = [
    { label: 'Total Revenue', value: '$84,249.12', change: '+12.4%', icon: DollarSign, trend: 'up' },
    { label: 'Active Campaigns', value: '48 Campaigns', change: '+8.2%', icon: Layers, trend: 'up' },
    { label: 'Total Audience Reach', value: '1.2M Users', change: '+24.1%', icon: Users, trend: 'up' },
  ];

  return (
    <div className="dashboard-body-wrapper">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome Back, {user.name}</h1>
          <p>Here is the overview of your marketing operations and system authorization status.</p>
        </div>
        <div className="welcome-time-badge">
          <span className="pulse-dot"></span>
          <span>API Gateway Node Active</span>
        </div>
      </section>

      {/* Stats Row */}
      <section className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{stat.label}</span>
              <div className="stat-card-icon-wrapper">
                <stat.icon size={20} />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{stat.value}</h3>
              <div className="stat-card-trend up">
                <ArrowUpRight size={14} />
                <span>{stat.change} vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Profile Details + Integration Panel */}
      <section className="dashboard-layout-grid">
        {/* User Details Box */}
        <div className="profile-details-card">
          <div className="card-header">
            <h2>User Profile Credentials</h2>
            <p>Your authentication credentials and authorization privileges</p>
          </div>

          <div className="details-list">
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <UserIcon size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user.name}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Mail size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Shield size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">System Role</span>
                <span className="detail-value">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* .NET Core Compatibility Panel */}
        <div className="integration-info-card">
          <div className="card-header">
            <h2>.NET Core API Settings</h2>
            <p>Active security session headers and routes</p>
          </div>

          <div className="integration-body">
            <div className="api-config-block">
              <span className="block-title">Backend API Base</span>
              <code>https://localhost:5001/api</code>
            </div>

            <div className="api-config-block">
              <span className="block-title">Required Headers</span>
              <pre className="code-pre">
{`{
  "Content-Type": "application/json",
  "x-api-key": "MARKETING_STAR_STATIC_KEY",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI..."
}`}
              </pre>
            </div>

            <div className="connection-status-box">
              <div className="connection-header">
                <span className="connection-status-dot"></span>
                <span className="connection-status-title">Axios Interceptor Enabled</span>
              </div>
              <p>The Axios client request interceptor is automatically appending the active Bearer JWT token from localStorage to all outbound requests.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
