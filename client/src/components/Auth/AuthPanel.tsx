import { memo, useCallback, useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  Crown,
  PenSquare,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, selectAuthError, selectAuthStatus } from '../../store/authSlice';
import type { AppDispatch } from '../../store/store';
import './AuthPanel.css';

interface RolePreset {
  role: 'admin' | 'editor' | 'viewer';
  title: string;
  subtitle: string;
  email: string;
  password: string;
  icon: typeof Crown;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    role: 'admin',
    title: 'Admin',
    subtitle: 'Full Access',
    email: 'admin@social.com',
    password: 'admin123',
    icon: Crown,
  },
  {
    role: 'editor',
    title: 'Editor',
    subtitle: 'Create & publish',
    email: 'editor@social.com',
    password: 'editor123',
    icon: PenSquare,
  },
  {
    role: 'viewer',
    title: 'Viewer',
    subtitle: 'Read only',
    email: 'viewer@social.com',
    password: 'viewer123',
    icon: Eye,
  },
];

function AuthPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('admin');
  const [email, setEmail] = useState('admin@social.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isChecking = authStatus === 'checking';

  const handleRoleSelect = useCallback((preset: RolePreset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.password);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate('/');
      }
    },
    [dispatch, email, password, navigate]
  );

  return (
    <div className="saas-auth-viewport">
      {/* ── Background Abstract SVG Waves (Mint gradient) ── */}
      <svg
        className="saas-bg-waves"
        viewBox="0 0 900 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-80 500 C 120 440, 240 480, 420 380 C 600 280, 720 320, 920 220 L 920 540 L -80 540 Z"
          fill="url(#wave-grad-1)"
          opacity="0.45"
        />
        <path
          d="M-80 540 C 160 480, 320 520, 500 420 C 680 320, 800 360, 980 260 L 980 540 L -80 540 Z"
          fill="url(#wave-grad-2)"
          opacity="0.3"
        />
        <path
          d="M-60 420 C 180 380, 280 430, 460 340 C 640 250, 760 300, 960 190"
          stroke="url(#stroke-grad)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="wave-grad-1" x1="0" y1="200" x2="800" y2="520" gradientUnits="userSpaceOnUse">
            <stop stopColor="#eaf8f1" stopOpacity="0.8" />
            <stop stopColor="#d1fae5" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0" y1="250" x2="900" y2="520" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bbf7d0" stopOpacity="0.5" />
            <stop stopColor="#f8faf9" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="stroke-grad" x1="0" y1="200" x2="900" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16a765" stopOpacity="0.5" />
            <stop stopColor="#16a765" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Top Bar ── */}
      <header className="saas-top-bar">
        <div className="saas-top-brand">
          <div className="saas-brand-shield">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
                fill="#16a765"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="saas-brand-title">JWT + RBAC</span>
        </div>

        <div className="saas-top-status">
          <span>Secure Access Portal</span>
          <span className="saas-status-dot" aria-label="Online" />
        </div>
      </header>

      {/* ── Main Layout: Hero (Left 55%) + Card (Right 45%) ── */}
      <main className="saas-auth-content">
        {/* LEFT HERO */}
        <section className="saas-hero-side">
          <h1 className="saas-hero-title">
            Secure Access<br />
            for <span className="saas-hero-title-accent">Every Role.</span>
          </h1>

          <p className="saas-hero-desc">
            Role-based access control with JWT authentication. A secure, scalable platform for admins, editors and viewers.
          </p>

          <div className="saas-hero-middle">
            {/* 3 Feature Rows */}
            <div className="saas-features-col">
              <div className="saas-feature-row">
                <div className="saas-feature-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div className="saas-feature-text">
                  <strong>JWT Authentication</strong>
                  <span>Secure, token-based authentication</span>
                </div>
              </div>

              <div className="saas-feature-row">
                <div className="saas-feature-icon-box">
                  <Users size={20} />
                </div>
                <div className="saas-feature-text">
                  <strong>Role Based Access Control</strong>
                  <span>Different access levels for different users</span>
                </div>
              </div>

              <div className="saas-feature-row">
                <div className="saas-feature-icon-box">
                  <BarChart3 size={20} />
                </div>
                <div className="saas-feature-text">
                  <strong>Audit & Activity Tracking</strong>
                  <span>Keep track of important actions</span>
                </div>
              </div>
            </div>

            {/* 3D Isometric Role Stack Illustration */}
            <div className="saas-role-stage" aria-hidden="true">
              <svg className="saas-stage-orbit" viewBox="0 0 260 260" fill="none">
                <circle cx="130" cy="130" r="110" stroke="#dcf5e9" strokeWidth="1.5" strokeDasharray="3 4" />
                <circle cx="218" cy="74" r="5" fill="#16a765" />
                <circle cx="48" cy="180" r="4" fill="#16a765" opacity="0.6" />
              </svg>

              <div className="saas-3d-cards-stack">
                <div className="saas-iso-card saas-iso-admin">
                  <div className="saas-iso-icon-wrap">
                    <Crown size={16} />
                  </div>
                  <div className="saas-iso-info">
                    <strong>Admin</strong>
                    <span>Full Access</span>
                  </div>
                </div>

                <div className="saas-iso-card saas-iso-editor">
                  <div className="saas-iso-icon-wrap">
                    <PenSquare size={16} />
                  </div>
                  <div className="saas-iso-info">
                    <strong>Editor</strong>
                    <span>Create & Publish</span>
                  </div>
                </div>

                <div className="saas-iso-card saas-iso-viewer">
                  <div className="saas-iso-icon-wrap">
                    <Eye size={16} />
                  </div>
                  <div className="saas-iso-info">
                    <strong>Viewer</strong>
                    <span>Read Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="saas-metrics-strip">
            <div className="saas-metric-box">
              <span className="saas-metric-number">3</span>
              <span className="saas-metric-label">User Roles</span>
            </div>

            <div className="saas-metric-divider" />

            <div className="saas-metric-box">
              <span className="saas-metric-number">100%</span>
              <span className="saas-metric-label">Secure Access</span>
            </div>

            <div className="saas-metric-divider" />

            <div className="saas-metric-box">
              <span className="saas-metric-number">24/7</span>
              <span className="saas-metric-label">Activity Monitoring</span>
            </div>
          </div>
        </section>

        {/* RIGHT FLOATING LOGIN CARD */}
        <section className="saas-login-card">
          <div className="saas-card-top-row">
            <div className="saas-card-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
                  fill="#16a765"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>JWT + RBAC</span>
            </div>
            <span className="saas-welcome-back">Welcome Back</span>
          </div>

          <div className="saas-card-heading">
            <h2 className="saas-card-title">Sign In</h2>
            <p className="saas-card-sub">Access your account to continue</p>
          </div>

          {/* Compact 3-Option Role Selector */}
          <div className="saas-role-selector" role="radiogroup" aria-label="Select Account Role">
            {ROLE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedRole === preset.role;
              return (
                <button
                  key={preset.role}
                  type="button"
                  className={`saas-role-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(preset)}
                  aria-checked={isSelected}
                  role="radio"
                >
                  <div className="saas-role-btn-icon">
                    <Icon size={15} />
                  </div>
                  <strong className="saas-role-btn-title">{preset.title}</strong>
                  <span className="saas-role-btn-desc">{preset.subtitle}</span>
                </button>
              );
            })}
          </div>

          {authError && (
            <div className="saas-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form className="saas-form" onSubmit={handleSubmit}>
            <div className="saas-form-group">
              <label className="saas-input-label" htmlFor="saas-email">
                Email Address
              </label>
              <div className="saas-input-wrap">
                <span className="saas-input-icon">
                  <Mail size={16} />
                </span>
                <input
                  id="saas-email"
                  type="email"
                  className="saas-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="saas-form-group">
              <label className="saas-input-label" htmlFor="saas-password">
                Password
              </label>
              <div className="saas-input-wrap">
                <span className="saas-input-icon">
                  <Lock size={16} />
                </span>
                <input
                  id="saas-password"
                  type={showPassword ? 'text' : 'password'}
                  className="saas-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="saas-pwd-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="saas-options-row">
              <label className="saas-remember-label">
                <input
                  type="checkbox"
                  className="saas-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="saas-forgot-link"
                onClick={() => alert(`Use demo password: ${selectedRole}123`)}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="saas-submit-btn"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="saas-card-divider">
            <span>OR</span>
          </div>

          <div className="saas-card-footer">
            <Lock size={13} />
            <span>Protected by JWT + RBAC</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default memo(AuthPanel);
