import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession, selectAuthStatus, selectIsAuthenticated } from './store/authSlice';
import type { AppDispatch } from './store/store';
import AuthPanel from './components/Auth/AuthPanel';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Unauthorized from './components/Auth/Unauthorized';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './components/Pages/DashboardPage';
import ComposePage from './components/Pages/ComposePage';
import HistoryPage from './components/Pages/HistoryPage';
import AdminPage from './components/Pages/AdminPage';

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
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : (
            <div className="app-container">
              <main className="main-content">
                <AuthPanel />
              </main>
            </div>
          )
        }
      />

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="app-container">
            <main className="main-content">
              <Unauthorized />
            </main>
          </div>
        }
      />

      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* All authenticated users */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* Admin + Editor only */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'editor']} />}>
            <Route path="/compose" element={<ComposePage />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}
