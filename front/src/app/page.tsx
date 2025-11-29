'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useStore';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'kakao' | 'naver' | 'google' | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSocialLogin = async (provider: 'facebook' | 'kakao' | 'naver' | 'google') => {
    if (provider === 'kakao') {
      // 카카오 로그인: 1단계 - 카카오 인증 URL 받기
      setLoadingProvider('kakao');
      try {
        const response = await fetch('http://localhost:8080/api/user/kakao/login', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // 카카오 로그인 페이지로 리다이렉트
          if (data.authUrl) {
            window.location.href = data.authUrl;
          } else {
            console.error('카카오 인증 URL을 받지 못했습니다.');
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          console.error('카카오 로그인 URL 요청 실패:', response.statusText);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('카카오 로그인 에러:', error);
        alert('로그인 중 오류가 발생했습니다.');
      } finally {
        setLoadingProvider(null);
      }
    } else if (provider === 'naver') {
      // 네이버 로그인: 1단계 - 네이버 인증 URL 받기
      setLoadingProvider('naver');
      try {
        const response = await fetch('http://localhost:8080/api/user/naver/login', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // 네이버 로그인 페이지로 리다이렉트
          if (data.authUrl) {
            window.location.href = data.authUrl;
          } else {
            console.error('네이버 인증 URL을 받지 못했습니다.');
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          console.error('네이버 로그인 URL 요청 실패:', response.statusText);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('네이버 로그인 에러:', error);
        alert('로그인 중 오류가 발생했습니다.');
      } finally {
        setLoadingProvider(null);
      }
    } else if (provider === 'google') {
      // 구글 로그인: 1단계 - 구글 인증 URL 받기
      setLoadingProvider('google');
      try {
        const response = await fetch('http://localhost:8080/api/user/google/login', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // 구글 로그인 페이지로 리다이렉트
          if (data.authUrl) {
            window.location.href = data.authUrl;
          } else {
            console.error('구글 인증 URL을 받지 못했습니다.');
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          console.error('구글 로그인 URL 요청 실패:', response.statusText);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('구글 로그인 에러:', error);
        alert('로그인 중 오류가 발생했습니다.');
      } finally {
        setLoadingProvider(null);
      }
    } else {
      // 다른 소셜 로그인은 기존 방식 유지
      console.log(`${provider} 로그인 시도`);
      login(`temp-token-${provider}-${Date.now()}`);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로그인 제목 */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          로그인
        </h1>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-3">
          {/* 페이스북 로그인 */}
          <button
            onClick={() => handleSocialLogin('facebook')}
            className="w-full h-14 bg-[#1877F2] text-white rounded-lg flex items-center justify-center gap-3 hover:bg-[#166FE5] transition-colors shadow-md"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#1877F2] font-bold text-sm">f</span>
            </div>
            <span className="font-medium">페이스북 계정으로 로그인</span>
          </button>

          {/* 카카오톡 로그인 */}
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loadingProvider !== null}
            className="w-full h-14 bg-[#FEE500] text-black rounded-lg flex items-center justify-center gap-3 hover:bg-[#FDD835] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'kakao' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span className="font-medium">로그인 중...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="text-xs font-bold">톡</span>
                </div>
                <span className="font-medium">카카오톡 계정으로 로그인</span>
              </>
            )}
          </button>

          {/* 네이버 로그인 */}
          <button
            onClick={() => handleSocialLogin('naver')}
            disabled={loadingProvider !== null}
            className="w-full h-14 bg-[#03C75A] text-white rounded-lg flex items-center justify-center gap-3 hover:bg-[#02B350] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'naver' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="font-medium">로그인 중...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#03C75A] font-bold text-sm">N</span>
                </div>
                <span className="font-medium">네이버 계정으로 로그인</span>
              </>
            )}
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loadingProvider !== null}
            className="w-full h-14 bg-[#F5F5F5] text-gray-700 rounded-lg flex items-center justify-center gap-3 hover:bg-[#EEEEEE] transition-colors shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'google' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                <span className="font-medium">로그인 중...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <span className="font-medium">구글 계정으로 로그인</span>
              </>
            )}
          </button>
        </div>

        {/* 이용약관 및 개인정보처리방침 */}
        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          회원가입 없이 이용 가능하며 첫 로그인시{' '}
          <a
            href="/terms"
            className="text-blue-400 hover:text-blue-500 underline"
          >
            이용약관
          </a>
          {' '}및{' '}
          <a
            href="/privacy"
            className="text-blue-400 hover:text-blue-500 underline"
          >
            개인정보처리방침
          </a>
          {' '}동의로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
