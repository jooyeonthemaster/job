'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getJobseekerProfile, updateJobseekerProfile } from '@/lib/firebase/jobseeker-service';
import Step1ProfileBasic from '@/components/onboarding/job-seeker/Step1ProfileBasic';
import Step2_Experience from '@/components/onboarding/job-seeker/Step2_Experience';
import Step3_Skills from '@/components/onboarding/job-seeker/Step3_Skills';
import Step4_Preferences from '@/components/onboarding/job-seeker/Step4_Preferences';
import OnboardingProgressBar from '@/components/onboarding/OnboardingProgressBar';
import StepIndicator from '@/components/StepIndicator';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const ProfileEditInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const step = useMemo(() => {
    const stepParam = searchParams.get('step');
    return stepParam ? parseInt(stepParam, 10) : 1;
  }, [searchParams]);

  const setStep = (newStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', newStep.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 기존 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getJobseekerProfile(user.uid);
        console.log('🔄 Loaded existing profile for edit:', profile);
        
        if (!profile) {
          router.push('/onboarding/job-seeker?step=1');
          return;
        }
        
        setProfileData(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const updateProfileData = (newData: any) => {
    setProfileData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleFinalSubmit = async (preferencesData: any) => {
    console.log('=== Saving Profile Updates ===');
    console.log('Updated Preferences:', preferencesData);
    console.log('All Profile Data:', profileData);
    
    setIsSaving(true);
    const updatedData = { 
      ...profileData,
      ...preferencesData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Saving to Firestore:', updatedData);
    
    if (user) {
      try {
        await updateJobseekerProfile(user.uid, updatedData);
        console.log('✅ Profile updated successfully!');
        
        // 성공 메시지 표시
        alert('프로필이 성공적으로 업데이트되었습니다!');
        
        // 대시보드로 이동
        router.push('/jobseeker-dashboard');
      } catch (error: any) {
        console.error("Failed to update profile:", error);
        alert(error.message || '프로필 업데이트 중 오류가 발생했습니다.');
        setIsSaving(false);
      }
    }
  };

  const renderStep = () => {
    if (!profileData) return null;

    switch (step) {
      case 1:
        return (
          <Step1ProfileBasic 
            data={profileData} 
            onNext={(data) => { 
              updateProfileData(data); 
              nextStep(); 
            }} 
          />
        );
      case 2:
        return (
          <Step2_Experience 
            data={profileData} 
            onNext={(data) => { 
              updateProfileData(data); 
              nextStep(); 
            }} 
            onBack={prevStep} 
          />
        );
      case 3:
        return (
          <Step3_Skills 
            data={profileData} 
            onNext={(data) => { 
              updateProfileData(data); 
              nextStep(); 
            }} 
            onBack={prevStep} 
          />
        );
      case 4:
        return (
          <Step4_Preferences 
            data={profileData} 
            onSubmit={handleFinalSubmit} 
            onBack={prevStep} 
          />
        );
      default:
        return (
          <Step1ProfileBasic 
            data={profileData} 
            onNext={(data) => { 
              updateProfileData(data); 
              nextStep(); 
            }} 
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/jobseeker-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
        </div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-full text-secondary-600 font-medium mb-4">
            <Save className="w-4 h-4" />
            <span className="text-sm">프로필 편집</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
            프로필 수정
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            프로필 정보를 최신 상태로 유지하세요
          </p>
        </motion.div>

        {/* Step Indicator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <StepIndicator
            steps={[
              { number: 1, title: '기본 정보', description: '프로필의 기초 정보' },
              { number: 2, title: '경력/학력', description: '경력과 학력 정보' },
              { number: 3, title: '기술/언어', description: '보유 기술과 언어' },
              { number: 4, title: '선호 조건', description: '희망 근무 조건' },
            ]}
            currentStep={step}
          />
        </motion.div>

        {/* Progress Bar */}
        <OnboardingProgressBar currentStep={step} totalSteps={4} />

        {/* Step Content Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 relative"
        >
          {isSaving && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-700 font-medium">프로필 저장 중...</p>
              </div>
            </div>
          )}
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
};

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ProfileEditInner />
    </Suspense>
  );
}
