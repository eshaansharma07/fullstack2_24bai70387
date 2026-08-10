import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, Users, CheckCircle, XCircle } from 'lucide-react';
import { selectAuthToken } from '../../store/authSlice';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const PERMISSION_MATRIX = [
  { feature: 'Compose Posts', admin: true, editor: true, viewer: false },
  { feature: 'Save Local Drafts', admin: true, editor: true, viewer: false },
  { feature: 'Publish to Database', admin: true, editor: true, viewer: false },
  { feature: 'View Published History', admin: true, editor: true, viewer: true },
  { feature: 'Access Admin Panel', admin: true, editor: false, viewer: false },
  { feature: 'Delete Posts from DB', admin: true, editor: false, viewer: false },
];

export default function AdminPage() {
  const authToken = useSelector(selectAuthToken);
  const [users, setUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch { /* ignore */ }
    };
    fetchUsers();
  }, [authToken]);

  return (
    <div>
      <div className="page-header">
        <h1><Shield size={28} /> Admin Panel</h1>
        <p>Manage users and view the RBAC permission matrix. Admin-only access.</p>
      </div>

      <h3 className="section-title" style={{ marginTop: '1.5rem' }}>
        <Users size={18} /> Registered Users
      </h3>
      <div className="admin-users-grid">
        {users.map((u) => (
          <div key={u.id} className="admin-user-card">
            <div className="admin-user-avatar">{u.name.charAt(0)}</div>
            <div className="admin-user-info">
              <strong>{u.name}</strong>
              <span>{u.email}</span>
              <span className={`role-badge role-${u.role}`}>{u.role}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title" style={{ marginTop: '2rem' }}>
        <Shield size={18} /> RBAC Permission Matrix
      </h3>
      <div className="rbac-table-wrap">
        <table className="rbac-table">
          <thead>
            <tr>
              <th>Feature / Permission</th>
              <th>Admin</th>
              <th>Editor</th>
              <th>Viewer</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MATRIX.map((row) => (
              <tr key={row.feature}>
                <td>{row.feature}</td>
                <td className="perm-cell">{row.admin ? <CheckCircle size={16} className="perm-yes" /> : <XCircle size={16} className="perm-no" />}</td>
                <td className="perm-cell">{row.editor ? <CheckCircle size={16} className="perm-yes" /> : <XCircle size={16} className="perm-no" />}</td>
                <td className="perm-cell">{row.viewer ? <CheckCircle size={16} className="perm-yes" /> : <XCircle size={16} className="perm-no" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
