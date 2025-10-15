# 개인 회원(Jobseeker) Supabase 마이그레이션 완료 보고서

## 📋 목차
1. [마이그레이션 개요](#마이그레이션-개요)
2. [주요 변경사항](#주요-변경사항)
3. [파일별 상세 변경내용](#파일별-상세-변경내용)
4. [기술적 개선사항](#기술적-개선사항)
5. [다음 단계](#다음-단계)

---

## 마이그레이션 개요

### 배경
- **문제점**: 기업 회원은 Supabase, 개인 회원은 Firebase를 사용하는 이중 인증 시스템
- **목표**: 모든 인증을 Supabase로 통합하여 일관성 있는 시스템 구축
- **기준**: 이미 잘 구축된 기업 온보딩 Supabase 패턴을 개인 회원에도 적용

### 마이그레이션 범위
✅ **완료된 항목**
- 개인 회원가입 (이메일/비밀번호)
- 개인 로그인 (이메일/비밀번호, Google OAuth)
- 개인 온보딩 (빠른 가입)
- 통합 인증 컨텍스트 (AuthContext_Supabase)
- Supabase 개인 회원 서비스 모듈

⏳ **남은 작업**
- AuthContext 교체 및 활성화
- Firebase 의존성 제거
- 기존 Firebase 데이터 마이그레이션 (필요시)
- 전체 플로우 테스트

---

## 주요 변경사항

### 1. 인증 시스템 통합
**AS-IS (Firebase)**
```typescript
// 기업: Supabase
// 개인: Firebase (Firestore + Auth)
// → 두 개의 별도 데이터베이스, 두 개의 인증 시스템
```

**TO-BE (Supabase)**
```typescript
// 모든 회원: Supabase (PostgreSQL + Auth)
// → 단일 데이터베이스, 단일 인증 시스템
// → user_metadata.user_type으로 회원 유형 구분
```

### 2. 데이터베이스 구조 단순화
**AS-IS (Firebase)**
- `users` 컬렉션: 기본 정보
- `jobseekers` 컬렉션: 개인 회원 상세 정보 (중복)
- 복잡한 `profileCompleteness` 객체로 프로필 완성도 추적

**TO-BE (Supabase)**
- `users` 테이블: 모든 회원 기본 정보 (user_type으로 구분)
- 단일 `onboarding_completed` boolean 필드
- 정규화된 관계형 테이블 (user_skills, user_experiences 등)

### 3. 타입 안전성 개선
**AS-IS**
```typescript
// any 타입 남용
const user: any = await getDoc(doc(db, 'users', uid));

// uid vs id 혼용
firebase.auth().currentUser.uid
```

**TO-BE**
```typescript
// 명확한 TypeScript 인터페이스
interface JobseekerSignupData {
  email: string;
  password: string;
  fullName?: string;
}

// 일관된 id 사용
supabase.auth.getUser().id
```

---

## 파일별 상세 변경내용

### 1. ✨ 신규 생성: `lib/supabase/jobseeker-service.ts` (425줄)

**목적**: 개인 회원 인증 및 프로필 관리를 위한 통합 서비스 모듈

**주요 함수**

#### 회원가입
```typescript
export const signUpJobseeker = async (data: JobseekerSignupData) => {
  // 1. Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        user_type: 'jobseeker',  // 메타데이터에 user_type 저장
        full_name: data.fullName || ''
      }
    }
  });

  // 2. users 테이블에 프로필 생성
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: data.email,
      user_type: 'jobseeker',
      full_name: data.fullName || '',
      onboarding_completed: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  return { user: authData.user, profile: userData };
}
```

#### 로그인
```typescript
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?type=jobseeker`
    }
  });
  if (error) throw error;
  return data;
}
```

#### 온보딩
```typescript
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  const { data: userData, error } = await supabase
    .from('users')
    .update({
      full_name: data.fullName,
      phone: data.phone,
      headline: data.headline,
      resume_file_url: data.resumeFileUrl,
      resume_file_name: data.resumeFileName,
      resume_uploaded_at: data.resumeFileUrl ? new Date().toISOString() : null,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return userData;
}
```

#### 이력서 업로드
```typescript
export const uploadResume = async (file: File, userId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/resumes/${userId}`);
  formData.append('type', 'resume');

  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '이력서 업로드 실패');
  }

  const data = await response.json();
  return data.url;
}
```

---

### 2. 🔄 수정: `app/signup/jobseeker/page.tsx`

**변경 전 (Firebase)**
```typescript
import { signUpWithEmail } from '@/lib/firebase/auth-service';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const handleSubmit = async (e: React.FormEvent) => {
  const user = await signUpWithEmail(email, password, 'jobseeker');

  await setDoc(doc(db, 'users', user.uid), {
    email,
    userType: 'jobseeker',
    createdAt: serverTimestamp()
  });

  router.push('/onboarding/job-seeker/quick');
}
```

**변경 후 (Supabase)**
```typescript
import { signUpJobseeker } from '@/lib/supabase/jobseeker-service';

const handleSubmit = async (e: React.FormEvent) => {
  try {
    console.log('[Jobseeker Signup] 회원가입 시작:', email);

    const result = await signUpJobseeker({
      email,
      password
    });

    console.log('[Jobseeker Signup] 회원가입 성공:', result.user.id);
    router.push('/onboarding/job-seeker/quick');
  } catch (err: any) {
    // Supabase 에러 메시지 처리
    if (err?.message?.includes('already registered') || err?.code === '23505') {
      setError('이미 사용 중인 이메일입니다.');
    } else if (err?.message?.includes('Invalid email')) {
      setError('유효하지 않은 이메일 형식입니다.');
    } else {
      setError(err?.message || '회원가입 중 오류가 발생했습니다.');
    }
  }
}
```

**개선사항**
- ✅ Auth + DB 삽입이 단일 함수로 처리됨
- ✅ 더 명확한 에러 처리 (Supabase 에러 코드 활용)
- ✅ 디버깅을 위한 console.log 추가
- ✅ TypeScript 타입 안정성 향상

---

### 3. 🔄 수정: `app/login/jobseeker/page.tsx`

**변경 전 (Firebase)**
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const handleEmailLogin = async (e: React.FormEvent) => {
  // 1. Firebase Auth 로그인
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Firestore에서 사용자 타입 확인
  const jobseekerDoc = await getDoc(doc(db, 'jobseekers', user.uid));
  if (!jobseekerDoc.exists()) {
    setError('개인 회원 계정이 아닙니다.');
    await signOut(auth);
    return;
  }

  router.push('/jobseeker-dashboard');
}
```

**변경 후 (Supabase)**
```typescript
import { signInWithEmail, signOut } from '@/lib/supabase/jobseeker-service';

const handleEmailLogin = async (e: React.FormEvent) => {
  try {
    console.log('[Jobseeker Login] 로그인 시작:', email);

    // Supabase 이메일 로그인
    const result = await signInWithEmail(email, password);

    console.log('[Jobseeker Login] 로그인 성공:', result.user.id);

    // 사용자 타입 확인 (메타데이터에서)
    const userType = result.user.user_metadata?.user_type;

    if (userType === 'jobseeker') {
      router.push('/jobseeker-dashboard');
    } else {
      setError('개인 회원 계정이 아닙니다. 기업 회원은 기업 로그인을 이용해주세요.');
      await signOut();
    }
  } catch (error: any) {
    if (error?.message?.includes('Invalid login credentials')) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (error?.message?.includes('Email not confirmed')) {
      setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
    } else {
      setError(error?.message || '로그인 중 오류가 발생했습니다.');
    }
  }
}
```

**개선사항**
- ✅ 단일 쿼리로 로그인 (메타데이터에서 user_type 확인)
- ✅ Firestore 추가 조회 제거 (성능 향상)
- ✅ 더 상세한 에러 메시지
- ✅ 구글 로그인도 Supabase OAuth로 통합

---

### 4. 🔄 수정: `app/onboarding/job-seeker/quick/page.tsx`

**변경 전 (Firebase)**
```typescript
import { updateUserProfile } from '@/lib/firebase/userActions';

const handleSubmit = async (e: React.FormEvent) => {
  // 1. Cloudinary 업로드 (로컬 함수)
  let resumeFileUrl = '';
  if (formData.resumeFile) {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', formData.resumeFile);
    // ... Cloudinary 업로드 로직
  }

  // 2. Firebase 프로필 업데이트
  await updateUserProfile(user.uid, {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    headline: formData.headline,
    resumeFileUrl,
    onboardingCompleted: true,
    profileCompleteness: {
      basic: 100,
      resume: 100,
      // ... 복잡한 완성도 계산
    }
  });

  router.push('/jobseeker-dashboard');
}
```

**변경 후 (Supabase)**
```typescript
import { completeOnboarding, uploadResume } from '@/lib/supabase/jobseeker-service';

const handleSubmit = async (e: React.FormEvent) => {
  try {
    console.log('[Quick Onboarding] 시작:', user?.id);

    // 1. 이력서 파일 업로드 (서비스 모듈 사용)
    let resumeFileUrl = '';
    if (formData.resumeFile) {
      console.log('[Quick Onboarding] 이력서 업로드 시작');
      resumeFileUrl = await uploadResume(formData.resumeFile, user.id);
      console.log('[Quick Onboarding] 이력서 업로드 완료:', resumeFileUrl);
    }

    // 2. Supabase users 테이블에 온보딩 데이터 저장
    console.log('[Quick Onboarding] 프로필 저장 시작');
    const result = await completeOnboarding(user.id, {
      fullName: formData.fullName,
      phone: formData.phone,
      headline: formData.headline || '',
      resumeFileUrl,
      resumeFileName: formData.resumeFile?.name || ''
    });

    console.log('[Quick Onboarding] 프로필 저장 완료:', result);

    // 성공 시 대시보드로 이동
    router.push('/jobseeker-dashboard');
  } catch (error: any) {
    console.error('[Quick Onboarding] 에러:', error);
    alert(error.message || '프로필 생성 중 오류가 발생했습니다.');
  }
}
```

**개선사항**
- ✅ 업로드 로직을 서비스 모듈로 분리 (재사용 가능)
- ✅ 복잡한 profileCompleteness 계산 제거
- ✅ 단순한 onboarding_completed boolean 사용
- ✅ 더 명확한 에러 핸들링
- ✅ 단계별 console.log로 디버깅 용이

---

### 5. ✨ 신규 생성: `contexts/AuthContext_Supabase.tsx` (245줄)

**목적**: 기업/개인 회원을 통합 관리하는 단일 인증 컨텍스트

**주요 기능**

#### 타입 정의
```typescript
export type UserType = 'company' | 'jobseeker';

export interface AuthUser extends SupabaseUser {
  user_type?: UserType;
}

interface AuthContextType {
  user: AuthUser | null;
  userType: UserType | null;
  userProfile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}
```

#### 프로필 가져오기 (타입별 분기)
```typescript
const fetchUserProfile = async (userId: string, type: UserType) => {
  try {
    if (type === 'company') {
      // 기업 회원: companies 테이블
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } else {
      // 개인 회원: users 테이블
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('[AuthContext] 프로필 조회 실패:', error);
    return null;
  }
};
```

#### Auth 상태 변경 리스너
```typescript
useEffect(() => {
  console.log('[AuthContext] 초기화 시작');

  // 1. 초기 세션 체크
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('[AuthContext] 초기 세션 발견:', session.user.id);
      handleAuthChange(session.user);
    } else {
      console.log('[AuthContext] 초기 세션 없음');
      setIsLoading(false);
    }
  });

  // 2. Auth 상태 변경 리스너 등록
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('[AuthContext] Auth 상태 변경:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await handleAuthChange(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [router, pathname]);
```

#### Auth 변경 처리 로직
```typescript
const handleAuthChange = async (authUser: SupabaseUser) => {
  try {
    console.log('[AuthContext] 사용자 인증 확인:', authUser.id);

    // 1. 사용자 타입 확인 (메타데이터에서)
    const type = (authUser.user_metadata?.user_type || 'jobseeker') as UserType;
    console.log('[AuthContext] 사용자 타입:', type);

    setUser(authUser as AuthUser);
    setUserType(type);

    // 2. 프로필 데이터 가져오기
    const profile = await fetchUserProfile(authUser.id, type);
    console.log('[AuthContext] 프로필 조회:', profile ? '성공' : '실패');

    if (profile) {
      setUserProfile(profile);

      // 3. 온보딩 완료 여부 체크
      checkOnboardingAndRedirect(profile, type);
    } else {
      // 프로필이 없으면 온보딩으로
      if (type === 'jobseeker') {
        router.push('/onboarding/job-seeker/quick');
      } else {
        router.push('/signup/company');
      }
    }

    setIsLoading(false);
  } catch (error) {
    console.error('[AuthContext] Auth 변경 처리 에러:', error);
    setIsLoading(false);
  }
};
```

#### 온보딩 체크 및 리다이렉션
```typescript
const checkOnboardingAndRedirect = (profile: any, type: UserType) => {
  // 온보딩 관련 페이지에서는 리다이렉션하지 않음
  if (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/company-auth') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/login')
  ) {
    return;
  }

  // 개인 회원 온보딩 체크
  if (type === 'jobseeker' && !profile?.onboarding_completed) {
    console.log('[AuthContext] 개인 회원 온보딩 미완료 -> /onboarding/job-seeker/quick');
    router.push('/onboarding/job-seeker/quick');
    return;
  }

  // 기업 회원 온보딩 체크는 기존 로직 유지
};
```

**개선사항**
- ✅ 단일 Auth 리스너 (Firebase/Supabase 이중화 제거)
- ✅ 메타데이터 기반 user_type 확인 (DB 쿼리 불필요)
- ✅ 타입별 프로필 테이블 자동 선택
- ✅ 자동 온보딩 리다이렉션 로직
- ✅ 상세한 로깅으로 디버깅 용이

---

## 기술적 개선사항

### 1. 성능 개선
**AS-IS (Firebase)**
- 로그인 시 2번의 데이터베이스 쿼리 필요
  1. Auth 인증
  2. Firestore에서 사용자 타입 확인

**TO-BE (Supabase)**
- 로그인 시 1번의 쿼리로 완료
  - Auth 인증 + 메타데이터에서 user_type 확인
  - 필요시에만 프로필 테이블 조회

### 2. 데이터 일관성
**AS-IS**
- users 컬렉션과 jobseekers 컬렉션에 중복 데이터 저장
- 동기화 문제 발생 가능

**TO-BE**
- 단일 users 테이블로 모든 정보 관리
- 정규화된 관계형 구조로 데이터 무결성 보장

### 3. 타입 안전성
**AS-IS**
```typescript
const user: any = ...
const uid = user.uid  // 런타임 에러 가능
```

**TO-BE**
```typescript
interface JobseekerSignupData {
  email: string;
  password: string;
  fullName?: string;
}

const user: AuthUser = ...
const id = user.id  // 컴파일 타임 검증
```

### 4. 에러 처리
**AS-IS**
```typescript
catch (error) {
  setError('오류가 발생했습니다.');
}
```

**TO-BE**
```typescript
catch (err: any) {
  if (err?.message?.includes('already registered') || err?.code === '23505') {
    setError('이미 사용 중인 이메일입니다.');
  } else if (err?.message?.includes('Invalid email')) {
    setError('유효하지 않은 이메일 형식입니다.');
  } else {
    setError(err?.message || '회원가입 중 오류가 발생했습니다.');
  }
}
```

### 5. 코드 재사용성
**AS-IS**
- 각 페이지에서 Cloudinary 업로드 로직 중복

**TO-BE**
- 서비스 모듈로 분리하여 재사용
```typescript
// lib/supabase/jobseeker-service.ts
export const uploadResume = async (file: File, userId: string): Promise<string> => {
  // 통합된 업로드 로직
}
```

---

## 다음 단계

### 1. ⚠️ 긴급: AuthContext 교체 (필수)
**현재 상태**: 새로운 `AuthContext_Supabase.tsx`가 생성되었지만 아직 활성화되지 않음

**작업 내용**:
```typescript
// app/layout.tsx 또는 루트 Provider 파일에서

// AS-IS
import { AuthProvider } from '@/contexts/AuthContext';

// TO-BE
import { AuthProvider } from '@/contexts/AuthContext_Supabase';
```

**중요도**: 🔴 **최우선** - 이 작업이 완료되어야 Supabase 마이그레이션이 실제로 적용됨

---

### 2. 🧪 테스트 (필수)

#### 2.1 개인 회원 플로우 테스트
- [ ] 이메일 회원가입 → 온보딩 → 대시보드
- [ ] 구글 회원가입 → 온보딩 → 대시보드
- [ ] 이메일 로그인 → 대시보드
- [ ] 구글 로그인 → 대시보드
- [ ] 이력서 업로드 (PDF, DOCX)
- [ ] 이력서 파일 크기 제한 (10MB)
- [ ] 온보딩 미완료 시 자동 리다이렉션

#### 2.2 기업 회원 플로우 테스트
- [ ] 기업 회원가입 → 온보딩 → 대시보드
- [ ] 기업 로그인 → 대시보드

#### 2.3 통합 테스트
- [ ] 개인 회원으로 로그인 후 로그아웃 → 기업 회원 로그인
- [ ] 기업 회원으로 로그인 후 로그아웃 → 개인 회원 로그인
- [ ] 개인 회원이 기업 로그인 페이지 접근 시 에러 처리
- [ ] 기업 회원이 개인 로그인 페이지 접근 시 에러 처리

#### 2.4 OAuth 콜백 테스트
- [ ] `/auth/callback?type=jobseeker` 경로 동작 확인
- [ ] `/auth/callback?type=company` 경로 동작 확인
- [ ] OAuth 후 프로필 초기화 확인

---

### 3. 🗑️ Firebase 의존성 제거 (권장)

#### 3.1 파일 삭제
```bash
# Firebase 관련 파일 삭제
rm -rf lib/firebase/
```

삭제 대상 파일:
- `lib/firebase/config.ts`
- `lib/firebase/auth-service.ts`
- `lib/firebase/userActions.ts`
- 기타 Firebase 관련 유틸리티

#### 3.2 package.json 정리
```json
// 제거할 패키지
"firebase": "^x.x.x",
"firebase-admin": "^x.x.x"
```

```bash
npm uninstall firebase firebase-admin
npm install  # 의존성 재설치
```

#### 3.3 환경변수 정리
`.env.local` 파일에서 Firebase 관련 변수 제거:
```
# 제거 대상
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ...
```

---

### 4. 🔄 데이터 마이그레이션 (필요시)

**조건**: 기존 Firebase에 실제 사용자 데이터가 있는 경우

#### 4.1 마이그레이션 스크립트 작성
```typescript
// scripts/migrate-firebase-to-supabase.ts

import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const firebaseApp = admin.initializeApp({
  // Firebase Admin SDK 설정
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Admin 권한 필요
);

async function migrateUsers() {
  // 1. Firebase에서 모든 사용자 조회
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('userType', '==', 'jobseeker')
    .get();

  for (const doc of usersSnapshot.docs) {
    const firebaseUser = doc.data();

    try {
      // 2. Supabase Auth 계정 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: firebaseUser.email,
        email_confirm: true,
        user_metadata: {
          user_type: 'jobseeker',
          full_name: firebaseUser.fullName || ''
        }
      });

      if (authError) throw authError;

      // 3. Supabase users 테이블에 프로필 삽입
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: firebaseUser.email,
          user_type: 'jobseeker',
          full_name: firebaseUser.fullName || '',
          phone: firebaseUser.phone || '',
          headline: firebaseUser.headline || '',
          resume_file_url: firebaseUser.resumeFileUrl || '',
          resume_file_name: firebaseUser.resumeFileName || '',
          onboarding_completed: firebaseUser.onboardingCompleted || false,
          created_at: firebaseUser.createdAt?.toDate() || new Date(),
          updated_at: new Date()
        });

      if (profileError) throw profileError;

      console.log(`✅ Migrated: ${firebaseUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${firebaseUser.email}:`, error);
    }
  }
}

