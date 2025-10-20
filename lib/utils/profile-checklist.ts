// 프로필 완성도 체크리스트 생성

import type { ProfileData, ChecklistItem } from '@/types/jobseeker-dashboard.types';
import {
  Upload,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Target,
  User
} from 'lucide-react';

export const getProfileChecklist = (profileData: ProfileData | null): ChecklistItem[] => {
  if (!profileData) return [];

  return [
    {
      id: 'basic',
      title: '기본 정보',
      description: '이름, 한 줄 소개, 프로필 사진',
      icon: User,
      completed: !!(profileData?.fullName && profileData?.headline),
      link: '/profile/edit/basic'
    },
    {
      id: 'resume',
      title: '이력서',
      description: '이력서 파일 업로드',
      icon: Upload,
      completed: !!(profileData?.resumeFileUrl),
      link: '/profile/edit/resume'
    },
    {
      id: 'experience-education',
      title: '경력 및 학력',
      description: '경력 또는 학력 중 최소 1개 이상',
      icon: Briefcase,
      completed: !!(
        (profileData?.experiences && profileData.experiences.length > 0) ||
        (profileData?.educations && profileData.educations.length > 0)
      ),
      link: '/profile/edit/experience'
    },
    {
      id: 'skills',
      title: '보유 기술',
      description: '보유한 기술과 역량',
      icon: Code,
      completed: !!(profileData?.skills && profileData.skills.length > 0),
      link: '/profile/edit/skills'
    },
    {
      id: 'languages',
      title: '언어 능력',
      description: '구사 가능한 언어',
      icon: Languages,
      completed: !!(profileData?.languages && profileData.languages.length > 0),
      link: '/profile/edit/skills'
    },
    {
      id: 'preferences',
      title: '선호 조건',
      description: '희망 직무 및 근무 조건',
      icon: Target,
      completed: !!(
        profileData?.desiredPositions &&
        profileData.desiredPositions.length > 0 &&
        profileData?.preferredLocations &&
        profileData.preferredLocations.length > 0 &&
        profileData?.salaryRange?.min
      ),
      link: '/profile/edit/preferences'
    },
    {
      id: 'introduction',
      title: '자기소개',
      description: '간단한 자기소개',
      icon: User,
      completed: !!(profileData?.introduction && profileData.introduction.trim().length > 0),
      link: '/profile/edit/introduction'
    }
  ];
};

export const calculateChecklistPercentage = (checklist: ChecklistItem[]): number => {
  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  return Math.round((completedItems / totalItems) * 100);
};
