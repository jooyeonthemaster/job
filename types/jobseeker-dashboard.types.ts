// 개인 회원 대시보드 타입 정의

export type ProfileData = {
  fullName: string;
  email: string;
  phone?: string | null;
  desiredJobCategory?: string | null;  // ✅ 희망 근무 직군 추가
  headline?: string | null;
  profileImageUrl?: string | null;
  resumeFileUrl?: string | null;
  resumeFileName?: string | null;
  resumeUploadedAt?: string | null;
  introduction?: string | null;
  workType?: string;
  companySize?: string | null;
  visaSponsorship?: boolean;
  remoteWork?: string | null;
  skills?: string[];
  languages?: string[];
  experiences?: Experience[];
  educations?: Education[];
  desiredPositions?: string[];
  preferredLocations?: string[];
  salaryRange?: SalaryRange | null;
  profileCompletion: number;
};

// ✅ UserProfile은 ProfileData의 alias (talent-pool-eligibility에서 사용)
export type UserProfile = ProfileData;

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string | null;
  current: boolean;
};

export type SalaryRange = {
  min: number;
  max: number;
  currency: string;
  negotiable: boolean;
};

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  link: string;
};

export type Job = {
  id: string;
  title: string;
  company: {
    name: string;
  };
  location: string;
  salary: {
    min: number;
    max: number;
  };
  employmentType: string;
  tags: string[];
};
