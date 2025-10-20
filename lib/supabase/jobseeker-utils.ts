// Supabase 개인 회원 유틸리티 함수
import { getUserProfile } from './jobseeker-profile';

// =====================================================
// 프로필 완성도 계산
// =====================================================

/**
 * 프로필 완성도 계산
 * @param profile - 사용자 프로필 데이터
 * @returns 완성도 (0-100)
 */
export const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  // 각 항목별 가중치 (총 100점)
  const weights = {
    basicInfo: 20,        // 이름, 이메일, 연락처
    resume: 15,           // 이력서
    experience: 15,       // 경력
    education: 10,        // 학력
    skills: 15,           // 기술
    languages: 10,        // 언어
    preferences: 10,      // 선호 조건 (희망 직군, 포지션, 지역, 연봉)
    introduction: 5,      // 자기소개
  };

  let score = 0;

  // 1. 기본 정보 (20점)
  if (profile.full_name && profile.email && profile.phone) {
    score += weights.basicInfo;
  } else if (profile.full_name && profile.email) {
    score += weights.basicInfo * 0.6;
  }

  // 2. 이력서 (15점)
  if (profile.resume_file_url) {
    score += weights.resume;
  }

  // 3. 경력 (15점)
  if (profile.experiences && profile.experiences.length > 0) {
    score += weights.experience;
  }

  // 4. 학력 (10점)
  if (profile.educations && profile.educations.length > 0) {
    score += weights.education;
  }

  // 5. 기술 (15점)
  if (profile.skills && profile.skills.length > 0) {
    score += weights.skills;
  }

  // 6. 언어 (10점)
  if (profile.languages && profile.languages.length > 0) {
    score += weights.languages;
  }

  // 7. 선호 조건 (10점)
  let preferencesScore = 0;
  if (profile.desired_job_category) {  // ✅ 희망 직군 추가 (30%)
    preferencesScore += weights.preferences * 0.3;
  }
  if (profile.desired_positions && profile.desired_positions.length > 0) {
    preferencesScore += weights.preferences * 0.3;  // 40% → 30%
  }
  if (profile.preferred_locations && profile.preferred_locations.length > 0) {
    preferencesScore += weights.preferences * 0.2;  // 30% → 20%
  }
  if (profile.salary_range) {
    preferencesScore += weights.preferences * 0.2;  // 30% → 20%
  }
  score += preferencesScore;

  // 8. 자기소개 (5점)
  if (profile.introduction && profile.introduction.length > 50) {
    score += weights.introduction;
  } else if (profile.introduction) {
    score += weights.introduction * 0.5;
  }

  return Math.min(Math.round(score), 100);
};

/**
 * 프로필 완성도와 함께 프로필 조회
 */
export const getUserProfileWithCompletion = async (userId: string) => {
  const profile = await getUserProfile(userId);
  const completionRate = calculateProfileCompletion(profile);

  return {
    ...profile,
    profileCompletion: completionRate
  };
};
