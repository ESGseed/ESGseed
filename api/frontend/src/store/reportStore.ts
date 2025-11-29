import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 회사정보 타입
export interface CompanyData {
  companyName: string;
  businessNumber: string;
  ceoName: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  mission: string;
  vision: string;
  esgGoals: string;
  employees: string;
  shareholders: string;
  stakeholders: string;
  communication: string;
}

// 생성된 문단 타입
export interface PreviewSection {
  id: string;
  title: string;
  content: string;
  aiComment?: string;
  commentType?: 'info' | 'warning';
  createdAt: Date;
  updatedAt: Date;
}

// 차트 데이터 타입
export interface ChartData {
  id: string;
  chartType: 'bar' | 'pie' | 'line' | 'area';
  dataSource: string;
  chartTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  dataPoints: { label: string; value: number }[];
  chartImage?: string; // base64 이미지
  createdAt: Date;
}

// 보고서 메타데이터
export interface ReportMetadata {
  reportYear: string;
  reportPeriod: string;
  language: string;
  lastUpdated: Date;
}

// Store 상태 타입
interface ReportStore {
  // 데이터
  companyInfo: CompanyData | null;
  contentSections: PreviewSection[];
  charts: ChartData[];
  reportMetadata: ReportMetadata;

  // Actions - 회사정보
  setCompanyInfo: (data: CompanyData) => void;
  updateCompanyInfo: (partial: Partial<CompanyData>) => void;

  // Actions - 문단
  addContentSection: (section: Omit<PreviewSection, 'createdAt' | 'updatedAt'>) => void;
  updateContentSection: (id: string, updates: Partial<PreviewSection>) => void;
  removeContentSection: (id: string) => void;

  // Actions - 차트
  addChart: (chart: Omit<ChartData, 'id' | 'createdAt'>) => void;
  updateChart: (id: string, updates: Partial<ChartData>) => void;
  removeChart: (id: string) => void;

  // Actions - 메타데이터
  updateReportMetadata: (metadata: Partial<ReportMetadata>) => void;

  // Utils
  getReportData: () => {
    companyInfo: CompanyData | null;
    contentSections: PreviewSection[];
    charts: ChartData[];
    reportMetadata: ReportMetadata;
  };
  clearAllData: () => void;
}

// 초기 메타데이터
const getInitialMetadata = (): ReportMetadata => ({
  reportYear: new Date().getFullYear().toString(),
  reportPeriod: `${new Date().getFullYear()}년 1월 - 12월`,
  language: '한국어',
  lastUpdated: new Date(),
});

// 초기 상태
const initialState = {
  companyInfo: null,
  contentSections: [],
  charts: [],
  reportMetadata: getInitialMetadata(),
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 회사정보 설정
      setCompanyInfo: (data) => {
        set({ companyInfo: data });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 회사정보 부분 업데이트
      updateCompanyInfo: (partial) => {
        const current = get().companyInfo;
        if (current) {
          set({ companyInfo: { ...current, ...partial } });
          get().updateReportMetadata({ lastUpdated: new Date() });
        }
      },

      // 문단 추가
      addContentSection: (section) => {
        const now = new Date();
        const newSection: PreviewSection = {
          ...section,
          createdAt: now,
          updatedAt: now,
        };

        // 이미 존재하는 섹션이면 업데이트, 없으면 추가
        const existingIndex = get().contentSections.findIndex((s) => s.id === section.id);
        if (existingIndex >= 0) {
          const updated = [...get().contentSections];
          updated[existingIndex] = { ...updated[existingIndex], ...newSection, updatedAt: now };
          set({ contentSections: updated });
        } else {
          set({ contentSections: [...get().contentSections, newSection] });
        }
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 문단 업데이트
      updateContentSection: (id, updates) => {
        const sections = get().contentSections.map((section) =>
          section.id === id
            ? { ...section, ...updates, updatedAt: new Date() }
            : section
        );
        set({ contentSections: sections });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 문단 제거
      removeContentSection: (id) => {
        set({ contentSections: get().contentSections.filter((s) => s.id !== id) });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 차트 추가
      addChart: (chart) => {
        const newChart: ChartData = {
          ...chart,
          id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };
        set({ charts: [...get().charts, newChart] });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 차트 업데이트
      updateChart: (id, updates) => {
        const charts = get().charts.map((chart) =>
          chart.id === id ? { ...chart, ...updates } : chart
        );
        set({ charts });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 차트 제거
      removeChart: (id) => {
        set({ charts: get().charts.filter((c) => c.id !== id) });
        get().updateReportMetadata({ lastUpdated: new Date() });
      },

      // 메타데이터 업데이트
      updateReportMetadata: (metadata) => {
        set({
          reportMetadata: {
            ...get().reportMetadata,
            ...metadata,
            lastUpdated: new Date(),
          },
        });
      },

      // 통합 데이터 가져오기
      getReportData: () => {
        return {
          companyInfo: get().companyInfo,
          contentSections: get().contentSections,
          charts: get().charts,
          reportMetadata: get().reportMetadata,
        };
      },

      // 모든 데이터 초기화
      clearAllData: () => {
        set(initialState);
      },
    }),
    {
      name: 'esg-report-storage', // localStorage key
      storage: createJSONStorage(() => sessionStorage), // sessionStorage 사용
      // Date 객체를 문자열로 변환
      partialize: (state) => ({
        ...state,
        contentSections: state.contentSections.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
        charts: state.charts.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        })),
        reportMetadata: {
          ...state.reportMetadata,
          lastUpdated: state.reportMetadata.lastUpdated.toISOString(),
        },
      }),
      // 문자열을 Date 객체로 복원
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.contentSections = state.contentSections.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }));
          state.charts = state.charts.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }));
          state.reportMetadata.lastUpdated = new Date(state.reportMetadata.lastUpdated as any);
        }
      },
    }
  )
);