migrateUsers().then(() => {
  console.log('🎉 Migration completed');
  process.exit(0);
});
```

#### 4.2 마이그레이션 실행
```bash
# 1. 스크립트 권한 설정
chmod +x scripts/migrate-firebase-to-supabase.ts

# 2. 실행
npx ts-node scripts/migrate-firebase-to-supabase.ts
```

#### 4.3 마이그레이션 검증
- [ ] 사용자 수 일치 확인
- [ ] 이메일 중복 확인
- [ ] 프로필 데이터 완전성 확인
- [ ] 로그인 테스트

---

### 5. 📝 추가 개선사항 (선택)

#### 5.1 `/signup/page.tsx` 통합
현재 통합 회원가입 페이지가 개인 회원 탭에서 Supabase를 사용하지 않을 수 있음

**작업**:
```typescript
// app/signup/page.tsx
import { signUpJobseeker } from '@/lib/supabase/jobseeker-service';

const handleJobseekerSignup = async () => {
  const result = await signUpJobseeker({
    email,
    password
  });
  router.push('/onboarding/job-seeker/quick');
}
```

#### 5.2 비밀번호 재설정 페이지
```typescript
// app/forgot-password/page.tsx
import { supabase } from '@/lib/supabase/config';

const handlePasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) throw error;
  alert('비밀번호 재설정 이메일이 발송되었습니다.');
}
```

#### 5.3 이메일 인증 페이지
```typescript
// app/verify-email/page.tsx
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';

