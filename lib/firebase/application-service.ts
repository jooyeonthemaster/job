// Firebase Application Service - 채용 신청 관리
import { 
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// 채용 신청 데이터 타입
export interface TalentApplication {
  id?: string;
  talentId: string;           // 구직자 UID
  talentName: string;         // 구직자 이름
  companyName: string;        // 기업명
  position: string;           // 제안 직무
  message: string;            // 메시지
  contactEmail: string;       // 담당자 이메일
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: string;
  updatedAt?: string;
  notes?: string;             // 관리자 메모
}

/**
 * 채용 신청 제출
 */
export const submitTalentApplication = async (
  applicationData: Omit<TalentApplication, 'id'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'talent_applications'), {
      ...applicationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Talent application submitted:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

/**
 * 모든 채용 신청 조회 (어드민용)
 */
export const getAllTalentApplications = async (): Promise<TalentApplication[]> => {
  try {
    const q = query(
      collection(db, 'talent_applications'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: TalentApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        talentId: data.talentId,
        talentName: data.talentName,
        companyName: data.companyName,
        position: data.position,
        message: data.message,
        contactEmail: data.contactEmail,
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        notes: data.notes
      });
    });
    
    console.log(`✅ Loaded ${applications.length} talent applications`);
    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * 채용 신청 상태 업데이트 (어드민용)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: TalentApplication['status'],
  notes?: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'talent_applications', applicationId);
    await updateDoc(docRef, {
      status,
      notes: notes || '',
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Application ${applicationId} updated to ${status}`);
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

/**
 * 특정 인재에 대한 신청 조회
 */
export const getApplicationsByTalentId = async (
  talentId: string
): Promise<TalentApplication[]> => {
  try {
    const q = query(
      collection(db, 'talent_applications'),
      where('talentId', '==', talentId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: TalentApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString()
      } as TalentApplication);
    });
    
    return applications;
  } catch (error) {
    console.error('Error fetching applications by talent:', error);
    throw error;
  }
};

/**
 * 상태별 신청 개수 조회 (어드민 대시보드용)
 */
export const getApplicationStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  contacted: number;
}> => {
  try {
    const allApplications = await getAllTalentApplications();
    
    return {
      total: allApplications.length,
      pending: allApplications.filter(a => a.status === 'pending').length,
      approved: allApplications.filter(a => a.status === 'approved').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      contacted: allApplications.filter(a => a.status === 'contacted').length
    };
  } catch (error) {
    console.error('Error getting application stats:', error);
    throw error;
  }
};

// ==================== 채용공고 지원 (Job Applications) ====================

/**
 * 채용공고 지원 데이터 타입
 */
export interface JobApplication {
  id?: string;
  jobId: string;              // 채용공고 ID
  jobTitle: string;           // 채용공고 제목
  companyId: string;          // 기업 ID
  companyName: string;        // 기업명
  applicantId: string;        // 지원자 UID
  applicantName: string;      // 지원자 이름
  applicantEmail: string;     // 지원자 이메일
  message: string;            // 지원 메시지
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  managerName?: string;       // 담당자 이름
  managerEmail?: string;      // 담당자 이메일
  managerPhone?: string;      // 담당자 전화번호
  createdAt: string;
  updatedAt?: string;
  notes?: string;             // 관리자 메모
}

/**
 * 채용공고 지원서 제출
 */
export const submitJobApplication = async (
  applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'job_applications'), {
      ...applicationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Job application submitted:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting job application:', error);
    throw error;
  }
};

/**
 * 모든 채용공고 지원 조회 (관리자용)
 */
export const getAllJobApplications = async (): Promise<JobApplication[]> => {
  try {
    const q = query(
      collection(db, 'job_applications'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: JobApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        companyId: data.companyId,
        companyName: data.companyName,
        applicantId: data.applicantId,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        message: data.message,
        status: data.status,
        managerName: data.managerName,
        managerEmail: data.managerEmail,
        managerPhone: data.managerPhone,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        notes: data.notes
      });
    });
    
    console.log(`✅ Loaded ${applications.length} job applications`);
    return applications;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
};

/**
 * 채용공고 지원 상태 업데이트 (관리자용)
 */
export const updateJobApplicationStatus = async (
  applicationId: string,
  status: JobApplication['status'],
  notes?: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'job_applications', applicationId);
    await updateDoc(docRef, {
      status,
      notes: notes || '',
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Job application ${applicationId} updated to ${status}`);
  } catch (error) {
    console.error('Error updating job application:', error);
    throw error;
  }
};

/**
 * 특정 채용공고에 대한 지원 조회
 */
export const getApplicationsByJobId = async (
  jobId: string
): Promise<JobApplication[]> => {
  try {
    const q = query(
      collection(db, 'job_applications'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: JobApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString()
      } as JobApplication);
    });
    
    return applications;
  } catch (error) {
    console.error('Error fetching applications by job:', error);
    throw error;
  }
};

/**
 * 특정 지원자의 지원 내역 조회
 */
export const getApplicationsByApplicantId = async (
  applicantId: string
): Promise<JobApplication[]> => {
  try {
    const q = query(
      collection(db, 'job_applications'),
      where('applicantId', '==', applicantId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: JobApplication[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString()
      } as JobApplication);
    });
    
    return applications;
  } catch (error) {
    console.error('Error fetching applications by applicant:', error);
    throw error;
  }
};

/**
 * 채용공고 지원 통계 조회 (관리자용)
 */
export const getJobApplicationStats = async (): Promise<{
  total: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
}> => {
  try {
    const allApplications = await getAllJobApplications();
    
    return {
      total: allApplications.length,
      pending: allApplications.filter(a => a.status === 'pending').length,
      reviewing: allApplications.filter(a => a.status === 'reviewing').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length
    };
  } catch (error) {
    console.error('Error getting job application stats:', error);
    throw error;
  }
};


