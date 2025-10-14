// Firebase Company Service Functions
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './config';
import { 
  CompanyRegistration, 
  CompanyProfile,
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
  OnboardingStep5
} from './company-types';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// 구글로 기업 회원가입
export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // 기존 기업 계정 확인
    const companyDoc = await getDoc(doc(db, 'companies', user.uid));
    
    if (!companyDoc.exists()) {
      // 새 기업 계정 생성 (기본 정보만)
      const newCompany: Partial<CompanyRegistration> = {
        uid: user.uid,
        email: user.email || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'pending',
        profileCompleted: false
      };
      
      await setDoc(doc(db, 'companies', user.uid), newCompany);
      return { user, isNewCompany: true };
    }
    
    return { user, isNewCompany: false };
  } catch (error) {
    console.error('Google sign up error:', error);
    throw error;
  }
};

// 기업 프로필 가져오기
export const getCompanyProfile = async (uid: string): Promise<CompanyProfile | null> => {
  try {
    const docRef = doc(db, 'companies', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as CompanyProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
};

// 온보딩 Step 1: 기본 정보 저장
export const saveOnboardingStep1 = async (uid: string, data: OnboardingStep1) => {
  try {
    await updateDoc(doc(db, 'companies', uid), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving step 1:', error);
    throw error;
  }
};

// 온보딩 Step 2: 위치 정보 저장
export const saveOnboardingStep2 = async (uid: string, data: OnboardingStep2) => {
  try {
    await updateDoc(doc(db, 'companies', uid), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving step 2:', error);
    throw error;
  }
};

// 온보딩 Step 3: 회사 소개 및 이미지 URL 저장 (Cloudinary)
export const saveOnboardingStep3 = async (uid: string, data: OnboardingStep3) => {
  try {
    const updates: any = {
      description: data.description,
      slogan: data.slogan,
      vision: data.vision,
      mission: data.mission,
      updatedAt: Timestamp.now()
    };
    
    // Cloudinary URL 직접 저장
    if (data.logo) {
      updates.logo = data.logo;
    }
    
    if (data.bannerImage) {
      updates.bannerImage = data.bannerImage;
    }
    
    await updateDoc(doc(db, 'companies', uid), updates);
  } catch (error) {
    console.error('Error saving step 3:', error);
    throw error;
  }
};

// 온보딩 Step 4: 기술 스택 & 복지 저장
export const saveOnboardingStep4 = async (uid: string, data: OnboardingStep4) => {
  try {
    const updates: any = {
      techStack: data.techStack,
      benefits: data.benefits,
      updatedAt: Timestamp.now()
    };

    // 비즈니스 정보 저장
    if (data.revenue) {
      updates.revenue = data.revenue;
    }
    if (data.funding) {
      updates.funding = data.funding;
    }

    // 통계 정보 저장 (stats 객체로)
    const statsUpdates: any = {};
    if (data.avgSalary !== undefined) {
      statsUpdates.avgSalary = data.avgSalary;
    }
    if (data.avgTenure !== undefined) {
      statsUpdates.avgTenure = data.avgTenure;
    }
    
    if (Object.keys(statsUpdates).length > 0) {
      updates.stats = statsUpdates;
    }

    await updateDoc(doc(db, 'companies', uid), updates);
  } catch (error) {
    console.error('Error saving step 4:', error);
    throw error;
  }
};

// 온보딩 Step 5: 채용 담당자 정보 저장 및 프로필 완성
export const saveOnboardingStep5 = async (uid: string, data: OnboardingStep5) => {
  try {
    await updateDoc(doc(db, 'companies', uid), {
      recruiters: data.recruiters,
      profileCompleted: true,
      status: 'active',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving step 5:', error);
    throw error;
  }
};

// 기업 프로필 업데이트
export const updateCompanyProfile = async (uid: string, updates: Partial<CompanyProfile>) => {
  try {
    await updateDoc(doc(db, 'companies', uid), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    throw error;
  }
};

// 사업자등록번호 중복 확인
export const checkBusinessNumberDuplicate = async (
  registrationNumber: string,
  excludeUid?: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'companies'),
      where('registrationNumber', '==', registrationNumber)
    );
    const querySnapshot = await getDocs(q);
    
    // 자기 자신의 uid는 중복에서 제외
    if (excludeUid) {
      const otherCompanies = querySnapshot.docs.filter(doc => doc.id !== excludeUid);
      return otherCompanies.length > 0;
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking business number:', error);
    throw error;
  }
};

// 모든 기업 목록 가져오기 (공개 프로필 완성된 기업만)
export const getAllCompanies = async () => {
  try {
    const q = query(
      collection(db, 'companies'),
      where('profileCompleted', '==', true),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const companiesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 각 기업의 채용공고 수 계산
    const companiesWithJobCount = await Promise.all(
      companiesData.map(async (company) => {
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('companyId', '==', company.id),
          where('status', '==', 'active')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        
        return {
          ...company,
          openPositions: jobsSnapshot.size
        };
      })
    );
    
    return companiesWithJobCount;
  } catch (error) {
    console.error('Error fetching all companies:', error);
    throw error;
  }
};

// 특정 기업 상세 정보 가져오기
export const getCompanyById = async (companyId: string) => {
  try {
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    throw error;
  }
};

// 특정 기업의 채용공고 목록 가져오기
export const getCompanyJobs = async (companyId: string) => {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    throw error;
  }
};

// 기업 프로필 완성도 계산
export const calculateCompanyProfileCompletion = (profile: any) => {
  if (!profile) return 0;

  const checks = {
    // 기본 정보
    hasBasicInfo: !!(profile.name && profile.nameEn && profile.industry && profile.location),
    hasContactInfo: !!(profile.phone && profile.email),
    hasRepresentative: !!(profile.ceoName || profile.representativeName),
    hasEstablished: !!profile.established,
    hasEmployeeCount: !!profile.employeeCount,
    
    // 회사 소개
    hasDescription: !!(profile.description && profile.description.length >= 50),
    hasSlogan: !!profile.slogan,
    hasVision: !!profile.vision,
    hasMission: !!profile.mission,
    
    // 이미지
    hasLogo: !!profile.logo,
    hasBanner: !!profile.bannerImage,
    
    // 기술 & 복지
    hasTechStack: !!(profile.techStack && profile.techStack.length > 0),
    hasBenefits: !!(profile.benefits && (
      Array.isArray(profile.benefits) ? profile.benefits.length > 0 :
      Object.keys(profile.benefits).length > 0
    )),
    
    // 채용 담당자
    hasRecruiters: !!(profile.recruiters && profile.recruiters.length > 0),
    
    // 추가 정보
    hasWebsite: !!profile.website,
    hasAddress: !!profile.address
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;
  
  return Math.round((completedCount / totalCount) * 100);
};

// 프로필 누락 항목 체크리스트
export const getCompanyProfileChecklist = (profile: any) => {
  if (!profile) return [];

  const checklist = [];

  if (!profile.logo || !profile.bannerImage) {
    checklist.push({
      id: 'images',
      title: '로고 & 배너 이미지 추가',
      description: `${!profile.logo ? '로고' : ''}${!profile.logo && !profile.bannerImage ? '와 ' : ''}${!profile.bannerImage ? '배너' : ''} 이미지를 업로드하세요`,
      link: '/company-dashboard/edit/images',
      completed: false
    });
  }

  if (!profile.description || profile.description.length < 50 || !profile.vision || !profile.mission || !profile.slogan) {
    checklist.push({
      id: 'introduction',
      title: '회사 소개 작성',
      description: '회사 소개, 슬로건, 비전, 미션을 작성하세요',
      link: '/company-dashboard/edit/introduction',
      completed: false
    });
  }

  if (!profile.techStack || profile.techStack.length === 0) {
    checklist.push({
      id: 'techStack',
      title: '기술 스택 추가',
      description: '사용하는 기술 스택을 입력하세요',
      link: '/company-dashboard/edit/techstack',
      completed: false
    });
  }

  if (!profile.benefits || (Array.isArray(profile.benefits) && profile.benefits.length === 0) || (typeof profile.benefits === 'object' && Object.values(profile.benefits).every((arr: any) => arr.length === 0))) {
    checklist.push({
      id: 'benefits',
      title: '복지 혜택 추가',
      description: '제공하는 복지 혜택을 입력하세요',
      link: '/company-dashboard/edit?section=benefits',
      completed: false
    });
  }

  if (!profile.recruiters || profile.recruiters.length === 0) {
    checklist.push({
      id: 'recruiters',
      title: '채용 담당자 정보 추가',
      description: '채용 담당자 정보를 입력하세요',
      link: '/company-dashboard/edit?section=recruiters',
      completed: false
    });
  }

  if (!profile.website) {
    checklist.push({
      id: 'website',
      title: '웹사이트 추가',
      description: '회사 홈페이지 주소를 입력하세요',
      link: '/company-dashboard/edit/basic',
      completed: false
    });
  }

  return checklist;
};
