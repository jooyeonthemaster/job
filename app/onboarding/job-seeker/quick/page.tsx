'use client';

// 개인 회원 온보딩 페이지 (2026-01-09 간소화)
// 필수 항목: 전화번호, 한줄소개, 비밀번호(소셜), 약관
// 선택 항목: 국적, 이름, 주소, 성별, 비자, 언어능력

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useJobseekerOnboarding } from '@/hooks/useJobseekerOnboarding';
import { JOBSEEKER_TERMS } from '@/constants/jobseeker-terms';

// 필수 섹션 컴포넌트
import BasicInfoSection from '@/components/jobseeker-onboarding/BasicInfoSection';
import AccountSection from '@/components/jobseeker-onboarding/AccountSection';
import TermsSection from '@/components/jobseeker-onboarding/TermsSection';
import TermsModal from '@/components/jobseeker-onboarding/TermsModal';

// 선택 섹션 컴포넌트 (접기 가능)
import AddressSection from '@/components/jobseeker-onboarding/AddressSection';
import PersonalInfoSection from '@/components/jobseeker-onboarding/PersonalInfoSection';
import VisaSection from '@/components/jobseeker-onboarding/VisaSection';
import LanguageSection from '@/components/jobseeker-onboarding/LanguageSection';

export default function JobseekerOnboardingPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [showOptionalSections, setShowOptionalSections] = useState(false);
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
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            빠른 시작하기
          </h1>
          <p className="text-gray-600">
            아래 필수 정보만 입력하면 바로 채용공고를 확인할 수 있어요
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>3분 내로 완료됩니다</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 필수 항목 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">📋 필수 입력 항목:</span> 전화번호, 한줄소개, {!isEmailSignup && '비밀번호, '}약관 동의
              </p>
              <p className="text-xs text-blue-600 mt-1">
                나머지 정보는 나중에 마이페이지에서 입력할 수 있습니다
              </p>
            </div>

            {/* Section 1: 핵심 정보 (전화번호, 한줄소개) */}
            <BasicInfoSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />

            {/* Section 2: 계정 정보 (이메일, 비밀번호) */}
            <AccountSection
              formData={formData}
              errors={errors}
              isEmailSignup={isEmailSignup}
              onChange={handleChange}
            />

            {/* Section 3: 약관 동의 */}
            <TermsSection
              formData={formData}
              errors={errors}
              onAgreeAll={handleAgreeAll}
              onIndividualAgree={handleIndividualAgree}
              onOpenTermModal={openTermModal}
            />

            {/* 선택 항목 토글 */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowOptionalSections(!showOptionalSections)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {showOptionalSections ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-700">추가 정보 입력 (선택)</p>
                    <p className="text-xs text-gray-500">
                      주소, 성별, 비자, 언어능력 등 - 나중에 입력해도 됩니다
                    </p>
                  </div>
                </div>
              </button>

              {/* 선택 섹션들 */}
              {showOptionalSections && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-8 pt-6 border-t border-dashed"
                >
                  {/* 주소 */}
                  <AddressSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onAddressSearch={handleAddressSearch}
                  />

                  {/* 개인 정보 (성별) */}
                  <PersonalInfoSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />

                  {/* 비자 정보 */}
                  <VisaSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />

                  {/* 언어 능력 */}
                  <LanguageSection
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onAddLanguage={addLanguage}
                    onRemoveLanguage={removeLanguage}
                    onUpdateLanguage={updateLanguage}
                  />
                </motion.div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>시작하기</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                추가 정보는 마이페이지에서 언제든 입력할 수 있습니다
              </p>
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
