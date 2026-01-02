'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { getUserProfile } from '@/lib/supabase/jobseeker-service';
import { saveSkillsAndLanguages } from '@/lib/supabase/profile-checklist';
import Step3_Skills from '@/components/onboarding/job-seeker/Step3_Skills';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SkillsEditPage() {
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

        // Transform data for Step3_Skills component (korean_level + otherLanguages)
        const transformedProfile = {
          ...profile,
          skills: profile.skills?.map((skill: any) =>
            typeof skill === 'string' ? skill : skill.skill_name || skill.name || skill
          ) || [],
          koreanLevel: profile.korean_level || '',
          otherLanguages: profile.languages && profile.languages.length > 0
            ? profile.languages.map((lang: any) => ({
                language: lang.language || lang.language_name || '',
                proficiency: lang.proficiency || ''
              }))
            : [{ language: '', proficiency: '' }]
        };

        setProfileData(transformedProfile);
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
      await saveSkillsAndLanguages(user.id, {
        skills: data.skills,
        korean_level: data.koreanLevel,
        otherLanguages: data.otherLanguages
      });

      alert('기술 및 언어가 성공적으로 업데이트되었습니다!');
      router.push('/jobseeker-dashboard');
    } catch (error: any) {
      console.error('Skills update error:', error);
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
            <h1 className="text-xl font-bold text-gray-900">기술 및 언어</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <Step3_Skills
            data={profileData}
            onNext={handleSave}
            onBack={() => router.push('/jobseeker-dashboard')}
          />
        </div>
      </div>
    </div>
  );
}
