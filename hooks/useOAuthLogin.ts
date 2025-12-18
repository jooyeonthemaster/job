// OAuth 로그인 처리 훅
// app/login/page.tsx에서 분리 (기능 변경 없음)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import type { LoginTab } from './useLoginForm';

type UseOAuthLoginProps = {
  activeTab: LoginTab;
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
};

export function useOAuthLogin({ activeTab, setError, setIsLoading }: UseOAuthLoginProps) {
  const router = useRouter();

  // Google OAuth Implicit Flow 처리 (hash fragment)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;

      // OAuth 리다이렉트 후 hash fragment 확인
      if (hash && hash.includes('access_token')) {
        console.log('[Login] OAuth hash fragment 감지:', hash.substring(0, 50));

        // 1순위: URL 파라미터에서 type 확인 (가장 안전)
        const urlParams = new URLSearchParams(window.location.search);
        const typeFromUrl = urlParams.get('type');

        // 2순위: localStorage 확인
        const savedTab =
          typeFromUrl ||
          localStorage.getItem('signup_oauth_tab') ||
          localStorage.getItem('login_oauth_tab') ||
          'company'; // 기본값을 company로 변경 (더 안전)

        console.log('[Login] URL에서 확인된 type:', typeFromUrl);
        console.log('[Login] localStorage에서 확인된 회원 유형:', savedTab);

        // 세션이 설정될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));

        // 최신 세션 가져오기
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error('[Login] 세션을 찾을 수 없습니다');
          return;
        }

        const currentUser = session.user;
        console.log('[Login] 현재 사용자 ID:', currentUser.id);

        try {
          if (savedTab === 'company') {
            await handleCompanyOAuth(currentUser);
          } else {
            await handleJobseekerOAuth(currentUser);
          }
        } catch (error) {
          console.error('[Login] OAuth DB 생성 에러:', error);
        }
      }
    };

    // 기업 회원 OAuth 처리
    const handleCompanyOAuth = async (currentUser: any) => {
      console.log('[Login] 기업 회원 OAuth 처리 시작');

      // ✅ 먼저 개인 회원으로 가입되어 있는지 체크
      const { data: existingJobseeker } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existingJobseeker) {
        console.warn('[Login] ⚠️ 이미 개인 회원으로 가입된 계정:', existingJobseeker.email);

        // 로그아웃
        await supabase.auth.signOut();

        // localStorage 정리
        localStorage.removeItem('login_oauth_tab');
        localStorage.setItem('login_error', '이미 개인 회원으로 가입된 계정입니다. 개인 회원 탭에서 로그인해주세요.');

        // 로그인 페이지로 리다이렉트 (새로고침)
        window.location.href = '/login?error=already_registered_as_jobseeker';
        return;
      }

      // ✅ 1. 즉시 localStorage 설정 (AuthContext보다 먼저 실행됨)
      localStorage.setItem('pending_user_type', 'company');
      console.log('[Login] pending_user_type = "company" localStorage 설정 완료');

      // 2. metadata 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: 'company' }
      });

      if (updateError) {
        console.error('[Login] metadata 업데이트 실패:', updateError);
      } else {
        console.log('[Login] metadata.user_type = "company" 업데이트 완료');
      }

      // ✅ 3. metadata 전파 대기 (500ms → 800ms 증가)
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Login] metadata 전파 대기 완료 (800ms)');

      // 기존 companies 레코드 확인 (profile_completed도 함께 조회)
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id, profile_completed, name')
        .eq('id', currentUser.id)
        .maybeSingle();

      // localStorage 정리
      localStorage.removeItem('signup_oauth_tab');
      localStorage.removeItem('login_oauth_tab');

      // URL hash 정리
      window.history.replaceState(null, '', window.location.pathname);

      // 조건부 리다이렉션
      if (existingCompany && existingCompany.profile_completed) {
        // 프로필 완성된 기업 → 대시보드로
        console.log('[Login] 프로필 완성된 기업 → /company-dashboard');
        router.push('/company-dashboard');
      } else if (existingCompany && !existingCompany.profile_completed) {
        // 레코드는 있지만 프로필 미완성 → 온보딩으로
        console.log('[Login] 프로필 미완성 → /signup/company');
        router.push('/signup/company');
      } else {
        // 레코드 없음 → 빈 레코드 생성 후 온보딩으로
        console.log('[Login] companies 테이블 빈 레코드 생성 중...');
        const { error: insertError } = await supabase.from('companies').insert({
          id: currentUser.id,
          email: currentUser.email!,
          registration_number: '',
          name: '',
          ceo_name: '',
          established: '',
          company_type: 'individual',
          employee_count: '',
          website: '',
          location: '',
          address: '',
          manager_department: '',
          manager_name: '',
          manager_email: currentUser.email!,
          profile_completed: false,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error('[Login] companies INSERT 에러:', insertError);
        } else {
          console.log('[Login] companies 레코드 생성 완료');
        }

        console.log('[Login] 신규 기업 → /signup/company');
        router.push('/signup/company');
      }
    };

    // 개인 회원 OAuth 처리
    const handleJobseekerOAuth = async (currentUser: any) => {
      console.log('[Login] 개인 회원 OAuth 처리 시작');

      // ✅ 먼저 기업 회원으로 가입되어 있는지 체크
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id, email, name')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existingCompany) {
        console.warn('[Login] ⚠️ 이미 기업 회원으로 가입된 계정:', existingCompany.email);

        // 로그아웃
        await supabase.auth.signOut();

        // localStorage 정리
        localStorage.removeItem('login_oauth_tab');
        localStorage.setItem('login_error', '이미 기업 회원으로 가입된 계정입니다. 기업 회원 탭에서 로그인해주세요.');

        // 로그인 페이지로 리다이렉트 (새로고침)
        window.location.href = '/login?error=already_registered_as_company';
        return;
      }

      // 먼저 metadata 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: 'jobseeker' }
      });

      if (updateError) {
        console.error('[Login] metadata 업데이트 실패:', updateError);
      } else {
        console.log('[Login] metadata.user_type = "jobseeker" 업데이트 완료');
      }

      // 기존 users 레코드 확인 (onboarding_completed 포함)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, onboarding_completed')
        .eq('id', currentUser.id)
        .maybeSingle();

      // 없으면 빈 레코드 생성
      if (!existingUser) {
        console.log('[Login] users 테이블 빈 레코드 생성 중...');
        const { error: insertError } = await supabase.from('users').insert({
          id: currentUser.id,
          email: currentUser.email!,
          user_type: 'jobseeker',
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
          phone: '',
          foreigner_number: '',
          address: '',
          address_detail: '',
          nationality: '',
          gender: '',
          korean_level: '',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error('[Login] users INSERT 에러 상세:', {
            message: insertError?.message,
            code: insertError?.code,
            details: insertError?.details,
            hint: insertError?.hint,
            fullError: JSON.stringify(insertError, null, 2)
          });
        } else {
          console.log('[Login] users 레코드 생성 완료');
        }
      } else {
        console.log('[Login] users 레코드 이미 존재함, onboarding_completed:', existingUser.onboarding_completed);
      }

      // localStorage 정리
      localStorage.removeItem('signup_oauth_tab');
      localStorage.removeItem('login_oauth_tab');

      // URL hash 정리
      window.history.replaceState(null, '', window.location.pathname);

      // 온보딩 완료 여부에 따라 리다이렉트
      if (existingUser && existingUser.onboarding_completed) {
        console.log('[Login] 온보딩 완료 → /jobseeker-dashboard');
        router.push('/jobseeker-dashboard');
      } else {
        console.log('[Login] 온보딩 미완료 → /onboarding/job-seeker/quick');
        router.push('/onboarding/job-seeker/quick');
      }
    };

    handleOAuthCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 마운트 1번만 실행 (router 의존성 제거 - OAuth 콜백 중복 방지)
}

