// Job Application Types for Admin Applications Log Feature

// Application status type (matches database schema)
export type JobApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

// Status labels in Korean
export const APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  pending: '대기중',
  reviewing: '검토중',
  accepted: '합격',
  rejected: '불합격',
};

// Status colors (Tailwind classes)
export const APPLICATION_STATUS_COLORS: Record<JobApplicationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// Job application with joined details
export type JobApplicationWithDetails = {
  id: string;
  job_id: string;
  job_title: string;
  company_id: string;
  company_name: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  message: string;
  status: JobApplicationStatus;
  manager_name: string | null;
  manager_email: string | null;
  manager_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data from related tables
  jobs?: {
    id: string;
    title: string;
    location: string | null;
    employment_type: string | null;
    status: string | null;
    deadline: string | null;
  } | null;
  companies?: {
    id: string;
    name: string;
    logo: string | null;
    industry: string | null;
  } | null;
  users?: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    profile_image_url: string | null;
    nationality: string | null;
    headline: string | null;
  } | null;
};

// Stats interface for dashboard
export type ApplicationsStats = {
  total: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
  thisMonth: number;
};

// Filters interface
export type ApplicationsFilters = {
  search: string;
  status: JobApplicationStatus | 'all';
  companyId: string;
  dateFrom: string;
  dateTo: string;
};

// Default filters
export const DEFAULT_APPLICATIONS_FILTERS: ApplicationsFilters = {
  search: '',
  status: 'all',
  companyId: '',
  dateFrom: '',
  dateTo: '',
};

// Sort options
export type ApplicationsSortBy = 'date_desc' | 'date_asc' | 'applicant_name' | 'company_name';

export const APPLICATIONS_SORT_OPTIONS: { value: ApplicationsSortBy; label: string }[] = [
  { value: 'date_desc', label: '최신순' },
  { value: 'date_asc', label: '오래된순' },
  { value: 'applicant_name', label: '지원자명순' },
  { value: 'company_name', label: '기업명순' },
];

// Company option for filter dropdown
export type CompanyOption = {
  id: string;
  name: string;
};
