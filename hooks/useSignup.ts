import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import type { SignupTab, SignupFormData, LocalStorageSignupData } from '@/types/signup.types';

const STORAGE_KEY = 'signup_form_data';
const OAUTH_TAB_KEY = 'signup_oauth_tab';

export const useSignup = (activeTab: SignupTab) => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // localStorage에서 입력값 복원
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: LocalStorageSignupData = JSON.parse(savedData);
        if (parsed.tab === activeTab) {
          setFormData({
            email: parsed.email || '',
            password: parsed.password || '',
            confirmPassword: parsed.confirmPassword || '',
            agreeTerms: parsed.agreeTerms || false
          });
        }
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    }
  }, [activeTab]);

  // 입력값 변경 시 localStorage 저장
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dataToSave: LocalStorageSignupData = {
      tab: activeTab,
      ...formData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [activeTab, formData]);

  // localStorage 클리어
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // 필드 업데이트
  const updateField = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // OAuth 콜백 처리
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token')) return;

      console.log('[Signup] OAuth hash fragment 감지:', hash.substring(0, 50));

      const savedTab = localStorage.getItem(OAUTH_TAB_KEY) || 'jobseeker';
      console.log('[Signup] localStorage에서 확인된 회원 유형:', savedTab);

      // 세션 설정 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error('[Signup] 세션을 찾을 수 없습니다');
        return;
      }

      const currentUser = session.user;
      console.log('[Signup] 현재 사용자 ID:', currentUser.id);

      try {
        if (savedTab === 'company') {
          await handleCompanyOAuth(currentUser);
        } else {
          await handleJobseekerOAuth(currentUser);
        }
      } catch (error) {
        console.error('[Signup] OAuth DB 생성 에러:', error);
      }
    };

    handleOAuthCallback();
  }, [router]);

  // 기업 회원 OAuth 처리
  const handleCompanyOAuth = async (user: any) => {
    console.log('[Signup] 기업 회원 OAuth 처리 시작');

    // metadata 업데이트
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { user_type: 'company' }
    });

    if (metadataError) {
      console.error('[Signup] metadata 업데이트 에러:', metadataError);
    } else {
      console.log('[Signup] metadata.user_type = "company" 업데이트 완료');
    }

    // companies 테이블 확인 및 생성
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingCompany) {
      console.log('[Signup] companies 레코드 생성 중...');
      await supabase.from('companies').insert({
        id: user.id,
        email: user.email!,
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
        manager_email: user.email!,
        profile_completed: false,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('[Signup] companies 레코드 생성 완료');
    } else {
      console.log('[Signup] companies 레코드 이미 존재함');
    }

    // 정리 및 리다이렉트
    localStorage.removeItem(OAUTH_TAB_KEY);
    window.history.replaceState(null, '', window.location.pathname);
    console.log('[Signup] /signup/company로 이동');
    router.push('/signup/company');
  };

  // 개인 회원 OAuth 처리
  const handleJobseekerOAuth = async (user: any) => {
    console.log('[Signup] 개인 회원 OAuth 처리 시작');

    // metadata 업데이트
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { user_type: 'jobseeker' }
    });

    if (metadataError) {
      console.error('[Signup] metadata 업데이트 에러:', metadataError);
    } else {
      console.log('[Signup] metadata.user_type = "jobseeker" 업데이트 완료');
    }

    // users 테이블 확인 및 생성
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingUser) {
      console.log('[Signup] users 레코드 생성 중...');
      await supabase.from('users').insert({
        id: user.id,
        email: user.email!,
        user_type: 'jobseeker',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
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
      console.log('[Signup] users 레코드 생성 완료');
    } else {
      console.log('[Signup] users 레코드 이미 존재함');
    }

    // 정리 및 리다이렉트
    localStorage.removeItem(OAUTH_TAB_KEY);
    window.history.replaceState(null, '', window.location.pathname);
    console.log('[Signup] /onboarding/job-seeker/quick로 이동');
    router.push('/onboarding/job-seeker/quick');
  };

  // 이메일 회원가입
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Signup] Supabase 회원가입 시작:', formData.email, activeTab);

      // Supabase Auth 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: activeTab
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

      // DB 테이블에 레코드 생성
      if (activeTab === 'jobseeker') {
        await createJobseekerRecord(data.user.id, formData.email);
      } else {
        await createCompanyRecord(data.user.id, formData.email);
      }

      // 세션 확인 대기
      if (!data.session) {
        await waitForSession();
      }

      clearFormData();

      // 리다이렉트
      if (activeTab === 'company') {
        console.log('[Signup] 기업 회원 -> /signup/company로 리다이렉트');
        router.push('/signup/company');
      } else {
        console.log('[Signup] 구직자 회원 -> /onboarding/job-seeker/quick로 리다이렉트');
        router.push('/onboarding/job-seeker/quick');
      }
    } catch (err: any) {
      console.error('[Signup] 에러 발생:', err);
      handleSignupError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 구직자 레코드 생성
  const createJobseekerRecord = async (userId: string, email: string) => {
    console.log('[Signup] users 테이블 빈 레코드 생성 중...');
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: email,
      user_type: 'jobseeker',
      full_name: '',
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
      console.error('[Signup] users 테이블 INSERT 에러:', insertError);
      throw new Error('회원가입 처리 중 오류가 발생했습니다.');
    }
    console.log('[Signup] users 테이블 레코드 생성 완료');
  };

  // 기업 레코드 생성
  const createCompanyRecord = async (userId: string, email: string) => {
    console.log('[Signup] companies 테이블 빈 레코드 생성 중...');
    const { error: insertError } = await supabase.from('companies').insert({
      id: userId,
      email: email,
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
      manager_email: email,
      profile_completed: false,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('[Signup] companies 테이블 INSERT 에러:', insertError);
      throw new Error('회원가입 처리 중 오류가 발생했습니다.');
    }
    console.log('[Signup] companies 테이블 레코드 생성 완료');
  };

  // 세션 확인 대기
  const waitForSession = async () => {
    console.log('[Signup] 세션 대기 중...');
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
  };

  // 에러 처리
  const handleSignupError = (err: any) => {
    if (err?.message?.includes('already registered')) {
      setError('이미 사용 중인 이메일입니다.');
    } else if (err?.message?.includes('invalid email')) {
      setError('유효하지 않은 이메일 형식입니다.');
    } else if (err?.message?.includes('Password should be at least 6 characters')) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
    } else {
      setError(err?.message || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // Google OAuth
  const handleGoogleSignup = async () => {
    if (!formData.agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('[Signup] 구글 회원가입 시작:', activeTab);

      localStorage.setItem(OAUTH_TAB_KEY, activeTab);

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
        console.error('[Signup] 구글 로그인 에러:', error);
        throw error;
      }

      console.log('[Signup] 구글 회원가입 리다이렉트 중...');
      clearFormData();
    } catch (err: any) {
      console.error('[Signup] 구글 회원가입 에러:', err);
      setError(err?.message || '구글 회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // Kakao OAuth
  const handleKakaoSignup = async () => {
    if (!formData.agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('[Signup] 카카오 회원가입 시작:', activeTab);

      localStorage.setItem(OAUTH_TAB_KEY, activeTab);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: activeTab === 'company'
            ? `${window.location.origin}/auth/callback?type=company`
            : `${window.location.origin}/auth/callback?type=jobseeker`,
          skipBrowserRedirect: false,
          queryParams: { scope: 'profile_nickname,profile_image' },
        }
      });

      if (error) {
        console.error('[Signup] 카카오 회원가입 에러:', error);
        throw error;
      }

      console.log('[Signup] 카카오 회원가입 리다이렉트 중...');
      clearFormData();
    } catch (err: any) {
      console.error('[Signup] 카카오 회원가입 에러:', err);
      setError(err?.message || '카카오 회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // Naver OAuth
  const handleNaverSignup = () => {
    if (!formData.agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('[Signup] 네이버 회원가입 시작:', activeTab);

      // API Route로 리다이렉트 (type 파라미터 전달)
      window.location.href = `/api/auth/naver?type=${activeTab}`;
      clearFormData();
    } catch (err: any) {
      console.error('[Signup] 네이버 회원가입 에러:', err);
      setError(err?.message || '네이버 회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return {
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
  };
};
