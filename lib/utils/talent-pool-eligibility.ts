// 인재풀 등록 자격 검증 로직
// 2026-01-09 통합: profile-eligibility.ts의 통합 로직 사용
//
// 📋 통합 기준:
// 1. 핵심 정보 (3가지 필수): 이메일, 전화번호, 한줄소개
// 2. 이력서 파일 OR 프로필 6개 정보 전부

import type { UserProfile } from '@/types/jobseeker-dashboard.types';
import { checkProfileEligibility, type ProfileEligibilityResult, type FieldStatus } from './profile-eligibility';

// 기존 타입 호환성 유지
export type EligibilityIssue = {
  field: string;
  message: string;
  link?: string;
  isRequired: boolean;
};

export type EligibilityResult = {
  eligible: boolean;
  completionRate: number;
  issues: EligibilityIssue[];
  requiredCompleted: number;
  requiredTotal: number;
  optionalCompleted: number;
  optionalTotal: number;
  // 새로운 필드 (통합 로직에서 추가)
  hasResume: boolean;
  coreCompleted: number;
  coreTotal: number;
  profileCompleted: number;
  profileTotal: number;
};

/**
 * 인재풀 등록 자격 검증 (통합 버전)
 * 내부적으로 checkProfileEligibility 사용
 */
export const checkTalentPoolEligibility = (profile: UserProfile | null): EligibilityResult => {
  const result = checkProfileEligibility(profile);

  // 기존 형식으로 변환 (호환성 유지)
  const issues: EligibilityIssue[] = [];

  // 핵심 정보 미완료 → 필수
  result.coreFields.forEach(field => {
    if (!field.completed) {
      issues.push({
        field: field.field,
        message: field.message,
        link: field.link,
        isRequired: true
      });
    }
  });

  // 이력서가 없는 경우 프로필 정보 미완료 → 필수
  if (!result.hasResume) {
    result.profileFields.forEach(field => {
      if (!field.completed) {
        issues.push({
          field: field.field,
          message: field.message,
          link: field.link,
          isRequired: true
        });
      }
    });
  }

  // 이력서가 있는 경우 프로필 정보는 선택 사항으로 표시
  if (result.hasResume) {
    result.profileFields.forEach(field => {
      if (!field.completed) {
        issues.push({
          field: field.field,
          message: `${field.message} (이력서가 있어 선택사항)`,
          link: field.link,
          isRequired: false
        });
      }
    });
  }

  // 필수/선택 분리 계산
  const requiredIssues = issues.filter(i => i.isRequired);
  const optionalIssues = issues.filter(i => !i.isRequired);

  // 필수 완료 수 계산
  let requiredCompleted: number;
  let requiredTotal: number;

  if (result.hasResume) {
    // 이력서 있으면 핵심 3개만 필수
    requiredCompleted = result.coreCompleted;
    requiredTotal = result.coreTotal;
  } else {
    // 이력서 없으면 핵심 3개 + 프로필 6개 = 9개 필수
    requiredCompleted = result.coreCompleted + result.profileCompleted;
    requiredTotal = result.coreTotal + result.profileTotal;
  }

  return {
    eligible: result.eligible,
    completionRate: result.completionRate,
    issues,
    requiredCompleted,
    requiredTotal,
    optionalCompleted: result.hasResume ? result.profileCompleted : 0,
    optionalTotal: result.hasResume ? result.profileTotal : 0,
    hasResume: result.hasResume,
    coreCompleted: result.coreCompleted,
    coreTotal: result.coreTotal,
    profileCompleted: result.profileCompleted,
    profileTotal: result.profileTotal
  };
};

/**
 * 필수 항목만 체크하는 간단한 함수 (호환성 유지)
 */
export const getRequiredFieldsStatus = (profile: UserProfile | null) => {
  const result = checkProfileEligibility(profile);

  const fields = [
    // 핵심 정보
    ...result.coreFields.map(f => ({ name: f.field, complete: f.completed })),
  ];

  // 이력서가 없으면 프로필 정보도 필수
  if (!result.hasResume) {
    fields.push(...result.profileFields.map(f => ({ name: f.field, complete: f.completed })));
  }

  return {
    complete: result.eligible,
    fields,
    hasResume: result.hasResume
  };
};
