'use client';

import { EsgHeader } from '../components/EsgHeader';

export function ReportPage() {
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
      {/* ESG Header with Export Buttons */}
      <EsgHeader
        showExportButtons={true}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            {/* 헤더 섹션 */}
            <div className="mb-12 text-center">
              <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                IFRS S2 기반 보고서
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4">
                연간 기후 공시 보고서
              </h1>
              <p className="text-gray-600 text-lg">
                AI ESG Consultant와의 대화형 정보 수집 및 검증을 통해 생성되었습니다
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>버전:</span>
                <span className="font-semibold text-emerald-700">v1.0</span>
                <span className="text-gray-400">|</span>
                <span>생성일:</span>
                <span className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* 섹션 1 */}
            <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  1. Governance (S2-5)
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4 leading-relaxed">
                <p>
                  당사는 기후 관련 리스크 및 기회에 대한 효과적인 감독을 위해
                  이사회 산하 &apos;지속가능경영위원회&apos;를 설치하여 운영하고 있습니다.
                  위원회는 분기별로 기후 관련 주요 안건을 보고받고, 관련 전략 및
                  성과를 감독합니다.
                </p>
                <p>
                  경영진은 위원회에서 승인된 기후 전략을 이행하며, 기후 리스크
                  식별 및 평가에 대한 책임을 집니다.
                </p>
              </div>
            </section>

            {/* 섹션 2 */}
            <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  2. Risks & Opportunities (S2-7)
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4 leading-relaxed">
                <p>
                  당사는 단기, 중기, 장기에 걸쳐 식별된 주요 기후 관련 리스크와
                  기회를 관리합니다. 주요 전환 리스크로는 탄소 배출 규제 강화가
                  있으며, 물리적 리스크로는 극한 기후 현상 증가를 식별하였습니다.
                </p>
                <p>
                  기회 요인으로는 저탄소 제품 및 서비스 시장 확대를 식별하고, 관련
                  기술 개발에 R&D 투자를 집중하고 있습니다.
                </p>
              </div>
            </section>

            {/* 섹션 3 */}
            <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  3. Metrics & Targets (S2-15)
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4 leading-relaxed">
                <p>
                  당사의 온실가스 배출량은 2023년(기준연도) 대비 2030년까지 Scope
                  1, 2 배출량을 40% 감축하는 것을 목표로 합니다.
                </p>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-l-4 border-emerald-500 mt-6">
                  <p className="font-semibold text-emerald-900 mb-3">주요 지표:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Scope 1 배출량 (tCO2e)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Scope 2 배출량 (Market-based, tCO2e)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      기후 관련 전환 리스크에 노출된 자산 (금액)
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

