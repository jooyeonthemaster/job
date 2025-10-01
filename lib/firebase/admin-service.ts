// Firebase Admin Service - 관리자 페이지 데이터 조회
import { collection, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from './config';
import { JobseekerProfile } from './jobseeker-service';
import { CompanyProfile } from './company-types';

/**
 * 어드민 대시보드 통계
 */
export interface AdminStats {
  totalJobseekers: number;
  completedJobseekers: number;
  totalCompanies: number;
  activeCompanies: number;
  totalApplications: number;
  pendingApplications: number;
}

/**
 * 전체 통계 조회
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // 구직자 통계
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalJobseekers = usersSnapshot.size;
    const completedJobseekers = usersSnapshot.docs.filter(
      doc => doc.data().onboardingCompleted === true
    ).length;

    // 기업 통계
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    const totalCompanies = companiesSnapshot.size;
    const activeCompanies = companiesSnapshot.docs.filter(
      doc => doc.data().profileCompleted === true
    ).length;

    // 채용 신청 통계
    const applicationsRef = collection(db, 'talent_applications');
    const applicationsSnapshot = await getDocs(applicationsRef);
    const totalApplications = applicationsSnapshot.size;
    const pendingApplications = applicationsSnapshot.docs.filter(
      doc => doc.data().status === 'pending'
    ).length;

    const stats = {
      totalJobseekers,
      completedJobseekers,
      totalCompanies,
      activeCompanies,
      totalApplications,
      pendingApplications
    };

    console.log('✅ Admin stats loaded:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * 모든 구직자 조회 (어드민용)
 */
export const getAllJobseekersAdmin = async (): Promise<JobseekerProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const jobseekers: JobseekerProfile[] = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userType === 'jobseeker' || data.role === 'jobseeker') {
        jobseekers.push({
          uid: doc.id,
          ...data
        } as JobseekerProfile);
      }
    });

    return jobseekers.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate; // 최신순
    });
  } catch (error) {
    console.error('Error fetching all jobseekers:', error);
    throw error;
  }
};

/**
 * 모든 기업 조회 (어드민용)
 */
export const getAllCompaniesAdmin = async (): Promise<CompanyProfile[]> => {
  try {
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    
    const companies: CompanyProfile[] = [];
    companiesSnapshot.forEach((doc) => {
      companies.push({
        uid: doc.id,
        ...doc.data()
      } as CompanyProfile);
    });

    return companies.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt.toString()).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt.toString()).getTime() : 0;
      return bDate - aDate; // 최신순
    });
  } catch (error) {
    console.error('Error fetching all companies:', error);
    throw error;
  }
};

/**
 * 최근 활동 조회
 */
export interface RecentActivity {
  id: string;
  type: 'jobseeker_signup' | 'company_signup' | 'application';
  description: string;
  timestamp: string;
}

export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const activities: RecentActivity[] = [];

    // 최근 구직자 가입
    const jobseekers = await getAllJobseekersAdmin();
    jobseekers.slice(0, 3).forEach(js => {
      if (js.createdAt) {
        activities.push({
          id: js.uid,
          type: 'jobseeker_signup',
          description: `${js.fullName || '신규 구직자'}님이 가입했습니다`,
          timestamp: js.createdAt
        });
      }
    });

    // 최근 기업 가입
    const companies = await getAllCompaniesAdmin();
    companies.slice(0, 2).forEach(company => {
      if (company.createdAt) {
        activities.push({
          id: company.uid,
          type: 'company_signup',
          description: `${company.name || '신규 기업'}이 가입했습니다`,
          timestamp: company.createdAt.toString()
        });
      }
    });

    // 최근 채용 신청
    const { getAllTalentApplications } = await import('./application-service');
    const applications = await getAllTalentApplications();
    applications.slice(0, 5).forEach(app => {
      activities.push({
        id: app.id!,
        type: 'application',
        description: `${app.companyName}이(가) ${app.talentName}님에게 채용 신청했습니다`,
        timestamp: app.createdAt
      });
    });

    // 시간순 정렬
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

/**
 * 공고 관리 관련
 */
export interface JobPosting {
  id: string;
  companyId: string;
  company: {
    name: string;
    nameEn?: string;
    logo?: string;
  };
  title: string;
  titleEn?: string;
  location: string;
  department: string;
  posting: {
    tier: 'standard' | 'top' | 'premium';
    price: number;
    duration: number;
    vatAmount: number;
    totalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'confirmed';
    requestedAt: any;
    paidAt?: any;
    confirmedAt?: any;
    billingContact: {
      name: string;
      phone: string;
    };
  };
  display?: {
    position: 'top' | 'middle' | 'bottom' | null;
    priority: number;
    assignedAt?: any;
    assignedBy?: string;
  };
  manager?: {
    name: string;
    position?: string;
    email: string;
    phone?: string;
  };
  status: string;
  createdAt: any;
  deadline: string;
}

// 모든 공고 조회 (관리자용)
export const getAllJobPostings = async (): Promise<JobPosting[]> => {
  try {
    const jobsRef = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsRef);
    
    const jobs: JobPosting[] = [];
    jobsSnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      } as JobPosting);
    });

    // 최신순 정렬
    return jobs.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching all job postings:', error);
    throw error;
  }
};

// 공고 결제 상태 업데이트
export const updateJobPaymentStatus = async (
  jobId: string,
  paymentStatus: 'pending' | 'paid' | 'confirmed'
): Promise<void> => {
  try {
    const updateData: any = {
      'payment.status': paymentStatus,
      updatedAt: new Date()
    };

    if (paymentStatus === 'paid') {
      updateData['payment.paidAt'] = new Date();
    } else if (paymentStatus === 'confirmed') {
      updateData['payment.confirmedAt'] = new Date();
    }

    await updateDoc(doc(db, 'jobs', jobId), updateData);
  } catch (error) {
    console.error('Error updating job payment status:', error);
    throw error;
  }
};

// 공고 UI 위치 할당
export const assignJobDisplayPosition = async (
  jobId: string,
  position: 'top' | 'middle' | 'bottom',
  priority: number,
  adminId?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      'display.position': position,
      'display.priority': priority,
      'display.assignedAt': new Date(),
      'display.assignedBy': adminId || 'admin',
      status: 'active',
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error assigning job display position:', error);
    throw error;
  }
};

// 공고 상태별 통계
export const getJobPostingStats = async () => {
  try {
    const jobs = await getAllJobPostings();
    
    return {
      total: jobs.length,
      pendingPayment: jobs.filter(j => j.payment?.status === 'pending').length,
      paid: jobs.filter(j => j.payment?.status === 'paid').length,
      confirmed: jobs.filter(j => j.payment?.status === 'confirmed').length,
      active: jobs.filter(j => j.status === 'active').length,
      pendingAssignment: jobs.filter(j => j.payment?.status === 'confirmed' && !j.display?.position).length,
      legacy: jobs.filter(j => !j.payment).length  // 기존 공고 (과금 필드 없음)
    };
  } catch (error) {
    console.error('Error getting job posting stats:', error);
    return { total: 0, pendingPayment: 0, paid: 0, confirmed: 0, active: 0, pendingAssignment: 0, legacy: 0 };
  }
};

