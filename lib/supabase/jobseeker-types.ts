// Supabase 개인 회원 관련 타입 정의

/**
 * 개인 회원 회원가입 데이터
 */
export interface JobseekerSignupData {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * 개인 회원 온보딩 데이터
 */
export interface JobseekerOnboardingData {
  fullName: string;
  desired_job_category?: string;  // ✅ 희망 근무 직군 추가
  phone: string;                // 휴대폰 번호 (한국인만)
  headline?: string;
  resumeFileUrl?: string;
  resumeFileName?: string;
  // K-Work 확장 필드
  phone_verified?: boolean;
  foreigner_number?: string;    // 외국인등록번호 (외국인만)
  foreigner_number_verified?: boolean;
  address?: string;
  address_detail?: string;
  nationality?: string;
  birth_year?: number;
  gender?: string;
  visa_types?: string[];
  korean_level?: string;
  otherLanguages?: Array<{      // 한국어 외 언어 능력
    language: string;
    proficiency: string;
  }>;
  agree_email_receive?: boolean;
  agree_privacy_collection?: boolean;
}

/**
 * 프로필 업데이트 데이터
 */
export interface ProfileUpdateData {
  fullName?: string;
  desiredJobCategory?: string;  // ✅ 희망 직군 추가
  headline?: string;
  phone?: string;
  profileImageUrl?: string;
  workType?: string;
  companySize?: string;
  visaSponsorship?: boolean;
  remoteWork?: string;
  introduction?: string;
  korean_level?: string; // ✅ 한국어 능력 추가
}

/**
 * 경력 데이터
 */
export interface ExperienceData {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

/**
 * 학력 데이터
 */
export interface EducationData {
  school: string;
  degree: string;
  field: string;
  start_year: number;
  end_year?: number;
  is_current: boolean;
}

/**
 * 언어 데이터
 */
export interface LanguageData {
  language_name: string;
  proficiency: string;
}

/**
 * 희망 연봉 데이터
 */
export interface SalaryRangeData {
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  negotiable?: boolean;
}
