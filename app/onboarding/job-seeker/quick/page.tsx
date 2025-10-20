'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useJobseekerOnboarding } from '@/hooks/useJobseekerOnboarding';
import { JOBSEEKER_TERMS } from '@/constants/jobseeker-terms';

// 섹션 컴포넌트들
import BasicInfoSection from '@/components/jobseeker-onboarding/BasicInfoSection';
import AccountSection from '@/components/jobseeker-onboarding/AccountSection';
import AddressSection from '@/components/jobseeker-onboarding/AddressSection';
import PersonalInfoSection from '@/components/jobseeker-onboarding/PersonalInfoSection';
import VisaSection from '@/components/jobseeker-onboarding/VisaSection';
import LanguageSection from '@/components/jobseeker-onboarding/LanguageSection';
import TermsSection from '@/components/jobseeker-onboarding/TermsSection';
import TermsModal from '@/components/jobseeker-onboarding/TermsModal';

export default function JobseekerOnboardingPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    isEmailSignup,
    handleChange,
    handleAddressSearch,
    addLanguage,
    removeLanguage,
    updateLanguage,
    handleAgreeAll,
    handleIndividualAgree,
    handleSubmit,
  } = useJobseekerOnboarding();

  // 약관 모달 열기
  const openTermModal = (termId: string) => {
    const term = JOBSEEKER_TERMS[termId];
    setModalContent({
      title: term.title,
      content: term.content,
    });
    setModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            개인 회원 정보 입력
          </h1>
          <p className="text-gray-600">
            더 나은 매칭을 위해 정확한 정보를 입력해주세요
          </p>
          <p className="text-sm text-red-600 mt-2">* 표시는 필수 항목입니다</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: 기본 정보 */}
            <BasicInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            {/* Section 2: 계정 정보 */}
            <AccountSection
              formData={formData}
              errors={errors}
              isEmailSignup={isEmailSignup}
              onChange={handleChange}
            />

            {/* Section 3: 주소 */}
            <AddressSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onAddressSearch={handleAddressSearch}
            />

            {/* Section 4: 개인 정보 */}
            <PersonalInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            {/* Section 5: 비자 정보 (외국인만 표시) */}
            <VisaSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            {/* Section 6: 언어 능력 */}
            <LanguageSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onAddLanguage={addLanguage}
              onRemoveLanguage={removeLanguage}
              onUpdateLanguage={updateLanguage}
            />

            {/* Section 7: 약관 동의 */}
            <TermsSection
              formData={formData}
              errors={errors}
              onAgreeAll={handleAgreeAll}
              onIndividualAgree={handleIndividualAgree}
              onOpenTermModal={openTermModal}
            />

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>회원가입 처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>회원가입 완료</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* 약관 전문 보기 모달 */}
      <TermsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalContent?.title}
        content={modalContent?.content}
      />
    </div>
  );
}
