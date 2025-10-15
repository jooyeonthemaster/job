'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Globe,
  CreditCard,
  GraduationCap,
  Languages,
  ArrowRight,
  Plus,
  X,
} from 'lucide-react';
import {
  type JobseekerOnboardingFormData,
  validateJobseekerOnboardingForm,
  VISA_TYPES,
  KOREAN_LEVELS,
  NATIONALITIES,
  KOREA_NATIONALITY_CODE,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY,
} from '@/types/jobseeker-onboarding.types';
import { completeOnboarding } from '@/lib/supabase/jobseeker-service';
import { JOBSEEKER_TERMS, JOBSEEKER_REQUIRED_TERMS, JOBSEEKER_OPTIONAL_TERMS } from '@/constants/jobseeker-terms';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function JobseekerOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailSignup, setIsEmailSignup] = useState(true);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [formData, setFormData] = useState<JobseekerOnboardingFormData>({
    fullName: '',
    phone: '',
    phoneVerified: false,
    foreignerNumber: '',
    foreignerNumberVerified: false,
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

  // 사용자 인증 정보 확인
  useEffect(() => {
    if (user) {
      const provider = user.app_metadata?.provider;
      setIsEmailSignup(provider === 'email');

      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);

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
      const allRequired = JOBSEEKER_REQUIRED_TERMS.every((termId) => {
        const fieldName = termFieldMap[termId];
        return newFormData[fieldName] as boolean;
      });

      const allOptional = JOBSEEKER_OPTIONAL_TERMS.every((termId) => {
        const fieldName = termFieldMap[termId];
        return newFormData[fieldName] as boolean;
      });

      newFormData.agreeAll = allRequired && allOptional;

      return newFormData;
    });
  };

  // 약관 모달 열기
  const openTermModal = (termId: string) => {
    const term = JOBSEEKER_TERMS[termId];
    setModalContent({
      title: term.title,
      content: term.content,
    });
    setModalOpen(true);
  };

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
        phone: isKorean ? formData.phone.replace(/-/g, '') : '',
        headline: formData.headline || '',
        resumeFileUrl: undefined,
        resumeFileName: undefined,
        foreigner_number: !isKorean ? formData.foreignerNumber : undefined,
        address: formData.address,
        address_detail: formData.addressDetail,
        nationality: formData.nationality,
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
    } catch (error: any) {
      console.error('[Jobseeker Onboarding] 에러:', error);
      alert(error.message || '온보딩 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">개인 회원 정보 입력</h1>
          <p className="text-gray-600">더 나은 매칭을 위해 정확한 정보를 입력해주세요</p>
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
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>
              <div className="space-y-6">
                {/* 국적 - 제일 먼저! */}
                <div id="nationality">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    국적 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                      errors.nationality ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">국적을 선택해주세요</option>
                    {NATIONALITIES.map((nat) => (
                      <option key={nat.value} value={nat.value}>
                        {nat.label}
                      </option>
                    ))}
                  </select>
                  {errors.nationality && <p className="mt-1 text-sm text-red-500">{errors.nationality}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    국적에 따라 입력해야 할 정보가 달라집니다
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* 이름 */}
                  <div id="fullName">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="홍길동"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* 한국인/외국인 구분 입력 */}
                  {formData.nationality === KOREA_NATIONALITY_CODE ? (
                    // 한국인: 휴대폰 번호만 (3-4-4 형식)
                    <div id="phone">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        휴대폰 번호 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={formData.phone.slice(0, 3)}
                            onChange={(e) => {
                              const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                              if (numbersOnly.length <= 3) {
                                const newPhone = numbersOnly + formData.phone.slice(3);
                                handleChange('phone', newPhone);
                              }
                            }}
                            placeholder="010"
                            maxLength={3}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <span className="text-gray-400 font-bold">-</span>
                        <div className="flex-1">
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={formData.phone.slice(3, 7)}
                            onChange={(e) => {
                              const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                              if (numbersOnly.length <= 4) {
                                const newPhone = formData.phone.slice(0, 3) + numbersOnly + formData.phone.slice(7);
                                handleChange('phone', newPhone);
                              }
                            }}
                            placeholder="1234"
                            maxLength={4}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <span className="text-gray-400 font-bold">-</span>
                        <div className="flex-1">
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={formData.phone.slice(7, 11)}
                            onChange={(e) => {
                              const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                              if (numbersOnly.length <= 4) {
                                const newPhone = formData.phone.slice(0, 7) + numbersOnly;
                                handleChange('phone', newPhone);
                              }
                            }}
                            placeholder="5678"
                            maxLength={4}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        나중에 휴대폰 본인인증을 진행합니다
                      </p>
                    </div>
                  ) : (
                    // 외국인: 외국인등록번호만
                    <div id="foreignerNumber">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        외국인등록번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.foreignerNumber}
                        onChange={(e) => handleChange('foreignerNumber', e.target.value)}
                        placeholder="123456-1234567"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                          errors.foreignerNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.foreignerNumber && <p className="mt-1 text-sm text-red-500">{errors.foreignerNumber}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: 계정 정보 */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">계정 정보</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* 이메일 */}
                <div id="email" className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 (아이디) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!!user.email}
                    placeholder="example@email.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* 비밀번호 */}
                {isEmailSignup ? (
                  // 이메일 가입자 - 비밀번호 이미 설정됨
                  <div id="password" className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 <span className="text-gray-500">(설정됨)</span>
                    </label>
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 cursor-not-allowed border-gray-300"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      회원가입 시 설정한 비밀번호입니다
                    </p>
                  </div>
                ) : (
                  // 소셜 로그인 사용자 - 비밀번호 설정 필요
                  <>
                    <div id="password">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="8자 이상, 영문+숫자 조합"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        8~20자, 문자와 숫자 또는 특수문자(!, @, #, $, ^, *, +, =, -) 포함
                      </p>
                    </div>

                    <div id="passwordConfirm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 확인 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                        placeholder="비밀번호 재입력"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                          errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.passwordConfirm && <p className="mt-1 text-sm text-red-500">{errors.passwordConfirm}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 3: 주소 */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">주소</h2>
              <div className="space-y-4">
                <div id="address">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      placeholder="주소를 검색하세요"
                      className={`flex-1 px-4 py-2 border rounded-lg bg-gray-50 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium whitespace-nowrap"
                    >
                      주소검색
                    </button>
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.addressDetail}
                    onChange={(e) => handleChange('addressDetail', e.target.value)}
                    placeholder="나머지 주소를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: 개인 정보 */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">개인 정보</h2>
              <div>
                {/* 성별 */}
                <div id="gender">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-700">남성</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-700">여성</span>
                    </label>
                  </div>
                  {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Section 5: 비자 정보 (외국인만 표시) */}
            {formData.nationality && formData.nationality !== KOREA_NATIONALITY_CODE && (
              <div className="border-b pb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">비자 정보</h2>
                <div id="visaType">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    비자 유형 (복수 선택 가능) <span className="text-red-500">*</span>
                  </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VISA_TYPES.map((visa) => (
                    <label
                      key={visa.value}
                      className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={visa.value}
                        checked={formData.visaType.includes(visa.value)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            handleChange('visaType', [...formData.visaType, value]);
                          } else {
                            handleChange(
                              'visaType',
                              formData.visaType.filter((v) => v !== value)
                            );
                          }
                        }}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm text-gray-700">{visa.label}</span>
                    </label>
                  ))}
                </div>
                  {errors.visaType && <p className="mt-2 text-sm text-red-500">{errors.visaType}</p>}
                </div>
              </div>
            )}

            {/* Section 6: 언어 능력 */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">언어 능력</h2>

              {/* 한국어 */}
              <div id="koreanLevel" className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한국어 능력 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.koreanLevel}
                  onChange={(e) => handleChange('koreanLevel', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.koreanLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">선택하세요</option>
                  {KOREAN_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.koreanLevel && <p className="mt-1 text-sm text-red-500">{errors.koreanLevel}</p>}
              </div>

              {/* 한국어 외 어학 능력 */}
              <div id="otherLanguages">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  한국어 외 구사 가능 언어 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {formData.otherLanguages.map((lang, index) => (
                    <div key={index} className="flex gap-3">
                      <select
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">언어 선택</option>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">숙련도 선택</option>
                        {LANGUAGE_PROFICIENCY.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formData.otherLanguages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    언어 추가
                  </button>
                </div>
                {errors.otherLanguages && <p className="mt-2 text-sm text-red-500">{errors.otherLanguages}</p>}
              </div>
            </div>

            {/* Section 7: 약관 동의 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">약관 동의</h2>
                {errors.terms && (
                  <span className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.terms}
                  </span>
                )}
              </div>

              {/* 전체 동의 */}
              <label className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-xl bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors mb-4">
                <input
                  type="checkbox"
                  checked={formData.agreeAll}
                  onChange={(e) => handleAgreeAll(e.target.checked)}
                  className="w-5 h-5 accent-primary-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">
                    전체 동의 (필수 약관 및 선택 약관 모두 동의)
                  </span>
                </div>
              </label>

              {/* 필수 약관 */}
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium text-gray-700 px-1">필수 약관</p>
                {JOBSEEKER_REQUIRED_TERMS.map(termId => {
                  const term = JOBSEEKER_TERMS[termId];
                  // 약관 ID를 필드명으로 매핑
                  const termFieldMap: Record<string, keyof JobseekerOnboardingFormData> = {
                    privacy: 'agreePrivacyTerms',
                    service: 'agreeServiceTerms',
                  };
                  const fieldName = termFieldMap[termId];
                  const isExpanded = expandedTerm === termId;

                  return (
                    <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="flex items-start gap-3 p-4 bg-white">
                        <input
                          type="checkbox"
                          checked={formData[fieldName] as boolean}
                          onChange={(e) => handleIndividualAgree(fieldName, e.target.checked)}
                          className="w-5 h-5 mt-0.5 accent-primary-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              <span className="text-red-500">(필수)</span> {term.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openTermModal(termId)}
                                className="text-sm text-primary-600 hover:text-primary-700 underline"
                              >
                                전문보기
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedTerm(isExpanded ? null : termId)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          {term.summary && (
                            <p className="text-sm text-gray-600 mt-1">{term.summary}</p>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                            {term.content.substring(0, 500)}...
                            <button
                              type="button"
                              onClick={() => openTermModal(termId)}
                              className="text-primary-600 hover:text-primary-700 underline ml-2"
                            >
                              전체 보기
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 선택 약관 */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 px-1">선택 약관</p>
                {JOBSEEKER_OPTIONAL_TERMS.map(termId => {
                  const term = JOBSEEKER_TERMS[termId];
                  // 약관 ID를 필드명으로 매핑
                  const termFieldMap: Record<string, keyof JobseekerOnboardingFormData> = {
                    emailReceive: 'agreeEmailReceive',
                  };
                  const fieldName = termFieldMap[termId];
                  const isExpanded = expandedTerm === termId;

                  return (
                    <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="flex items-start gap-3 p-4 bg-white">
                        <input
                          type="checkbox"
                          checked={formData[fieldName] as boolean}
                          onChange={(e) => handleIndividualAgree(fieldName, e.target.checked)}
                          className="w-5 h-5 mt-0.5 accent-primary-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              <span className="text-gray-500">(선택)</span> {term.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openTermModal(termId)}
                                className="text-sm text-primary-600 hover:text-primary-700 underline"
                              >
                                전문보기
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedTerm(isExpanded ? null : termId)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          {term.summary && (
                            <p className="text-sm text-gray-600 mt-1">{term.summary}</p>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                            {term.content.substring(0, 500)}...
                            <button
                              type="button"
                              onClick={() => openTermModal(termId)}
                              className="text-primary-600 hover:text-primary-700 underline ml-2"
                            >
                              전체 보기
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

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
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                {modalContent?.title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {modalContent?.content}
                </pre>
              </div>
            </div>

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
