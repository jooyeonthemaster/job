// Supabase 개인 회원 서비스 - 통합 Export 파일
// 825줄 → 5개 파일로 분리하여 재사용성과 유지보수성 향상

// =====================================================
// 타입 정의
// =====================================================
export type {
  JobseekerSignupData,
  JobseekerOnboardingData,
  ProfileUpdateData,
  ExperienceData,
  EducationData,
  LanguageData,
  SalaryRangeData
} from './jobseeker-types';

// =====================================================
// 인증 관련 (회원가입/로그인/로그아웃)
// =====================================================
export {
  signUpJobseeker,
  initializeGoogleUser,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  checkEmailDuplicate
} from './jobseeker-auth';

// =====================================================
// 온보딩 관련
// =====================================================
export {
  completeOnboarding,
  uploadResume
} from './jobseeker-onboarding';

// =====================================================
// 프로필 관련
// =====================================================
export {
  getUserProfile,
  getCurrentUser,
  updateUserProfile,
  updateSkills,
  updateLanguages,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  updateDesiredPositions,
  updatePreferredLocations,
  updateSalaryRange
} from './jobseeker-profile';

// =====================================================
// 유틸리티 함수
// =====================================================
export {
  calculateProfileCompletion,
  getUserProfileWithCompletion
} from './jobseeker-utils';
