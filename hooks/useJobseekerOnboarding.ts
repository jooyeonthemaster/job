// 개인 회원 온보딩 커스텀 훅
// 폼 상태 관리 + 유효성 검증 + 제출 처리 + 주소 검색 로직

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import {
  type JobseekerOnboardingFormData,
  validateJobseekerOnboardingForm,
  KOREA_NATIONALITY_CODE,
} from '@/types/jobseeker-onboarding.types';
import { completeOnboarding } from '@/lib/supabase/jobseeker-service';

export const useJobseekerOnboarding = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailSignup, setIsEmailSignup] = useState(true);

  const [formData, setFormData] = useState<JobseekerOnboardingFormData>({
    fullName: '',
    phoneCountryCode: '+82',      // ✅ 기본값: 한국 국가 코드
    phone: '',
    phoneVerified: false,
    foreignerNumber: '',
    foreignerNumberVerified: false,
    desiredJobCategory: '',
    email: '',
    password: '',
    passwordConfirm: '',
    address: '',
    addressDetail: '',
    nationality: '',
    gender: '',
    birthYear: '',
    visaType: [],
    koreanLevel: '',
    otherLanguages: [{ language: '', proficiency: '' }],
    agreeAll: false,
    agreeServiceTerms: false,
    agreePrivacyTerms: false,
    agreeEmailReceive: false,
    headline: '',
  });

  // 가입 방식 확인 및 이메일 설정
  useEffect(() => {
    if (!user) return;

    // 가입 방식 확인
    const provider = user.user_metadata?.provider || user.app_metadata?.provider || 'email';
    setIsEmailSignup(provider === 'email');

    console.log('[개인 온보딩] 가입 방식:', provider === 'email' ? '이메일' : `소셜 로그인 (${provider})`);

    // 이메일 설정
    setFormData((prev) => ({
      ...prev,
      email: user.email || '',
    }));
  }, [user]);

  // 폼 필드 변경 핸들러
  const handleChange = (field: keyof JobseekerOnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // 다음 API 주소 검색
  const handleAddressSearch = () => {
    if (typeof window === 'undefined') return;

    new (window as any).daum.Postcode({
      oncomplete: function (data: any) {
        let addr = '';
        if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }
        handleChange('address', addr);
      },
    }).open();
  };

  // 어학 능력 추가
  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      otherLanguages: [...prev.otherLanguages, { language: '', proficiency: '' }],
    }));
  };

  // 어학 능력 제거
  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherLanguages: prev.otherLanguages.filter((_, i) => i !== index),
    }));
  };

  // 어학 능력 변경
  const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    setFormData((prev) => ({
      ...prev,
      otherLanguages: prev.otherLanguages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  // 약관 전체 동의
  const handleAgreeAll = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeAll: checked,
      agreeServiceTerms: checked,
      agreePrivacyTerms: checked,
      agreeEmailReceive: checked,
    }));
  };

  // 개별 약관 동의
  const handleIndividualAgree = (field: keyof JobseekerOnboardingFormData, checked: boolean) => {
    // 약관 ID를 필드명으로 매핑
    const termFieldMap: Record<string, keyof JobseekerOnboardingFormData> = {
      privacy: 'agreePrivacyTerms',
      service: 'agreeServiceTerms',
      emailReceive: 'agreeEmailReceive',
    };

    setFormData((prev) => {
      const newFormData = { ...prev, [field]: checked };

      // 전체 동의 체크박스 상태 업데이트
      const allRequired = ['privacy', 'service'].every((termId) => {
        const fieldName = termFieldMap[termId];
        return newFormData[fieldName] as boolean;
      });

      const allOptional = ['emailReceive'].every((termId) => {
        const fieldName = termFieldMap[termId];
        return newFormData[fieldName] as boolean;
      });

      newFormData.agreeAll = allRequired && allOptional;

      return newFormData;
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 [Submit] 폼 제출 시작');
    console.log('📝 [Submit] 폼 데이터:', formData);

    // 유효성 검증
    const validation = validateJobseekerOnboardingForm(formData, isEmailSignup);
    console.log('✅ [Submit] 유효성 검증 결과:', validation);

    if (!validation.isValid) {
      console.error('❌ [Submit] 유효성 검증 실패:', validation.errors);
      setErrors(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      console.log('📍 [Submit] 첫 번째 에러 필드:', firstErrorField);
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login/jobseeker');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[Jobseeker Onboarding] 온보딩 시작:', user.id);

      const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

      // Supabase users 테이블 업데이트
      await completeOnboarding(user.id, {
        fullName: formData.fullName,
        desired_job_category: formData.desiredJobCategory,  // ✅ 희망 근무 직군 저장
        phone_country_code: formData.phoneCountryCode,      // ✅ 국가 코드 저장
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : '',  // ✅ 숫자만 저장
        headline: formData.headline || '',
        resumeFileUrl: undefined,
        resumeFileName: undefined,
        foreigner_number: !isKorean && formData.foreignerNumber ? formData.foreignerNumber : undefined,  // ✅ 외국인만 저장
        address: formData.address,
        address_detail: formData.addressDetail,
        nationality: formData.nationality,
        birth_year: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        gender: formData.gender,
        visa_types: formData.visaType,
        korean_level: formData.koreanLevel,
        otherLanguages: formData.otherLanguages,  // ✅ 언어 능력 저장 추가
        agree_email_receive: formData.agreeEmailReceive,
        agree_privacy_collection: formData.agreePrivacyTerms,
      });

      console.log('[Jobseeker Onboarding] 온보딩 완료');

      // 대시보드로 이동
      router.push('/jobseeker-dashboard');
    } catch (error: unknown) {
      const err = error as any;
      console.error('[Jobseeker Onboarding] 에러 상세:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack,
        fullError: JSON.stringify(error, null, 2)
      });
      alert(err?.message || '온보딩 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
