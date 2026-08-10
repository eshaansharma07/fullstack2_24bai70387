import { memo, useCallback, useState, type FormEvent } from 'react';
import { KeyRound, LockKeyhole, LogIn, ShieldCheck, Zap, Shield, PenSquare, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, selectAuthError, selectAuthStatus } from '../../store/authSlice';
import type { AppDispatch } from '../../store/store';

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  name: string;
  description: string;
  icon: typeof Shield;
  permissions: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    email: 'admin@social.com',
    password: 'admin123',
    name: 'Admin User',
    description: 'Full access to all features',
    icon: Shield,
    permissions: ['Compose', 'Publish', 'History', 'Admin Panel', 'Delete Posts'],
  },
  {
    role: 'editor',
    email: 'editor@social.com',
    password: 'editor123',
    name: 'Editor User',
    description: 'Create and publish content',
    icon: PenSquare,
    permissions: ['Compose', 'Publish', 'History'],
  },
  {
    role: 'viewer',
    email: 'viewer@social.com',
    password: 'viewer123',
    name: 'Viewer User',
    description: 'Read-only access',
    icon: Eye,
    permissions: ['History'],
  },
];

function AuthPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);
  const isChecking = authStatus === 'checking';

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  }, [dispatch, email, password, navigate]);

  const handleRoleLogin = useCallback(async (account: DemoAccount) => {
    setLoggingInRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    const result = await dispatch(loginUser({ email: account.email, password: account.password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
    setLoggingInRole(null);
  }, [dispatch, navigate]);

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-mark">
          <ShieldCheck size={28} />
          JWT + RBAC
        </div>

        <div className="auth-heading">
          <h1>Secure Login</h1>
          <p>Role-Based Access Control with JWT authentication. Select a role below to login instantly, or enter credentials manually.</p>
        </div>

        {/* Role Cards */}
        <div className="role-cards-grid">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            return (
              <button
                key={account.role}
                type="button"
                className={`role-login-card role-card-${account.role}`}
                onClick={() => handleRoleLogin(account)}
                disabled={isChecking}
              >
                <div className="role-card-header">
                  <Icon size={20} />
                  <span className={`role-badge role-${account.role}`}>{account.role}</span>
                </div>
                <strong>{account.name}</strong>
                <span className="role-card-desc">{account.description}</span>
                <div className="role-card-perms">
                  {account.permissions.map((p) => (
                    <span key={p} className="role-perm-tag">{p}</span>
                  ))}
                </div>
                <div className="role-card-creds">
                  <code>{account.email}</code>
                  <code>{account.password}</code>
                </div>
                {loggingInRole === account.role && (
                  <span className="role-card-loading">Logging in...</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="auth-divider">
          <span>or login manually</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <div className="auth-input-wrap">
              <KeyRound size={18} />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="auth-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {authError && (
            <div className="auth-error" role="alert">
              {authError}
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={isChecking}>
            <LogIn size={18} />
            {isChecking ? 'Checking Token' : 'Login With JWT'}
          </button>
        </form>

        <div className="auth-flow">
          <span>1. Select Role</span>
          <span>2. JWT Token</span>
          <span>3. RBAC Routes</span>
        </div>
      </div>
    </section>
  );
}

export default memo(AuthPanel);
