import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShieldCheck, PenSquare, Clock, Shield, Eye, Database, Save, Trash2 } from 'lucide-react';
import { selectAuthUser } from '../../store/authSlice';

const PERMISSIONS = {
  admin: [
    { label: 'Compose Posts', allowed: true, icon: PenSquare },
    { label: 'Save Local Drafts', allowed: true, icon: Save },
    { label: 'Publish to Database', allowed: true, icon: Database },
    { label: 'View Published History', allowed: true, icon: Clock },
    { label: 'Admin Panel', allowed: true, icon: Shield },
    { label: 'Delete Posts from DB', allowed: true, icon: Trash2 },
  ],
  editor: [
    { label: 'Compose Posts', allowed: true, icon: PenSquare },
    { label: 'Save Local Drafts', allowed: true, icon: Save },
    { label: 'Publish to Database', allowed: true, icon: Database },
    { label: 'View Published History', allowed: true, icon: Clock },
    { label: 'Admin Panel', allowed: false, icon: Shield },
    { label: 'Delete Posts from DB', allowed: false, icon: Trash2 },
  ],
  viewer: [
    { label: 'Compose Posts', allowed: false, icon: PenSquare },
    { label: 'Save Local Drafts', allowed: false, icon: Save },
    { label: 'Publish to Database', allowed: false, icon: Database },
    { label: 'View Published History', allowed: true, icon: Clock },
    { label: 'Admin Panel', allowed: false, icon: Shield },
    { label: 'Delete Posts from DB', allowed: false, icon: Trash2 },
  ],
} as const;

export default function DashboardPage() {
  const user = useSelector(selectAuthUser);
  const role = user?.role || 'viewer';
  const permissions = PERMISSIONS[role];

  return (
    <div>
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>You are logged in as <span className={`role-badge role-${role}`}>{role}</span></p>
        </div>
        <div className="dashboard-welcome-icon">
          <ShieldCheck size={48} />
        </div>
      </div>

      <h3 className="section-title" style={{ marginTop: '2rem' }}>
        <Eye size={18} /> Your Permissions
      </h3>
      <div className="permissions-grid">
        {permissions.map((perm) => {
          const Icon = perm.icon;
          return (
            <div key={perm.label} className={`permission-card ${perm.allowed ? 'allowed' : 'denied'}`}>
              <Icon size={20} />
              <span>{perm.label}</span>
              <span className={`perm-status ${perm.allowed ? 'allowed' : 'denied'}`}>
                {perm.allowed ? '✓ Allowed' : '✗ Denied'}
              </span>
            </div>
          );
        })}
      </div>

      <h3 className="section-title" style={{ marginTop: '2rem' }}>
        Quick Actions
      </h3>
      <div className="quick-actions">
        {(role === 'admin' || role === 'editor') && (
          <Link to="/compose" className="quick-action-card">
            <PenSquare size={24} />
            <strong>Compose Post</strong>
            <span>Create and publish social media content</span>
          </Link>
        )}
        <Link to="/history" className="quick-action-card">
          <Clock size={24} />
          <strong>View History</strong>
          <span>Browse published posts from the database</span>
        </Link>
        {role === 'admin' && (
          <Link to="/admin" className="quick-action-card">
            <Shield size={24} />
            <strong>Admin Panel</strong>
            <span>Manage users and system settings</span>
          </Link>
        )}
      </div>
    </div>
  );
}
