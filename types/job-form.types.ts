// 채용공고 생성 폼 관련 타입 정의

export type PostingTier = 'standard' | 'top' | 'premium';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';

export type LanguageLevel = 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';

export interface PostingPrice {
  price: number;
  duration: number;
  label: string;
  desc: string;
}

export interface JobFormData {
  // 기본 정보
  title: string;
  titleEn: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  deadline: string;
  
  // 급여
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  
  // 상세 정보
  description: string;
  mainTasks: string[];
  requirements: string[];
  preferredQualifications: string[];
  
  // 복지 및 태그
  benefits: string[];
  tags: string[];
  
  // 비자 및 언어
  visaSponsorship: boolean;
  koreanLevel: LanguageLevel;
  englishLevel: LanguageLevel;
  
  // 근무 조건
  probation: string;
  workHours: string;
  startDate: string;
  
  // 채용 담당자
  managerName: string;
  managerPosition: string;
  managerEmail: string;
  managerPhone: string;
  
  // 공고 노출 위치
  postingTier: PostingTier;
}

export interface CompanyData {
  id: string;
  name: string;
  nameEn: string;
  logo?: string;
  industry: string;
  location: string;
  employeeCount: string;
  email?: string;
  phone?: string;
  recruiters?: Array<{
    name: string;
    position: string;
    email: string;
    phone: string;
  }>;
}

export interface JobSubmitData {
  companyId: string;
  company: {
    id: string;
    name: string;
    nameEn: string;
    logo: string;
    industry: string;
    location: string;
    employeeCount: string;
  };
  title: string;
  titleEn: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  description: string;
  mainTasks: string[];
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  tags: string[];
  visaSponsorship: boolean;
  languageRequirements: {
    korean: LanguageLevel;
    english: LanguageLevel;
  };
  deadline: string;
  workConditions: {
    type: string;
    probation: string;
    location: string;
    workHours: string;
    salary: string;
    startDate: string;
  };
  manager: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  posting: {
    tier: PostingTier;
    price: number;
    duration: number;
    vatAmount: number;
    totalAmount: number;
  };
  payment: {
    status: string;
    requestedAt: any;
    billingContact: {
      name: string;
      phone: string;
    };
  };
  views: number;
  applicants: number;
  status: string;
  postedAt: any;
  createdAt: any;
  updatedAt: any;
}













