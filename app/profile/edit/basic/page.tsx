'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/jobseeker-service';
import Step1ProfileBasic from '@/components/onboarding/job-seeker/Step1ProfileBasic';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobseeker-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">기본 정보</h1>
          <p className="text-gray-600 mt-2">이름, 한 줄 소개, 프로필 사진을 설정하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-gray-100"
        >
          <Step1ProfileBasic
            data={profileData}
            onNext={handleSave}
            buttonText="저장하기"
          />
        </motion.div>
      </div>
    </div>
  );
}
