// 자동 리다이렉트 훅
// app/login/page.tsx에서 분리 (기능 변경 없음)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UseAutoRedirectProps = {
  user: any;
  userProfile: any;
  userType: string | null;
};

export function useAutoRedirect({ user, userProfile, userType }: UseAutoRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (user && userProfile) {
      console.log('[Login] 이미 로그인됨, 리다이렉트 시작');

      if (userType === 'jobseeker') {
        if (userProfile.onboarding_completed) {
          console.log('[Login] → /jobseeker-dashboard');
          router.push('/jobseeker-dashboard');
        } else {
          console.log('[Login] → /onboarding/job-seeker/quick');
          router.push('/onboarding/job-seeker/quick');
        }
      } else if (userType === 'company') {
        if (userProfile.profile_completed) {
          console.log('[Login] → /company-dashboard');
          router.push('/company-dashboard');
        } else {
          console.log('[Login] → /signup/company');
          router.push('/signup/company');
        }
      }
    }
  }, [user, userProfile, userType, router]);
}