export default function VerifyEmailPage() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          // 이메일 인증 완료
          router.push('/onboarding/job-seeker/quick');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <div>이메일 인증 중...</div>;
}
```

#### 5.4 프로필 편집 페이지
```typescript
// app/jobseeker-dashboard/profile/edit/page.tsx
import { updateUserProfile, updateSkills, updateLanguages } from '@/lib/supabase/jobseeker-service';

const handleSave = async () => {
  await updateUserProfile(user.id, {
    fullName,
    headline,
    phone,
    introduction
  });

  await updateSkills(user.id, skills);
  await updateLanguages(user.id, languages);

  alert('프로필이 저장되었습니다.');
}
```

---

## 체크리스트

### 완료된 작업 ✅
- [x] 기업 온보딩 Supabase 코드 분석 및 패턴 파악
- [x] Supabase 개인 인증 서비스 모듈 작성 (`lib/supabase/jobseeker-service.ts`)
- [x] 개인 회원가입 페이지 마이그레이션 (`app/signup/jobseeker/page.tsx`)
- [x] 개인 로그인 페이지 마이그레이션 (`app/login/jobseeker/page.tsx`)
- [x] 개인 온보딩 페이지 마이그레이션 (`app/onboarding/job-seeker/quick/page.tsx`)
- [x] 통합 AuthContext 작성 (`contexts/AuthContext_Supabase.tsx`)
- [x] 마이그레이션 요약 문서 작성

### 남은 작업 ⏳
- [ ] **🔴 최우선**: AuthContext 교체 및 활성화
- [ ] 전체 플로우 테스트
- [ ] Firebase 의존성 제거
- [ ] 기존 데이터 마이그레이션 (필요시)
- [ ] `/signup/page.tsx` 통합 회원가입 페이지 업데이트

---

## 참고 자료

### Supabase 공식 문서
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

### 프로젝트 내부 참고 파일
- `supabase/schema.sql` - 데이터베이스 스키마
- `lib/supabase/company-service.ts` - 기업 회원 서비스 모듈 (참고 패턴)
- `app/company-auth/onboarding/page.tsx` - 기업 온보딩 페이지 (참고 패턴)

---

## 문의 사항
마이그레이션 과정에서 문제가 발생하거나 추가 작업이 필요한 경우:
1. 각 서비스 함수의 console.log 출력 확인
2. Supabase Dashboard에서 로그 확인 (Logs → Auth / Database)
3. 브라우저 개발자 도구 Network 탭에서 요청/응답 확인

---

**작성일**: 2025-10-15
**작성자**: Claude Code
**버전**: 1.0
