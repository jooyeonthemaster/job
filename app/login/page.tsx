'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  ChevronLeft,
  AlertCircle,
  Building2,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from '@/contexts/AuthContext_Supabase';

type LoginTab = 'jobseeker' | 'company';

export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, userType, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<LoginTab>('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isPerson = activeTab === 'jobseeker';

  // Google OAuth Implicit Flow 처리 (hash fragment)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;

      // OAuth 리다이렉트 후 hash fragment 확인
      if (hash && hash.includes('access_token')) {
        console.log('[Login] OAuth hash fragment 감지:', hash.substring(0, 50));

        // 1순위: URL 파라미터에서 type 확인 (가장 안전)
        const urlParams = new URLSearchParams(window.location.search);
        const typeFromUrl = urlParams.get('type');
        
        // 2순위: localStorage 확인
        const savedTab =
          typeFromUrl ||
          localStorage.getItem('signup_oauth_tab') ||
          localStorage.getItem('login_oauth_tab') ||
          'company';  // 기본값을 company로 변경 (더 안전)

        console.log('[Login] URL에서 확인된 type:', typeFromUrl);
        console.log('[Login] localStorage에서 확인된 회원 유형:', savedTab);

        // 세션이 설정될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));

        // 최신 세션 가져오기
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error('[Login] 세션을 찾을 수 없습니다');
          return;
        }

        const currentUser = session.user;
        console.log('[Login] 현재 사용자 ID:', currentUser.id);

        try {
          if (savedTab === 'company') {
            console.log('[Login] 기업 회원 OAuth 처리 시작');

            // ✅ 1. 즉시 localStorage 설정 (AuthContext보다 먼저 실행됨)
            localStorage.setItem('pending_user_type', 'company');
            console.log('[Login] pending_user_type = "company" localStorage 설정 완료');

            // 2. metadata 업데이트
            const { error: updateError } = await supabase.auth.updateUser({
              data: { user_type: 'company' }
            });

            if (updateError) {
              console.error('[Login] metadata 업데이트 실패:', updateError);
            } else {
              console.log('[Login] metadata.user_type = "company" 업데이트 완료');
            }

            // ✅ 3. metadata 전파 대기 (500ms → 800ms 증가)
            await new Promise(resolve => setTimeout(resolve, 800));
            console.log('[Login] metadata 전파 대기 완료 (800ms)');

            // 기존 companies 레코드 확인 (profile_completed도 함께 조회)
            const { data: existingCompany } = await supabase
              .from('companies')
              .select('id, profile_completed, name')
              .eq('id', currentUser.id)
              .maybeSingle();

            // localStorage 정리
            localStorage.removeItem('signup_oauth_tab');
            localStorage.removeItem('login_oauth_tab');

            // URL hash 정리
            window.history.replaceState(null, '', window.location.pathname);

            // 조건부 리다이렉션
            if (existingCompany && existingCompany.profile_completed) {
              // 프로필 완성된 기업 → 대시보드로
              console.log('[Login] 프로필 완성된 기업 → /company-dashboard');
              router.push('/company-dashboard');
            } else if (existingCompany && !existingCompany.profile_completed) {
              // 레코드는 있지만 프로필 미완성 → 온보딩으로
              console.log('[Login] 프로필 미완성 → /signup/company');
              router.push('/signup/company');
            } else {
              // 레코드 없음 → 빈 레코드 생성 후 온보딩으로
              console.log('[Login] companies 테이블 빈 레코드 생성 중...');
              const { error: insertError } = await supabase.from('companies').insert({
                id: currentUser.id,
                email: currentUser.email!,
                registration_number: '',
                name: '',
                ceo_name: '',
                established: '',
                company_type: 'individual',
                employee_count: '',
                website: '',
                location: '',
                address: '',
                manager_department: '',
                manager_name: '',
                manager_email: currentUser.email!,
                profile_completed: false,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

              if (insertError) {
                console.error('[Login] companies INSERT 에러:', insertError);
              } else {
                console.log('[Login] companies 레코드 생성 완료');
              }

              console.log('[Login] 신규 기업 → /signup/company');
              router.push('/signup/company');
            }
          } else {
            console.log('[Login] 개인 회원 OAuth 처리 시작');

            // 먼저 metadata 업데이트
            const { error: updateError } = await supabase.auth.updateUser({
              data: { user_type: 'jobseeker' }
            });

            if (updateError) {
              console.error('[Login] metadata 업데이트 실패:', updateError);
            } else {
              console.log('[Login] metadata.user_type = "jobseeker" 업데이트 완료');
            }

            // 기존 users 레코드 확인 (onboarding_completed 포함)
            const { data: existingUser } = await supabase
              .from('users')
              .select('id, onboarding_completed')
              .eq('id', currentUser.id)
              .maybeSingle();

            // 없으면 빈 레코드 생성
            if (!existingUser) {
              console.log('[Login] users 테이블 빈 레코드 생성 중...');
              const { error: insertError } = await supabase.from('users').insert({
                id: currentUser.id,
                email: currentUser.email!,
                user_type: 'jobseeker',
                full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
                phone: '',
                foreigner_number: '',
                address: '',
                address_detail: '',
                nationality: '',
                gender: '',
                korean_level: '',
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

              if (insertError) {
                console.error('[Login] users INSERT 에러 상세:', {
                  message: insertError?.message,
                  code: insertError?.code,
                  details: insertError?.details,
                  hint: insertError?.hint,
                  fullError: JSON.stringify(insertError, null, 2)
                });
              } else {
                console.log('[Login] users 레코드 생성 완료');
              }
            } else {
              console.log('[Login] users 레코드 이미 존재함, onboarding_completed:', existingUser.onboarding_completed);
            }

            // localStorage 정리
            localStorage.removeItem('signup_oauth_tab');
            localStorage.removeItem('login_oauth_tab');

            // URL hash 정리
            window.history.replaceState(null, '', window.location.pathname);

            // 온보딩 완료 여부에 따라 리다이렉트
            if (existingUser && existingUser.onboarding_completed) {
              console.log('[Login] 온보딩 완료 → /jobseeker-dashboard');
              router.push('/jobseeker-dashboard');
            } else {
              console.log('[Login] 온보딩 미완료 → /onboarding/job-seeker/quick');
              router.push('/onboarding/job-seeker/quick');
            }
          }
        } catch (error) {
          console.error('[Login] OAuth DB 생성 에러:', error);
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

  // 이미 로그인되어 있으면 자동 리다이렉트 (구글 로그인 후)
  useEffect(() => {
    if (user && userProfile) {
      console.log('[Login] 이미 로그인됨, 리다이렉트 시작');
      
      if (userType === 'jobseeker') {
        if (userProfile.onboarding_completed) {
          console.log('[Login] → /jobseeker-dashboard');
          router.push('/jobseeker-dashboard');
        } else {
          console.log('[Login] → /onboarding/job-seeker/quick');
          router.push('/onboarding/job-seeker/quick');
        }
      } else if (userType === 'company') {
        if (userProfile.profile_completed) {
          console.log('[Login] → /company-dashboard');
          router.push('/company-dashboard');
        } else {
          console.log('[Login] → /signup/company');
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
          <p className="text-gray-600">로그인 중...</p>
        </div>
      </div>
    );
  }

  // 이메일 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] Supabase 로그인 시작:', email, activeTab);

      // Supabase Auth로 로그인
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('[Login] Supabase 로그인 에러:', loginError);
        throw loginError;
      }

      if (!authData.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      console.log('[Login] Supabase 로그인 성공:', authData.user.id);

      if (activeTab === 'company') {
        // 기업 회원 - Companies 테이블 확인
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (companyError) {
          console.error('[Login] 기업 정보 조회 에러:', companyError);
          throw new Error('기업 정보를 확인할 수 없습니다.');
        }

        if (companyData) {
          console.log('[Login] 기업 회원 확인 -> /company-dashboard');
          router.push('/company-dashboard');
        } else {
          console.log('[Login] 기업 회원 아님 -> 로그아웃');
          setError('기업 회원 계정이 아닙니다. 기업 회원가입을 진행해주세요.');
          await supabase.auth.signOut();
        }
      } else {
        // 개인 회원 - users 테이블 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, onboarding_completed')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userError) {
          console.error('[Login] 사용자 정보 조회 에러:', userError);
          throw new Error('사용자 정보를 확인할 수 없습니다.');
        }

        if (userData) {
          if (userData.onboarding_completed) {
            console.log('[Login] 개인 회원 (온보딩 완료) -> /jobseeker-dashboard');
            router.push('/jobseeker-dashboard');
          } else {
            console.log('[Login] 개인 회원 (온보딩 미완료) -> /onboarding/job-seeker/quick');
            router.push('/onboarding/job-seeker/quick');
          }
        } else {
          console.log('[Login] 개인 회원 아님 -> 로그아웃');
          setError('개인 회원 계정이 아닙니다. 개인 회원가입을 진행해주세요.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      console.error('[Login] 에러 발생:', err);

      if (err?.message?.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      } else {
        setError(err?.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] 구글 로그인 시작:', activeTab);

      // 기존 localStorage 정리 (이전 값 제거)
      localStorage.removeItem('signup_oauth_tab');
      localStorage.removeItem('login_oauth_tab');
      
      // localStorage에 현재 탭 저장 (OAuth 후 확인용)
      localStorage.setItem('login_oauth_tab', activeTab);
      console.log('[Login] localStorage에 저장:', activeTab);

      // Supabase Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: activeTab === 'company'
            ? `${window.location.origin}/auth/callback?type=company`
            : `${window.location.origin}/auth/callback?type=jobseeker`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('[Login] 구글 로그인 에러:', error);
        throw error;
      }

      console.log('[Login] 구글 로그인 리다이렉트 중...');
    } catch (err: any) {
      console.error('[Login] 구글 로그인 에러:', err);
      setError(err?.message || '구글 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] 카카오 로그인 시작:', activeTab);

      // 기존 localStorage 정리 (이전 값 제거)
      localStorage.removeItem('signup_oauth_tab');
      localStorage.removeItem('login_oauth_tab');
      
      // localStorage에 현재 탭 저장 (OAuth 후 확인용)
      localStorage.setItem('login_oauth_tab', activeTab);
      console.log('[Login] localStorage에 저장:', activeTab);

      // Supabase Kakao OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: activeTab === 'company'
            ? `${window.location.origin}/auth/callback?type=company`
            : `${window.location.origin}/auth/callback?type=jobseeker`,
          skipBrowserRedirect: false,
          queryParams: { scope: 'profile_nickname,profile_image' },  // account_email 권한 없으므로 제외
        }
      });

      if (error) {
        console.error('[Login] 카카오 로그인 에러:', error);
        throw error;
      }

      console.log('[Login] 카카오 로그인 리다이렉트 중...');
    } catch (err: any) {
      console.error('[Login] 카카오 로그인 에러:', err);
      setError(err?.message || '카카오 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 네이버 로그인
  const handleNaverLogin = () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] 네이버 로그인 시작:', activeTab);

      // API Route로 리다이렉트 (type 파라미터 전달)
      window.location.href = `/api/auth/naver?type=${activeTab}`;
    } catch (err: any) {
      console.error('[Login] 네이버 로그인 에러:', err);
      setError(err?.message || '네이버 로그인 중 오류가 발생했습니다.');
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
            {/* Left Side - Sign Up Promotion (Desktop Only) */}
            <div className="hidden lg:flex bg-white rounded-2xl shadow-md p-16 h-full flex-col justify-center items-start">
              <div className="inline-flex p-5 rounded-2xl mb-8 bg-primary-50">
                {isPerson ? (
                  <User className="w-12 h-12 text-primary-600" />
                ) : (
                  <Building2 className="w-12 h-12 text-primary-600" />
                )}
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {isPerson ? (
                  <>아직 계정이<br />없으신가요?</>
                ) : (
                  <>아직 계정이<br />없으신가요?</>
                )}
              </h2>

              <p className="text-base text-gray-600 mb-12 leading-relaxed">
                {isPerson
                  ? '지금 가입하고 글로벌 인재로서의 커리어를 시작하세요'
                  : '지금 가입하고 우수한 글로벌 인재를 채용하세요'
                }
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                회원가입 하러가기
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white rounded-2xl shadow-md p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">로그인</h2>

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
              <div className="mb-6">
                <p className="text-center text-sm text-gray-600 mb-4">소셜 계정으로 간편 로그인</p>
                <div className="flex items-center justify-center gap-3">
                  {/* 네이버 */}
                  <button
                    type="button"
                    onClick={handleNaverLogin}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-[#03C75A] hover:bg-[#02b350] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
                    title="네이버로 로그인"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z" fill="white"/>
                    </svg>
                  </button>

                  {/* 카카오 */}
                  <button
                    type="button"
                    onClick={handleKakaoLogin}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-[#FEE500] hover:bg-[#f5dc00] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
                    title="카카오로 로그인"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.477 2 10.8C2 13.425 3.636 15.742 6.154 17.136L5.154 20.854C5.052 21.223 5.471 21.508 5.783 21.284L10.285 18.167C10.848 18.236 11.42 18.271 12 18.271C17.523 18.271 22 14.794 22 10.8C22 6.477 17.523 3 12 3Z" fill="#3C1E1E"/>
                    </svg>
                  </button>

                  {/* 구글 */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
                    title="Google로 로그인"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>

                  {/* 페이스북 */}
                  <button
                    type="button"
                    onClick={() => console.log('Facebook login - TODO')}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#0d66d9] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
                    title="Facebook으로 로그인"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                    </svg>
                  </button>

                  {/* 애플 */}
                  <button
                    type="button"
                    onClick={() => console.log('Apple login - TODO')}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
                    title="Apple로 로그인"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleEmailLogin}>
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
                      placeholder="비밀번호 입력"
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

                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    비밀번호 찾기
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

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