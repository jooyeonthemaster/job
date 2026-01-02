// 인재풀 등록 자격 검증 로직
// 2026-01-02 간소화: 8개 필수 → 6개 필수로 변경

import type { UserProfile } from '@/types/jobseeker-dashboard.types';

export type EligibilityIssue = {
  field: string;
  message: string;
  link?: string;
  isRequired: boolean; // 필수 여부 추가
};

export type EligibilityResult = {
  eligible: boolean;
  completionRate: number;
  issues: EligibilityIssue[];
  requiredCompleted: number;
  requiredTotal: number;
  optionalCompleted: number;
  optionalTotal: number;
};

/**
 * 인재풀 등록 자격 검증 (간소화 버전)
 *
 * ⭐ 필수 항목 (6개) - 반드시 완성해야 등록 가능:
 * 1. 연락처 (전화번호)
 * 2. 이메일
 * 3. 경력 (최소 1개)
 * 4. 보유 기술 (최소 1개)
 * 5. 자기소개
 * 6. 희망 직무 (최소 1개)
 *
 * 📋 선택 항목 (4개) - 없어도 등록 가능:
 * - 프로필 사진
 * - 헤드라인 (한 줄 소개)
 * - 언어 능력
 * - 이력서 파일
 * - 학력 (경력이 있으면 불필요)
 */
export const checkTalentPoolEligibility = (profile: UserProfile | null): EligibilityResult => {
  const issues: EligibilityIssue[] = [];

  // 필수 항목 카운터
  let requiredCompleted = 0;
  const requiredTotal = 6;

  // 선택 항목 카운터
  let optionalCompleted = 0;
  const optionalTotal = 4;

  if (!profile) {
    return {
      eligible: false,
      completionRate: 0,
      issues: [{ field: '프로필', message: '프로필 정보를 불러올 수 없습니다.', isRequired: true }],
      requiredCompleted: 0,
      requiredTotal,
      optionalCompleted: 0,
      optionalTotal
    };
  }

  // ============================================
  // ⭐ 필수 항목 (6개) - 반드시 완성 필요
  // ============================================

  // 1. 연락처 (전화번호) ⭐ 필수
  if (profile.phone && profile.phone.trim().length > 0) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '연락처',
      message: '전화번호를 입력해주세요. 기업이 연락할 수 있어야 합니다.',
      link: '/profile/edit/basic',
      isRequired: true
    });
  }

  // 2. 이메일 ⭐ 필수
  if (profile.email && profile.email.trim().length > 0) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '이메일',
      message: '이메일 주소를 입력해주세요.',
      link: '/profile/edit/basic',
      isRequired: true
    });
  }

  // 3. 경력 (최소 1개) ⭐ 필수
  const hasExperience = profile.experiences && profile.experiences.length > 0;
  if (hasExperience) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '경력 사항',
      message: '최소 1개 이상의 경력을 입력해주세요.',
      link: '/profile/edit/experience',
      isRequired: true
    });
  }

  // 4. 보유 기술 (최소 1개) ⭐ 필수
  if (profile.skills && profile.skills.length >= 1) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '보유 기술',
      message: `최소 1개 이상의 기술을 입력해주세요. (현재: ${profile.skills?.length || 0}개)`,
      link: '/profile/edit/skills',
      isRequired: true
    });
  }

  // 5. 자기소개 ⭐ 필수
  if (profile.introduction && profile.introduction.trim().length > 0) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '자기소개',
      message: '자기소개를 작성해주세요. 기업에게 자신을 어필하세요!',
      link: '/profile/edit/introduction',
      isRequired: true
    });
  }

  // 6. 희망 직무 (최소 1개) ⭐ 필수
  if (profile.desiredPositions && profile.desiredPositions.length > 0) {
    requiredCompleted++;
  } else {
    issues.push({
      field: '희망 직무',
      message: '최소 1개 이상의 희망 직무를 선택해주세요.',
      link: '/profile/edit/preferences',
      isRequired: true
    });
  }

  // ============================================
  // 📋 선택 항목 (4개) - 없어도 등록 가능
  // ============================================

  // 선택 1. 프로필 사진
  if (profile.profileImageUrl && profile.profileImageUrl.trim().length > 0) {
    optionalCompleted++;
  } else {
    issues.push({
      field: '프로필 사진',
      message: '프로필 사진을 추가하면 기업 관심도가 높아집니다.',
      link: '/profile/edit/basic-info',
      isRequired: false
    });
  }

  // 선택 2. 헤드라인 (한 줄 소개)
  if (profile.headline && profile.headline.trim().length > 0) {
    optionalCompleted++;
  } else {
    issues.push({
      field: '헤드라인',
      message: '한 줄 소개를 추가하면 검색에서 눈에 띕니다. (예: "5년차 프론트엔드 개발자")',
      link: '/profile/edit/basic-info',
      isRequired: false
    });
  }

  // 선택 3. 언어 능력
  if (profile.languages && profile.languages.length >= 1) {
    optionalCompleted++;
  } else {
    issues.push({
      field: '언어 능력',
      message: '언어 능력을 추가하면 글로벌 기업 매칭에 유리합니다.',
      link: '/profile/edit/skills',
      isRequired: false
    });
  }

  // 선택 4. 이력서 파일
  if (profile.resumeFileUrl && profile.resumeFileUrl.trim().length > 0) {
    optionalCompleted++;
  } else {
    issues.push({
      field: '이력서 파일',
      message: '이력서 파일을 업로드하면 기업이 더 자세한 정보를 확인할 수 있습니다.',
      link: '/profile/edit/resume',
      isRequired: false
    });
  }

  // 완성율 계산: 필수 항목 기준
  const completionRate = Math.round((requiredCompleted / requiredTotal) * 100);

  // 등록 가능 여부: 필수 항목 6개 모두 완성
  const eligible = requiredCompleted === requiredTotal;

  // issues 정렬: 필수 항목이 먼저, 그 다음 선택 항목
  issues.sort((a, b) => {
    if (a.isRequired && !b.isRequired) return -1;
    if (!a.isRequired && b.isRequired) return 1;
    return 0;
  });

  return {
    eligible,
    completionRate,
    issues,
    requiredCompleted,
    requiredTotal,
    optionalCompleted,
    optionalTotal
  };
};

/**
 * 필수 항목만 체크하는 간단한 함수
 */
export const getRequiredFieldsStatus = (profile: UserProfile | null) => {
  if (!profile) return { complete: false, fields: [] };

  const fields = [
    { name: '연락처', complete: !!(profile.phone && profile.phone.trim().length > 0) },
    { name: '이메일', complete: !!(profile.email && profile.email.trim().length > 0) },
    { name: '경력', complete: !!(profile.experiences && profile.experiences.length > 0) },
    { name: '보유 기술', complete: !!(profile.skills && profile.skills.length >= 1) },
    { name: '자기소개', complete: !!(profile.introduction && profile.introduction.trim().length > 0) },
    { name: '희망 직무', complete: !!(profile.desiredPositions && profile.desiredPositions.length > 0) },
  ];

  return {
    complete: fields.every(f => f.complete),
    fields
  };
};
