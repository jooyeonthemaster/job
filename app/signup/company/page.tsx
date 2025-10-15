'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import Section1BusinessInfo from '@/components/company-signup/Section1BusinessInfo';
import Section2CompanyInfo from '@/components/company-signup/Section2CompanyInfo';
import Section3Images from '@/components/company-signup/Section3Images';
import Section4Benefits from '@/components/company-signup/Section4Benefits';
import Section5Manager from '@/components/company-signup/Section5Manager';
import Section6Address from '@/components/company-signup/Section6Address';
import Section7Account from '@/components/company-signup/Section7Account';
import TermsAgreement from '@/components/company-signup/TermsAgreement';
import {
  type CompanySignupFormData,
  validateCompanySignupForm,
  transformFormDataToInsertData
} from '@/lib/supabase/company-types';
import {
  checkBusinessNumberDuplicate,
  uploadCompanySignupFiles
} from '@/lib/supabase/company-service';

export default function CompanySignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 사용자 계정 정보
  const [userEmail, setUserEmail] = useState('');
  const [isEmailSignup, setIsEmailSignup] = useState(true); // 이메일 가입인지 소셜 로그인인지

  // 폼 데이터 상태
  const [formData, setFormData] = useState<CompanySignupFormData>({
    // Section 1: 사업자 정보
    registrationNumber: '',
    name: '',
    establishmentYear: '',
    ceoName: '',

    // Section 2: 기업 기본 정보 (K-Work 기반)
    companyType: '',              // 기업 형태 (7개 옵션)
    companyScale: '',             // 기업 규모 (6개 옵션)
    businessCondition: '',        // 업태 (21개 옵션)
    industry: '',                 // 업종 1단계 (15개 카테고리)
    industryDetail: '',           // 업종 2단계 (상세)
    companyPhone: '',             // 대표번호 (선택)
    website: '',

    // Section 3: 로고 & 회사 전경 이미지

    // Section 4: 복지 정보
    basicBenefits: [],

    // Section 5: 담당자 정보
    managerDepartment: '',
    managerName: '',
    managerEmail: '',
    managerPosition: '',

    // Section 6: 주소 정보
    address: '',

    // Section 7: 계정 정보
    email: '',
    password: '',
    passwordConfirm: '',

    // Section 8: 약관 동의
    agreeAll: false,
    agreeServiceTerms: false,
    agreePrivacyTerms: false,
    agreeCompanyInfoTerms: false,
    agreePublicInfoTerms: false,
    agreeAdminInfoTerms: false,
    agreeMarketingTerms: false,
  });

  // 사용자 인증 정보 확인 (이메일 가입 vs 소셜 로그인)
  useEffect(() => {
    const checkAuthMethod = async () => {
      try {
        const { supabase: supabaseClient } = await import('@/lib/supabase/config');
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
          console.log('[Onboarding] 사용자 인증 정보:', {
            id: user.id,
            email: user.email,
            provider: user.app_metadata?.provider
          });

          // 이메일 설정
          setUserEmail(user.email || '');
          setFormData((prev) => ({
            ...prev,
            email: user.email || ''
          }));

          // 가입 방식 확인
          const provider = user.app_metadata?.provider || 'email';
          const isEmail = provider === 'email';
          setIsEmailSignup(isEmail);

          console.log('[Onboarding] 가입 방식:', isEmail ? '이메일' : '소셜 로그인 (Google, Kakao 등)');
        }
      } catch (error) {
        console.error('[Onboarding] 사용자 정보 가져오기 에러:', error);
      }
    };

    checkAuthMethod();
  }, []);

  // 폼 필드 변경 핸들러
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 제거
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // 1. 클라이언트 사이드 검증
    const validation = validateCompanySignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setError('입력하신 정보를 다시 확인해주세요.');
      // 첫 번째 에러로 스크롤
      const firstErrorField = Object.keys(validation.errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Signup] 회원가입 시작');

      // 2. 현재 로그인된 사용자 가져오기
      const { supabase: supabaseClient } = await import('@/lib/supabase/config');
      const { data: { user } } = await supabaseClient.auth.getUser();

      console.log('[Signup] 사용자 정보:', user ? `ID: ${user.id}, Email: ${user.email}` : '없음');

      if (!user) {
        console.log('[Signup] 사용자 없음 -> /login/company로 리다이렉트');
        setError('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        setIsLoading(false);
        router.push('/login/company');
        return;
      }

      // 3. 사업자등록번호 중복 확인
      console.log('[Signup] 사업자등록번호 중복 확인:', formData.registrationNumber);
      const isBusinessNumberDuplicate = await checkBusinessNumberDuplicate(formData.registrationNumber);

      if (isBusinessNumberDuplicate) {
        console.log('[Signup] 중복된 사업자등록번호');
        setErrors({ registrationNumber: '이미 등록된 사업자등록번호입니다.' });
        setError('이미 등록된 사업자등록번호입니다.');
        setIsLoading(false);
        return;
      }

      // 3.5. 소셜 로그인 사용자의 경우 비밀번호 설정
      if (!isEmailSignup && formData.password) {
        console.log('[Signup] 소셜 로그인 사용자 - 비밀번호 설정 시작');
        try {
          const { error: passwordError } = await supabaseClient.auth.updateUser({
            password: formData.password
          });

          if (passwordError) {
            console.error('[Signup] 비밀번호 설정 에러:', passwordError);
            setError('비밀번호 설정에 실패했습니다. 다시 시도해주세요.');
            setIsLoading(false);
            return;
          }

          console.log('[Signup] 소셜 로그인 사용자 비밀번호 설정 완료');
        } catch (passwordErr) {
          console.error('[Signup] 비밀번호 설정 예외:', passwordErr);
          setError('비밀번호 설정 중 오류가 발생했습니다.');
          setIsLoading(false);
          return;
        }
      }

      // 4. 파일 업로드 먼저 처리 (Cloudinary)
      console.log('[Signup] 파일 업로드 시작');
      let uploadedFiles: { registrationDocument?: string; logo?: string } = {};

      const files = {
        registrationDocument: formData.registrationDocument,
        logo: formData.logo,
        companyImage: formData.companyImage,
      };

      if (files.registrationDocument || files.logo || files.companyImage) {
        uploadedFiles = await uploadCompanySignupFiles(files, user.id);
        console.log('[Signup] 파일 업로드 완료:', uploadedFiles);
      }

      // 5. 데이터 변환 (업로드된 파일 URL 포함)
      console.log('[Signup] 데이터 변환 시작');
      const insertData = transformFormDataToInsertData(formData, uploadedFiles);
      console.log('[Signup] 변환된 데이터:', insertData);

      // 6. Companies 테이블에 기업 정보 저장
      console.log('[Signup] Companies 테이블에 저장 시작');
      const dataToInsert = {
        id: user.id,
        email: user.email,
        ...insertData,
      };
      console.log('[Signup] 저장할 데이터:', JSON.stringify(dataToInsert, null, 2));

      const { error: insertError } = await supabaseClient
        .from('companies')
        .upsert(dataToInsert, {
          onConflict: 'id'
        });

      if (insertError) {
        console.error('[Signup] Companies 저장 에러 (전체):', JSON.stringify(insertError, null, 2));
        console.error('[Signup] 에러 코드:', insertError.code);
        console.error('[Signup] 에러 메시지:', insertError.message);
        console.error('[Signup] 에러 상세:', insertError.details);
        console.error('[Signup] 에러 힌트:', insertError.hint);
        throw insertError;
      }
      console.log('[Signup] Companies 저장 완료');

      // 7. 복지 정보 저장 (별도 테이블)
      if (formData.basicBenefits && formData.basicBenefits.length > 0) {
        console.log('[Signup] 복지 정보 저장 시작:', formData.basicBenefits);
        const benefitsData = formData.basicBenefits.map(benefit => ({
          company_id: user.id,
          category: 'basic', // 기본 복지 카테고리
          title: benefit,
        }));

        const { error: benefitsError } = await supabaseClient
          .from('company_benefits')
          .insert(benefitsData);

        if (benefitsError) {
          console.error('[Signup] 복지 정보 저장 에러:', benefitsError);
          // 복지 저장 실패해도 계속 진행 (필수 아님)
        } else {
          console.log('[Signup] 복지 정보 저장 완료');
        }
      }

      // 8. 온보딩 완료 - 대시보드로 이동
      console.log('[Signup] 온보딩 완료! /company-dashboard로 리다이렉트');
      router.push('/company-dashboard');
    } catch (err: any) {
      console.error('Company signup error:', err);

      if (err?.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
      } else if (err?.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
        setErrors({ email: '유효하지 않은 이메일 형식입니다.' });
      } else if (err?.code === 'auth/weak-password') {
        setError('비밀번호는 8자 이상이어야 합니다.');
        setErrors({ password: '비밀번호는 8자 이상이어야 합니다.' });
      } else {
        setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로 가기 */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          회원가입 유형 선택으로 돌아가기
        </Link>

        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">GlobalTalent</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">기업 회원가입</h1>
            <p className="text-gray-600">
              기업 정보를 입력하고 채용 서비스를 시작하세요
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-red-500">*</span> 표시는 필수 항목입니다
            </p>
          </div>

          {/* 전체 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  {Object.keys(errors).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-700 font-medium mb-1">
                        {Object.keys(errors).length}개 항목을 확인해주세요:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field} className="text-xs text-red-600">
                            {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: 사업자 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section1BusinessInfo
                formData={{
                  registrationNumber: formData.registrationNumber,
                  registrationDocument: formData.registrationDocument,
                  name: formData.name,
                  nameEn: formData.nameEn,
                  establishmentYear: formData.establishmentYear || '',
                  ceoName: formData.ceoName,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 2: 기업 기본 정보 (K-Work 기반) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section2CompanyInfo
                formData={{
                  companyType: formData.companyType || '',
                  companyScale: formData.companyScale || '',
                  businessCondition: formData.businessCondition || '',
                  industry: formData.industry || '',
                  industryDetail: formData.industryDetail || '',
                  companyPhone: formData.companyPhone || '',
                  website: formData.website || '',
                  summary: formData.summary || '',
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 3: 로고 & 회사 전경 이미지 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section3Images
                formData={{
                  logo: formData.logo,
                  companyImage: formData.companyImage,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 4: 복지 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section4Benefits
                formData={{
                  basicBenefits: formData.basicBenefits,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 5: 담당자 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section5Manager
                formData={{
                  managerDepartment: formData.managerDepartment,
                  managerName: formData.managerName,
                  managerEmail: formData.managerEmail,
                  managerPosition: formData.managerPosition,
                  managerPhone: formData.managerPhone,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 6: 주소 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section6Address
                formData={{
                  address: formData.address,
                  addressDetail: formData.addressDetail,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* Section 7: 계정 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Section7Account
                formData={{
                  email: formData.email,
                  password: formData.password || '',
                  passwordConfirm: formData.passwordConfirm || '',
                }}
                onChange={handleChange}
                errors={errors}
                isEmailSignup={isEmailSignup}
              />
            </div>

            {/* Section 8: 약관 동의 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <TermsAgreement
                agreements={{
                  agreeAll: formData.agreeAll,
                  agreeServiceTerms: formData.agreeServiceTerms,
                  agreePrivacyTerms: formData.agreePrivacyTerms,
                  agreeCompanyInfoTerms: formData.agreeCompanyInfoTerms,
                  agreePublicInfoTerms: formData.agreePublicInfoTerms,
                  agreeAdminInfoTerms: formData.agreeAdminInfoTerms,
                  agreeMarketingTerms: formData.agreeMarketingTerms,
                }}
                onChange={handleChange}
                errors={errors}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    회원가입 중...
                  </>
                ) : (
                  '기업 회원가입 완료'
                )}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                회원가입을 완료하면{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  서비스 이용약관
                </Link>
                과{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  개인정보 처리방침
                </Link>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center mt-8 text-gray-600 mb-12">
            이미 계정이 있으신가요?{' '}
            <Link href="/login/company" className="text-primary-600 hover:text-primary-700 font-medium">
              기업 회원 로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
