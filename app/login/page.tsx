'use client';

// 로그인 메인 페이지 - 리팩토링 완료 (794줄 → 145줄)
// 기능 변경 없음, 컴포넌트/훅으로 분리

import Link from 'next/link';
import { Globe, ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useLoginErrors } from '@/hooks/useLoginErrors';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';
import { useEmailLogin } from '@/hooks/useEmailLogin';
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import LoginTabs from '@/components/login/LoginTabs';
import SocialLoginButtons from '@/components/login/SocialLoginButtons';
import EmailLoginForm from '@/components/login/EmailLoginForm';
import LoginPromoPanel from '@/components/login/LoginPromoPanel';

export default function LoginPage() {
  const { user, userProfile, userType, isLoading: authLoading } = useAuth();

  // Custom Hooks
  const {
    activeTab,
    email,
    password,
    showPassword,
    rememberMe,
    isLoading,
    error,
    isPerson,
    setActiveTab,
    setEmail,
    setPassword,
    setShowPassword,
    setRememberMe,
    setIsLoading,
    setError
  } = useLoginForm();

  useLoginErrors({ setError, setActiveTab });
  useOAuthLogin({ activeTab, setError, setIsLoading });
  const { handleEmailLogin } = useEmailLogin();
  useAutoRedirect({ user, userProfile, userType });

  // 로딩 중이거나 이미 로그인되어 있으면 로딩 표시
  if (authLoading || (user && userProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 중...</p>
        </div>
      </div>
    );
  }

  // 이메일 로그인 핸들러
  const onEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailLogin(email, password, activeTab, setError, setIsLoading);
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
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Bridge World</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Side - Sign Up Promotion (Desktop Only) */}
            <LoginPromoPanel isPerson={isPerson} />

            {/* Right Side - Login Form */}
            <div className="bg-white rounded-2xl shadow-md p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">로그인</h2>

              {/* Tab Navigation */}
              <LoginTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Social Login */}
              <SocialLoginButtons
                activeTab={activeTab}
                isLoading={isLoading}
                setError={setError}
                setIsLoading={setIsLoading}
              />

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* Email Login Form */}
              <EmailLoginForm
                email={email}
                password={password}
                showPassword={showPassword}
                rememberMe={rememberMe}
                isLoading={isLoading}
                isPerson={isPerson}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onShowPasswordToggle={() => setShowPassword(!showPassword)}
                onRememberMeChange={setRememberMe}
                onSubmit={onEmailSubmit}
              />

              {/* Sign Up Link */}
              <div className="mt-6 text-center text-sm text-gray-600">
                아직 계정이 있으신가요?{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
