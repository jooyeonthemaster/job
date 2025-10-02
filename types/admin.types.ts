// 관리자 페이지 관련 타입 정의

export type AdminTab = 'overview' | 'talent-applications' | 'jobseekers' | 'companies' | 'job-postings';

export interface AdminStats {
  totalJobseekers: number;
  completedJobseekers: number;
  totalCompanies: number;
  activeCompanies: number;
  totalApplications: number;
  pendingApplications: number;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  contacted: number;
}

export interface JobStats {
  total: number;
  pendingPayment: number;
  paid: number;
  confirmed: number;
  active: number;
  pendingAssignment: number;
  legacy: number;
}

export interface TabConfig {
  id: AdminTab;
  label: string;
  icon: any; // Lucide Icon Component
  count?: number;
}

