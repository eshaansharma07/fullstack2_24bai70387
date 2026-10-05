import { useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  PenSquare,
  Clock,
  CalendarDays,
  Code2,
  Shield,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  Zap,
} from 'lucide-react';
import { logout, selectAuthUser } from '../../store/authSlice';
import { clearComposer } from '../../store/postsSlice';
import type { AppDispatch } from '../../store/store';
import './AppLayout.css';

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const role = user?.role || 'viewer';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearComposer());
    navigate('/login');
  }, [dispatch, navigate]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="saas-layout-shell">
      {/* Mobile Backdrop */}
      <div
        className={`saas-mobile-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* ── LEFT SIDEBAR (~260px) ── */}
      <aside className={`saas-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="saas-sidebar-inner">
          {/* Brand & Logo */}
          <div className="saas-sidebar-brand">
            <Link to="/" className="saas-brand-group" onClick={closeMobile} style={{ textDecoration: 'none' }}>
              <div className="saas-logo-icon-box">
                <Zap size={20} fill="#ffffff" strokeWidth={1.5} />
              </div>
              <div className="saas-brand-text-col">
                <span className="saas-brand-title-black">SOCIAL</span>
                <span className="saas-brand-title-green">COMPOSER</span>
              </div>
            </Link>
            <span className="saas-brand-pro-badge">PRO V2.0</span>
          </div>

          {/* Navigation Links */}
          <nav className="saas-sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <LayoutDashboard className="saas-nav-icon" />
              <span>Dashboard</span>
            </NavLink>

            {(role === 'admin' || role === 'editor') && (
              <NavLink
                to="/compose"
                className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <PenSquare className="saas-nav-icon" />
                <span>Compose</span>
              </NavLink>
            )}

            <NavLink
              to="/history"
              className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <Clock className="saas-nav-icon" />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/calendar"
              className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <CalendarDays className="saas-nav-icon" />
              <span>Calendar</span>
            </NavLink>

            <NavLink
              to="/api-docs"
              className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <Code2 className="saas-nav-icon" />
              <span>REST API</span>
            </NavLink>

            {role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `saas-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <Shield className="saas-nav-icon" />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Quick Create Section */}
          <div className="saas-quick-create-section">
            <span className="saas-quick-create-label">Quick Create</span>
            <Link
              to={role === 'viewer' ? '#' : '/compose'}
              className="saas-compose-btn"
              onClick={(e) => {
                if (role === 'viewer') {
                  e.preventDefault();
                  alert('Viewers have read-only access. Only Admin and Editor roles can compose posts.');
                } else {
                  closeMobile();
                }
              }}
              style={role === 'viewer' ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Compose Post</span>
            </Link>
          </div>

          {/* Sidebar Promotional Card */}
          <div className="saas-sidebar-promo-card">
            <div className="saas-promo-illu">
              <svg width="100%" height="70" viewBox="0 0 200 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Abstract multi-channel network visualization */}
                <rect x="15" y="15" width="40" height="40" rx="10" fill="#ffffff" stroke="#c8ecd9" strokeWidth="1.5" />
                <path d="M27 35L33 41L43 29" stroke="#12a765" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                <line x1="55" y1="35" x2="80" y2="35" stroke="#12a765" strokeWidth="1.5" strokeDasharray="3 3" />

                <rect x="80" y="8" width="44" height="44" rx="12" fill="#12a765" />
                <circle cx="102" cy="30" r="12" fill="#ffffff" fillOpacity="0.25" />
                <path d="M96 30H108M102 24V36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

                <line x1="124" y1="35" x2="149" y2="35" stroke="#12a765" strokeWidth="1.5" strokeDasharray="3 3" />

                <rect x="149" y="15" width="40" height="40" rx="10" fill="#ffffff" stroke="#c8ecd9" strokeWidth="1.5" />
                <circle cx="169" cy="35" r="8" fill="#e7f8f0" stroke="#12a765" strokeWidth="1.5" />
                <circle cx="169" cy="35" r="3" fill="#12a765" />
              </svg>
            </div>
            <h4 className="saas-promo-heading">Create. Schedule. Publish. Everywhere.</h4>
            <p className="saas-promo-sub">Manage your social media content seamlessly in one place.</p>
          </div>

          {/* User Area at Bottom */}
          <div className="saas-sidebar-user">
            <div className="saas-user-meta">
              <div className="saas-user-avatar">{userInitial}</div>
              <div className="saas-user-texts">
                <span className="saas-user-name">{user?.name || 'Admin User'}</span>
                <span className="saas-role-badge-yellow">{role}</span>
              </div>
            </div>
            <button
              type="button"
              className="saas-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div className="saas-main-wrapper">
        {/* Top Header */}
        <header className="saas-top-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="saas-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="saas-header-search-wrap">
              <Search size={16} className="saas-search-icon" />
              <input
                type="text"
                className="saas-search-input"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="saas-shortcut-chip">⌘ K</span>
            </div>
          </div>

          <div className="saas-header-right-tools">
            <div className="saas-online-pill">
              <span className="saas-online-dot" />
              <span>ONLINE</span>
            </div>

            <button type="button" className="saas-icon-btn" title="Notifications" aria-label="Notifications">
              <Bell size={18} />
              <span className="saas-notif-dot" />
            </button>

            <div className="saas-header-user-circle" title={`${user?.name} (${role})`}>
              {userInitial}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="saas-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
