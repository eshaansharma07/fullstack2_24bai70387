import { describe, it, expect } from 'vitest';
import authReducer, { logout } from '../store/authSlice';
import type { AuthState } from '../types';

describe('authSlice Redux Reducers', () => {
  const getAuthenticatedState = (): AuthState => ({
    token: 'fake-jwt-token-123',
    user: {
      id: 'usr_admin',
      email: 'admin@social.com',
      name: 'Admin User',
      role: 'admin',
    },
    status: 'authenticated',
    error: null,
  });

  it('should logout user and clear authentication token', () => {
    const initialState = getAuthenticatedState();
    const newState = authReducer(initialState, logout());

    expect(newState.token).toBeNull();
    expect(newState.user).toBeNull();
    expect(newState.status).toBe('unauthenticated');
  });
});
