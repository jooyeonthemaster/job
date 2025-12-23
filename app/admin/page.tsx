'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import JobsTab from '@/components/admin/JobsTab';
import AdminCreatedTab from '@/components/admin/AdminCreatedTab';
import ProfileViewsTab from '@/components/admin/ProfileViewsTab';
import BannersTab from '@/components/admin/BannersTab';
import AdminPaymentsTab from '@/components/admin/AdminPaymentsTab';
import AdminRefundsTab from '@/components/admin/AdminRefundsTab';
import { Settings, Briefcase, LogOut, Star, Eye, Monitor, CreditCard, RotateCcw } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jobs' | 'admin-created' | 'profile-views' | 'payments' | 'refunds' | 'banners'>('jobs');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // 브라우저 탭이 다시 활성화될 때 세션 refresh (idle 후 stale 연결 방지)
  // 2분 이상 idle 상태였을 때만 체크
  useEffect(() => {
    let lastVisibleTime = Date.now();
    const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2분

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // 탭이 숨겨질 때 시간 기록
        lastVisibleTime = Date.now();
        return;
      }

      // 탭이 다시 보일 때
      if (document.visibilityState === 'visible' && authorized) {
        const idleTime = Date.now() - lastVisibleTime;

        // 2분 미만 idle이면 체크 안 함
        if (idleTime < IDLE_THRESHOLD_MS) {
          console.log(`[Admin] 탭 활성화 (idle: ${Math.round(idleTime / 1000)}초) - 체크 스킵`);
          return;
        }

        console.log(`[Admin] 탭 활성화 (idle: ${Math.round(idleTime / 1000)}초) - 세션 refresh 중...`);
        try {
          // 5초 타임아웃으로 refreshSession (stale 연결 시 hang 방지)
          const refreshResult = await Promise.race([
            supabase.auth.refreshSession(),
            new Promise<{ error: Error }>((resolve) =>
              setTimeout(() => resolve({ error: new Error('세션 refresh 타임아웃 (5초)') }), 5000)
            )
          ]);

          if (refreshResult.error) {
            console.warn('[Admin] 세션 refresh 실패:', refreshResult.error.message);
            // 디버깅: 자동 새로고침 대신 alert으로 원인 파악
            if (refreshResult.error.message.includes('타임아웃')) {
              console.warn('[Admin] Supabase 연결 stale 감지');
              alert('[디버깅] visibilitychange로 인한 stale 감지.\n이 알림 없이 새로고침되면 다른 원인입니다.');
              // window.location.reload(); // 일시 비활성화
              return;
            }
          } else {
            console.log('[Admin] 세션 refresh 성공');
          }
        } catch (err) {
          console.warn('[Admin] 세션 refresh 에러:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authorized]);

  const checkAuth = async () => {
    try {
      // 세션과 유저 정보를 한 번에 가져옴 (이후 자식 컴포넌트에서 재호출 안 함)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const user = session.user;

      // 간단한 어드민 체크 (이메일 기반)
      // 프로덕션에서는 더 강력한 권한 체크 필요
      const adminEmails = [
        'admin@ssmhr.com',
        'yjpark@ssmhr.com',
        'joo.y.oh.ko@gmail.com',
        'nadr110619@gmail.com',
        'admin@gmail.com'
      ];

      if (!adminEmails.includes(user.email || '')) {
        alert('어드민 권한이 없습니다.');
        router.push('/');
        return;
      }

      // 세션 토큰 저장 (자식 컴포넌트에서 사용)
      setAccessToken(session.access_token);
      setAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
                <p className="text-sm text-gray-600">채용공고 및 시스템 관리</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              공고 관리
            </button>
            <button
              onClick={() => setActiveTab('admin-created')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'admin-created'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-5 h-5" />
              관리자 생성 항목
            </button>
            <button
              onClick={() => setActiveTab('profile-views')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'profile-views'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-5 h-5" />
              프로필 열람 내역
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              결제 내역
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'refunds'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              환불 관리
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'banners'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-5 h-5" />
              광고 배너 관리
            </button>
          </div>
        </div>
      </div>

      {/* Content - 탭 컴포넌트를 언마운트하지 않고 CSS로 숨김 (idle 후 재마운트 시 Supabase 연결 문제 방지) */}
      {/* isActive prop으로 탭 활성화 시 데이터 재로드 */}
      <div className="px-8 py-8">
        <div className={activeTab === 'jobs' ? '' : 'hidden'}>
          <JobsTab isActive={activeTab === 'jobs'} />
        </div>
        <div className={activeTab === 'admin-created' ? '' : 'hidden'}>
          <AdminCreatedTab isActive={activeTab === 'admin-created'} />
        </div>
        <div className={activeTab === 'profile-views' ? '' : 'hidden'}>
          <ProfileViewsTab isActive={activeTab === 'profile-views'} accessToken={accessToken} />
        </div>
        <div className={activeTab === 'payments' ? '' : 'hidden'}>
          <AdminPaymentsTab isActive={activeTab === 'payments'} />
        </div>
        <div className={activeTab === 'refunds' ? '' : 'hidden'}>
          <AdminRefundsTab isActive={activeTab === 'refunds'} />
        </div>
        <div className={activeTab === 'banners' ? '' : 'hidden'}>
          <BannersTab isActive={activeTab === 'banners'} />
        </div>
      </div>
    </div>
  );
}


