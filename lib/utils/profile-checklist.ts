// 프로필 완성도 체크리스트 생성
// 2026-01-09 통합: profile-eligibility.ts의 통합 로직 사용
//
// 📋 새로운 구조:
// 1. 핵심 정보 (3가지 필수): 이메일, 전화번호, 한줄소개
// 2. 이력서 파일 OR 프로필 6개 정보
// 3. 선택 항목 (매칭률 UP): 프로필 사진, 희망 근무지, 희망 연봉, 근무 형태

import type { ProfileData, ChecklistItem } from '@/types/jobseeker-dashboard.types';
import { checkProfileEligibility } from './profile-eligibility';
import {
  Upload,
  Briefcase,
  Code,
  Languages,
  Target,
  User,
  Phone,
  Mail,
  FileText,
  GraduationCap,
  Camera,
  MapPin,
  DollarSign,
  Laptop
} from 'lucide-react';

// 확장된 체크리스트 아이템 타입
export type ExtendedChecklistItem = ChecklistItem & {
  isRequired: boolean;
  priority: number;
  category: 'core' | 'resume' | 'profile' | 'optional';
};

/**
 * 프로필 체크리스트 생성 (통합 버전)
 */
export const getProfileChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  if (!profileData) return [];

  const eligibility = checkProfileEligibility(profileData);

  const items: ExtendedChecklistItem[] = [
    // 🔵 핵심 정보 (priority 1-3) - 항상 필수
    {
      id: 'email',
      title: '이메일',
      description: '이메일 주소 입력',
      icon: Mail,
      completed: eligibility.coreFields.find(f => f.fieldKey === 'email')?.completed ?? false,
      link: '/profile/edit/basic',
      isRequired: true,
      priority: 1,
      category: 'core'
    },
    {
      id: 'phone',
      title: '전화번호',
      description: '연락 가능한 전화번호',
      icon: Phone,
      completed: eligibility.coreFields.find(f => f.fieldKey === 'phone')?.completed ?? false,
      link: '/profile/edit/basic',
      isRequired: true,
      priority: 2,
      category: 'core'
    },
    {
      id: 'headline',
      title: '한줄소개',
      description: '나를 표현하는 한 줄 (예: "5년차 개발자")',
      icon: User,
      completed: eligibility.coreFields.find(f => f.fieldKey === 'headline')?.completed ?? false,
      link: '/profile/edit/basic',
      isRequired: true,
      priority: 3,
      category: 'core'
    },

    // 📄 이력서 (priority 4)
    {
      id: 'resume',
      title: '이력서 파일',
      description: eligibility.hasResume ? '이력서 등록됨 ✓' : '이력서 업로드 (PDF, Word)',
      icon: Upload,
      completed: eligibility.hasResume,
      link: '/profile/edit/resume',
      isRequired: !eligibility.hasResume && eligibility.profileCompleted < eligibility.profileTotal,
      priority: 4,
      category: 'resume'
    },

    // 📋 프로필 6개 정보 (priority 5-10) - 이력서 없을 때 필수
    {
      id: 'experience',
      title: '경력사항',
      description: '최소 1개 이상의 경력',
      icon: Briefcase,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'experiences')?.completed ?? false,
      link: '/profile/edit/experience',
      isRequired: !eligibility.hasResume,
      priority: 5,
      category: 'profile'
    },
    {
      id: 'education',
      title: '학력사항',
      description: '최소 1개 이상의 학력',
      icon: GraduationCap,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'educations')?.completed ?? false,
      link: '/profile/edit/experience',
      isRequired: !eligibility.hasResume,
      priority: 6,
      category: 'profile'
    },
    {
      id: 'skills',
      title: '보유기술',
      description: '최소 1개 이상의 기술',
      icon: Code,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'skills')?.completed ?? false,
      link: '/profile/edit/skills',
      isRequired: !eligibility.hasResume,
      priority: 7,
      category: 'profile'
    },
    {
      id: 'languages',
      title: '언어능력',
      description: '최소 1개 이상의 언어',
      icon: Languages,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'languages')?.completed ?? false,
      link: '/profile/edit/skills',
      isRequired: !eligibility.hasResume,
      priority: 8,
      category: 'profile'
    },
    {
      id: 'introduction',
      title: '자기소개',
      description: '본인을 어필하는 소개글',
      icon: FileText,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'introduction')?.completed ?? false,
      link: '/profile/edit/introduction',
      isRequired: !eligibility.hasResume,
      priority: 9,
      category: 'profile'
    },
    {
      id: 'preferences',
      title: '희망직무',
      description: '최소 1개 이상 선택',
      icon: Target,
      completed: eligibility.profileFields.find(f => f.fieldKey === 'desiredPositions')?.completed ?? false,
      link: '/profile/edit/preferences',
      isRequired: !eligibility.hasResume,
      priority: 10,
      category: 'profile'
    },

    // ⭐ 선택 항목 (priority 11-14) - 매칭률 UP
    {
      id: 'profileImage',
      title: '프로필 사진',
      description: '프로필 사진 등록 시 매칭률 UP',
      icon: Camera,
      completed: !!(profileData.profileImageUrl && profileData.profileImageUrl.trim().length > 0),
      link: '/profile/edit/basic',
      isRequired: false,
      priority: 11,
      category: 'optional'
    },
    {
      id: 'preferredLocations',
      title: '희망 근무지',
      description: '선호하는 근무 지역',
      icon: MapPin,
      completed: !!(profileData.preferredLocations && profileData.preferredLocations.length > 0),
      link: '/profile/edit/preferences',
      isRequired: false,
      priority: 12,
      category: 'optional'
    },
    {
      id: 'salaryRange',
      title: '희망 연봉',
      description: '기대하는 연봉 범위',
      icon: DollarSign,
      completed: !!(profileData.salaryRange && (profileData.salaryRange.min > 0 || profileData.salaryRange.max > 0)),
      link: '/profile/edit/preferences',
      isRequired: false,
      priority: 13,
      category: 'optional'
    },
    {
      id: 'remoteWork',
      title: '근무 형태',
      description: '재택/출근 선호도',
      icon: Laptop,
      completed: !!(profileData.remoteWork && profileData.remoteWork.trim().length > 0),
      link: '/profile/edit/preferences',
      isRequired: false,
      priority: 14,
      category: 'optional'
    }
  ];

  return items.sort((a, b) => a.priority - b.priority);
};

