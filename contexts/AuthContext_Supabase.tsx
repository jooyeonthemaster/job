'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// =====================================================
// 타입 정의
// =====================================================

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
  logout: async () => {},
  refreshUserProfile: async () => {}
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
          .select('*')
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
        return data;
      }
    } catch (error: any) {
      console.error('[AuthContext] 프로필 조회 실패:', {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
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

    // 1. 초기 세션 체크
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[AuthContext] 초기 세션 발견:', session.user.id);
        handleAuthChange(session.user);
      } else {
        console.log('[AuthContext] 초기 세션 없음');
        setIsLoading(false);
      }
    });

    // 2. Auth 상태 변경 리스너 등록
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth 상태 변경:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await handleAuthChange(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // ===================================================
  // Auth 변경 처리 로직
  // ===================================================
  const handleAuthChange = async (authUser: SupabaseUser) => {
    try {
      console.log('[AuthContext] 사용자 인증 확인:', authUser.id);

      // 1. 사용자 타입 확인 (메타데이터에서)
      const type = (authUser.user_metadata?.user_type || 'jobseeker') as UserType;
      console.log('[AuthContext] 사용자 타입:', type);

      setUser(authUser as AuthUser);
      setUserType(type);

      // 2. 프로필 데이터 가져오기
      const profile = await fetchUserProfile(authUser.id, type);
      console.log('[AuthContext] 프로필 조회:', profile ? '성공' : '실패');

      if (profile) {
        setUserProfile(profile);

        // 3. 온보딩 완료 여부 체크
        checkOnboardingAndRedirect(profile, type);
      } else {
        // 프로필이 없으면 온보딩으로
        if (type === 'jobseeker') {
          router.push('/onboarding/job-seeker/quick');
        } else {
          router.push('/signup/company');
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[AuthContext] Auth 변경 처리 에러:', error);
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
