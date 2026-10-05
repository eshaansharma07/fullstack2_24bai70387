import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  PenSquare,
  Clock,
  Shield,
  Database,
  Save,
  Trash2,
  CalendarDays,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  KeyRound,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { selectAuthUser } from '../../store/authSlice';
import './DashboardPage.css';

interface PermissionItem {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  allowed: boolean;
}

export default function DashboardPage() {
  const user = useSelector(selectAuthUser);
  const role = user?.role || 'viewer';
  const userName = user?.name || 'Admin User';

  const permissionsList: PermissionItem[] = [
    {
      key: 'compose',
      label: 'Compose Posts',
      desc: 'Create and design multi-platform content',
      icon: PenSquare,
      allowed: role === 'admin' || role === 'editor',
    },
    {
      key: 'drafts',
      label: 'Save Local Drafts',
      desc: 'Store unfinished posts in browser storage',
      icon: Save,
      allowed: role === 'admin' || role === 'editor',
    },
    {
      key: 'publish',
      label: 'Publish to Database',
      desc: 'Persist posts to Spring Boot backend DB',
      icon: Database,
      allowed: role === 'admin' || role === 'editor',
    },
    {
      key: 'history',
      label: 'View Published History',
      desc: 'Read and audit previous post records',
      icon: Clock,
      allowed: true, // Everyone can view
    },
    {
      key: 'admin',
      label: 'Admin Panel',
      desc: 'Manage roles and system configurations',
      icon: Shield,
      allowed: role === 'admin',
    },
    {
      key: 'delete',
      label: 'Delete Posts from DB',
      desc: 'Remove published content permanently',
      icon: Trash2,
      allowed: role === 'admin',
    },
  ];

  const allowedCount = permissionsList.filter((p) => p.allowed).length;

  return (
    <div className="dashboard-page-container">
      {/* ── 1. HERO SECTION ── */}
      <section className="dashboard-hero-card">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-eyebrow-row">
            <span className="dashboard-hero-eyebrow">
              {role.toUpperCase()} DASHBOARD
            </span>
            <span className="dashboard-role-badge-yellow">{role}</span>
          </div>

          <h1 className="dashboard-hero-title">
            Welcome back, {userName}.
          </h1>

          <p className="dashboard-hero-subtitle">
            Role-based access control with JWT authentication. Multi-platform social publishing engine powered by Spring Boot & React.
          </p>

          <div className="dashboard-hero-badges-row">
            <div className="hero-security-chip">
              <span className="hero-security-chip-icon">
                <ShieldCheck size={16} />
              </span>
              <span><strong>JWT Active:</strong> Token-based security</span>
            </div>

            <div className="hero-security-chip">
              <span className="hero-security-chip-icon">
                <Lock size={15} />
              </span>
              <span><strong>RBAC Enabled:</strong> Role enforcement</span>
            </div>
          </div>

          <div className="dashboard-hero-banner-ribbon">
            <Sparkles size={14} color="#12a765" />
            <span>Secure • Compose • Manage • Publish</span>
          </div>
        </div>

        {/* 3D Security Shield Illustration */}
        <div className="dashboard-hero-visual" aria-hidden="true">
          <svg
            className="hero-shield-svg-box"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="shieldGradBack" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e7f8f0" />
                <stop offset="1" stopColor="#c8ecd9" />
              </linearGradient>
              <linearGradient id="shieldGradFront" x1="50" y1="30" x2="150" y2="170" gradientUnits="userSpaceOnUse">
                <stop stopColor="#12a765" />
                <stop offset="1" stopColor="#087a4b" />
              </linearGradient>
              <linearGradient id="glowG" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" stopOpacity="0.4" />
                <stop offset="1" stopColor="#12a765" stopOpacity="0" />
              </linearGradient>
              <filter id="shadow3D" x="20" y="20" width="160" height="170" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#12a765" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Ambient Background Circles */}
            <circle cx="100" cy="100" r="75" stroke="#e7f8f0" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="88" stroke="#f3fbf7" strokeWidth="1.5" />

            {/* Rear 3D Layer Shield */}
            <path
              d="M100 28L152 52V104C152 136 128 163 100 172C72 163 48 136 48 104V52L100 28Z"
              fill="url(#shieldGradBack)"
              stroke="#b5e4cc"
              strokeWidth="2"
            />

            {/* Front Raised Layer Shield */}
            <path
              d="M100 38L144 58V102C144 128 124 150 100 158C76 150 56 128 56 102V58L100 38Z"
              fill="url(#shieldGradFront)"
              filter="url(#shadow3D)"
            />

            {/* Inner Sheen Highlight */}
            <path
              d="M100 42L138 60V98C138 121 122 140 100 148C100 95 100 42 100 42Z"
              fill="#ffffff"
              fillOpacity="0.14"
            />

            {/* Center Checkmark */}
            <path
              d="M84 98L95 109L117 87"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Sparkle Nodes */}
            <circle cx="152" cy="52" r="4" fill="#12a765" />
            <circle cx="48" cy="104" r="3" fill="#34d399" />
            <circle cx="100" cy="172" r="3.5" fill="#12a765" />
          </svg>
        </div>
      </section>

      {/* ── 2. YOUR PERMISSIONS SECTION ── */}
      <section>
        <div className="dashboard-section-header">
          <div className="dashboard-section-title-wrap">
            <h2 className="dashboard-section-title">
              <KeyRound size={20} color="#12a765" /> Your Permissions
            </h2>
            <span className="dashboard-section-sub">
              Granular role capabilities enforced for {role} account
            </span>
          </div>
          <span className="dashboard-perm-pill allowed">
            {allowedCount} of 6 Allowed
          </span>
        </div>

        <div className="dashboard-permissions-grid">
          {permissionsList.map((perm) => {
            const Icon = perm.icon;
            return (
              <div
                key={perm.key}
                className={`dashboard-perm-card ${perm.allowed ? 'allowed' : 'denied'}`}
              >
                <div className="dashboard-perm-left">
                  <div className="dashboard-perm-icon-box">
                    <Icon size={20} />
                  </div>
                  <div className="dashboard-perm-info">
                    <span className="dashboard-perm-name">{perm.label}</span>
                    <span className="dashboard-perm-desc">{perm.desc}</span>
                  </div>
                </div>

                <span className={`dashboard-perm-pill ${perm.allowed ? 'allowed' : 'denied'}`}>
                  {perm.allowed ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> ALLOWED
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <XCircle size={12} /> DENIED
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. QUICK ACTIONS SECTION ── */}
      <section>
        <div className="dashboard-section-header">
          <div className="dashboard-section-title-wrap">
            <h2 className="dashboard-section-title">
              <Layers size={20} color="#12a765" /> Quick Actions
            </h2>
            <span className="dashboard-section-sub">
              Core platform workflows and shortcuts
            </span>
          </div>
        </div>

        <div className="dashboard-quick-actions-grid">
          {/* Action 1: Compose Post (Featured Dark Emerald) */}
          <Link
            to={role === 'viewer' ? '#' : '/compose'}
            className="quick-action-card-link quick-action-card-featured"
            onClick={(e) => {
              if (role === 'viewer') {
                e.preventDefault();
                alert('Viewers have read-only access. Only Admin and Editor roles can compose posts.');
              }
            }}
          >
            {/* Watermark Ghost Pencil Icon */}
            <div className="ghost-pencil-watermark">
              <PenSquare size={130} />
            </div>

            <div className="quick-action-top-row">
              <div className="quick-action-icon-wrap">
                <PenSquare size={22} />
              </div>
              <div className="quick-action-arrow">
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="quick-action-bottom-texts">
              <h3 className="quick-action-title">Compose Post</h3>
              <p className="quick-action-desc">
                Create, customize and publish multi-platform social media posts
              </p>
            </div>
          </Link>

          {/* Action 2: View History */}
          <Link to="/history" className="quick-action-card-link quick-action-card-standard">
            <div className="quick-action-top-row">
              <div className="quick-action-icon-wrap">
                <Clock size={22} />
              </div>
              <div className="quick-action-arrow">
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="quick-action-bottom-texts">
              <h3 className="quick-action-title">View History</h3>
              <p className="quick-action-desc">
                Browse audit trails and published posts from the PostgreSQL database
              </p>
            </div>
          </Link>

          {/* Action 3: Content Calendar */}
          <Link to="/calendar" className="quick-action-card-link quick-action-card-standard">
            <div className="quick-action-top-row">
              <div className="quick-action-icon-wrap">
                <CalendarDays size={22} />
              </div>
              <div className="quick-action-arrow">
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="quick-action-bottom-texts">
              <h3 className="quick-action-title">Content Calendar</h3>
              <p className="quick-action-desc">
                Schedule posts & view temporal publication pipeline
              </p>
            </div>
          </Link>

          {/* Action 4: Admin Panel */}
          <Link
            to={role === 'admin' ? '/admin' : '#'}
            className="quick-action-card-link quick-action-card-standard"
            onClick={(e) => {
              if (role !== 'admin') {
                e.preventDefault();
                alert('Admin Panel is restricted to administrators.');
              }
            }}
            style={role !== 'admin' ? { opacity: 0.65 } : {}}
          >
            <div className="quick-action-top-row">
              <div className="quick-action-icon-wrap">
                <Shield size={22} />
              </div>
              <div className="quick-action-arrow">
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="quick-action-bottom-texts">
              <h3 className="quick-action-title">Admin Panel</h3>
              <p className="quick-action-desc">
                Manage system users, access roles, and platform settings
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 4. SYSTEM STATUS STRIP ── */}
      <section>
        <div className="dashboard-section-header">
          <div className="dashboard-section-title-wrap">
            <h2 className="dashboard-section-title">
              <Activity size={20} color="#12a765" /> System Status
            </h2>
            <span className="dashboard-section-sub">
              Live token, session and security diagnostics
            </span>
          </div>
        </div>

        <div className="dashboard-status-strip">
          <div className="dashboard-status-card">
            <div className="status-card-icon-box">
              <ShieldCheck size={20} />
            </div>
            <div className="status-card-texts">
              <span className="status-card-label">Authentication</span>
              <span className="status-card-value">
                <span className="status-card-dot-active" /> JWT Active
              </span>
            </div>
          </div>

          <div className="dashboard-status-card">
            <div className="status-card-icon-box">
              <Lock size={20} />
            </div>
            <div className="status-card-texts">
              <span className="status-card-label">Assigned Role</span>
              <span className="status-card-value">
                {role.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="dashboard-status-card">
            <div className="status-card-icon-box">
              <KeyRound size={20} />
            </div>
            <div className="status-card-texts">
              <span className="status-card-label">Permissions</span>
              <span className="status-card-value">
                {allowedCount} / 6 Enabled
              </span>
            </div>
          </div>

          <div className="dashboard-status-card">
            <div className="status-card-icon-box">
              <Activity size={20} />
            </div>
            <div className="status-card-texts">
              <span className="status-card-label">Session Security</span>
              <span className="status-card-value">
                <span className="status-card-dot-active" /> Validated
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
