import type { StateCreator } from 'zustand';

// 전역 UI 상태 (feature에 속하지 않는 상태)
export interface UiSlice {
  inputValue: string;
  setInputValue: (value: string) => void;
}

export const createUiSlice = (
  set: Parameters<StateCreator<UiSlice>>[0]
): UiSlice => ({
  inputValue: '',
  setInputValue: (inputValue) => set({ inputValue }),
});

