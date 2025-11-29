'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useStore';

const providerConfig: Record<string, { name: string; color: string; idKey: string }> = {
    kakao: { name: '카카오', color: 'border-yellow-500', idKey: 'kakaoId' },
    naver: { name: '네이버', color: 'border-green-500', idKey: 'naverId' },
    google: { name: '구글', color: 'border-blue-500', idKey: 'googleId' },
};

export default function OAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const provider = params.provider as string;
    const config = providerConfig[provider] || { name: provider, color: 'border-gray-500', idKey: 'id' };

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setErrorMessage(`${config.name} 로그인이 취소되었습니다.`);
            return;
        }

        if (!code) {
            setStatus('error');
            setErrorMessage('인가 코드를 받지 못했습니다.');
            return;
        }

        const processCallback = async () => {
            try {
                const body: Record<string, string> = { code };
                if (state) body.state = state;

                const response = await fetch(`http://localhost:8080/api/user/${provider}/callback`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const token = data.accessToken || `${provider}-${data[config.idKey]}-${Date.now()}`;
                    login(token);
                    setStatus('success');
                    setTimeout(() => router.push('/dashboard'), 1000);
                } else {
                    setStatus('error');
                    setErrorMessage(data.message || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error(`${config.name} 콜백 처리 에러:`, error);
                setStatus('error');
                setErrorMessage('로그인 처리 중 오류가 발생했습니다.');
            }
        };

        processCallback();
    }, [searchParams, login, router, provider, config]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${config.color} mx-auto mb-4`}></div>
                        <p className="text-gray-600">{config.name} 로그인 처리 중...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-600">로그인 성공! 잠시 후 이동합니다...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 mb-4">{errorMessage}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            로그인 페이지로 돌아가기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

