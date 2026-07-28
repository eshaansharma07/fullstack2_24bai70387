import { memo, useCallback, useState, type FormEvent } from 'react';
import { KeyRound, LockKeyhole, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthError, selectAuthStatus } from '../../store/authSlice';
import type { AppDispatch } from '../../store/store';

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'password123';

function AuthPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const isChecking = authStatus === 'checking';

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(loginUser({ email, password }));
  }, [dispatch, email, password]);

  const handleDemoLogin = useCallback(() => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    dispatch(loginUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD }));
  }, [dispatch]);

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-mark">
          <ShieldCheck size={28} />
          JWT AUTH
        </div>

        <div className="auth-heading">
          <h1>Secure Login</h1>
          <p>Authenticate once, receive a signed JWT, and use the bearer token for protected composer requests.</p>
        </div>

        {/* Demo credentials banner for evaluators */}
        <div className="demo-credentials-banner">
          <div className="demo-credentials-header">
            <Zap size={16} />
            <strong>Demo Credentials</strong>
          </div>
          <div className="demo-credentials-body">
            <div className="demo-credential-row">
              <span className="demo-label">Email</span>
              <code className="demo-value">{DEMO_EMAIL}</code>
            </div>
            <div className="demo-credential-row">
              <span className="demo-label">Password</span>
              <code className="demo-value">{DEMO_PASSWORD}</code>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary demo-login-btn"
            onClick={handleDemoLogin}
            disabled={isChecking}
          >
            <Zap size={16} />
            {isChecking ? 'Logging in...' : 'Click Here to Login Instantly'}
          </button>
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
          <span>1. Credentials</span>
          <span>2. Signed Token</span>
          <span>3. Stateless Requests</span>
        </div>
      </div>
    </section>
  );
}

export default memo(AuthPanel);
