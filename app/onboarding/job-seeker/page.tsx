'use client';

import { useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import Step1ProfileBasic from '@/components/onboarding/job-seeker/Step1ProfileBasic';
import Step2_Experience from '@/components/onboarding/job-seeker/Step2_Experience';
import Step3_Skills from '@/components/onboarding/job-seeker/Step3_Skills';
import Step4_Preferences from '@/components/onboarding/job-seeker/Step4_Preferences';
import OnboardingProgressBar from '@/components/onboarding/OnboardingProgressBar';
import StepIndicator from '@/components/StepIndicator';
import { motion } from 'framer-motion';
import { updateUserProfile } from '@/lib/firebase/userActions';
import { useAuth } from '@/contexts/AuthContext';
import { debugFirebaseAuth } from '@/lib/firebase/debugAuth';

const JobSeekerOnboardingInner = () => {
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

  const [onboardingData, setOnboardingData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOnboardingData = (newData: any) => {
    setOnboardingData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleFinalSubmit = async (preferencesData: any) => {
    console.log('=== Starting Final Submit ===');
    console.log('User:', user);
    console.log('Preferences Data:', preferencesData);
    console.log('All Onboarding Data:', onboardingData);
    
    setIsSubmitting(true);
    const finalData = { 
      ...onboardingData,
      ...preferencesData,  // preferences를 펼쳐서 저장
      onboardingCompleted: true,
      userType: 'jobseeker',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Final Data to save:', finalData);
    console.log('📍 Preferred Locations in final data:', finalData.preferredLocations);
    console.log('💰 Salary Range in final data:', finalData.salaryRange);
    
    if (user) {
      try {
        console.log('Calling updateUserProfile with uid:', user.uid);
        const result = await updateUserProfile(user.uid, finalData);
        console.log('Update result:', result);
        
        if (result?.success) {
          console.log('Success! Redirecting to dashboard...');
          // 성공 시 대시보드로 이동
          router.push('/jobseeker-dashboard');
        } else {
          throw new Error('프로필 생성에 실패했습니다.');
        }
      } catch (error: any) {
        console.error("Failed to save onboarding data:", error);
        
        // Show user-friendly error message
        alert(error.message || '프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsSubmitting(false);
      }
    } else {
      console.log('No user found! Redirecting to login...');
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      router.push('/login');
    }
  };

  const handleStep1Next = (data: any) => {
    setOnboardingData((prev: any) => ({ ...prev, ...data }));
    nextStep();
  };

  const handleStep2Next = (data: any) => {
    setOnboardingData((prev: any) => ({ ...prev, ...data }));
    nextStep();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1ProfileBasic data={onboardingData} onNext={(data) => { updateOnboardingData(data); nextStep(); }} />;
      case 2:
        return <Step2_Experience data={onboardingData} onNext={(data) => { updateOnboardingData(data); nextStep(); }} onBack={prevStep} />;
      case 3:
        return <Step3_Skills data={onboardingData} onNext={(data) => { updateOnboardingData(data); nextStep(); }} onBack={prevStep} />;
      case 4:
        return <Step4_Preferences data={onboardingData} onSubmit={handleFinalSubmit} onBack={prevStep} />;
      default:
        return <Step1ProfileBasic data={onboardingData} onNext={(data) => { updateOnboardingData(data); nextStep(); }} />;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-full text-secondary-600 font-medium mb-4">
          <span className="text-sm">개인 온보딩</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
          프로필 생성
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          더 나은 매칭을 위해 프로필 정보를 완성해주세요
        </p>
        {/* Debug Button */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => debugFirebaseAuth()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            🔍 Debug Firebase
          </button>
        )}
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
            { number: 1, title: '기본 정보', description: '프로필의 기초 정보를 입력합니다' },
            { number: 2, title: '경력/학력', description: '경력과 학력을 추가합니다' },
            { number: 3, title: '기술/언어', description: '보유 기술과 언어를 등록합니다' },
            { number: 4, title: '선호 조건', description: '희망 근무 조건을 선택합니다' },
          ]}
          currentStep={step}
        />
      </motion.div>

      {/* Progress (optional small bar) */}
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
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl z-10">
            <p>프로필을 생성하는 중...</p>
          </div>
        )}
        {renderStep()}
      </motion.div>
    </div>
  );
};

export default function JobSeekerOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center text-gray-600">로딩 중...</div>}>
      <JobSeekerOnboardingInner />
    </Suspense>
  );
}
