import { memo, useCallback, useState, type FormEvent } from 'react';
import { KeyRound, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthError, selectAuthStatus } from '../../store/authSlice';
import type { AppDispatch } from '../../store/store';

function AuthPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const isChecking = authStatus === 'checking';

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(loginUser({ email, password }));
  }, [dispatch, email, password]);

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
