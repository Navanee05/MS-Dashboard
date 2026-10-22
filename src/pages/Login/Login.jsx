import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconUser,
  IconAlertCircle,
  IconLayoutDashboard,
  IconLoader2,
} from '@tabler/icons-react';
import { loginUser, isAuthenticated } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import loginIllustration from '../../assets/login_illustration.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard/overview');
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem('remembered_username');
    if (saved) { setUsername(saved); setRememberMe(true); }
  }, []);

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      await loginUser(username, password);
      if (rememberMe) localStorage.setItem('remembered_username', username);
      else localStorage.removeItem('remembered_username');
      navigate('/dashboard/overview');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-left-inner">

          {/* Logo — same structure as sidebar */}
          <div className="login-logo">
            <img src="/image/logo.jpg" alt="SmartVue Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div className="login-logo-name">SmartVue</div>
              <div className="login-logo-sub">Marketing Star</div>
            </div>
          </div>

          {/* Headline */}
          <div className="login-hero-text">
            <h1>Elevate Your<br />Marketing Intelligence</h1>
            <p>
              Unify growth metrics, track customer journeys, and power
              decisions with predictive real-time analytics.
            </p>
          </div>

          {/* Illustration */}
          <div className="login-illustration-wrap">
            <img
              src={loginIllustration}
              alt="SmartVue Dashboard Preview"
              className="login-illustration"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>



        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-card">

          {/* Card header */}
          <div className="login-card-header">
            <div className="login-card-title">Welcome back</div>
            <div className="login-card-sub">Sign in to access the console</div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="login-error" role="alert">
              <IconAlertCircle size={15} stroke={2} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} noValidate>

            {/* Username */}
            <div className={`login-field${fieldErrors.username ? ' error' : ''}`}>
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <IconUser size={14} stroke={1.5} className="login-input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.username && (
                <span className="login-field-error">{fieldErrors.username}</span>
              )}
            </div>

            {/* Password */}
            <div className={`login-field${fieldErrors.password ? ' error' : ''}`}>
              <div className="login-field-label-row">
                <label htmlFor="password">Password</label>
                <a
                  href="#forgot"
                  className="login-forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Demo credentials:\nUsername: admin\nPassword: Admin@123');
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="login-input-wrap">
                <IconLock size={14} stroke={1.5} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <IconEyeOff size={14} stroke={1.5} />
                    : <IconEye size={14} stroke={1.5} />
                  }
                </button>
              </div>
              {fieldErrors.password && (
                <span className="login-field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Remember Me */}
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="login-check-box" />
              <span className="login-check-label">Remember me</span>
            </label>

            {/* Submit */}
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <IconLoader2 size={15} stroke={2} className="login-spinner" />
                  Verifying…
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          {/* Demo hint */}
          <div className="login-demo-hint">
            Demo: <code>admin</code> / <code>Admin@123</code>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
