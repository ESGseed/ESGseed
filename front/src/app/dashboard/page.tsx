'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useStore';

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        setMounted(true);

        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        if (mounted && !isAuthenticated) {
            router.push('/');
        }
    }, [mounted, isAuthenticated, router]);

    const handleLogout = () => {
        // 1. 우리 앱의 JWT 제거
        logout();
        
        // 2. 네이버 서버 로그아웃 (선택사항)
        // 네이버 로그인으로 접속했다면 네이버 로그아웃 페이지로 리다이렉트
        // 주의: 이렇게 하면 네이버의 모든 서비스에서 로그아웃됩니다
        // window.location.href = 'https://nid.naver.com/nidlogin.logout?returl=' + encodeURIComponent(window.location.origin);
        
        // 3. 메인 페이지로 이동
        router.push('/');
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

    if (!isAuthenticated) {
        return null; // 리다이렉트 중
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="text-center">
                {/* 카카오 로그인 성공 메시지 */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
                    카카오 로그인이 성공했습니다.
                </h1>

                {/* 로그아웃 버튼 */}
                <button
                    onClick={handleLogout}
                    className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md text-lg font-medium"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
}

