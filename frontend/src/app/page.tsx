'use client';

import Link from 'next/link';

export default function Home() {
  // 네트워크 연결 테스트 (Gateway를 거쳐서 Soccer Service로)
  const testConnection = async () => {
    const apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:9000';
    const soccerApi = process.env.NEXT_PUBLIC_SOCCER_API || '/api/soccer';

    try {
      // 5초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Gateway를 거쳐서 Soccer Service로 요청
      const response = await fetch(`${apiGateway}${soccerApi}/players`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        alert('✅ Gateway → Soccer Service 연결 성공!');
      } else {
        alert('❌ 연결 실패 (응답 코드: ' + response.status + ')');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('연결 실패:', errorMessage);
      alert('❌ 연결 실패!\nGateway를 거쳐 Soccer Service에 연결할 수 없습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
          Welcome
        </h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          서비스에 오신 것을 환영합니다
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* ESG 카드 */}
          <Link
            href="/esg"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 border border-green-200 hover:border-green-300 transition-all hover:shadow-lg"
          >
            <div className="relative z-10">
              <div className="mb-4 text-4xl">🌱</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">ESG</h2>
              <p className="text-gray-600">
                ESG 보고서 작성 및 상담 서비스
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/0 to-green-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Soccer 카드 */}
          <Link
            href="/soccer"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 border border-blue-200 hover:border-blue-300 transition-all hover:shadow-lg"
          >
            <div className="relative z-10">
              <div className="mb-4 text-4xl">⚽</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Soccer</h2>
              <p className="text-gray-600">
                축구 선수, 팀, 경기장 정보 검색
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* 네트워크 연결 테스트 버튼 */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={testConnection}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            🔌 네트워크 연결 테스트
          </button>
        </div>
      </main>

      <footer className="w-full py-6 px-4 text-center border-t border-gray-200 mt-12">
        <p className="text-sm text-gray-500">
          Made with Next.js
        </p>
      </footer>
    </div>
  );
}
