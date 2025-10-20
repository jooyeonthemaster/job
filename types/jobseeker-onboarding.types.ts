// 개인 회원 온보딩 타입 정의 (K-Work 기반)
// 🔥 최종 수정: 2025년 10월 15일 - Supabase 스키마와 완전 동기화

export interface JobseekerOnboardingFormData {
  // 1. 회원 정보 입력 (필수)
  fullName: string;                    // 이름
  phone: string;                       // 휴대폰 번호 (한국인만)
  phoneVerified: boolean;              // 전화번호 인증 여부
  foreignerNumber: string;             // 외국인등록번호 (외국인만, 123456-1234567)
  foreignerNumberVerified: boolean;    // 외국인등록번호 인증 여부
  desiredJobCategory: string;          // 희망 근무 직군 (필수)

  // 2. 계정 정보
  email: string;                       // 이메일 (아이디 대체)
  password: string;                    // 비밀번호
  passwordConfirm: string;             // 비밀번호 확인

  // 3. 주소
  address: string;                     // 주소
  addressDetail: string;               // 상세 주소

  // 4. 개인 정보
  nationality: string;                 // 국적
  gender: 'male' | 'female' | '';      // 성별
  birthYear: string;                   // 출생연도 (YYYY)

  // 5. 비자 정보
  visaType: string[];                  // 비자 유형 (F2, F4, F5, F6 중 복수 선택 가능)

  // 6. 한국어 능력
  koreanLevel: string;                 // 한국어 능력 (TOPIK 등급)

  // 7. 어학 능력 (한국어 외)
  otherLanguages: Array<{              // 한국어 외 구사 가능 언어
    language: string;
    proficiency: string;
  }>;

  // 8. 약관 동의
  agreeAll: boolean;                   // 전체 동의
  agreeServiceTerms: boolean;          // 서비스 이용약관
  agreePrivacyTerms: boolean;          // 개인정보 수집·이용 동의
  agreeEmailReceive: boolean;          // 이메일 수신 동의 (선택)

  // 선택 항목
  headline?: string;                   // 간단 소개
  resumeFile?: File;                   // 이력서 파일
}

// 비자 유형 옵션
export const VISA_TYPES = [
  { value: 'F2', label: 'F-2 (거주)' },
  { value: 'F4', label: 'F-4 (재외동포)' },
  { value: 'F5', label: 'F-5 (영주)' },
  { value: 'F6', label: 'F-6 (결혼이민)' },
] as const;

// 한국어 능력 레벨
export const KOREAN_LEVELS = [
  { value: 'topik1', label: 'TOPIK 1급' },
  { value: 'topik2', label: 'TOPIK 2급' },
  { value: 'topik3', label: 'TOPIK 3급' },
  { value: 'topik4', label: 'TOPIK 4급' },
  { value: 'topik5', label: 'TOPIK 5급' },
  { value: 'topik6', label: 'TOPIK 6급' },
  { value: 'native', label: '모국어 수준' },
  { value: 'none', label: '해당 없음' },
] as const;

// 어학 능력 (한국어 외)
export const LANGUAGE_OPTIONS = [
  { value: 'english', label: '영어' },
  { value: 'chinese', label: '중국어' },
  { value: 'japanese', label: '일본어' },
  { value: 'spanish', label: '스페인어' },
  { value: 'french', label: '프랑스어' },
  { value: 'german', label: '독일어' },
  { value: 'russian', label: '러시아어' },
  { value: 'arabic', label: '아랍어' },
  { value: 'vietnamese', label: '베트남어' },
  { value: 'thai', label: '태국어' },
  { value: 'indonesian', label: '인도네시아어' },
  { value: 'hindi', label: '힌디어' },
  { value: 'portuguese', label: '포르투갈어' },
  { value: 'other', label: '기타' },
] as const;

// 어학 능력 숙련도
export const LANGUAGE_PROFICIENCY = [
  { value: 'native', label: '원어민' },
  { value: 'fluent', label: '유창함' },
  { value: 'business', label: '비즈니스' },
  { value: 'intermediate', label: '중급' },
  { value: 'beginner', label: '초급' },
] as const;

