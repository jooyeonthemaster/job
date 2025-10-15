// Supabase 기업 회원가입 타입 정의
// K-Work 스타일로 재설계

// =====================================================
// 기업 분류 Enum
// =====================================================

export type CompanyType = 'individual' | 'corporation' | 'foreign';

export const COMPANY_TYPES: Record<CompanyType, string> = {
  individual: '개인사업자',
  corporation: '법인',
  foreign: '외국계법인'
};

export type BusinessType =
  | 'manufacturing'    // 제조업
  | 'wholesale'        // 도소매업
  | 'service'          // 서비스업
  | 'it'               // IT/정보통신
  | 'finance'          // 금융업
  | 'construction'     // 건설업
  | 'education'        // 교육업
  | 'healthcare'       // 의료업
  | 'other';           // 기타

export const BUSINESS_TYPES: Record<BusinessType, string> = {
  manufacturing: '제조업',
  wholesale: '도소매업',
  service: '서비스업',
  it: 'IT/정보통신',
  finance: '금융업',
  construction: '건설업',
  education: '교육업',
  healthcare: '의료업',
  other: '기타'
};

export const EMPLOYEE_COUNTS = [
  '1-10명',
  '11-50명',
  '51-100명',
  '101-300명',
  '301-1,000명',
  '1,001-5,000명',
  '5,000명 이상'
];

// =====================================================
// 회원가입 폼 데이터 타입
// =====================================================

export interface CompanySignupFormData {
  // ===== Section 1: 사업자 정보 =====
  registrationNumber: string;           // 사업자등록번호 (10자리 숫자)
  name: string;                         // 기업명 (한글, 필수)
  nameEn?: string;                      // 기업명 (영문, 선택)
  establishmentYear?: string;           // 설립년도 (YYYY) - 구형 호환
  established?: string;                 // 설립년도 (YYYY) - 신형
  ceoName: string;                      // 대표자명
  registrationDocument?: File;          // 사업자등록증 파일 (PDF/이미지)

  // ===== Section 2: 기업 기본 정보 (K-Work 기반) =====
  companyType: CompanyType | '';        // 기업형태 (필수) - 7개 K-Work 옵션
  companyScale?: string;                // 기업규모 (필수) - 6개 K-Work 옵션
  businessCondition?: string;           // 업태 (필수) - 21개 K-Work 옵션
  industry?: string;                    // 업종 1단계 (필수) - 15개 K-Work 카테고리
  industryDetail?: string;              // 업종 2단계 (필수) - 상세 카테고리
  businessType?: BusinessType;          // 구형 업태 (하위호환)
  employeeCount?: string;               // 구형 기업규모 (하위호환)
  companyPhone?: string;                // 대표번호 (선택, 하이픈 없이)
  phone?: string;                       // 구형 대표번호 (하위호환)
  website?: string;                     // 홈페이지 (선택)
  summary?: string;                     // 요약소개글 (선택, 200자)

  // ===== Section 3: 로고 & 회사 전경 이미지 =====
  logo?: File;                          // 로고 (선택)
  companyImage?: File;                  // 회사 전경 이미지 (선택)

  // ===== Section 4: 복지 정보 =====
  basicBenefits: string[];              // 주요 복지 (최소 1개, 태그 형식)

  // ===== Section 5: 담당자 정보 =====
  managerDepartment: string;            // 담당부서 (필수)
  managerName: string;                  // 담당자명 (필수)
  managerEmail: string;                 // 담당자 이메일 (필수)
  managerPosition: string;              // 담당자 직책 (필수)
  managerPhone?: string;                // 담당자 연락처 (선택)

  // ===== Section 6: 주소 정보 =====
  location?: string;                    // 주소 (주소검색, 필수) - 구형
  address: string;                      // 주소/상세주소 (필수) - 신형 통합
  addressDetail?: string;               // 상세주소 (선택) - 신형

  // ===== Section 7: 계정 정보 =====
  email: string;                        // 이메일 (읽기 전용, 회원가입 시 설정됨)
  password?: string;                    // 비밀번호 (소셜 로그인 사용자만 필수)
  passwordConfirm?: string;             // 비밀번호 확인 (소셜 로그인 사용자만 필수)

  // ===== Section 8: 약관 동의 =====
  agreeAll: boolean;                    // 전체 동의
  agreeServiceTerms: boolean;           // 서비스 이용약관 (필수)
  agreePrivacyTerms: boolean;           // 개인정보 수집 및 이용 (필수)
  agreeCompanyInfoTerms: boolean;       // 기업정보 수집·이용·제공·조회 (필수)
  agreePublicInfoTerms: boolean;        // 공공기관 신용정보 제공·조회 (필수)
  agreeAdminInfoTerms: boolean;         // 행정정보 공동이용 (필수)
  agreeMarketingTerms: boolean;         // 마케팅 정보 수신 (선택)
}

// =====================================================
// 데이터베이스 저장용 타입 (Supabase)
// =====================================================

export interface CompanyInsertData {
  email: string;

