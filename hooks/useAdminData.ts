// 관리자 데이터 관리 훅

import { useState, useEffect, useCallback } from 'react';
import { 
  getAdminStats,
  getAllJobseekersAdmin,
  getAllCompaniesAdmin,
  getRecentActivities,
  getAllJobPostings,
  getJobPostingStats,
  type RecentActivity,
  type JobPosting
} from '@/lib/firebase/admin-service';
import { 
  getAllTalentApplications,
  getAllJobApplications,
  getApplicationStats,
  getJobApplicationStats,
  updateApplicationStatus,
  updateJobApplicationStatus,
  type TalentApplication,
  type JobApplication
} from '@/lib/firebase/application-service';
import { JobseekerProfile } from '@/lib/firebase/jobseeker-service';
import { CompanyProfile } from '@/lib/firebase/company-types';
import { AdminStats, ApplicationStats, JobStats } from '@/types/admin.types';

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalJobseekers: 0,
    completedJobseekers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const adminStats = await getAdminStats();
        setStats(adminStats);
        
        const activities = await getRecentActivities(10);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  return { loading, stats, recentActivities };
}

export function useAdminApplications() {
  const [talentApplications, setTalentApplications] = useState<TalentApplication[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [applicationStats, setApplicationStats] = useState<ApplicationStats>({ 
    total: 0, pending: 0, approved: 0, rejected: 0, contacted: 0 
  });
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      // Talent Applications (기업 → 구직자 제안)
      const talentApps = await getAllTalentApplications();
      setTalentApplications(talentApps);
      
      const talentStats = await getApplicationStats();
      setApplicationStats(talentStats);

      // Job Applications (구직자 → 채용공고 지원)
      const jobApps = await getAllJobApplications();
      setJobApplications(jobApps);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const handleStatusUpdate = useCallback(async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(applicationId, newStatus as any);
      await loadApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }, [loadApplications]);

  const handleJobApplicationStatusUpdate = useCallback(async (
    applicationId: string, 
    newStatus: JobApplication['status']
  ) => {
    try {
      await updateJobApplicationStatus(applicationId, newStatus);
      await loadApplications();
    } catch (error) {
      console.error('Failed to update job application status:', error);
      throw error;
    }
  }, [loadApplications]);

  return {
    talentApplications,
    jobApplications,
    applicationStats,
    applicationsLoading,
    loadApplications,
    handleStatusUpdate,
    handleJobApplicationStatusUpdate
  };
}

export function useAdminJobseekers() {
  const [jobseekers, setJobseekers] = useState<JobseekerProfile[]>([]);
  const [jobseekersLoading, setJobseekersLoading] = useState(false);

  const loadJobseekers = useCallback(async () => {
    setJobseekersLoading(true);
    try {
      const data = await getAllJobseekersAdmin();
      setJobseekers(data);
    } catch (error) {
      console.error('Failed to load jobseekers:', error);
    } finally {
      setJobseekersLoading(false);
    }
  }, []);

  return { jobseekers, jobseekersLoading, loadJobseekers };
}

export function useAdminCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const data = await getAllCompaniesAdmin();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  return { companies, companiesLoading, loadCompanies };
}

export function useAdminJobs() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobStats, setJobStats] = useState<JobStats>({ 
    total: 0, pendingPayment: 0, paid: 0, confirmed: 0, active: 0, pendingAssignment: 0, legacy: 0
  });
  const [jobsLoading, setJobsLoading] = useState(false);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const jobs = await getAllJobPostings();
      setJobPostings(jobs);
      
      const stats = await getJobPostingStats();
      setJobStats(stats);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  return { jobPostings, jobStats, jobsLoading, loadJobs };
}

