'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/jobseeker-service';
import Step1ProfileBasic from '@/components/onboarding/job-seeker/Step1ProfileBasic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BasicEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        if (!profile) {
          router.push('/onboarding/job-seeker/quick');
          return;
        }

        // Supabase 데이터를 Step1ProfileBasic이 기대하는 형식으로 변환
        setProfileData({
          fullName: profile.full_name,
          headline: profile.headline,
          profileImageUrl: profile.profile_image_url
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleSave = async (data: any) => {
    if (!user) return;

    try {
      await updateUserProfile(user.id, {
        fullName: data.fullName,
        headline: data.headline,
        profileImageUrl: data.profileImageUrl
      });

      alert('기본 정보가 성공적으로 업데이트되었습니다!');
      router.push('/jobseeker-dashboard');
    } catch (error: any) {
      console.error('Basic info update error:', error);
      alert(error.message || '업데이트 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 간소화된 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/jobseeker-dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">기본 정보</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <Step1ProfileBasic
            data={profileData}
            onNext={handleSave}
            buttonText="저장하기"
          />
        </div>
      </div>
    </div>
  );
}
