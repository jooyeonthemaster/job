'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';

function NaverLoginContent() {
  const router = useRouter();

  useEffect(() => {
    const handleNaverLogin = async () => {
      try {
        // ✅ 보안 개선: API를 통해 httpOnly 쿠키에서 세션 정보 가져오기
        console.log('[Naver Login] 세션 정보 요청 중...');
        const response = await fetch('/api/auth/naver/get-session', {
          method: 'GET',
          credentials: 'include',  // 쿠키 포함
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Naver Login] 세션 정보 없음:', errorData);
          router.push('/login?error=invalid_session');
          return;
        }

        const { email, password, redirect } = await response.json();
        console.log('[Naver Login] 자동 로그인 시작:', { email, redirect });

        // Supabase 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[Naver Login] 로그인 에러:', error);
          throw error;
        }

        console.log('[Naver Login] 로그인 성공:', data.user.id);

        // 세션 설정 완료 대기
        await new Promise(resolve => setTimeout(resolve, 500));

        // 온보딩/대시보드로 리다이렉트
        console.log('[Naver Login] 리다이렉트:', redirect);
        router.push(redirect);

      } catch (err: any) {
        console.error('[Naver Login] 에러 발생:', err);
        router.push('/login?error=auto_login_failed');
      }
    };

    handleNaverLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">네이버 로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function NaverLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <NaverLoginContent />
    </Suspense>
  );
}

