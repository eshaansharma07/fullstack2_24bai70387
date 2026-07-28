import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { AuthState, AuthUser } from '../types';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';
const AUTH_STORAGE_KEY = 'socialComposer.authToken.v1';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

interface JwtPayload extends AuthUser {
  exp?: number;
}

const readStoredToken = () => localStorage.getItem(AUTH_STORAGE_KEY);

const persistToken = (token: string) => {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
};

const clearStoredToken = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
};

const isExpired = (payload: JwtPayload | null) => (
  !payload?.exp || payload.exp * 1000 <= Date.now()
);

export const loginUser = createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || 'Login failed.');
      }

      persistToken(data.token);
      return data;
    } catch {
      return rejectWithValue('Unable to connect to authentication server.');
    }
  }
);

export const restoreSession = createAsyncThunk<LoginResponse, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = readStoredToken();
    const payload = token ? decodeJwtPayload(token) : null;

    if (!token || isExpired(payload)) {
      clearStoredToken();
      return rejectWithValue('No active session.');
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        clearStoredToken();
        return rejectWithValue(data.error || 'Session expired.');
      }

      return {
        token,
        user: data.user,
        expiresIn: payload?.exp ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000)) : 0,
      };
    } catch {
      return rejectWithValue('Unable to restore session.');
    }
  }
);

const initialToken = readStoredToken();
const initialPayload = initialToken ? decodeJwtPayload(initialToken) : null;

const initialState: AuthState = {
  token: initialToken && !isExpired(initialPayload) ? initialToken : null,
  user: initialToken && !isExpired(initialPayload) && initialPayload
    ? {
      id: initialPayload.id,
      email: initialPayload.email,
      name: initialPayload.name,
      role: initialPayload.role,
    }
    : null,
  status: initialToken && !isExpired(initialPayload) ? 'checking' : 'unauthenticated',
  error: null,
};

if (initialToken && isExpired(initialPayload)) {
  clearStoredToken();
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
      clearStoredToken();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'checking';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.token = null;
        state.user = null;
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed.';
      })
      .addCase(restoreSession.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'unauthenticated';
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;

export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated' && Boolean(state.auth.token);

export default authSlice.reducer;
