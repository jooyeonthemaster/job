// 대시보드 메뉴 상수

import { Home, Building2, Briefcase, Users, Eye, /* ShieldCheck, */ Settings } from 'lucide-react';
import { MenuItem } from '@/types/company-dashboard.types';

/**
 * 기업 대시보드 메뉴 아이템
 */
export const DASHBOARD_MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: '대시보드', icon: Home },
  { id: 'profile', label: '기업 정보', icon: Building2 },
  { id: 'jobs', label: '채용 관리', icon: Briefcase },
  { id: 'applicants', label: '지원자 관리', icon: Users },
  { id: 'viewed-profiles', label: '열람한 프로필', icon: Eye },
  // { id: 'verification', label: '기업 인증', icon: ShieldCheck }, // 임시 숨김: 실제 제약 로직 미구현
  { id: 'settings', label: '계정 설정', icon: Settings }
];

