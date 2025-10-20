// 공개 공고 조회 서비스 (메인 페이지용)
// Public Job Service for Homepage

import { supabase } from './config';
import { Job as JobCardType } from '@/types';

export interface PublicJob {
  id: string;
  title: string;
  title_en: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  salary_negotiable: boolean;
  visa_sponsorship: boolean;
  korean_level: string;
  deadline: string;
  views: number;
  applicants: number;
  posting_tier: string;
  display_position: string | null;
  display_priority: number | null;
  posted_at: string;
  
  // 회사 정보
  company: {
    id: string;
    name: string;
    name_en: string | null;
    logo: string | null;
    industry: string | null;
    location: string | null;
  };
}

// ==========================================
// 활성 공고 조회 (display_position별 정렬)
// ==========================================

export async function getActiveJobs(): Promise<{
  topJobs: PublicJob[];
  middleJobs: PublicJob[];
  bottomJobs: PublicJob[];
}> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        title_en,
        department,
        location,
        employment_type,
        experience_level,
        salary_min,
        salary_max,
        salary_negotiable,
        visa_sponsorship,
        korean_level,
        deadline,
        views,
        applicants,
        posting_tier,
        display_position,
        display_priority,
        posted_at,
        companies (
          id,
          name,
          name_en,
          logo,
          industry,
          location
        )
      `)
      .eq('status', 'active')
      .not('display_position', 'is', null)
      .order('display_priority', { ascending: true })
      .order('posted_at', { ascending: false });

    if (error) throw error;

    const allJobs = (jobs || [])
      .filter((job: any) => job.companies !== null)  // 회사 정보 없는 공고 제외
      .map((job: any) => ({
        ...job,
        company: job.companies
      })) as PublicJob[];

    // display_position별로 그룹화
    const topJobs = allJobs.filter(j => j.display_position === 'top');
    const middleJobs = allJobs.filter(j => j.display_position === 'middle');
    const bottomJobs = allJobs.filter(j => j.display_position === 'bottom');

    return {
      topJobs,
      middleJobs,
      bottomJobs
    };
  } catch (error) {
    console.error('Failed to get active jobs:', error);
    return {
      topJobs: [],
      middleJobs: [],
      bottomJobs: []
    };
  }
}

// ==========================================
// 추천 공고 조회 (최신순)
// ==========================================

// ==========================================
// DB 데이터를 JobCard 형식으로 변환
// ==========================================
function transformToJobCardFormat(job: PublicJob): JobCardType {
  return {
    id: job.id,
    title: job.title,
    titleEn: job.title_en,
    companyId: job.company.id,  // ✅ 타입 호환성
    company: {
      id: job.company.id,
      name: job.company.name,
      nameEn: job.company.name_en || job.company.name,
      logo: job.company.logo || '',
      bannerImage: '', // 현재 DB에 없음
      industry: job.company.industry || 'Technology',
      location: job.company.location || job.location,
      employeeCount: '100+',
      description: '',
      rating: 0,
      reviewCount: 0,
      openPositions: 0,
      benefits: [],
      techStack: [],
      established: ''
    },
    location: job.location,
    department: job.department,
    employmentType: job.employment_type as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
    experienceLevel: job.experience_level as "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "EXECUTIVE",
    salary: {
      min: job.salary_min || 0,
      max: job.salary_max || 0,
      currency: 'KRW',
      negotiable: job.salary_negotiable
    },
    description: '',
    requirements: [],
    benefits: [],
    tags: [],
    preferredQualifications: [],  // ✅ 타입 호환성
    visaSponsorship: job.visa_sponsorship,
    languageRequirements: {
      korean: job.korean_level as "NONE" | "BASIC" | "INTERMEDIATE" | "FLUENT" | "NATIVE",
      english: 'INTERMEDIATE'
    },
    deadline: job.deadline,
    views: job.views,
    applicants: job.applicants,
    postedAt: job.posted_at
  };
}

export async function getFeaturedJobs(limit: number = 6): Promise<JobCardType[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        title_en,
        department,
        location,
        employment_type,
        experience_level,
        salary_min,
        salary_max,
        salary_negotiable,
        visa_sponsorship,
        korean_level,
        deadline,
        views,
        applicants,
        posting_tier,
        display_position,
        display_priority,
        posted_at,
        companies (
          id,
          name,
          name_en,
          logo,
          industry,
          location
        )
      `)
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 회사 정보가 없는 공고는 필터링 (조인 실패 또는 RLS 차단)
    const publicJobs = (jobs || [])
      .filter((job: any) => {
        if (!job.companies) {
          console.warn('⚠️ Job without company data (skipped):', {
            id: job.id,
            title: job.title,
            company_id: job.company_id
          });
          return false;
        }
        return true;
      })
      .map((job: any) => ({
        ...job,
        company: job.companies
      })) as PublicJob[];

    // JobCard 형식으로 변환
    return publicJobs.map(transformToJobCardFormat);
  } catch (error) {
    console.error('Failed to get featured jobs:', error);
    return [];
  }
}

// ==========================================
// 공고 조회수 증가
// ==========================================

export async function incrementJobViews(jobId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_job_views', {
      job_id: jobId
    });

    if (error) {
      // RPC 함수가 없으면 직접 업데이트
      const { data: job } = await supabase
        .from('jobs')
        .select('views')
        .eq('id', jobId)
        .single();

      if (job) {
        await supabase
          .from('jobs')
          .update({ views: (job.views || 0) + 1 })
          .eq('id', jobId);
      }
    }
  } catch (error) {
    console.error('Failed to increment views:', error);
  }
}

// ==========================================
// 프리미엄 공고 조회
// ==========================================

export async function getPremiumJobs(limit: number = 3): Promise<PublicJob[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        title_en,
        department,
        location,
        employment_type,
        experience_level,
        salary_min,
        salary_max,
        salary_negotiable,
        visa_sponsorship,
        korean_level,
        deadline,
        views,
        applicants,
        posting_tier,
        display_position,
        display_priority,
        posted_at,
        companies (
          id,
          name,
          name_en,
          logo,
          industry,
          location
        )
      `)
      .eq('status', 'active')
      .in('posting_tier', ['premium', 'top'])
      .order('display_priority', { ascending: true })
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (jobs || []).map((job: any) => ({
      ...job,
      company: job.companies
    })) as PublicJob[];
  } catch (error) {
    console.error('Failed to get premium jobs:', error);
    return [];
  }
}

