// 이메일 로그인 처리 훅
// app/login/page.tsx에서 분리 (기능 변경 없음)

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import type { LoginTab } from './useLoginForm';

export function useEmailLogin() {
  const router = useRouter();

  const handleEmailLogin = async (
    email: string,
    password: string,
    activeTab: LoginTab,
    setError: (error: string) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] Supabase 로그인 시작:', email, activeTab);

      // Supabase Auth로 로그인
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('[Login] Supabase 로그인 에러:', loginError);
        throw loginError;
      }

      if (!authData.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      console.log('[Login] Supabase 로그인 성공:', authData.user.id);

      if (activeTab === 'company') {
        // 기업 회원 - Companies 테이블 확인
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (companyError) {
          console.error('[Login] 기업 정보 조회 에러:', companyError);
          throw new Error('기업 정보를 확인할 수 없습니다.');
        }

        if (companyData) {
          console.log('[Login] 기업 회원 확인 -> /company-dashboard');
          router.push('/company-dashboard');
        } else {
          console.log('[Login] 기업 회원 아님 -> 로그아웃');
          setError('기업 회원 계정이 아닙니다. 기업 회원가입을 진행해주세요.');
          await supabase.auth.signOut();
        }
      } else {
        // 개인 회원 - users 테이블 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, onboarding_completed')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userError) {
          console.error('[Login] 사용자 정보 조회 에러:', userError);
          throw new Error('사용자 정보를 확인할 수 없습니다.');
        }

        if (userData) {
          if (userData.onboarding_completed) {
            console.log('[Login] 개인 회원 (온보딩 완료) -> /jobseeker-dashboard');
            router.push('/jobseeker-dashboard');
          } else {
            console.log('[Login] 개인 회원 (온보딩 미완료) -> /onboarding/job-seeker/quick');
            router.push('/onboarding/job-seeker/quick');
          }
        } else {
          console.log('[Login] 개인 회원 아님 -> 로그아웃');
          setError('개인 회원 계정이 아닙니다. 개인 회원가입을 진행해주세요.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      console.error('[Login] 에러 발생:', err);

      if (err?.message?.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      } else {
        setError(err?.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleEmailLogin };
}
