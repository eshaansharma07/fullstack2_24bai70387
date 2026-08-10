import { ShieldX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '../../store/authSlice';

export default function Unauthorized() {
  const user = useSelector(selectAuthUser);

  return (
    <section className="unauthorized-shell">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <ShieldX size={48} />
        </div>
        <h1>Access Denied</h1>
        <p>
          Your current role <strong className={`role-badge role-${user?.role || 'viewer'}`}>{user?.role || 'unknown'}</strong> does not have permission to access this page.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
