import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { PlatformId, PlatformsState } from '../types';

const initialState: PlatformsState = {
  ids: ['twitter', 'facebook', 'instagram', 'linkedin'],
  selectedIds: ['twitter'],
  entities: {
    twitter: {
      id: 'twitter',
      name: 'X (Twitter)',
      maxChars: 280,
      maxMedia: 4,
      mediaRequired: false,
    },
    facebook: {
      id: 'facebook',
      name: 'Facebook',
      maxChars: 63206,
      maxMedia: 10,
      mediaRequired: false,
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram',
      maxChars: 2200,
      maxMedia: 10,
      mediaRequired: true,
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      maxChars: 3000,
      maxMedia: 9,
      mediaRequired: false,
    },
  },
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    togglePlatform(state, action: PayloadAction<PlatformId>) {
      const platformId = action.payload;
      if (state.selectedIds.includes(platformId)) {
        state.selectedIds = state.selectedIds.filter((id) => id !== platformId);
      } else {
        state.selectedIds.push(platformId);
      }
    },
    setSelectedPlatforms(state, action: PayloadAction<PlatformId[] | undefined>) {
      state.selectedIds = action.payload?.length ? action.payload : ['twitter'];
    },
  },
});

export const { setSelectedPlatforms, togglePlatform } = platformsSlice.actions;

export const selectPlatformRules = (state: RootState) => state.platforms.entities;
export const selectSelectedPlatformIds = (state: RootState) => state.platforms.selectedIds;
export const selectPlatforms = (state: RootState) => (
  state.platforms.ids.map((id) => state.platforms.entities[id]).filter(Boolean)
);

export default platformsSlice.reducer;
