// 대시보드 데이터 조회 및 관리 훅

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileData, Job } from '@/types/jobseeker-dashboard.types';
import { getUserProfileWithCompletion } from '@/lib/supabase/jobseeker-service';
import { transformSupabaseProfile } from '@/lib/utils/profile-transformer';
import { jobs } from '@/lib/data';
import { getRecommendedJobs } from '@/lib/utils';

export const useDashboardData = (userId: string | undefined) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        // Supabase에서 프로필 완성도와 함께 프로필 조회
        const profileWithCompletion = await getUserProfileWithCompletion(userId);

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Loaded Profile Data:', profileWithCompletion);
        }

        if (!profileWithCompletion) {
          // 프로필이 없으면 온보딩으로 리다이렉트
          router.push('/onboarding/job-seeker/quick');
          return;
        }

        // Supabase 데이터를 대시보드 형식으로 변환
        const transformedProfile = transformSupabaseProfile(profileWithCompletion);

        if (process.env.NODE_ENV === 'development') {
          console.log('📍 Preferred Locations:', transformedProfile.preferredLocations);
          console.log('💰 Salary Range:', transformedProfile.salaryRange);
          console.log('🎯 Desired Positions:', transformedProfile.desiredPositions);
          console.log('💻 Skills:', transformedProfile.skills);
        }

        setProfileData(transformedProfile);

        // 프로필 기반 추천 채용공고 계산
        const recommended = getRecommendedJobs(transformedProfile, jobs, 3);

        if (process.env.NODE_ENV === 'development') {
          console.log('✨ Recommended Jobs:', recommended.map(j => ({
            title: j.title,
            company: j.company.name,
            tags: j.tags,
            location: j.location
          })));
        }

        setRecommendedJobs(recommended);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // ✅ userId 변경 시에만 실행 (router 의존성 제거 - 무한 로딩 방지)

  return {
    loading,
    profileData,
    recommendedJobs
  };
};
