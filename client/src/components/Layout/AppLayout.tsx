import { useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, PenSquare, Clock, Shield, LogOut } from 'lucide-react';
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

  return (
    <div className="app-container">
      <nav className="app-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <span className="navbar-logo">SC</span>
            <span className="navbar-title">SocialComposer</span>
          </div>
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            {(role === 'admin' || role === 'editor') && (
              <NavLink to="/compose" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PenSquare size={16} /> Compose
              </NavLink>
            )}
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Clock size={16} /> History
            </NavLink>
            {role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Shield size={16} /> Admin
              </NavLink>
            )}
          </div>
          <div className="navbar-user">
            <div className="navbar-user-info">
              <strong>{user?.name}</strong>
              <span className={`role-badge role-${role}`}>{role}</span>
            </div>
            <button type="button" className="navbar-logout" onClick={handleLogout}>
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