// 한국 국적 코드
export const KOREA_NATIONALITY_CODE = 'KR';

// 국적 리스트 (주요 국가)
export const NATIONALITIES = [
  { value: 'KR', label: '한국' },
  { value: 'CN', label: '중국' },
  { value: 'VN', label: '베트남' },
  { value: 'TH', label: '태국' },
  { value: 'ID', label: '인도네시아' },
  { value: 'PH', label: '필리핀' },
  { value: 'MM', label: '미얀마' },
  { value: 'KH', label: '캄보디아' },
  { value: 'NP', label: '네팔' },
  { value: 'IN', label: '인도' },
  { value: 'PK', label: '파키스탄' },
  { value: 'BD', label: '방글라데시' },
  { value: 'LK', label: '스리랑카' },
  { value: 'MN', label: '몽골' },
  { value: 'UZ', label: '우즈베키스탄' },
  { value: 'KZ', label: '카자흐스탄' },
  { value: 'US', label: '미국' },
  { value: 'CA', label: '캐나다' },
  { value: 'GB', label: '영국' },
  { value: 'AU', label: '호주' },
  { value: 'NZ', label: '뉴질랜드' },
  { value: 'JP', label: '일본' },
  { value: 'DE', label: '독일' },
  { value: 'FR', label: '프랑스' },
  { value: 'IT', label: '이탈리아' },
  { value: 'ES', label: '스페인' },
  { value: 'BR', label: '브라질' },
  { value: 'MX', label: '멕시코' },
  { value: 'RU', label: '러시아' },
  { value: 'OTHER', label: '기타' },
] as const;

// 유효성 검증 함수들
export const validatePhone = (phone: string): boolean => {
  // 010, 011, 016, 017, 018, 019로 시작하는 11자리 숫자 (하이픈 제외)
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

export const validateForeignerNumber = (number: string): boolean => {
  // 외국인등록번호: 123456-1234567 형식 (6자리-7자리)
  const foreignerRegex = /^\d{6}-\d{7}$/;
  return foreignerRegex.test(number);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // 8~20자, 문자+숫자 또는 문자+특수문자 조합
  if (password.length < 8 || password.length > 20) return false;

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$^*+=\-]/.test(password);
  const hasInvalidChar = /[^a-zA-Z0-9!@#$^*+=\-]/.test(password);

  if (hasInvalidChar) return false;

  return hasLetter && (hasNumber || hasSpecial);
};

export const validateBirthYear = (year: string): boolean => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1900 && yearNum <= currentYear;
};

