'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { useSignup } from '@/hooks/useSignup';
import BenefitsSection from '@/components/signup/BenefitsSection';
import OAuthButtons from '@/components/signup/OAuthButtons';
import EmailSignupForm from '@/components/signup/EmailSignupForm';
import TermsModal from '@/components/signup/TermsModal';
import type { SignupTab, ModalType } from '@/types/signup.types';

export default function SignupPage() {
  const router = useRouter();
  const { user, userProfile, userType, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SignupTab>('jobseeker');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('terms');

  const {
    formData,
    showPassword,
    isLoading,
    error,
    setShowPassword,
    updateField,
    handleEmailSignup,
    handleGoogleSignup,
    handleKakaoSignup,
    handleNaverSignup
  } = useSignup(activeTab);

  // 이미 로그인되어 있으면 자동 리다이렉트
  useEffect(() => {
    if (user && userProfile) {
      console.log('[Signup] 이미 로그인됨, 리다이렉트 시작');

      if (userType === 'jobseeker') {
        if (userProfile.onboarding_completed) {
          console.log('[Signup] → /jobseeker-dashboard');
          router.push('/jobseeker-dashboard');
        } else {
          console.log('[Signup] → /onboarding/job-seeker/quick');
          router.push('/onboarding/job-seeker/quick');
        }
      } else if (userType === 'company') {
        if (userProfile.profile_completed) {
          console.log('[Signup] → /company-dashboard');
          router.push('/company-dashboard');
        } else {
          console.log('[Signup] → /signup/company');
          router.push('/signup/company');
        }
      }
    }
  }, [user, userProfile, userType, router]);

  // 로딩 중이거나 이미 로그인되어 있으면 로딩 표시
  if (authLoading || (user && userProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">처리 중...</p>
        </div>
      </div>
    );
  }

  // 약관 모달 열기
  const openTermsModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Bridge World</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Side - Benefits Promotion */}
            <BenefitsSection activeTab={activeTab} />

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-lg shadow-md p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">회원가입</h2>

              {/* Tab Navigation */}
              <ul className="flex border-b border-gray-200 mb-8" role="tablist">
                <li className="flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('jobseeker')}
                    className={`w-full pb-3 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'jobseeker'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    개인회원
                  </button>
                </li>
                <li className="flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('company')}
                    className={`w-full pb-3 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'company'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    기업회원
                  </button>
                </li>
              </ul>

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* 소셜 로그인 */}
              <OAuthButtons
                isLoading={isLoading}
                onNaverSignup={handleNaverSignup}
                onKakaoSignup={handleKakaoSignup}
                onGoogleSignup={handleGoogleSignup}
              />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* Email Signup Form */}
              <EmailSignupForm
                activeTab={activeTab}
                formData={formData}
                showPassword={showPassword}
                isLoading={isLoading}
                onFieldChange={updateField}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleEmailSignup}
                onOpenTermsModal={openTermsModal}
              />

              <div className="mt-6 text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  로그인
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 약관 모달 */}
      <TermsModal
        open={modalOpen}
        modalType={modalType}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
