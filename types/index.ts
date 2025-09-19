export interface Company {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  bannerImage?: string;
  industry: string;
  location: string;
  employeeCount: string;
  description: string;
  rating: number;
  reviewCount: number;
  openPositions: number;
  benefits: string[];
  techStack?: string[];
  established?: string;
}

export interface Job {
  id: string;
  companyId: string;
  company: Company;
  title: string;
  titleEn: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  salary: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  description: string;
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  deadline: string;
  postedAt: string;
  views: number;
  applicants: number;
  tags: string[];
  visaSponsorship: boolean;
  languageRequirements: {
    korean: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
    english: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
  };
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  visaStatus: string;
  profileImage?: string;
  resume?: string;
  portfolio?: string;
  experience: number;
  skills: string[];
  education: Education[];
  workExperience: WorkExperience[];
  languages: Language[];
  appliedJobs: string[];
  savedJobs: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'HIRED';
  createdAt: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Language {
  language: string;
  proficiency: 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
  appliedAt: string;
  coverLetter?: string;
  notes?: string;
}