  // 사업자 정보
  registration_number: string;
  registration_document?: string;       // Storage URL
  name: string;
  name_en?: string;
  established: string;
  ceo_name: string;

  // 기업 분류
  company_type: CompanyType;
  industry?: BusinessType;
  employee_count: string;

  // 연락처
  phone?: string;                       // 담당자 전화번호
  company_phone?: string;               // 기업 대표번호 (신규)
  website: string;

  // 주소
  location: string;
  address: string;

  // 이미지
  logo?: string;                        // Storage URL
  company_image?: string;               // 회사 전경 이미지 (신규)
  images?: string[];                    // Storage URLs (구형 호환)

  // 담당자 정보
  manager_department: string;
  manager_name: string;
  manager_position?: string;
  manager_phone?: string;

  // 간단한 소개
  summary?: string;

  // 메타
  status: 'pending' | 'active' | 'suspended';
  profile_completed: boolean;
  additional_info_completed: boolean;
}

// =====================================================
// 대시보드 추가 정보 타입
// =====================================================

export interface CompanyAdditionalInfo {
  // 회사 상세 소개
  banner_image?: string;                // Storage URL
  description?: string;                 // 상세 소개
  slogan?: string;
  vision?: string;
  mission?: string;

  // 비즈니스 정보
  revenue?: string;
  funding?: string;

  additional_info_completed?: boolean;
}

// =====================================================
// 유효성 검증 함수
// =====================================================

/**
 * 사업자등록번호 검증 (10자리 숫자)
 */
export const validateBusinessNumber = (num: string): boolean => {
  // 하이픈 제거 후 10자리 숫자인지 확인
  const cleaned = num.replace(/-/g, '');
  return /^\d{10}$/.test(cleaned);
};

/**
 * 전화번호 검증 (하이픈 없이 7~11자리)
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/-/g, '');
  return /^\d{7,11}$/.test(cleaned);
};

/**
 * 홈페이지 URL 검증
 */
export const validateWebsite = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 이메일 검증
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * 비밀번호 검증 (8자 이상, 문자+숫자 포함)
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
};

/**
 * 설립년도 검증 (YYYY, 1900~현재)
 */
export const validateEstablishedYear = (year: string): boolean => {
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1900 && yearNum <= currentYear;
};

/**
 * 개업일자 검증 (YYYY-MM-DD 형식)
 */
export const validateEstablishmentDate = (date: string): boolean => {
  // YYYY-MM-DD 형식 체크
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  // 실제 날짜 유효성 체크
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  // 날짜 객체가 유효한지 + 입력한 값과 일치하는지 확인
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return false;
  }

  // 1900년 이후 ~ 현재까지만 허용
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear && dateObj <= new Date();
};

// =====================================================
// 폼 검증 헬퍼
// =====================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 회원가입 폼 전체 검증
 */
