// 기업 대시보드 관련 타입 정의
// Company Dashboard Types

import { LucideIcon } from 'lucide-react';

/**
 * 기업 정보 인터페이스
 * companies 테이블의 구조를 반영
 */
export interface Company {
  // 기본 정보
  id: string;
  name: string;
  name_en?: string;
  email: string;
  
  // 로고 및 이미지
  logo?: string;
  company_image?: string;
  
  // 기업 소개
  summary?: string;
  
  // 연락처 정보
  phone?: string;
  company_phone?: string;
  website?: string;
  
  // 사업자 정보
  registration_number?: string;
  registration_document?: string;
  ceo_name?: string;
  established?: string;
  
  // 기업 상세 정보
  company_type?: string;
  employee_count?: string;
  industry?: string;
  
  // 주소 정보
  address?: string;
  location?: string;
  
  // 담당자 정보
  manager_department?: string;
  manager_name?: string;
  manager_position?: string;
  manager_phone?: string;

  // 복지 정보
  basic_benefits?: any[];

  // 상태 정보
  status: 'active' | 'pending' | 'inactive';
  profile_completed?: boolean;

  // 메타데이터
  created_at?: string;
  updated_at?: string;
}

/**
 * 채용공고 인터페이스
 * jobs 테이블의 구조를 반영
 */
export interface Job {
  id: string;
  company_id: string;
  
  // 기본 정보
  title: string;
  department: string;
  location: string;
  
  // 상태 정보
  status: 'active' | 'closed' | 'pending_approval' | 'draft';
  deadline: string;
  
  // 통계 정보
  views?: number;
  applicants?: number;
  
  // 태그
  tags?: string[];
  
  // 과금 정보
  posting_tier?: string;
  payment_status?: string;
  
  // 노출 위치
  display_position?: string | null;
  display_priority?: number | null;
  
  // 메타데이터
  created_at: string;
  updated_at?: string;
  posted_at?: string;
}

/**
 * 대시보드 통계 정보
 */
export interface DashboardStats {
  totalViews: number;
  viewsChange: number;
  totalApplications: number;
  applicationsChange: number;
  activeJobs: number;
  jobsChange: number;
  avgRating: number;
  ratingChange: number;
}

/**
 * 메뉴 아이템 인터페이스
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * 탭 ID 타입
 */
export type TabId = 'overview' | 'profile' | 'jobs' | 'applicants' | 'viewed-profiles' | 'payments' | 'verification' | 'settings';

/**
 * 프로필 완성도 필드 타입
 */
export type ProfileCompletionFields = {
  logo?: string;
  name_en?: string;
  company_phone?: string;
  website?: string;
  summary?: string;
  company_image?: string;
};

/**
 * 미완성 필드 정보
 */
export interface MissingFieldInfo {
  key: keyof ProfileCompletionFields;
  label: string;
}

/**
 * 기업 인증 상태
 */
export type VerificationStatus =
  | 'not_submitted'    // 미제출
  | 'pending'          // 검토중
  | 'approved'         // 승인됨
  | 'rejected';        // 반려됨

/**
 * 기업 인증 정보
 */
export interface CompanyVerification {
  id: string;
  company_id: string;
  status: VerificationStatus;
  document_url?: string;
  document_name?: string;
  additional_doc1_url?: string;
  additional_doc1_name?: string;
  additional_doc2_url?: string;
  additional_doc2_name?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 구직자 프로필 정보 (간략)
 */
export interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  headline?: string;
  desired_position?: string;
  desired_salary?: string;
  profile_image_url?: string;
  experience_years?: number;
  education_level?: string;
  skills?: string[];
}

/**
 * 결제한 프로필 정보
 */
export interface ViewedProfile {
  id: string;
  talent_id: string;
  payment_status: string;
  payment_amount: number;
  payment_paid_at: string;
  created_at: string;
  users: TalentProfile;
}

