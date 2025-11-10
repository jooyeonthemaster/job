// 기업 정보 공개 자격 검증 로직

import type { Company } from '@/types/company-dashboard.types';

export type CompanyEligibilityIssue = {
  field: string;
  message: string;
  link?: string;
};

export type CompanyEligibilityResult = {
  eligible: boolean;
  completionRate: number;
  issues: CompanyEligibilityIssue[];
};

/**
 * 기업 정보 공개 자격 검증
 *
 * 구직자가 기업 목록/상세 페이지에서 보는 필수 정보:
 * 1. 기업 로고 (선택이지만 권장)
 * 2. 기업명 (영문) (선택이지만 권장)
 * 3. 대표번호 (선택이지만 권장)
 * 4. 한 줄 소개 (선택이지만 권장)
 * 5. 회사 전경 이미지 (선택이지만 권장)
 *
 * 온보딩 필수 항목은 이미 완료되었으므로,
 * 선택 항목 중 권장 항목만 체크합니다.
 */
export const checkCompanyPublicEligibility = (company: Company | null): CompanyEligibilityResult => {
  const issues: CompanyEligibilityIssue[] = [];
  let completedFields = 0;
  const totalRecommendedFields = 5; // 총 권장 필드 수

  if (!company) {
    return {
      eligible: false,
      completionRate: 0,
      issues: [{ field: '기업 정보', message: '기업 정보를 불러올 수 없습니다.' }]
    };
  }

  // 1. 기업 로고
  if (company.logo) {
    completedFields++;
  } else {
    issues.push({
      field: '기업 로고',
      message: '기업 로고를 업로드하면 구직자들이 기업을 쉽게 인식할 수 있습니다.',
      link: '/company-dashboard/edit/images'
    });
  }

  // 2. 기업명 (영문)
  if (company.name_en && company.name_en.trim().length > 0) {
    completedFields++;
  } else {
    issues.push({
      field: '기업명 (영문)',
      message: '영문 기업명을 입력하면 외국인 구직자들이 기업을 더 잘 이해할 수 있습니다.',
      link: '/company-dashboard/edit/business'
    });
  }

  // 3. 대표번호
  if (company.company_phone) {
    completedFields++;
  } else {
    issues.push({
      field: '대표번호',
      message: '대표번호를 입력하면 구직자들이 기업에 쉽게 연락할 수 있습니다.',
      link: '/company-dashboard/edit/company-info'
    });
  }

  // 4. 한 줄 소개 (최소 20자)
  if (company.summary && company.summary.trim().length >= 20) {
    completedFields++;
  } else {
    issues.push({
      field: '기업 한 줄 소개',
      message: `한 줄 소개를 20자 이상 작성해주세요. (현재: ${company.summary?.trim().length || 0}자)`,
      link: '/company-dashboard/edit/summary'
    });
  }

  // 5. 회사 전경 이미지
  if (company.company_image) {
    completedFields++;
  } else {
    issues.push({
      field: '회사 전경 이미지',
      message: '회사 전경 이미지를 업로드하면 구직자들이 기업 분위기를 파악할 수 있습니다.',
      link: '/company-dashboard/edit/images'
    });
  }

  const completionRate = Math.round((completedFields / totalRecommendedFields) * 100);
  
  // 60% 이상 완성 시 공개 가능 (5개 중 3개 이상)
  const eligible = completionRate >= 60;

  return {
    eligible,
    completionRate,
    issues
  };
};









