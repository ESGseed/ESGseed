import type { StateCreator } from 'zustand';
import { soccerApi } from '@/lib/api';

export interface Player {
  playerId: number;
  playerName: string;
  position: string;
  teamUk: string;
  backNo: string;
  nation?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SoccerSlice {
  players: Player[];
  loading: boolean;
  error: string | null;
  searchName: string;
  searchPosition: string;
  fetchPlayers: (name?: string, position?: string) => Promise<void>;
  setSearchName: (name: string) => void;
  setSearchPosition: (position: string) => void;
}

export const createSoccerSlice = (
  set: Parameters<StateCreator<SoccerSlice>>[0],
  get: Parameters<StateCreator<SoccerSlice>>[1]
): SoccerSlice => ({
  players: [],
  loading: false,
  error: null,
  searchName: '',
  searchPosition: '',

  setSearchName: (searchName) => set({ searchName }),
  setSearchPosition: (searchPosition) => set({ searchPosition }),

  fetchPlayers: async (name, position) => {
    set({ loading: true, error: null });
    try {
      const response = await soccerApi.getPlayers(
        name || get().searchName || undefined,
        position || get().searchPosition || undefined
      ) as ApiResponse<Player[]>;
      set({ players: response.data || [], loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch players',
        loading: false,
      });
    }
  },
});

