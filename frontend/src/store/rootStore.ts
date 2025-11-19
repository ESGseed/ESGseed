'use client';

import { create } from 'zustand';
import { createSoccerSlice, SoccerSlice } from '@/features/soccer/store/soccerSlice';
import { createEsgSlice, EsgSlice } from '@/features/esg/store/esgSlice';
import { createUiSlice, UiSlice } from './globalSlice';

// Re-export types for convenience
export type { Player } from '@/features/soccer/store/soccerSlice';

// Combined store type
export type AppState = SoccerSlice & EsgSlice & UiSlice;

// Root store combining all slices
export const useStore = create<AppState>()((set, get) => ({
  ...createSoccerSlice(set, get),
  ...createEsgSlice(set),
  ...createUiSlice(set),
}));

