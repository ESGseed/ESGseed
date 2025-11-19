'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { EsgHeader } from '../components/EsgHeader';
import { ChecklistItem } from '../components/ChecklistItem';
import { ChatBubble } from '../components/ChatBubble';

export function ConsultPage() {
  const [chatInput, setChatInput] = useState('');

  const handleSend = () => {
    if (chatInput.trim()) {
      // 메시지 전송 로직 추가
      console.log('Sending:', chatInput);
      setChatInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
    alert('PDF 내보내기 기능이 호출되었습니다.');
  };

  const handleExportWord = () => {
    console.log('Exporting to Word...');
    alert('Word 내보내기 기능이 호출되었습니다.');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      {/* ESG Header */}
      <EsgHeader
        showExportButtons={false}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-full">
          {/* 왼쪽: 전문가 상담 UI */}
          <div className="w-1/2 flex flex-col h-full bg-white/80 backdrop-blur-sm border-r border-emerald-200/50 shadow-lg">
            {/* 필수정보 체크리스트 */}
            <div className="p-6 border-b border-emerald-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  IFRS S2 필수 정보 체크리스트
                </h2>
              </div>
              <ul className="space-y-2">
                <ChecklistItem
                  status="complete"
                  text="S2-5: 거버넌스 (감독 주체)"
                />
                <ChecklistItem
                  status="in-progress"
                  text="S2-7: 리스크 및 기회 (전략 우선순위)"
                />
                <ChecklistItem
                  status="incomplete"
                  text="S2-15: 시나리오 분석 (기준 연도)"
                />
                <ChecklistItem
                  status="incomplete"
                  text="Scope 1, 2, 3 배출량"
                />
              </ul>
            </div>

            {/* 대화 히스토리 */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-emerald-50/20">
              <ChatBubble type="system">
                1단계: TCFD 보고서.pdf (7.8MB) 업로드됨
              </ChatBubble>

              <ChatBubble type="ai">
                <p>
                  2단계: 문단 분석 및 부족정보 파악이 완료되었습니다. IFRS S2
                  기준에 맞춰 몇 가지 질문을 시작하겠습니다. (흐름 4.1)
                </p>
              </ChatBubble>

              <ChatBubble type="ai">
                <p>
                  질문 (S2-5 거버넌스): 경영진의 기후 리스크 감독 주체가
                  누구인가요? (예: 이사회, ESG 위원회) (흐름 4.2)
                </p>
              </ChatBubble>

              <ChatBubble type="user">
                <p>
                  이사회 산하의 &apos;지속가능경영위원회&apos;가 분기별로 감독합니다.
                </p>
              </ChatBubble>

              <ChatBubble type="ai">
                <p>
                  좋습니다. S2-5 문단이 우측에 생성되었습니다. 확인해주세요.
                </p>
                <p className="mt-2">
                  다음 질문 (S2-15 관련): Scope 1·2 데이터의 기준연도는 어떻게
                  되나요? (흐름 4.2)
                </p>
              </ChatBubble>
            </div>

            {/* 대화 입력창 */}
            <div className="p-5 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-t border-emerald-200/50 backdrop-blur-sm">
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-4 border-2 border-emerald-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all"
                  placeholder="AI의 질문에 답변하거나, 궁금한 점을 입력하세요..."
                />
                <button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!chatInput.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 문단 생성 프리뷰 */}
          <div className="w-1/2 flex flex-col h-full bg-gradient-to-br from-gray-50 to-emerald-50/20 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full"></div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                  실시간 보고서 문단 프리뷰
                </h2>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                  흐름 6.2
                </span>
              </div>

              {/* 생성된 문단 예시 1 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-100 mb-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    IFRS S2-5: Governance
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <p className="leading-relaxed">
                    당사는 기후 관련 리스크 및 기회에 대한 효과적인 감독을 위해{' '}
                    <span className="highlight-source">
                      이사회 산하 &apos;지속가능경영위원회&apos;
                      <span className="tooltip">
                        근거: 사용자 입력 (Q:감독 주체)
                      </span>
                    </span>
                    를 설치하여 운영하고 있습니다.{' '}
                    <span className="highlight-source">
                      위원회는 분기별
                      <span className="tooltip">
                        근거: TCFD 보고서 p.5 (수정됨)
                      </span>
                    </span>
                    로 기후 관련 주요 안건을 보고받고, 관련 전략 및 성과를
                    감독합니다.
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <strong className="text-emerald-800">AI 코멘트 (흐름 5.1 검증):</strong>{' '}
                    <span className="text-emerald-700">
                      기준서 충족. &apos;위원회&apos;의 구체적인 역할(예: 성과 측정, 보상
                      연계)을 추가하면 더 좋습니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* 생성된 문단 예시 2 (부족 요소 표시) */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-100 mb-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    IFRS S2-15: Scenario Analysis
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <p className="leading-relaxed">
                    당사는 NZE 2050, 2도 시나리오 등을 활용하여 기후 관련 전환
                    리스크를 분석합니다.{' '}
                    <span className="highlight-source highlight-source-error">
                      [기준연도 데이터 입력 필요]
                      <span className="tooltip">
                        근거: 정량요소 부족 (AI가 수정 요청)
                      </span>
                    </span>
                    를 기준으로 분석을 수행하였으며...
                  </p>
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <strong className="text-amber-800">AI 코멘트 (흐름 5.1 검증):</strong>{' '}
                    <span className="text-amber-700">
                      정량요소 부족. &apos;Scope 1·2 데이터의 기준연도&apos;를 왼쪽
                      채팅창에 입력해주세요. (흐름 4.1-6)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

