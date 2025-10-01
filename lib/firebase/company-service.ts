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
    await updateDoc(doc(db, 'companies', uid), {
      techStack: data.techStack,
      benefits: data.benefits,
      updatedAt: Timestamp.now()
    });
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
