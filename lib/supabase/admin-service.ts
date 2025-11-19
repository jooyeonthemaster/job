// 어드민 서비스 레이어 - Supabase 기반
// Admin Service Layer for Job Management System

import { supabase } from './config';

// ==========================================
// 타입 정의
// ==========================================

export interface AdminStats {
  totalJobseekers: number;
  completedJobseekers: number;
  totalCompanies: number;
  activeCompanies: number;
  totalApplications: number;
  pendingApplications: number;
  totalJobs: number;
  activeJobs: number;
  pendingApprovalJobs: number;
}

export interface JobStats {
  total: number;
  pending_approval: number;
  active: number;
  draft: number;
  closed: number;
  pendingPayment: number;
  paid: number;
  confirmed: number;
  pendingAssignment: number;
}

export interface JobWithCompany {
  id: string;
  company_id: string;
  title: string;
  title_en: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  salary_negotiable: boolean;
  description: string;
  visa_sponsorship: boolean;
  korean_level: string;
  english_level: string;
  
  // 과금 정보
  posting_tier: string;
  posting_price: number;
  posting_duration: number;
  posting_vat_amount: number;
  posting_total_amount: number;
  
  // 결제 정보
  payment_status: string;
  payment_paid_at: string | null;
  payment_confirmed_at: string | null;
  
  // 노출 위치
  display_position: string | null;
  display_priority: number | null;
  display_assigned_at: string | null;
  
  // 메타
  deadline: string;
  status: string;
  views: number;
  applicants: number;
  posted_at: string;
  created_at: string;
  updated_at: string;
  
  // 회사 정보 (JOIN)
  companies: {
    id: string;
    name: string;
    logo: string | null;
    industry: string | null;
  } | null;
}

export interface RecentActivity {
  id: string;
  type: 'jobseeker_signup' | 'company_signup' | 'application' | 'job_posting';
  description: string;
  timestamp: string;
}

// ==========================================
// 어드민 통계 조회
// ==========================================

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // 구직자 통계
    const { count: totalJobseekers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'jobseeker');

    const { count: completedJobseekers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'jobseeker')
      .eq('onboarding_completed', true);

    // 기업 통계
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: activeCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 신청 통계
    const { count: totalApplications } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true });

    const { count: pendingApplications } = await supabase
      .from('talent_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 공고 통계
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: pendingApprovalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');

    return {
      totalJobseekers: totalJobseekers || 0,
      completedJobseekers: completedJobseekers || 0,
      totalCompanies: totalCompanies || 0,
      activeCompanies: activeCompanies || 0,
      totalApplications: totalApplications || 0,
      pendingApplications: pendingApplications || 0,
      totalJobs: totalJobs || 0,
      activeJobs: activeJobs || 0,
      pendingApprovalJobs: pendingApprovalJobs || 0,
    };
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    throw error;
  }
}

// ==========================================
// 공고 통계 조회
// ==========================================

export async function getJobStats(): Promise<JobStats> {
  try {
    const { count: total } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    const { count: pending_approval } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');

    const { count: active } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: draft } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    const { count: closed } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed');

    const { count: pendingPayment } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    const { count: paid } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    const { count: confirmed } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'confirmed');

    const { count: pendingAssignment } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .is('display_position', null)
      .eq('status', 'active');

    return {
      total: total || 0,
      pending_approval: pending_approval || 0,
      active: active || 0,
      draft: draft || 0,
      closed: closed || 0,
      pendingPayment: pendingPayment || 0,
      paid: paid || 0,
      confirmed: confirmed || 0,
      pendingAssignment: pendingAssignment || 0,
    };
  } catch (error) {
    console.error('Failed to get job stats:', error);
    throw error;
  }
}

// ==========================================
// 모든 공고 조회 (회사 정보 포함)
// ==========================================

export async function getAllJobs(): Promise<JobWithCompany[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          industry
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (jobs || []) as JobWithCompany[];
  } catch (error) {
    console.error('Failed to get all jobs:', error);
    throw error;
  }
}

// ==========================================
// 공고 상태 업데이트 (승인/반려)
// ==========================================

export async function updateJobStatus(
  jobId: string,
  status: 'active' | 'closed' | 'pending_approval',
  adminId?: string
): Promise<void> {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // 활성화 시 posted_at 업데이트
    if (status === 'active') {
      updates.posted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update job status:', error);
    throw error;
  }
}

// ==========================================
// 결제 상태 업데이트
// ==========================================

export async function updatePaymentStatus(
  jobId: string,
  paymentStatus: 'pending' | 'paid' | 'confirmed'
): Promise<void> {
  try {
    const updates: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus === 'paid') {
      updates.payment_paid_at = new Date().toISOString();
    } else if (paymentStatus === 'confirmed') {
      updates.payment_confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
}

// ==========================================
// 공고 위치 설정
// ==========================================

export async function updateJobDisplayPosition(
  jobId: string,
  displayPosition: 'top' | 'middle' | 'bottom',
  displayPriority: number,
  adminId?: string
): Promise<void> {
  try {
    const updates = {
      display_position: displayPosition,
      display_priority: displayPriority,
      display_assigned_at: new Date().toISOString(),
      display_assigned_by: adminId || 'admin',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update job display position:', error);
    throw error;
  }
}

// ==========================================
// 최근 활동 조회
// ==========================================

export async function getRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // 최근 구직자 가입
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, full_name, created_at')
      .eq('user_type', 'jobseeker')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsers) {
      recentUsers.forEach((user: any) => {
        activities.push({
          id: `user-${user.id}`,
          type: 'jobseeker_signup',
          description: `${user.full_name}님이 가입했습니다`,
          timestamp: user.created_at,
        });
      });
    }

    // 최근 기업 가입
    const { data: recentCompanies } = await supabase
      .from('companies')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentCompanies) {
      recentCompanies.forEach((company: any) => {
        activities.push({
          id: `company-${company.id}`,
          type: 'company_signup',
          description: `${company.name} 기업이 가입했습니다`,
          timestamp: company.created_at,
        });
      });
    }

    // 최근 신청
    const { data: recentApplications } = await supabase
      .from('talent_applications')
      .select('id, talent_name, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentApplications) {
      recentApplications.forEach((app: any) => {
        activities.push({
          id: `app-${app.id}`,
          type: 'application',
          description: `${app.talent_name}님이 ${app.company_name}에 지원했습니다`,
          timestamp: app.created_at,
        });
      });
    }

    // 시간순 정렬
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Failed to get recent activities:', error);
    return [];
  }
}

// ==========================================
// 승인 대기 공고 조회
// ==========================================

export async function getPendingApprovalJobs(): Promise<JobWithCompany[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          industry
        )
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (jobs || []) as JobWithCompany[];
  } catch (error) {
    console.error('Failed to get pending approval jobs:', error);
    throw error;
  }
}

















