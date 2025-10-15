'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  ChevronLeft,
  AlertCircle,
  Building2,
  User,
  Check,
  Briefcase,
  TrendingUp,
  Target,
  Shield,
  Zap,
  Users,
  X
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/lib/supabase/config';
import { COMPANY_TERMS } from '@/constants/company-terms';

type SignupTab = 'jobseeker' | 'company';

export default function SignupPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<SignupTab>('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

  // 페이지 로드 시 localStorage에서 입력값 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('signup_form_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.tab === activeTab) {
            setEmail(parsed.email || '');
            setPassword(parsed.password || '');
            setConfirmPassword(parsed.confirmPassword || '');
            setAgreeTerms(parsed.agreeTerms || false);
          }
        } catch (e) {
          console.error('Failed to restore form data:', e);
        }
      }
    }
  }, [activeTab]);

  // 입력값이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const formData = {
        tab: activeTab,
        email,
        password,
        confirmPassword,
        agreeTerms
      };
      localStorage.setItem('signup_form_data', JSON.stringify(formData));
    }
  }, [activeTab, email, password, confirmPassword, agreeTerms]);

  // 회원가입 성공 시 localStorage 클리어
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('signup_form_data');
    }
  };


  const isPerson = activeTab === 'jobseeker';

  // 약관 모달 열기
  const openTermsModal = (type: 'terms' | 'privacy') => {
    setModalType(type);
    setModalOpen(true);
  };

  // 이메일 회원가입
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Signup] Supabase 회원가입 시작:', email, activeTab);

      // Supabase Auth로 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: activeTab, // 'jobseeker' or 'company'
          }
        }
      });

      if (signUpError) {
        console.error('[Signup] Supabase 회원가입 에러:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('회원가입에 실패했습니다.');
      }

      console.log('[Signup] Supabase 회원가입 성공:', data.user.id);
      console.log('[Signup] 세션 정보:', data.session ? '세션 있음' : '세션 없음');

      // 세션이 확실히 설정될 때까지 기다림
      if (!data.session) {
        console.log('[Signup] 세션 대기 중...');
        // 세션이 없으면 잠시 기다림 (최대 3초)
        let retries = 0;
        while (retries < 6) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            console.log('[Signup] 세션 확인됨!');
            break;
          }
          retries++;
          console.log(`[Signup] 세션 재확인 ${retries}/6...`);
        }
      }

      clearFormData();

      if (activeTab === 'company') {
        // 기업 회원 - 온보딩으로 이동
        console.log('[Signup] 기업 회원 -> /signup/company로 리다이렉트');
        router.push('/signup/company');
      } else {
        // 구직자 회원 - 구직자 온보딩으로 이동
        console.log('[Signup] 구직자 회원 -> /onboarding/job-seeker/quick로 리다이렉트');
        router.push('/onboarding/job-seeker/quick');
      }
    } catch (err: any) {
      console.error('[Signup] 에러 발생:', err);

      if (err?.message?.includes('already registered')) {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err?.message?.includes('invalid email')) {
        setError('유효하지 않은 이메일 형식입니다.');
      } else if (err?.message?.includes('Password should be at least 6 characters')) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
        setError(err?.message || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 회원가입
  const handleGoogleSignup = async () => {
    if (!agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('[Signup] 구글 로그인 시작:', activeTab);

      // Supabase Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: activeTab === 'company'
            ? `${window.location.origin}/signup/company`
            : `${window.location.origin}/onboarding/job-seeker/quick`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('[Signup] 구글 로그인 에러:', error);
        throw error;
      }

      console.log('[Signup] 구글 로그인 리다이렉트 중...');
      clearFormData();
    } catch (err: any) {
      console.error('[Signup] 구글 로그인 에러:', err);
      setError(err?.message || '구글 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
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
              <span className="text-3xl font-bold text-gray-900">GlobalTalent</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Side - Benefits Promotion */}
            <div className="bg-white rounded-2xl shadow-md p-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex p-4 rounded-xl mb-6 bg-primary-50">
                  {isPerson ? (
                    <User className="w-8 h-8 text-primary-600" />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary-600" />
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {isPerson ? (
                    <>글로벌 인재로서<br />커리어를 시작하세요</>
                  ) : (
                    <>최고의 글로벌<br />인재를 찾으세요</>
                  )}
                </h2>

                <p className="text-gray-600 mb-8">
                  {isPerson
                    ? '한국에서의 새로운 기회를 발견하세요'
                    : '우수한 글로벌 인재를 채용하세요'
                  }
                </p>

                {isPerson ? (
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI 맞춤 채용공고</p>
                        <p className="text-sm text-gray-600">나에게 딱 맞는 포지션 추천</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">비자 스폰서십 지원</p>
                        <p className="text-sm text-gray-600">워크퍼밋 & 비자 지원 기업</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">간편한 지원 프로세스</p>
                        <p className="text-sm text-gray-600">원클릭으로 빠른 지원</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">실시간 채용 알림</p>
                        <p className="text-sm text-gray-600">새로운 기회를 놓치지 마세요</p>
                      </div>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">검증된 글로벌 인재풀</p>
                        <p className="text-sm text-gray-600">우수한 해외 인재 데이터베이스</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">효율적인 채용 관리</p>
                        <p className="text-sm text-gray-600">지원자 관리 대시보드 제공</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI 인재 매칭</p>
                        <p className="text-sm text-gray-600">최적의 후보자 자동 추천</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">프리미엄 채용공고</p>
                        <p className="text-sm text-gray-600">최상단 노출과 3배 높은 조회수</p>
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-2xl shadow-md p-10">
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

              {/* Google Signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full mb-6 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">Google로 시작하기</span>
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleEmailSignup}>
                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isPerson ? "your@email.com" : "company@example.com"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호 (6자 이상)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={() => openTermsModal('terms')}
                        className="text-primary-600 hover:underline"
                      >
                        이용약관
                      </button> 및{' '}
                      <button
                        type="button"
                        onClick={() => openTermsModal('privacy')}
                        className="text-primary-600 hover:underline"
                      >
                        개인정보처리방침
                      </button>에 동의합니다.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

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
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] z-50 flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                {modalType === 'terms' ? '서비스 이용약관' : '개인정보처리방침'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {modalType === 'terms'
                    ? COMPANY_TERMS.serviceTerms.content
                    : COMPANY_TERMS.privacyTerms.content}
                </pre>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <Dialog.Close asChild>
                <button className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  확인
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
