// 인재풀 등록 자격 검증 로직

import type { UserProfile } from '@/types/jobseeker-dashboard.types';

export type EligibilityIssue = {
  field: string;
  message: string;
  link?: string;
};

export type EligibilityResult = {
  eligible: boolean;
  completionRate: number;
  issues: EligibilityIssue[];
};

/**
 * 인재풀 등록 자격 검증
 *
 * 기업이 인재 상세 페이지에서 보는 필수 정보:
 * 1. 기본 정보 (이름, 프로필 사진, 헤드라인)
 * 2. 경력 또는 학력 (최소 하나)
 * 3. 스킬 (최소 1개)
 * 4. 언어 능력 (최소 1개)
 * 5. 자기소개
 * 6. 희망 조건 (희망 직무)
 * 7. 이력서 파일 (필수)
 */
export const checkTalentPoolEligibility = (profile: UserProfile | null): EligibilityResult => {
  const issues: EligibilityIssue[] = [];
  let completedFields = 0;
  const totalRequiredFields = 8; // 총 필수 필드 수 (이력서 추가로 7→8)

  if (!profile) {
    return {
      eligible: false,
      completionRate: 0,
      issues: [{ field: '프로필', message: '프로필 정보를 불러올 수 없습니다.' }]
    };
  }

  // 1. 기본 정보 체크 (이름은 필수이므로 항상 있음, 프로필 사진과 헤드라인 체크)
  if (profile.profileImageUrl) {
    completedFields++;
  } else {
    issues.push({
      field: '프로필 사진',
      message: '프로필 사진을 업로드해주세요.',
      link: '/profile/edit/basic-info'
    });
  }

  if (profile.headline && profile.headline.trim().length > 0) {
    completedFields++;
  } else {
    issues.push({
      field: '헤드라인',
      message: '직무 헤드라인을 입력해주세요. (예: "5년차 프론트엔드 개발자")',
      link: '/profile/edit/basic-info'
    });
  }

  // 2. 경력 또는 학력 (최소 하나)
  const hasExperience = profile.experiences && profile.experiences.length > 0;
  const hasEducation = profile.educations && profile.educations.length > 0;

  if (hasExperience || hasEducation) {
    completedFields++;
  } else {
    issues.push({
      field: '경력 및 학력',
      message: '경력 또는 학력 중 최소 1개를 입력해주세요.',
      link: '/profile/edit/experience'
    });
  }

  // 3. 스킬 (최소 1개)
  if (profile.skills && profile.skills.length >= 1) {
    completedFields++;
  } else {
    issues.push({
      field: '보유 기술',
      message: `최소 1개 이상의 기술을 입력해주세요. (현재: ${profile.skills?.length || 0}개)`,
      link: '/profile/edit/skills'
    });
  }

  // 4. 언어 능력 (최소 1개)
  if (profile.languages && profile.languages.length >= 1) {
    completedFields++;
  } else {
    issues.push({
      field: '언어 능력',
      message: '최소 1개 이상의 언어 능력을 입력해주세요.',
      link: '/profile/edit/skills'
    });
  }

  // 5. 자기소개
  if (profile.introduction && profile.introduction.trim().length > 0) {
    completedFields++;
  } else {
    issues.push({
      field: '자기소개',
      message: `자기소개를 1자 이상 작성해주세요. (현재: ${profile.introduction?.trim().length || 0}자)`,
      link: '/profile/edit/introduction'
    });
  }

  // 6. 희망 직무
  if (profile.desiredPositions && profile.desiredPositions.length > 0) {
    completedFields++;
  } else {
    issues.push({
      field: '희망 직무',
      message: '최소 1개 이상의 희망 직무를 선택해주세요.',
      link: '/profile/edit/preferences'
    });
  }

  // 7. 이력서 파일 (필수)
  if (profile.resumeFileUrl && profile.resumeFileUrl.trim().length > 0) {
    completedFields++;
  } else {
    issues.push({
      field: '이력서',
      message: '이력서 파일을 업로드해주세요.',
      link: '/profile/edit/resume'
    });
  }

  const completionRate = Math.round((completedFields / totalRequiredFields) * 100);
  const eligible = completionRate === 100;

  return {
    eligible,
    completionRate,
    issues
  };
};
