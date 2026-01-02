// 프로필 완성도 체크리스트 생성
// 2026-01-02 간소화: 필수 항목 6개, 선택 항목 4개로 재구성

import type { ProfileData, ChecklistItem } from '@/types/jobseeker-dashboard.types';
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
  ImageIcon
} from 'lucide-react';

// 확장된 체크리스트 아이템 타입 (필수/선택 구분)
export type ExtendedChecklistItem = ChecklistItem & {
  isRequired: boolean;
  priority: number; // 낮을수록 먼저 표시
};

/**
 * 프로필 체크리스트 생성 (필수 항목 우선)
 *
 * ⭐ 필수 항목 (6개) - 인재풀 등록 필수:
 * 1. 연락처 (전화번호)
 * 2. 이메일
 * 3. 경력 (최소 1개)
 * 4. 보유 기술 (최소 1개)
 * 5. 자기소개
 * 6. 희망 직무 (최소 1개)
 *
 * 📋 선택 항목 (3개) - 권장 사항:
 * - 기본 정보 보완 (프로필 사진 + 헤드라인)
 * - 언어 능력
 * - 이력서 파일
 */
export const getProfileChecklist = (profileData: ProfileData | null): ExtendedChecklistItem[] => {
  if (!profileData) return [];

  const items: ExtendedChecklistItem[] = [
    // ⭐ 필수 항목 (priority 1-6)
    {
      id: 'phone',
      title: '연락처',
      description: '전화번호 입력 (기업 연락용)',
      icon: Phone,
      completed: !!(profileData?.phone && profileData.phone.trim().length > 0),
      link: '/profile/edit/basic',
      isRequired: true,
      priority: 1
    },
    {
      id: 'email',
      title: '이메일',
      description: '이메일 주소 입력',
      icon: Mail,
      completed: !!(profileData?.email && profileData.email.trim().length > 0),
      link: '/profile/edit/basic',
      isRequired: true,
      priority: 2
    },
    {
      id: 'experience',
      title: '경력 사항',
      description: '최소 1개 이상의 경력',
      icon: Briefcase,
      completed: !!(profileData?.experiences && profileData.experiences.length > 0),
      link: '/profile/edit/experience',
      isRequired: true,
      priority: 3
    },
    {
      id: 'skills',
      title: '보유 기술',
      description: '최소 1개 이상의 기술',
      icon: Code,
      completed: !!(profileData?.skills && profileData.skills.length >= 1),
      link: '/profile/edit/skills',
      isRequired: true,
      priority: 4
    },
    {
      id: 'introduction',
      title: '자기소개',
      description: '본인을 어필하는 소개글',
      icon: FileText,
      completed: !!(profileData?.introduction && profileData.introduction.trim().length > 0),
      link: '/profile/edit/introduction',
      isRequired: true,
      priority: 5
    },
    {
      id: 'preferences',
      title: '희망 직무',
      description: '최소 1개 이상 선택',
      icon: Target,
      completed: !!(profileData?.desiredPositions && profileData.desiredPositions.length > 0),
      link: '/profile/edit/preferences',
      isRequired: true,
      priority: 6
    },

    // 📋 선택 항목 (priority 7-9)
    {
      id: 'basic-extra',
      title: '기본 정보 보완',
      description: '프로필 사진, 한 줄 소개 (권장)',
      icon: User,
      completed: !!(
        (profileData?.profileImageUrl && profileData.profileImageUrl.trim().length > 0) &&
        (profileData?.headline && profileData.headline.trim().length > 0)
      ),
      link: '/profile/edit/basic',
      isRequired: false,
      priority: 7
    },
    {
      id: 'languages',
      title: '언어 능력',
      description: '구사 가능한 언어 (권장)',
      icon: Languages,
      completed: !!(profileData?.languages && profileData.languages.length > 0),
      link: '/profile/edit/skills',
      isRequired: false,
      priority: 9
    },
    {
      id: 'resume',
      title: '이력서 파일',
      description: '이력서 파일 업로드 (권장)',
      icon: Upload,
      completed: !!(profileData?.resumeFileUrl),
      link: '/profile/edit/resume',
      isRequired: false,
      priority: 10
    }
  ];

  // priority 순으로 정렬 (필수 항목이 먼저)
  return items.sort((a, b) => a.priority - b.priority);
};

/**
 * 필수 항목만 반환
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
 * 전체 체크리스트 완성율 계산 (필수 + 선택)
 */
export const calculateChecklistPercentage = (checklist: ExtendedChecklistItem[]): number => {
  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  return Math.round((completedItems / totalItems) * 100);
};

/**
 * 필수 항목 완성율 계산 (인재풀 등록 기준)
 */
export const calculateRequiredPercentage = (checklist: ExtendedChecklistItem[]): number => {
  const requiredItems = checklist.filter(item => item.isRequired);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  return Math.round((completedRequired / requiredItems.length) * 100);
};

/**
 * 필수 항목 완료 여부 확인
 */
export const isRequiredComplete = (checklist: ExtendedChecklistItem[]): boolean => {
  return checklist.filter(item => item.isRequired).every(item => item.completed);
};