// 폼 전체 유효성 검증
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateJobseekerOnboardingForm = (
  formData: JobseekerOnboardingFormData,
  isEmailSignup: boolean
): ValidationResult => {
  const errors: Record<string, string> = {};

  const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

  // 1. 이름 (필수)
  if (!formData.fullName.trim()) {
    errors.fullName = '이름을 입력해주세요.';
  }

  // 1-1. 희망 근무 직군 (필수)
  if (!formData.desiredJobCategory.trim()) {
    errors.desiredJobCategory = '희망 근무 직군을 입력해주세요.';
  }

  // 2. 한국인/외국인 구분 검증
  if (isKorean) {
    // 한국인: phone 필수
    if (!formData.phone) {
      errors.phone = '휴대폰 번호를 입력해주세요.';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)';
    }
  } else {
    // 외국인: 외국인등록번호 필수
    if (!formData.foreignerNumber) {
      errors.foreignerNumber = '외국인등록번호를 입력해주세요.';
    } else if (!validateForeignerNumber(formData.foreignerNumber)) {
      errors.foreignerNumber = '올바른 형식이 아닙니다. (예: 123456-1234567)';
    }
  }

  // 4. 이메일 (필수)
  if (!formData.email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!validateEmail(formData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  // 5. 비밀번호 (소셜 로그인 시에만 필수)
  // 이메일 회원가입 사용자는 이미 비밀번호가 설정되어 있으므로 검증 스킵
  if (!isEmailSignup) {
    // 소셜 로그인 사용자만 비밀번호 설정 필요
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (!validatePassword(formData.password)) {
      errors.password = '비밀번호는 8~20자로, 문자와 숫자 또는 특수문자(!, @, #, $, ^, *, +, =, -)를 포함해야 합니다.';
    }

    // 6. 비밀번호 확인
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
  }

  // 7. 주소 (필수)
  if (!formData.address) {
    errors.address = '주소를 입력해주세요.';
  }

  // 8. 국적 (필수)
  if (!formData.nationality) {
    errors.nationality = '국적을 선택해주세요.';
  }

  // 9. 성별 (필수)
  if (!formData.gender) {
    errors.gender = '성별을 선택해주세요.';
  }

  // 10. 비자 유형 (외국인만 필수, 한국인은 선택)
  if (!isKorean) {
    // 외국인은 비자 유형 필수
    if (!formData.visaType || formData.visaType.length === 0) {
      errors.visaType = '비자 유형을 최소 1개 이상 선택해주세요.';
    }
  }
  // 한국인은 비자 입력 선택사항

  // 11. 한국어 능력 (필수)
  if (!formData.koreanLevel) {
    errors.koreanLevel = '한국어 능력을 선택해주세요.';
  }

  // 12. 어학 능력 (필수, 최소 1개)
  if (!formData.otherLanguages || formData.otherLanguages.length === 0) {
    errors.otherLanguages = '한국어 외 구사 가능한 언어를 최소 1개 이상 추가해주세요.';
  } else {
    // 각 언어의 언어명과 숙련도가 모두 선택되었는지 확인
    const invalidLanguage = formData.otherLanguages.find(
      (lang) => !lang.language || !lang.proficiency
    );
    if (invalidLanguage) {
      errors.otherLanguages = '모든 언어의 언어명과 숙련도를 선택해주세요.';
    }
  }

  // 13. 서비스 이용약관 동의 (필수)
  if (!formData.agreeServiceTerms) {
    errors.terms = '서비스 이용약관에 동의해주세요.';
  }

  // 14. 개인정보 수집·이용 동의 (필수)
  if (!formData.agreePrivacyTerms) {
    errors.terms = '개인정보 수집·이용 동의는 필수입니다.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Supabase insert용 데이터 변환
export interface JobseekerInsertData {
  email: string;
  full_name: string;
  phone: string;
  phone_verified: boolean;
  foreigner_number: string;
  foreigner_number_verified: boolean;
  desired_job_category: string;
  address: string;
  address_detail: string | null;
  nationality: string;
  birth_year: number;
  gender: string;
  visa_types: string[];
  korean_level: string;
  agree_email_receive: boolean;
  headline: string | null;
  resume_file_url: string | null;
  resume_file_name: string | null;
  onboarding_completed: boolean;
}

export const transformJobseekerFormData = (
  formData: JobseekerOnboardingFormData,
  resumeFileUrl?: string
): Omit<JobseekerInsertData, 'email'> => {
  return {
    full_name: formData.fullName.trim(),
    phone: formData.phone.replace(/-/g, ''), // 하이픈 제거
    phone_verified: formData.phoneVerified,
    foreigner_number: formData.foreignerNumber,
    foreigner_number_verified: formData.foreignerNumberVerified,
    desired_job_category: formData.desiredJobCategory.trim(),
    address: formData.address,
    address_detail: formData.addressDetail || null,
    nationality: formData.nationality,
    birth_year: parseInt(formData.birthYear),
    gender: formData.gender,
    visa_types: formData.visaType,
    korean_level: formData.koreanLevel,
    agree_email_receive: formData.agreeEmailReceive,
    headline: formData.headline || null,
    resume_file_url: resumeFileUrl || null,
    resume_file_name: formData.resumeFile?.name || null,
    onboarding_completed: true,
  };
};
