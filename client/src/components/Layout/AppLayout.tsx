import { useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, PenSquare, Clock, Shield, LogOut, Radio, CalendarDays } from 'lucide-react';
import { logout, selectAuthUser } from '../../store/authSlice';
import { clearComposer } from '../../store/postsSlice';
import type { AppDispatch } from '../../store/store';

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearComposer());
    navigate('/login');
  }, [dispatch, navigate]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-container">
      <nav className="app-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <span className="navbar-logo">SC</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="navbar-title">SocialComposer</span>
                <span className="version-badge">v2.0</span>
              </div>
            </div>
          </div>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={15} /> Dashboard
            </NavLink>
            {(role === 'admin' || role === 'editor') && (
              <NavLink to="/compose" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PenSquare size={15} /> Compose
              </NavLink>
            )}
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Clock size={15} /> History
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarDays size={15} /> Calendar
            </NavLink>
            {role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Shield size={15} /> Admin
              </NavLink>
            )}
          </div>

          <div className="navbar-user">
            <div className="system-live-chip">
              <Radio size={12} className="live-radio-icon" /> ONLINE
            </div>
            <div className="navbar-user-info">
              <div className="user-avatar-small">{userInitial}</div>
              <div className="user-text-meta">
                <strong>{user?.name}</strong>
                <span className={`role-badge role-${role}`}>{role}</span>
              </div>
            </div>
            <button type="button" className="navbar-logout" title="Sign Out" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
