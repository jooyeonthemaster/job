'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthChange, 
  getUserType, 
  getUserProfile,
  logout as authLogout,
  UserType 
} from '@/lib/firebase/auth-service';
import { onAuthStateChanged, getRedirectResult, getAdditionalUserInfo, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: FirebaseUser | null;
  userType: UserType | null;
  userProfile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 사용자 프로필 새로고침
  const refreshUserProfile = async () => {
    if (user && userType) {
      try {
        const profile = await getUserProfile(user.uid, userType);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      setUserType(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // 1. 페이지 로드 시 리디렉션 결과 확인
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const additionalUserInfo = getAdditionalUserInfo(result);
          // 2. 신규 사용자일 경우 Firestore에 문서 생성
          if (additionalUserInfo?.isNewUser) {
            const userDocRef = doc(db, 'users', result.user.uid);
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: new Date(),
              onboardingCompleted: false, // 온보딩 필요 플래그
              role: 'jobseeker'
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      })
      .finally(() => {
        // 3. 인증 상태 리스너 설정
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            let userProfileData = null;

            // Firestore를 기준으로 사용자 타입 판별하여 전역 설정
            try {
              const type = await getUserType(user.uid);
              setUserType(type);

              // 프로필 데이터 가져오기
              if (type) {
                userProfileData = await getUserProfile(user.uid, type);
                setUserProfile(userProfileData);
              }
            } catch (e) {
              console.error('Failed to detect user type:', e);
            }

            if (userDoc.exists()) {
              const data = userDoc.data() as any;
              // 온보딩 완료 여부 체크 - 프로필이 있으면 온보딩 완료로 간주
              const hasProfile = userProfileData && (userProfileData as any).fullName;

              // 온보딩이 명시적으로 false이고, 프로필도 없고, 이미 온보딩 페이지가 아닌 경우만 리다이렉트
              if (data && data.onboardingCompleted === false && !hasProfile) {
                // 개인 온보딩 미완료 시에만 온보딩 페이지로 유도 (간단한 온보딩)
                if (data.role === 'jobseeker' && !pathname.startsWith('/onboarding') && !pathname.startsWith('/jobseeker-dashboard')) {
                  router.push('/onboarding/job-seeker/quick');
                }
                // 기업은 company-auth 온보딩 플로우를 따르므로 여기서는 리다이렉트하지 않음
              }
            }
            setUser(user);
          } else {
            setUser(null);
            setUserType(null);
            setUserProfile(null);
          }
          setIsLoading(false);
        });
        return () => unsubscribe();
      });
  }, [router, pathname]);

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