// Jobseeker Profile Service
import { db } from './config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export interface JobseekerProfile {
  uid: string;
  // Step 1: 기본 정보
  fullName: string;
  headline?: string;
  profileImageUrl?: string;
  
  // Step 2: 경력 및 학력
  experiences?: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  educations?: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    current: boolean;
  }>;
  
  // Step 3: 기술 및 언어
  skills?: string[];
  languages?: string[];
  
  // Step 4: 선호 조건
  desiredPositions?: string[];
  preferredLocations?: string[];
  salaryRange?: {
    min: string | number;
    max: string | number;
  };
  workType?: string;
  companySize?: string;
  visaSponsorship?: boolean;
  remoteWork?: string;
  introduction?: string;
  
  // 이력서
  resumeFileUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  
  // 메타 정보
  onboardingCompleted?: boolean;
  userType?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 통계 (추후 구현)
  applicationsCount?: number;
  profileViews?: number;
  savedJobs?: string[];
  messagesCount?: number;
}

/**
 * 구직자 프로필 가져오기
 * 이전 중첩 구조와 새 구조 모두 지원
 */
export const getJobseekerProfile = async (uid: string): Promise<JobseekerProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // 이전 버전 호환성: preferences 객체가 중첩되어 있는 경우
      if (data.preferences && typeof data.preferences === 'object') {
        console.log('⚠️ 이전 중첩 구조 발견 - 자동 변환 중...');
        const { preferences, ...restData } = data;
        
        return {
          uid,
          ...restData,
          ...preferences,  // preferences 안의 데이터를 바깥으로 펼침
        } as JobseekerProfile;
      }
      
      // 새 버전: 평탄화된 구조
      return { uid, ...data } as JobseekerProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching jobseeker profile:', error);
    throw error;
  }
};

/**
 * 구직자 프로필 업데이트
 */
export const updateJobseekerProfile = async (
  uid: string, 
  data: Partial<JobseekerProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    
    // preferences 중첩 구조 제거 (만약 있다면)
    const cleanData = { ...data };
    if ('preferences' in cleanData) {
      const { preferences, ...rest }: any = cleanData;
      Object.assign(cleanData, rest, preferences);
      delete cleanData.preferences;
    }
    
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Firestore updated successfully');
  } catch (error) {
    console.error('Error updating jobseeker profile:', error);
    throw error;
  }
};

/**
 * 프로필 완성도 계산
 */
export const calculateProfileCompletion = (profile: JobseekerProfile | null): number => {
  if (!profile) return 0;
  
  let completed = 0;
  const total = 10;
  
  // 기본 정보 (3점)
  if (profile.fullName) completed++;
  if (profile.headline) completed++;
  if (profile.profileImageUrl) completed++;
  
  // 경력/학력 (2점)
  if (profile.experiences && profile.experiences.length > 0) completed++;
  if (profile.educations && profile.educations.length > 0) completed++;
  
  // 스킬/언어 (2점)
  if (profile.skills && profile.skills.length > 0) completed++;
  if (profile.languages && profile.languages.length > 0) completed++;
  
  // 선호 조건 (3점)
  if (profile.desiredPositions && profile.desiredPositions.length > 0) completed++;
  if (profile.preferredLocations && profile.preferredLocations.length > 0) completed++;
  if (profile.salaryRange && profile.salaryRange.min && profile.salaryRange.max) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * 통계 업데이트 (추후 구현 예정)
 */
export const updateJobseekerStats = async (
  uid: string,
  stats: {
    applicationsCount?: number;
    profileViews?: number;
    messagesCount?: number;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, stats);
  } catch (error) {
    console.error('Error updating jobseeker stats:', error);
    throw error;
  }
};

/**
 * 모든 구직자 프로필 가져오기 (인재풀용)
 */
export const getAllJobseekers = async (): Promise<JobseekerProfile[]> => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const jobseekers: JobseekerProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // 온보딩이 완료된 구직자만 포함
      if (data.onboardingCompleted && data.userType === 'jobseeker') {
        jobseekers.push({
          uid: doc.id,
          ...data
        } as JobseekerProfile);
      }
    });
    
    console.log(`✅ Loaded ${jobseekers.length} real jobseekers from Firebase`);
    return jobseekers;
  } catch (error) {
    console.error('Error fetching all jobseekers:', error);
    throw error;
  }
};