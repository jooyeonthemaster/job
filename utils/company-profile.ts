// 기업 프로필 관련 유틸리티 함수

import { Company, MissingFieldInfo, ProfileCompletionFields } from '@/types/company-dashboard.types';

/**
 * 프로필 완성도를 계산합니다 (온보딩 선택 항목 기준)
 * @param company 기업 정보
 * @returns 완성도 퍼센트 (0-100)
 */
export const calculateProfileCompletion = (company: Company | null): number => {
  if (!company) return 0;

  const fields: (keyof ProfileCompletionFields)[] = [
    'logo',
    'name_en',
    'company_phone',
    'website',
    'summary',
    'company_image'
  ];

  const completedFields = fields.filter(field => {
    const value = company[field];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / fields.length) * 100);
};

/**
 * 미완성 필드 목록을 반환합니다
 * @param company 기업 정보
 * @returns 미완성 필드 정보 배열
 */
export const getMissingFields = (company: Company | null): MissingFieldInfo[] => {
  if (!company) return [];

  const fieldMap: Record<keyof ProfileCompletionFields, string> = {
    logo: '기업 로고',
    name_en: '기업명 (영문)',
    company_phone: '대표번호',
    website: '홈페이지 주소',
    summary: '기업 한 줄 소개',
    company_image: '회사 전경 이미지'
  };

  return (Object.entries(fieldMap) as [keyof ProfileCompletionFields, string][])
    .filter(([key]) => {
      const value = company[key];
      return !value || value === '';
    })
    .map(([key, label]) => ({ key, label }));
};

/**
 * 프로필이 완성되었는지 확인합니다
 * @param company 기업 정보
 * @returns 완성 여부
 */
export const isProfileCompleted = (company: Company | null): boolean => {
  return calculateProfileCompletion(company) === 100;
};

/**
 * 프로필 완성도에 따른 메시지를 반환합니다
 * @param completion 완성도 (0-100)
 * @returns 안내 메시지
 */
export const getProfileCompletionMessage = (completion: number): string => {
  if (completion === 100) {
    return '프로필이 완벽하게 완성되었습니다! 🎉';
  } else if (completion >= 80) {
    return '거의 다 왔습니다! 조금만 더 입력해주세요.';
  } else if (completion >= 50) {
    return '절반 이상 완성했습니다. 계속 진행해주세요!';
  } else if (completion > 0) {
    return '좋은 시작입니다! 더 많은 정보를 입력해보세요.';
  } else {
    return '기업 정보를 입력하여 프로필을 완성해주세요.';
  }
};

/**
 * 기업 상태에 따른 표시 텍스트를 반환합니다
 * @param status 기업 상태
 * @returns 표시 텍스트
 */
export const getCompanyStatusText = (status: Company['status']): string => {
  switch (status) {
    case 'active':
      return '활성';
    case 'pending':
      return '승인 대기중';
    case 'inactive':
      return '비활성';
    default:
      return '알 수 없음';
  }
};

/**
 * 기업 상태에 따른 색상 클래스를 반환합니다
 * @param status 기업 상태
 * @returns Tailwind CSS 클래스
 */
export const getCompanyStatusColor = (status: Company['status']): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

