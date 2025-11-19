import type { StateCreator } from 'zustand';

// ESG feature의 전역 상태
// activeTab은 라우팅으로 대체되어 제거됨
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EsgSlice {
  // 추후 ESG 관련 상태 추가 가능
  // 예: exportFormat, isExporting 등
}

export const createEsgSlice = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _set: Parameters<StateCreator<EsgSlice>>[0]
): EsgSlice => ({
  // 현재는 빈 상태
});

