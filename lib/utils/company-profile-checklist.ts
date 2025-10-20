// 기업 프로필 완성도 체크리스트 생성

import type { Company } from '@/types/company-dashboard.types';
import {
  Building2,
  FileText,
  MapPin,
  Image,
  Gift,
  Users
} from 'lucide-react';

export type CompanyChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  link: string;
  isRequired: boolean; // 필수 항목인지
};

/**
 * 기업 프로필 체크리스트 생성
 * 온보딩 7단계 기반
 */
export const getCompanyProfileChecklist = (company: Company | null): CompanyChecklistItem[] => {
  if (!company) return [];

  return [
    // 필수 항목 (온보딩 필수)
    {
      id: 'business',
      title: '사업자 정보',
      description: '사업자등록번호, 기업명, 대표자명 등',
      icon: Building2,
      completed: !!(
        company.registration_number &&
        company.name &&
        company.ceo_name &&
        company.established
      ),
      link: '/company-dashboard/edit/business',
      isRequired: true
    },
    {
      id: 'company-info',
      title: '기업 기본 정보',
      description: '기업 형태, 규모, 홈페이지',
      icon: FileText,
      completed: !!(
        company.company_type &&
        company.employee_count &&
        company.website
      ),
      link: '/company-dashboard/edit/company-info',
      isRequired: true
    },
    {
      id: 'location',
      title: '주소 정보',
      description: '회사 주소',
      icon: MapPin,
      completed: !!(company.location && company.address),
      link: '/company-dashboard/edit/location',
      isRequired: true
    },
    {
      id: 'benefits',
      title: '복지 정보',
      description: '제공하는 복지 (최소 1개)',
      icon: Gift,
      completed: !!(
        company.basic_benefits && 
        Array.isArray(company.basic_benefits) && 
        company.basic_benefits.length > 0
      ),
      link: '/company-dashboard/edit/basic-benefits',
      isRequired: true
    },
    {
      id: 'manager',
      title: '담당자 정보',
      description: '채용 담당 부서 및 담당자',
      icon: Users,
      completed: !!(
        company.manager_department &&
        company.manager_name
      ),
      link: '/company-dashboard/edit/manager',
      isRequired: true
    },

    // 선택 항목 (프로필 완성도 향상)
    {
      id: 'images',
      title: '로고 & 회사 이미지',
      description: '기업 로고 및 회사 전경 이미지',
      icon: Image,
      completed: !!(company.logo || company.company_image),
      link: '/company-dashboard/edit/images',
      isRequired: false
    },
    {
      id: 'name-en',
      title: '기업명 (영문)',
      description: '영문 기업명',
      icon: Building2,
      completed: !!(company.name_en),
      link: '/company-dashboard/edit/business',
      isRequired: false
    },
    {
      id: 'company-phone',
      title: '대표번호',
      description: '기업 대표 전화번호',
      icon: Users,
      completed: !!(company.company_phone),
      link: '/company-dashboard/edit/company-info',
      isRequired: false
    },
    {
      id: 'summary',
      title: '한 줄 소개',
      description: '기업 한 줄 소개 (200자)',
      icon: FileText,
      completed: !!(company.summary && company.summary.length >= 20),
      link: '/company-dashboard/edit/summary',
      isRequired: false
    }
  ];
};

/**
 * 체크리스트 완성률 계산
 */
export const calculateCompanyChecklistPercentage = (checklist: CompanyChecklistItem[]): number => {
  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  return Math.round((completedItems / totalItems) * 100);
};

/**
 * 필수 항목만 완성률 계산
 */
export const calculateRequiredItemsPercentage = (checklist: CompanyChecklistItem[]): number => {
  const requiredItems = checklist.filter(item => item.isRequired);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  return Math.round((completedRequired / requiredItems.length) * 100);
};

/**
 * 선택 항목만 완성률 계산
 */
export const calculateOptionalItemsPercentage = (checklist: CompanyChecklistItem[]): number => {
  const optionalItems = checklist.filter(item => !item.isRequired);
  const completedOptional = optionalItems.filter(item => item.completed).length;
  if (optionalItems.length === 0) return 0;
  return Math.round((completedOptional / optionalItems.length) * 100);
};