export const validateCompanySignupForm = (
  formData: Partial<CompanySignupFormData>
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Section 1: 사업자 정보
  if (!formData.registrationNumber) {
    errors.registrationNumber = '사업자등록번호를 입력해주세요';
  } else if (!validateBusinessNumber(formData.registrationNumber)) {
    errors.registrationNumber = '올바른 사업자등록번호 형식이 아닙니다 (10자리 숫자)';
  }

  // 사업자등록증 필수
  if (!formData.registrationDocument) {
    errors.registrationDocument = '사업자등록증을 업로드해주세요';
  }

  if (!formData.name) {
    errors.name = '기업명을 입력해주세요';
  }

  // establishmentYear 필드로 개업일자 검증 (YYYY-MM-DD)
  if (!formData.establishmentYear) {
    errors.establishmentYear = '개업일자를 입력해주세요';
  } else if (!validateEstablishmentDate(formData.establishmentYear)) {
    errors.establishmentYear = '올바른 개업일자를 입력해주세요 (YYYY-MM-DD)';
  }

  if (!formData.ceoName) {
    errors.ceoName = '대표자명을 입력해주세요';
  }

  // Section 2: 기업 기본 정보
  if (!formData.companyType) {
    errors.companyType = '기업형태를 선택해주세요';
  }

  if (!formData.companyScale) {
    errors.companyScale = '기업규모를 선택해주세요';
  }

  if (!formData.businessCondition) {
    errors.businessCondition = '업태를 선택해주세요';
  }

  if (!formData.industry) {
    errors.industry = '업종을 선택해주세요';
  }

  if (formData.industry && !formData.industryDetail) {
    errors.industryDetail = '업종 상세를 선택해주세요';
  }

  // 대표번호 검증 (선택)
  if (formData.companyPhone && !validatePhone(formData.companyPhone)) {
    errors.companyPhone = '올바른 전화번호 형식이 아닙니다 (숫자만 7~11자리)';
  }

  // 구형 phone 필드 검증 (하위 호환)
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다 (숫자만 7~11자리)';
  }

  if (formData.website && !validateWebsite(formData.website)) {
    errors.website = '올바른 URL 형식이 아닙니다 (http:// 또는 https://)';
  }

  if (formData.summary && formData.summary.length > 200) {
    errors.summary = '요약소개글은 200자 이내로 입력해주세요';
  }

  // Section 4: 복지 정보
  if (!formData.basicBenefits || formData.basicBenefits.length === 0) {
    errors.basicBenefits = '최소 1개 이상의 복지를 입력해주세요';
  }

  // Section 5: 담당자 정보
  if (!formData.managerDepartment) {
    errors.managerDepartment = '담당부서를 입력해주세요';
  }

  if (!formData.managerName) {
    errors.managerName = '담당자명을 입력해주세요';
  }

  if (!formData.managerEmail) {
    errors.managerEmail = '담당자 이메일을 입력해주세요';
  } else if (!validateEmail(formData.managerEmail)) {
    errors.managerEmail = '올바른 이메일 형식이 아닙니다';
  }

  if (!formData.managerPosition) {
    errors.managerPosition = '담당자 직급/직책을 입력해주세요';
  }

  if (!formData.managerPhone) {
    errors.managerPhone = '담당자 연락처를 입력해주세요';
  } else if (!validatePhone(formData.managerPhone)) {
    errors.managerPhone = '올바른 전화번호 형식이 아닙니다 (10-11자리)';
  }

  // Section 6: 주소 정보
  if (!formData.address) {
    errors.address = '주소를 입력해주세요';
  }

  // Section 7: 계정 정보
  // 이메일은 항상 필수 (회원가입 시 설정됨)
  if (!formData.email) {
    errors.email = '이메일을 입력해주세요';
  } else if (!validateEmail(formData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다';
  }

  // 비밀번호 검증은 소셜 로그인 사용자만 (password 필드가 있는 경우)
  // Note: 이메일 가입자는 이미 비밀번호가 설정되어 있음
  if (formData.password !== undefined && formData.password !== '') {
    if (!validatePassword(formData.password)) {
      errors.password = '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다';
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }
  }

  // Section 8: 약관 동의
  if (!formData.agreeServiceTerms) {
    errors.terms = '서비스 이용약관에 동의해주세요';
  }
  if (!formData.agreePrivacyTerms) {
    errors.terms = '개인정보 수집 및 이용에 동의해주세요';
  }
  if (!formData.agreeCompanyInfoTerms) {
    errors.terms = '기업정보 수집·이용·제공·조회에 동의해주세요';
  }
  if (!formData.agreePublicInfoTerms) {
    errors.terms = '공공기관 신용정보 제공·조회에 동의해주세요';
  }
  if (!formData.agreeAdminInfoTerms) {
    errors.terms = '행정정보 공동이용에 동의해주세요';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// =====================================================
// 폼 데이터 변환 헬퍼
// =====================================================

/**
 * 폼 데이터를 Supabase Insert 데이터로 변환
 * 파일 업로드는 별도로 처리 후 URL을 전달받음
 */
export const transformFormDataToInsertData = (
  formData: CompanySignupFormData,
  uploadedFiles?: {
    registrationDocument?: string;
    logo?: string;
    companyImage?: string;
    images?: string[];
  }
): Partial<CompanyInsertData> => {
  // 전화번호 하이픈 제거
  const cleanCompanyPhone = formData.companyPhone?.replace(/-/g, '');
  const cleanPhone = formData.phone?.replace(/-/g, '');
  const cleanManagerPhone = formData.managerPhone?.replace(/-/g, '');
  const cleanRegistrationNumber = formData.registrationNumber.replace(/-/g, '');

  // 주소 통합: address와 addressDetail을 합침
  const fullAddress = formData.addressDetail
    ? `${formData.address} ${formData.addressDetail}`.trim()
    : formData.address;

  return {
    // 사업자 정보
    registration_number: cleanRegistrationNumber,
    registration_document: uploadedFiles?.registrationDocument,
    name: formData.name,
    name_en: formData.nameEn,
    established: formData.establishmentYear || formData.established, // establishmentYear 우선 사용
    ceo_name: formData.ceoName,

    // 기업 분류
    company_type: formData.companyType as CompanyType,
    industry: formData.businessCondition as BusinessType, // businessCondition을 industry로 매핑
    employee_count: formData.companyScale || formData.employeeCount || '', // companyScale을 employee_count로 매핑

    // 연락처
    company_phone: cleanCompanyPhone, // 기업 대표번호 (신규)
    phone: cleanPhone || cleanManagerPhone || '', // phone이 없으면 manager_phone 사용
    website: formData.website || '', // 필수 필드이므로 빈 문자열 기본값

    // 주소
    location: formData.address, // 기본 주소를 location으로
    address: fullAddress, // 통합 주소를 address로

    // 이미지
    logo: uploadedFiles?.logo,
    company_image: uploadedFiles?.companyImage, // 회사 전경 이미지 (신규)
    images: uploadedFiles?.images,

    // 담당자
    manager_department: formData.managerDepartment,
    manager_name: formData.managerName,
    manager_position: formData.managerPosition,
    manager_phone: cleanManagerPhone,

    // 간단한 소개
    summary: formData.summary,

    // 메타
    status: 'pending',
    profile_completed: true,
    additional_info_completed: false
  };
};
