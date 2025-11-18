'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [inputValue, setInputValue] = useState('');

  // 통합 검색 함수 (수정됨!)
  const searchSoccer = async (keyword: string) => {
    try {
      // 환경 변수에서 API URL 가져오기, 없으면 기본값 사용
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${apiUrl}/api/soccer/search`, {
        params: { keyword }  // ← keyword로 통일!
      });

      console.log('백엔드 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('검색 실패:', error);
      throw error;
    }
  };

  // 네트워크 연결 테스트 (Gateway를 거쳐서 Soccer Service로)
  const testConnection = async () => {
    const apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:9000';
    const soccerApi = process.env.NEXT_PUBLIC_SOCCER_API || '/api/soccer';

    try {
      // 5초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Gateway를 거쳐서 Soccer Service로 요청
      // http://api-gateway:9000/api/soccer/players
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
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-4">
        <h1 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-12 text-center">
          지금 무슨 생각을 하시나요?
        </h1>

        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow bg-white">
            <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <input
              type="text"
              placeholder="선수, 팀, 경기장을 검색하세요"
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  await searchSoccer(inputValue);
                }
              }}
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 검색 버튼 */}
              <button
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                onClick={async () => {
                  if (!inputValue.trim()) {
                    alert('검색어를 입력해주세요!');
                    return;
                  }

                  await searchSoccer(inputValue);  // ← 수정된 함수 호출
                  console.log("검색한 키워드: " + inputValue);
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6m0 0a2 2 0 012-2h2a2 2 0 012 2v13m-6-6h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12v7m14-7v7" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            축구 관련 정보를 검색할 수 있습니다.
          </p>

          {/* 네트워크 연결 테스트 버튼 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              🔌 네트워크 연결 테스트
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 px-4 text-center">
        <p className="text-sm text-gray-500">
          ChatGPT Clone · Made with Next.js
        </p>
      </footer>
    </div>
  );
}
