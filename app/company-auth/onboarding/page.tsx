'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCompanyProfile } from '@/lib/firebase/company-service';
import { motion } from 'framer-motion';
import {
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
  OnboardingStep5
} from '@/lib/firebase/company-types';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Location from './Step2Location';
import Step3Introduction from './Step3Introduction';
import Step4Benefits from './Step4Benefits';
import Step5Recruiters from './Step5Recruiters';
import StepIndicator from '@/components/StepIndicator';
import { Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string>('');
  
  // 각 단계별 데이터 상태
  const [step1Data, setStep1Data] = useState<OnboardingStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<OnboardingStep2 | null>(null);
  const [step3Data, setStep3Data] = useState<OnboardingStep3 | null>(null);
  const [step4Data, setStep4Data] = useState<OnboardingStep4 | null>(null);
  const [step5Data, setStep5Data] = useState<OnboardingStep5 | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        // 기존 프로필 확인
        const profile = await getCompanyProfile(user.uid);
        if (profile?.profileCompleted) {
          router.push('/company-dashboard');
        }
      } else {
        router.push('/company-auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const steps = [
    { number: 1, title: '기본 정보', description: '회사 기본 정보를 입력해주세요' },
    { number: 2, title: '위치 정보', description: '사무실 위치를 등록해주세요' },
    { number: 3, title: '회사 소개', description: '비전과 미션을 작성해주세요' },
    { number: 4, title: '복지 & 기술', description: '복지와 기술 스택을 소개해주세요' },
    { number: 5, title: '담당자 정보', description: '채용 담당자를 등록해주세요' }
  ];

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header with Gradient */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full text-primary-600 font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">기업 온보딩</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              기업 정보 등록
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              더 나은 인재 매칭을 위해 기업 정보를 완성해주세요
            </p>
          </motion.div>

          {/* Step Indicator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
          >
            <StepIndicator 
              steps={steps} 
              currentStep={currentStep}
            />
          </motion.div>
        </div>

        {/* Step Content Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          {currentStep === 1 && (
            <Step1BasicInfo 
              data={step1Data}
              onSave={(data) => {
                setStep1Data(data);
                handleNextStep();
              }}
              uid={uid}
            />
          )}
          {currentStep === 2 && (
            <Step2Location
              data={step2Data}
              onSave={(data) => {
                setStep2Data(data);
                handleNextStep();
              }}
              onBack={handlePrevStep}
              uid={uid}
            />
          )}
          {currentStep === 3 && (
            <Step3Introduction
              data={step3Data}
              onSave={(data) => {
                setStep3Data(data);
                handleNextStep();
              }}
              onBack={handlePrevStep}
              uid={uid}
            />
          )}
          {currentStep === 4 && (
            <Step4Benefits
              data={step4Data}
              onSave={(data) => {
                setStep4Data(data);
                handleNextStep();
              }}
              onBack={handlePrevStep}
              uid={uid}
            />
          )}
          {currentStep === 5 && (
            <Step5Recruiters
              data={step5Data}
              onSave={(data) => {
                setStep5Data(data);
                // 온보딩 완료 후 대시보드로 이동
                router.push('/company-dashboard');
              }}
              onBack={handlePrevStep}
              uid={uid}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}