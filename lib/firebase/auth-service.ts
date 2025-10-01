// Firebase Authentication Service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './config';

// User Types
export type UserType = 'company' | 'jobseeker';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: UserType | null;
}

// 구글 로그인 리디렉션을 시작하는 함수
export const signInWithGoogleRedirect = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error initiating Google sign-in redirect:", error);
    throw error;
  }
};

// 이메일 회원가입
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userType: UserType,
  additionalData?: any
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Firestore에 사용자 정보 저장
  const collection = userType === 'company' ? 'companies' : 'jobseekers';
  await setDoc(doc(db, collection, user.uid), {
    email: user.email,
    userType,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...additionalData
  });

  return user;
};

// 이메일 로그인
export const signInWithEmail = async (
  email: string, 
  password: string
) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// 사용자 타입 확인
export const getUserType = async (uid: string): Promise<UserType | null> => {
  // 기업 회원 확인
  const companyDoc = await getDoc(doc(db, 'companies', uid));
  if (companyDoc.exists()) {
    return 'company';
  }

  // 구직자 회원 확인
  const jobseekerDoc = await getDoc(doc(db, 'jobseekers', uid));
  if (jobseekerDoc.exists()) {
    return 'jobseeker';
  }

  return null;
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string, userType: UserType) => {
  const collection = userType === 'company' ? 'companies' : 'jobseekers';
  const docSnap = await getDoc(doc(db, collection, uid));
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  
  return null;
};
// 사용자 프로필 업데이트
export const updateUserProfile = async (
  uid: string, 
  userType: UserType, 
  data: any
) => {
  const collection = userType === 'company' ? 'companies' : 'jobseekers';
  await updateDoc(doc(db, collection, uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// 로그아웃
export const logout = async () => {
  await signOut(auth);
};

// 비밀번호 재설정 이메일 전송
export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// 현재 사용자 가져오기
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth 상태 변경 감지
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 사용자 초기화 (신규 가입 시)
export const initializeNewUser = async (
  user: User,
  userType: UserType,
  additionalData?: any
) => {
  const collection = userType === 'company' ? 'companies' : 'jobseekers';
  
  // Firestore에 사용자 문서 생성 (merge: true로 기존 데이터 유지)
  await setDoc(doc(db, collection, user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    userType,
    isNewUser: true,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...additionalData
  }, { merge: true });
};

// 프로필 완성도 체크
export const checkProfileCompletion = async (
  uid: string,
  userType: UserType
): Promise<boolean> => {
  const profile: any = await getUserProfile(uid, userType);
  
  if (!profile) return false;
  
  if (userType === 'company') {
    // 기업 필수 정보 체크
    return !!(
      profile.name &&
      profile.nameEn &&
      profile.industry &&
      profile.location &&
      profile.employeeCount &&
      profile.description
    );
  } else {
    // 구직자 필수 정보 체크
    return !!(
      profile.displayName &&
      profile.nationality &&
      profile.skills &&
      profile.experience
    );
  }
};

export default {
  signInWithGoogleRedirect,
  signUpWithEmail,
  signInWithEmail,
  getUserType,
  getUserProfile,
  updateUserProfile,
  logout,
  sendPasswordReset,
  getCurrentUser,
  onAuthChange,
  initializeNewUser,
  checkProfileCompletion
};