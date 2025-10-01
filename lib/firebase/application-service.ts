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


