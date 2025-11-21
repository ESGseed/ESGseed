import React from 'react';

export type ChecklistStatus = 'completed' | 'in-progress' | 'missing';

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
}

export interface ChatMessage {
  id: number;
  sender: 'system' | 'ai' | 'user';
  text: string;
  type: 'system' | 'message';
}

export interface PreviewCard {
  id: string;
  title: string;
  content: React.ReactNode;
  aiComment: string;
  commentType: 'info' | 'error';
}

export interface ReportSection {
  title: string;
  content: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 's2-5', label: 'S2-5: 거버넌스 (감독 주체)', status: 'completed' },
  { id: 's2-7', label: 'S2-7: 리스크 및 기회 (전략 우선순위)', status: 'in-progress' },
  { id: 's2-15', label: 'S2-15: 시나리오 분석 (기준 연도)', status: 'missing' },
  { id: 'scope', label: 'Scope 1, 2, 3 배출량', status: 'missing' },
];

export const CHAT_HISTORY_MOCK: ChatMessage[] = [
  {
    id: 1,
    sender: 'system',
    text: '1단계: TCFD 보고서.pdf (7.8MB) 업로드됨',
    type: 'system',
  },
  {
    id: 2,
    sender: 'ai',
    text: '2단계: 문단 분석 및 부족정보 파악이 완료되었습니다. IFRS S2 기준에 맞춰 몇 가지 질문을 시작하겠습니다.',
    type: 'message',
  },
  {
    id: 3,
    sender: 'ai',
    text: '질문 (S2-5 거버넌스): 경영진의 기후 리스크 감독 주체가 누구인가요? (예: 이사회, ESG 위원회)',
    type: 'message',
  },
  {
    id: 4,
    sender: 'user',
    text: '이사회 산하의 \'지속가능경영위원회\'가 분기별로 감독합니다.',
    type: 'message',
  },
  {
    id: 5,
    sender: 'ai',
    text: '좋습니다. S2-5 문단이 우측에 생성되었습니다. 확인해주세요.',
    type: 'message',
  },
];

export const PREVIEW_CARDS: PreviewCard[] = [
  {
    id: 'card-1',
    title: 'IFRS S2-5: Governance',
    content: (
      <>
        당사는 기후 관련 리스크 및 기회에 대한 효과적인 감독을 위해 <span className="bg-yellow-100 border-b-2 border-yellow-300 font-medium">이사회 산하 &apos;지속가능경영위원회&apos;</span>를 설치하여 운영하고 있습니다. <span className="bg-yellow-100 border-b-2 border-yellow-300 font-medium">위원회는 분기별로</span> 기후 관련 주요 안건을 보고받고, 관련 전략 및 성과를 감독합니다.
      </>
    ),
    aiComment: "기준서 충족. '위원회'의 구체적인 역할(예: 성과 측정, 보상 연계)을 추가하면 더 좋습니다.",
    commentType: 'info',
  },
  {
    id: 'card-2',
    title: 'IFRS S2-15: Scenario Analysis',
    content: (
      <>
        당사는 NZE 2050, 2도 시나리오 등을 활용하여 기후 관련 전환 리스크를 분석합니다. <span className="text-red-600 bg-red-50 border-b border-red-400 font-medium">[기준연도 데이터 입력 필요]</span>를 기준으로 분석을 수행하였으며...
      </>
    ),
    aiComment: "정량요소 부족. 'Scope 1·2 데이터의 기준연도'를 왼쪽 채팅창에 입력해주세요.",
    commentType: 'error',
  }
];

export const FINAL_REPORT_CONTENT: ReportSection[] = [
  {
    title: '1. Governance (S2-5)',
    content: "당사는 기후 관련 리스크 및 기회에 대한 효과적인 감독을 위해 이사회 산하 '지속가능경영위원회'를 설치하여 운영하고 있습니다. 위원회는 분기별로 기후 관련 주요 안건을 보고받고, 관련 전략 및 성과를 감독합니다.\n\n경영진은 위원회에서 승인된 기후 전략을 이행하며, 기후 리스크 식별 및 평가에 대한 책임을 집니다."
  },
  {
    title: '2. Risks & Opportunities (S2-7)',
    content: "당사는 단기, 중기, 장기에 걸쳐 식별된 주요 기후 관련 리스크와 기회를 관리합니다. 주요 전환 리스크로는 탄소 배출 규제 강화가 있으며, 물리적 리스크로는 극한 기후 현상 증가를 식별하였습니다.\n\n기회 요인으로는 저탄소 제품 및 서비스 시장 확대를 식별하고, 관련 기술 개발에 R&D 투자를 집중하고 있습니다."
  },
  {
    title: '3. Metrics & Targets (S2-15)',
    content: "당사의 온실가스 배출량은 2023년(기준연도) 대비 2030년까지 Scope 1, 2 배출량을 40% 감축하는 것을 목표로 합니다.\n\n주요 지표:\n• Scope 1 배출량 (tCO2e)"
  }
];

