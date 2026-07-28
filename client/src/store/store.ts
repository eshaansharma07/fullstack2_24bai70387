import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import platformsReducer from './platformsSlice';
import postsReducer from './postsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    platforms: platformsReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
