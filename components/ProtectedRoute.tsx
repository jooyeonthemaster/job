'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/lib/firebase/auth-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedUserTypes,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // 로그인하지 않은 경우
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // 특정 사용자 타입만 허용하는 경우
      if (allowedUserTypes && userType) {
        if (!allowedUserTypes.includes(userType)) {
          // 권한이 없는 경우 해당 사용자 타입의 대시보드로 리다이렉트
          if (userType === 'company') {
            router.push('/company-dashboard');
          } else {
            router.push('/jobseeker-dashboard');
          }
        }
      }
    }
  }, [user, userType, isLoading, router, allowedUserTypes, redirectTo]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않았거나 권한이 없는 경우 (리다이렉트 전)
  if (!user || (allowedUserTypes && userType && !allowedUserTypes.includes(userType))) {
    return null;
  }

  // 인증된 사용자
  return <>{children}</>;
}