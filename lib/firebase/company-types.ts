// Company-specific types for Firebase integration
import { Timestamp } from 'firebase/firestore';

export interface CompanyRegistration {
  // 기본 정보 (회원가입 시 필수)
  uid: string; // Firebase Auth UID
  email: string;
  name: string; // 회사명 (한글)
  nameEn: string; // 회사명 (영문)
  registrationNumber: string; // 사업자등록번호
  ceoName: string; // 대표자명
  established: string; // 설립년도
  industry: string; // 산업군
  employeeCount: string; // 직원수 범위
  
  // 연락처 정보
  phone: string;
  website?: string;
  
  // 주소 정보
  location: string; // 주 사업장 위치
  address: string; // 상세 주소
  
  // 계정 정보
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'pending' | 'active' | 'suspended'; // 계정 상태
  profileCompleted: boolean;
}

export interface CompanyProfile extends CompanyRegistration {
  // 회사 소개 (온보딩에서 입력)
  logo?: string; // Storage URL
  bannerImage?: string; // Storage URL
  description: string; // 간단한 회사 소개
  slogan?: string; // 슬로건
  vision?: string; // 비전
  mission?: string; // 미션
  
  // 비즈니스 정보
  revenue?: string; // 매출
  funding?: string; // 펀딩 정보
  
  // 기술 정보
  techStack?: string[]; // 사용 기술 스택
  
  // 복지/혜택 (카테고리별로 구조화)
  benefits?: CompanyBenefits;
  
  // 통계 정보
  stats?: CompanyStats;
  
  // 평가 정보 (자동 계산)
  rating?: number;
  reviewCount?: number;
  openPositions?: number;
  
  // 추가 정보
  videoUrl?: string; // 회사 소개 영상
  galleryImages?: string[]; // 회사 이미지들
  certifications?: string[]; // 인증/수상
  
  // 채용 담당자 정보
  recruiters?: CompanyRecruiter[];
  
  // 사무실 위치 정보
  offices?: CompanyOffice[];
}

export interface CompanyBenefits {
  workEnvironment: BenefitItem[]; // 근무 환경
  growth: BenefitItem[]; // 성장 지원
  healthWelfare: BenefitItem[]; // 건강/복지
  compensation: BenefitItem[]; // 보상
  additional?: BenefitItem[]; // 기타 복지
}

export interface BenefitItem {
  title: string;
  description: string;
  icon?: string; // 아이콘 이름 또는 URL
}

export interface CompanyStats {
  currentEmployees?: number;
  lastYearEmployees?: number;
  avgSalary?: number; // 평균 연봉 (만원)
  avgTenure?: number; // 평균 근속 (년)
  femaleRatio?: number; // 여성 비율 (%)
  foreignerRatio?: number; // 외국인 비율 (%)
  growthRate?: number; // 성장률 (%)
  turnoverRate?: number; // 이직률 (%)
  recommendRate?: number; // 추천율 (%)
  interviewDifficulty?: number; // 면접 난이도 (5점 만점)
}

export interface CompanyRecruiter {
  name: string;
  position: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isPrimary: boolean; // 주 담당자 여부
}

export interface CompanyOffice {
  name: string; // 본사, 지사 등
  nameEn?: string; // 영문 명칭
  address: string;
  addressEn?: string; // 영문 주소
  detailAddress?: string; // 상세 주소
  postalCode?: string; // 우편번호
  type: 'HQ' | 'Branch' | 'Lab' | 'Factory';
  employees?: number;
  lat?: number; // 위도
  lng?: number; // 경도
  mapUrl?: string;
  isMain?: boolean; // 메인 오피스 여부
}

// 회원가입 단계별 데이터
export interface OnboardingStep1 {
  // 기본 회사 정보
  name: string;
  nameEn: string;
  registrationNumber: string;
  ceoName: string;
  established: string;
  industry: string;
  employeeCount: string;
  phone: string;
  website?: string;
}

export interface OnboardingStep2 {
  // 회사 위치 정보
  location: string;
  address: string;
  offices?: CompanyOffice[];
}

export interface OnboardingStep3 {
  // 회사 소개
  description: string;
  slogan?: string;
  vision?: string;
  mission?: string;
  logo?: string;        // Cloudinary URL
  bannerImage?: string; // Cloudinary URL
}

export interface OnboardingStep4 {
  // 기술 스택 & 복지
  techStack: string[];
  benefits: CompanyBenefits;
  // 비즈니스 정보
  revenue?: string;
  funding?: string;
  // 통계 정보
  avgSalary?: number;
  avgTenure?: number;
}

export interface OnboardingStep5 {
  // 채용 담당자 정보
  recruiters: CompanyRecruiter[];
}

// Validation helpers
export const validateBusinessNumber = (number: string): boolean => {
  // 한국 사업자등록번호 검증 (10자리)
  const regex = /^\d{3}-\d{2}-\d{5}$/;
  return regex.test(number);
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const regex = /^(\d{2,3})-(\d{3,4})-(\d{4})$/;
  return regex.test(phone);
};
