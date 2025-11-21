import { create } from 'zustand';
import { EsgConsultStore } from './types';
import { createEsgConsultSlice } from './slices/esgConsultSlice';

export const useEsgStore = create<EsgConsultStore>()((...a) => ({
  ...createEsgConsultSlice(...a),
}));

