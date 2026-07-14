import { configureStore } from '@reduxjs/toolkit';
import platformsReducer from './platformsSlice';
import postsReducer from './postsSlice';

export const store = configureStore({
  reducer: {
    platforms: platformsReducer,
    posts: postsReducer,
  },
});
