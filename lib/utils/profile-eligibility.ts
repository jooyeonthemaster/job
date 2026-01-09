// 통합 프로필 자격 검증 로직
// 2026-01-09 신규 생성: 채용공고 지원 + 인재풀 등록 통합 기준
//
// 📋 새로운 통합 기준:
// 1. 핵심 정보 (3가지 필수): 이메일, 전화번호, 한줄소개
// 2. 이력서 파일 OR 프로필 6개 정보 전부
//
// 이력서 대체 6가지:
// - 경력사항 (최소 1개)
// - 학력사항 (최소 1개)
// - 보유기술 (최소 1개)
// - 언어능력 (최소 1개)
// - 자기소개
// - 희망직무 (최소 1개)

import type { UserProfile } from '@/types/jobseeker-dashboard.types';

// 필드 상태 타입
export type FieldStatus = {
  field: string;
  fieldKey: string;
  completed: boolean;
  link: string;
  message: string;
};

// 통합 자격 검증 결과 타입
export type ProfileEligibilityResult = {
  eligible: boolean;
  hasResume: boolean;
  // 핵심 정보 (이메일, 전화번호, 한줄소개)
  coreFields: FieldStatus[];
  coreCompleted: number;
  coreTotal: number;
  // 프로필 6개 정보 (이력서 없을 때 필요)
  profileFields: FieldStatus[];
  profileCompleted: number;
  profileTotal: number;
  // 미완료 항목 (에러 메시지용)
  issues: FieldStatus[];
  // 완성율 (UI 표시용)
  completionRate: number;
};

/**
 * 통합 프로필 자격 검증 함수
 * 채용공고 지원 & 인재풀 등록에 동일하게 적용
 */
export const checkProfileEligibility = (profile: UserProfile | null): ProfileEligibilityResult => {
  // 프로필 없으면 모든 항목 미완료
  if (!profile) {
    return {
      eligible: false,
      hasResume: false,
      coreFields: [],
      coreCompleted: 0,
      coreTotal: 3,
      profileFields: [],
      profileCompleted: 0,
      profileTotal: 6,
      issues: [{ field: '프로필', fieldKey: 'profile', completed: false, link: '/profile/edit', message: '프로필 정보를 불러올 수 없습니다.' }],
      completionRate: 0
    };
  }

  // ============================================
  // 🔵 핵심 정보 (3가지) - 항상 필수
  // ============================================
  const coreFields: FieldStatus[] = [
    {
      field: '이메일',
      fieldKey: 'email',
      completed: !!(profile.email && profile.email.trim().length > 0),
      link: '/profile/edit/basic',
      message: '이메일 주소를 입력해주세요.'
    },
    {
      field: '전화번호',
      fieldKey: 'phone',
      completed: !!(profile.phone && profile.phone.trim().length > 0),
      link: '/profile/edit/basic',
      message: '전화번호를 입력해주세요. 기업이 연락할 수 있어야 합니다.'
    },
    {
      field: '한줄소개',
      fieldKey: 'headline',
      completed: !!(profile.headline && profile.headline.trim().length > 0),
      link: '/profile/edit/basic',
      message: '한줄소개를 입력해주세요. (예: "5년차 프론트엔드 개발자")'
    }
  ];

  const coreCompleted = coreFields.filter(f => f.completed).length;
  const coreTotal = 3;

  // ============================================
  // 📄 이력서 확인
  // ============================================
  const hasResume = !!(profile.resumeFileUrl && profile.resumeFileUrl.trim().length > 0);

  // ============================================
  // 📋 프로필 6개 정보 (이력서 없을 때 필요)
  // ============================================
  const profileFields: FieldStatus[] = [
    {
      field: '경력사항',
      fieldKey: 'experiences',
      completed: !!(profile.experiences && profile.experiences.length > 0),
      link: '/profile/edit/experience',
      message: '경력사항을 최소 1개 이상 입력해주세요.'
    },
    {
      field: '학력사항',
      fieldKey: 'educations',
      completed: !!(profile.educations && profile.educations.length > 0),
      link: '/profile/edit/experience',
      message: '학력사항을 최소 1개 이상 입력해주세요.'
    },
    {
      field: '보유기술',
      fieldKey: 'skills',
      completed: !!(profile.skills && profile.skills.length >= 1),
      link: '/profile/edit/skills',
      message: '보유 기술을 최소 1개 이상 입력해주세요.'
    },
    {
      field: '언어능력',
      fieldKey: 'languages',
      completed: !!(profile.languages && profile.languages.length >= 1),
      link: '/profile/edit/skills',
      message: '언어 능력을 최소 1개 이상 입력해주세요.'
    },
    {
      field: '자기소개',
      fieldKey: 'introduction',
      completed: !!(profile.introduction && profile.introduction.trim().length > 0),
      link: '/profile/edit/introduction',
      message: '자기소개를 작성해주세요.'
    },
    {
      field: '희망직무',
      fieldKey: 'desiredPositions',
      completed: !!(profile.desiredPositions && profile.desiredPositions.length > 0),
      link: '/profile/edit/preferences',
      message: '희망 직무를 최소 1개 이상 선택해주세요.'
    }
  ];

  const profileCompleted = profileFields.filter(f => f.completed).length;
  const profileTotal = 6;

  // ============================================
  // 🎯 자격 판정
  // ============================================
  // 핵심 3가지가 모두 완료되어야 함
  const coreAllComplete = coreCompleted === coreTotal;

  // 이력서가 있거나, 프로필 6개가 모두 완료되어야 함
  const resumeOrProfileComplete = hasResume || (profileCompleted === profileTotal);

  // 최종 자격: 핵심 3가지 + (이력서 OR 프로필 6개)
  const eligible = coreAllComplete && resumeOrProfileComplete;

  // ============================================
  // 📊 미완료 항목 수집 (issues)
  // ============================================
  const issues: FieldStatus[] = [];

  // 핵심 정보 중 미완료 항목
  coreFields.forEach(field => {
    if (!field.completed) {
      issues.push(field);
    }
  });

  // 이력서가 없고 프로필도 미완료인 경우
  if (!hasResume) {
    profileFields.forEach(field => {
      if (!field.completed) {
        issues.push(field);
      }
    });
  }

  // ============================================
  // 📈 완성율 계산
  // ============================================
  // 핵심 3개 + (이력서 있으면 100%, 없으면 프로필 6개 기준)
  let completionRate: number;
  if (hasResume) {
    // 이력서 있으면 핵심 3개만 체크
    completionRate = Math.round((coreCompleted / coreTotal) * 100);
  } else {
    // 이력서 없으면 핵심 3개 + 프로필 6개 = 총 9개
    const totalCompleted = coreCompleted + profileCompleted;
    const totalRequired = coreTotal + profileTotal;
    completionRate = Math.round((totalCompleted / totalRequired) * 100);
  }

  return {
    eligible,
    hasResume,
    coreFields,
    coreCompleted,
    coreTotal,
    profileFields,
    profileCompleted,
    profileTotal,
    issues,
    completionRate
  };
};

/**
 * 자격 미달 시 첫 번째 미완료 항목 반환 (리다이렉트용)
 */
export const getFirstIncompleteField = (result: ProfileEligibilityResult): FieldStatus | null => {
  if (result.issues.length > 0) {
    return result.issues[0];
  }
  return null;
};

/**
 * 간단한 자격 여부만 확인 (boolean)
 */
export const isProfileEligible = (profile: UserProfile | null): boolean => {
  return checkProfileEligibility(profile).eligible;
};
