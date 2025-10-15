// Supabase 기업 회원가입 서비스
import { supabase } from './config';
import type {
  CompanySignupFormData,
  CompanyInsertData,
  CompanyAdditionalInfo
} from './company-types';

// =====================================================
// 회원가입
// =====================================================

/**
 * 기업 회원가입
 * 1. Supabase Auth로 계정 생성
 * 2. companies 테이블에 데이터 저장
 * 3. basic_benefits 테이블에 복지 저장
 */
export const signUpCompany = async (
  insertData: CompanyInsertData,
  basicBenefits: string[]
) => {
  // 1. Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: insertData.email,
    password: '', // 별도로 전달받아야 함 (보안상 insertData에 포함 안 함)
    options: {
      data: {
        user_type: 'company',
        company_name: insertData.name
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('회원가입 실패');

  const userId = authData.user.id;

  // 2. companies 테이블에 저장
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert({
      ...insertData,
      id: userId, // Auth UID를 그대로 사용
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (companyError) {
    // 롤백: Auth 계정 삭제 (어드민 권한 필요, 일단 에러만 던짐)
    console.error('Company insert failed, auth user created:', userId);
    throw companyError;
  }

  // 3. basic_benefits 테이블에 저장
  if (basicBenefits.length > 0) {
    const benefitsToInsert = basicBenefits.map(tag => ({
      company_id: userId,
      benefit_tag: tag
    }));

    const { error: benefitsError } = await supabase
      .from('company_basic_benefits')
      .insert(benefitsToInsert);

    if (benefitsError) {
      console.error('Benefits insert failed:', benefitsError);
      // 복지 저장 실패는 치명적이지 않으므로 계속 진행
    }
  }

  return {
    user: authData.user,
    company: companyData
  };
};

// =====================================================
// 중복 확인
// =====================================================

/**
 * 사업자등록번호 중복 확인
 */
export const checkBusinessNumberDuplicate = async (
  registrationNumber: string
): Promise<boolean> => {
  const cleaned = registrationNumber.replace(/-/g, '');

  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('registration_number', cleaned)
    .maybeSingle();

  if (error) {
    console.error('Registration number check error:', error);
    return false;
  }

  return data !== null; // 데이터가 있으면 중복
};

/**
 * 이메일 중복 확인
 */
export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Email check error:', error);
    return false;
  }

  return data !== null;
};

// =====================================================
// 파일 업로드 (Cloudinary)
// =====================================================

/**
 * 사업자등록증 업로드 (Cloudinary)
 */
export const uploadRegistrationDocument = async (
  file: File,
  companyId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/companies/${companyId}/documents`);
  formData.append('type', 'general');

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '사업자등록증 업로드 실패');
  }

  const data = await response.json();
  return data.url;
};

/**
 * 로고 업로드 (Cloudinary)
 */
export const uploadLogo = async (
  file: File,
  companyId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/logos/${companyId}`);
  formData.append('type', 'logo');

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '로고 업로드 실패');
  }

  const data = await response.json();
  return data.url;
};

/**
 * 회사 전경 이미지 업로드 (Cloudinary)
 */
export const uploadCompanyImage = async (
  file: File,
  companyId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/companies/${companyId}/images`);
  formData.append('type', 'general');

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '회사 전경 이미지 업로드 실패');
  }

  const data = await response.json();
  return data.url;
};

/**
 * 기업 이미지 업로드 (여러 개, Cloudinary)
 */
export const uploadCompanyImages = async (
  files: File[],
  companyId: string
): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `jobmatch/companies/${companyId}/images`);
    formData.append('type', 'general');

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 업로드 실패');
    }

    const data = await response.json();
    return data.url;
  });

  return Promise.all(uploadPromises);
};

/**
 * 모든 회원가입 파일 한 번에 업로드
 */
export const uploadCompanySignupFiles = async (
  files: {
    registrationDocument?: File;
    logo?: File;
    companyImage?: File;
    images?: File[];
  },
  companyId: string
): Promise<{
  registrationDocument?: string;
  logo?: string;
  companyImage?: string;
  images?: string[];
}> => {
  const result: {
    registrationDocument?: string;
    logo?: string;
    companyImage?: string;
    images?: string[];
  } = {};

  try {
    if (files.registrationDocument) {
      result.registrationDocument = await uploadRegistrationDocument(
        files.registrationDocument,
        companyId
      );
    }

    if (files.logo) {
      result.logo = await uploadLogo(files.logo, companyId);
    }

    if (files.companyImage) {
      result.companyImage = await uploadCompanyImage(files.companyImage, companyId);
    }

    if (files.images && files.images.length > 0) {
      result.images = await uploadCompanyImages(files.images, companyId);
    }

    return result;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// =====================================================
// 조회
// =====================================================

/**
 * 기업 프로필 조회
 */
export const getCompanyProfile = async (companyId: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      basic_benefits:company_basic_benefits(benefit_tag),
      tech_stack:company_tech_stack(tech_name),
      benefits:company_benefits(*),
      stats:company_stats(*),
      recruiters:company_recruiters(*),
      offices:company_offices(*)
    `)
    .eq('id', companyId)
    .single();

  if (error) throw error;

  return data;
};

/**
 * 현재 로그인한 기업 정보 가져오기
 */
export const getCurrentCompany = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getCompanyProfile(user.id);
};

// =====================================================
// 업데이트 (대시보드용)
// =====================================================

/**
 * 추가 정보 업데이트
 */
export const updateAdditionalInfo = async (
  companyId: string,
  additionalInfo: CompanyAdditionalInfo
) => {
  const { data, error } = await supabase
    .from('companies')
    .update({
      ...additionalInfo,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * 기술 스택 업데이트
 */
export const updateTechStack = async (
  companyId: string,
  techStack: string[]
) => {
  // 기존 기술 스택 삭제
  await supabase
    .from('company_tech_stack')
    .delete()
    .eq('company_id', companyId);

  // 새로 추가
  if (techStack.length > 0) {
    const techToInsert = techStack.map(tech => ({
      company_id: companyId,
      tech_name: tech
    }));

    const { error } = await supabase
      .from('company_tech_stack')
      .insert(techToInsert);

    if (error) throw error;
  }
};

/**
 * 상세 복지 업데이트
 */
export const updateDetailedBenefits = async (
  companyId: string,
  benefits: Array<{
    category: string;
    title: string;
    description?: string;
  }>
) => {
  // 기존 복지 삭제
  await supabase
    .from('company_benefits')
    .delete()
    .eq('company_id', companyId);

  // 새로 추가
  if (benefits.length > 0) {
    const benefitsToInsert = benefits.map(benefit => ({
      company_id: companyId,
      ...benefit
    }));

    const { error } = await supabase
      .from('company_benefits')
      .insert(benefitsToInsert);

    if (error) throw error;
  }
};

// =====================================================
// 프로필 완성도 계산
// =====================================================

/**
 * 프로필 완성도 계산 (0~100%)
 * 선택 항목만 기준으로 계산 (필수 항목은 이미 100%)
 */
export const calculateProfileCompletion = (company: any): number => {
  const optionalFields = [
    company.logo,              // 로고
    company.name_en,           // 영문명
    company.company_phone,     // 대표번호
    company.website,           // 홈페이지
    company.summary,           // 한 줄 소개
    company.company_image      // 회사 전경 이미지
  ];

  const filledCount = optionalFields.filter(Boolean).length;
  const totalCount = optionalFields.length;

  return Math.round((filledCount / totalCount) * 100);
};
