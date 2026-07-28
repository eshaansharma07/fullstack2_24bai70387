import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthPanel from './components/Auth/AuthPanel';
import Composer from './components/PostComposer/Composer';
import {
  restoreSession,
  selectAuthStatus,
  selectIsAuthenticated
} from './store/authSlice';
import type { AppDispatch } from './store/store';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (authStatus === 'checking') {
      dispatch(restoreSession());
    }
  }, [authStatus, dispatch]);

  return (
    <div className="app-container">
      <main className="main-content">
        {authStatus === 'checking' && (
          <div className="auth-loading">Verifying JWT session...</div>
        )}
        {authStatus !== 'checking' && !isAuthenticated && <AuthPanel />}
        {isAuthenticated && <Composer />}
      </main>
    </div>
  );
}
