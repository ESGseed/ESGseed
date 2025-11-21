"use client";

type TabType = 'consultation' | 'report';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex gap-6">
        <button
          onClick={() => onTabChange('consultation')}
          className={`py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'consultation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          전문가 상담 및 문단 생성
        </button>
        <button
          onClick={() => onTabChange('report')}
          className={`py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'report'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          최종 보고서 조합
        </button>
      </div>
    </div>
  );
}