/**
 * 핵심 정보 체크리스트만 반환
 */
export const getCoreChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  return getProfileChecklist(profileData).filter(item => item.category === 'core');
};

/**
 * 프로필 정보 체크리스트만 반환
 */
export const getProfileFieldsChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  return getProfileChecklist(profileData).filter(item => item.category === 'profile');
};

/**
 * 이력서 항목만 반환
 */
export const getResumeChecklist = (profileData: ProfileData | null): ExtendedChecklistItem | null => {
  return getProfileChecklist(profileData).find(item => item.category === 'resume') ?? null;
};

/**
 * 필수 항목만 반환 (현재 상태에 따라 동적)
 */
export const getRequiredChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  return getProfileChecklist(profileData).filter(item => item.isRequired);
};

/**
 * 선택 항목만 반환
 */
export const getOptionalChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  return getProfileChecklist(profileData).filter(item => !item.isRequired);
};

/**
 * 완성율 계산 (이력서 유무에 따라 동적)
 */
export const calculateChecklistPercentage = (profileData: ProfileData | null): number => {
  const eligibility = checkProfileEligibility(profileData);
  return eligibility.completionRate;
};

/**
 * 필수 항목 완료 여부 확인
 */
export const isRequiredComplete = (profileData: ProfileData | null): boolean => {
  const eligibility = checkProfileEligibility(profileData);
  return eligibility.eligible;
};