// 소셜 로그인 헬퍼 함수들
export const handleGoogleLogin = async (activeTab: LoginTab, setError: (error: string) => void, setIsLoading: (loading: boolean) => void) => {
  setError('');
  setIsLoading(true);

  try {
    console.log('[Login] 구글 로그인 시작:', activeTab);

    // 기존 localStorage 정리 (이전 값 제거)
    localStorage.removeItem('signup_oauth_tab');
    localStorage.removeItem('login_oauth_tab');

    // localStorage에 현재 탭 저장 (OAuth 후 확인용)
    localStorage.setItem('login_oauth_tab', activeTab);
    console.log('[Login] localStorage에 저장:', activeTab);

    // Supabase Google OAuth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: activeTab === 'company'
          ? `${window.location.origin}/auth/callback?type=company`
          : `${window.location.origin}/auth/callback?type=jobseeker`,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      console.error('[Login] 구글 로그인 에러:', error);
      throw error;
    }

    console.log('[Login] 구글 로그인 리다이렉트 중...');
  } catch (err: any) {
    console.error('[Login] 구글 로그인 에러:', err);
    setError(err?.message || '구글 로그인 중 오류가 발생했습니다.');
    setIsLoading(false);
  }
};

export const handleKakaoLogin = async (activeTab: LoginTab, setError: (error: string) => void, setIsLoading: (loading: boolean) => void) => {
  setError('');
  setIsLoading(true);

  try {
    console.log('[Login] 카카오 로그인 시작:', activeTab);

    // 기존 localStorage 정리 (이전 값 제거)
    localStorage.removeItem('signup_oauth_tab');
    localStorage.removeItem('login_oauth_tab');

    // localStorage에 현재 탭 저장 (OAuth 후 확인용)
    localStorage.setItem('login_oauth_tab', activeTab);
    console.log('[Login] localStorage에 저장:', activeTab);

    // Supabase Kakao OAuth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: activeTab === 'company'
          ? `${window.location.origin}/auth/callback?type=company`
          : `${window.location.origin}/auth/callback?type=jobseeker`,
        skipBrowserRedirect: false,
        queryParams: { scope: 'profile_nickname,profile_image' }, // account_email 권한 없으므로 제외
      }
    });

    if (error) {
      console.error('[Login] 카카오 로그인 에러:', error);
      throw error;
    }

    console.log('[Login] 카카오 로그인 리다이렉트 중...');
  } catch (err: any) {
    console.error('[Login] 카카오 로그인 에러:', err);
    setError(err?.message || '카카오 로그인 중 오류가 발생했습니다.');
    setIsLoading(false);
  }
};

export const handleNaverLogin = (activeTab: LoginTab, setError: (error: string) => void, setIsLoading: (loading: boolean) => void) => {
  setError('');
  setIsLoading(true);

  try {
    console.log('[Login] 네이버 로그인 시작:', activeTab);

    // API Route로 리다이렉트 (type 파라미터 전달)
    window.location.href = `/api/auth/naver?type=${activeTab}`;
  } catch (err: any) {
    console.error('[Login] 네이버 로그인 에러:', err);
    setError(err?.message || '네이버 로그인 중 오류가 발생했습니다.');
    setIsLoading(false);
  }
};
