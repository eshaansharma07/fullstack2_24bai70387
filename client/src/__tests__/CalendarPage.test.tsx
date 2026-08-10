import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CalendarPage from '../components/Pages/CalendarPage';
import postsReducer from '../store/postsSlice';
import authReducer from '../store/authSlice';

const createMockStore = () =>
  configureStore({
    reducer: {
      posts: postsReducer,
      auth: authReducer,
      platforms: (state = { selectedIds: ['twitter'] }) => state,
    },
    preloadedState: {
      auth: {
        token: 'test-token',
        user: { id: 'u1', name: 'Test Admin', email: 'admin@test.com', role: 'admin' as const },
        status: 'authenticated' as const,
        error: null,
      },
    },
  });

describe('CalendarPage Component (Exp 1.4.2 Integration Test)', () => {
  it('renders calendar title, month navigation, and performance profiling bar', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CalendarPage />
      </Provider>
    );

    expect(screen.getByText(/Content Schedule Calendar/i)).toBeDefined();
    expect(screen.getByText(/O\(1\) Map Indexing/i)).toBeDefined();
    expect(screen.getByText(/Month/i)).toBeDefined();
    expect(screen.getByText(/List/i)).toBeDefined();
  });
});
