'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// =====================================================
// 타입 정의
// =====================================================
// Updated: DB 테이블 기반 타입 판단

export type UserType = 'company' | 'jobseeker';

export interface AuthUser extends SupabaseUser {
  user_type?: UserType;
}

interface AuthContextType {
  user: AuthUser | null;
  userType: UserType | null;
  userProfile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// =====================================================
// Context 생성
// =====================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => { },
  refreshUserProfile: async () => { }
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// =====================================================
// Provider 컴포넌트
// =====================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ===================================================
  // 사용자 프로필 가져오기
  // ===================================================
  const fetchUserProfile = async (userId: string, type: UserType) => {
    try {
      console.log('[AuthContext] 프로필 조회 시작:', { userId, type });

      // ✅ 개별 타임아웃 제거 - 전역 config.ts의 10초 타임아웃 + 재시도에 맡김
      if (type === 'company') {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[AuthContext] companies 테이블 조회 에러:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return null;
        }

        if (!data) {
          console.log('[AuthContext] 기업 프로필 없음 (온보딩 진행 중)');
          return null;
        }

        console.log('[AuthContext] 기업 프로필 조회 성공:', data?.name);
        return data;
      } else {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            skills:user_skills(skill_name),
            languages:user_languages(language_name, proficiency),
            experiences:user_experiences(*),
            educations:user_educations(*),
            desired_positions:user_desired_positions(position_name),
            preferred_locations:user_preferred_locations(location_name),
            salary_range:user_salary_range(*)
          `)
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[AuthContext] users 테이블 조회 에러:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return null;
        }

        if (!data) {
          console.log('[AuthContext] 개인 프로필 없음 (온보딩 진행 중)');
          return null;
        }

        console.log('[AuthContext] 개인 프로필 조회 성공:', data?.full_name);
        console.log('[AuthContext] 경력 개수:', data?.experiences?.length || 0);
        console.log('[AuthContext] 학력 개수:', data?.educations?.length || 0);
        return data;
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[AuthContext] 프로필 조회 실패:', err.message);
      return null;
    }
  };

  // ===================================================
  // 사용자 프로필 새로고침
  // ===================================================
  const refreshUserProfile = async () => {
    if (user && userType) {
      try {
        const profile = await fetchUserProfile(user.id, userType);
        setUserProfile(profile);
      } catch (error) {
        console.error('[AuthContext] 프로필 새로고침 실패:', error);
      }
    }
  };

  // ===================================================
  // 로그아웃
  // ===================================================
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType(null);
      setUserProfile(null);
      router.push('/');
    } catch (error) {
      console.error('[AuthContext] 로그아웃 에러:', error);
    }
  };

  // ===================================================
  // 온보딩 완료 여부 체크 및 리다이렉션
  // ===================================================
  const checkOnboardingAndRedirect = (profile: any, type: UserType) => {
    // 온보딩 관련 페이지에서는 리다이렉션하지 않음
    if (
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/company-auth') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/login')
    ) {
      return;
    }

    // 개인 회원 온보딩 체크
    if (type === 'jobseeker' && !profile?.onboarding_completed) {
      console.log('[AuthContext] 개인 회원 온보딩 미완료 -> /onboarding/job-seeker/quick');
      router.push('/onboarding/job-seeker/quick');
      return;
    }

    // 기업 회원 온보딩 체크는 이미 잘 되어있으므로 패스
  };

  // ===================================================
  // Auth 상태 변경 리스너
  // ===================================================
  useEffect(() => {
    console.log('[AuthContext] 초기화 시작');
    let isMounted = true;
    let authHandledByListener = false; // ✅ onAuthStateChange가 이미 처리했는지 플래그

    // 1. 초기 세션 체크 (5초 타임아웃 추가 - 무한 대기 방지)
    const sessionCheck = async () => {
      try {
        // ✅ 500ms 지연 - onAuthStateChange가 먼저 처리할 기회를 줌
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isMounted) return;

        // ✅ onAuthStateChange가 이미 SIGNED_IN을 처리했으면 스킵 (Race Condition 방지)
        if (authHandledByListener) {
          console.log('[AuthContext] 세션 체크 스킵 - onAuthStateChange가 이미 처리함');
          return;
        }

        console.log('[AuthContext] 세션 체크 시작 (500ms 지연 후)');

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout (5s)')), 5000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!isMounted) return;

        // ✅ 다시 한번 체크 - 비동기 작업 중 onAuthStateChange가 처리했을 수 있음
        if (authHandledByListener) {
          console.log('[AuthContext] 세션 체크 결과 무시 - onAuthStateChange가 이미 처리함');
          return;
        }

        if (session) {
          console.log('[AuthContext] 초기 세션 발견:', session.user.id);
          handleAuthChange(session.user);
        } else {
          console.log('[AuthContext] 초기 세션 없음');
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[AuthContext] 세션 체크 실패/타임아웃:', (err as Error).message);
        // ✅ 타임아웃이어도 onAuthStateChange가 처리 중이면 로딩 종료 안 함
        if (isMounted && !authHandledByListener) {
          setIsLoading(false);
        }
      }
    };

    sessionCheck();

    // 2. Auth 상태 변경 리스너 등록
    // ✅ 동기 콜백 사용 - Supabase 공식 권장사항 (데드락 방지)
    // 참고: GoTrueClient.ts:2090-2094 - async 콜백 + Supabase API 호출 = 데드락 위험
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth 상태 변경:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          authHandledByListener = true; // ✅ 플래그 설정 - sessionCheck에서 중복 처리 방지
          // ✅ setTimeout(0)으로 락 해제 후 실행 (데드락 방지)
          const user = session.user;
          setTimeout(() => {
            handleAuthChange(user);
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 의존성 제거 - 최초 마운트 시 1번만 실행

  // ===================================================
  // Auth 변경 처리 로직
  // ===================================================
  const handleAuthChange = async (authUser: SupabaseUser) => {
    try {
      console.log('[AuthContext] 사용자 인증 확인:', authUser.id);

      // ✅ 1. localStorage에서 OAuth 중 설정된 pending_user_type 먼저 확인 (최우선)
      const pendingType = localStorage.getItem('pending_user_type') as UserType | null;
      console.log('[AuthContext] pending_user_type (localStorage):', pendingType);

      // 2. metadata에서 확인 (OAuth 콜백에서 설정됨)
      const metadataUserType = authUser.user_metadata?.user_type as UserType | undefined;
      console.log('[AuthContext] metadata user_type:', metadataUserType);

      let type: UserType;

      // ✅ metadata나 localStorage에서 이미 타입을 알면 DB 조회 스킵 (Race Condition 방지)
      if (pendingType) {
        type = pendingType;
        localStorage.removeItem('pending_user_type'); // 1회용 - 즉시 삭제
        console.log('[AuthContext] 사용자 타입:', type, '(localStorage 우선 - OAuth 중)');
      } else if (metadataUserType) {
        type = metadataUserType;
        console.log('[AuthContext] 사용자 타입:', type, '(metadata 우선 - DB 조회 스킵)');
      } else {
        // 3. DB 테이블 존재 여부로 사용자 타입 확인 (fallback) - 타임아웃 추가
        console.log('[AuthContext] DB 조회로 사용자 타입 확인 시작...');

        // ✅ 3초 타임아웃으로 DB 조회 (hang 방지)
        const dbCheckPromise = async () => {
          const [companyResult, userResult] = await Promise.all([
            supabase.from('companies').select('id').eq('id', authUser.id).maybeSingle(),
            supabase.from('users').select('id').eq('id', authUser.id).maybeSingle()
          ]);
          return { companyData: companyResult.data, userData: userResult.data };
        };

        const timeoutPromise = new Promise<{ companyData: null; userData: null }>((resolve) =>
          setTimeout(() => {
            console.warn('[AuthContext] DB 조회 타임아웃 (3초) - 기본값 사용');
            resolve({ companyData: null, userData: null });
          }, 3000)
        );

        const { companyData, userData } = await Promise.race([dbCheckPromise(), timeoutPromise]);

        if (companyData) {
          type = 'company';
          console.log('[AuthContext] 사용자 타입: company (DB 테이블 확인)');
        } else if (userData) {
          type = 'jobseeker';
          console.log('[AuthContext] 사용자 타입: jobseeker (DB 테이블 확인)');
        } else {
          // 최후의 기본값
          type = 'jobseeker';
          console.log('[AuthContext] 사용자 타입:', type, '(기본값)');
        }
      }

      setUser(authUser as AuthUser);
      setUserType(type);

      // 2. 프로필 데이터 가져오기 (타임아웃 적용)
      console.log('[AuthContext] 프로필 데이터 가져오기 시작...');

      // ✅ clearTimeout으로 성공 시 타임아웃 취소 (거짓 경보 방지)
      let timeoutId: NodeJS.Timeout;
      const fetchProfilePromise = fetchUserProfile(authUser.id, type);
      const profileTimeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          console.error('[AuthContext] ❌ 프로필 가져오기 타임아웃 (5초) - 로딩 강제 종료');
          resolve(null);
        }, 5000);
      });

      // Promise.race로 프로필 가져오기가 너무 오래 걸리면 null 리턴하고 넘어감
      const profile = await Promise.race([fetchProfilePromise, profileTimeoutPromise]);
      clearTimeout(timeoutId!); // ✅ 성공이든 타임아웃이든 타이머 정리

      console.log('[AuthContext] 프로필 조회 결과:', profile ? '성공' : '실패/타임아웃');

      if (profile) {
        setUserProfile(profile);

        // 3. 온보딩 완료 여부 체크
        checkOnboardingAndRedirect(profile, type);
      } else {
        // 프로필이 없거나 실패했으면 (타임아웃 포함)
        // 온보딩으로 보내거나, 에러 상태를 처리해야 함. 
        // 여기서는 일단 기존 로직대로 온보딩 유도
        console.log('[AuthContext] 프로필 없음 -> 온보딩 페이지 리다이렉트 검토');
        if (type === 'jobseeker') {
          // 타임아웃일 수도 있으니 무조건 리다이렉트하기보단, 현재 페이지 유지가 나을 수 있음
          // 하지만 "무한 로딩" 해결이 우선이므로, 로딩 상태만 끄고, 필요하면 사용자가 이동하도록 함.
          // 단, 명확히 데이터가 없다는 확신이 없으므로(타임아웃 등), 
          // 추가적인 리다이렉트는 조심스러움. 일단 기존 로직 유지.
          router.push('/onboarding/job-seeker/quick');
        } else {
          router.push('/signup/company');
        }
      }

    } catch (error) {
      console.error('[AuthContext] Auth 변경 처리 에러:', error);
    } finally {
      // ✅ 무조건 로딩 종료 - 이것이 제일 중요함
      console.log('[AuthContext] ✅ 로딩 상태 해제 (isLoading: false)');
      setIsLoading(false);
    }
  };

  // ===================================================
  // Context Value
  // ===================================================
  const value = {
    user,
    userType,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
