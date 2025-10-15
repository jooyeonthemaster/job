# 개인 회원 온보딩 시스템 심층 분석 보고서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [개인 회원 온보딩 아키텍처 분석](#개인-회원-온보딩-아키텍처-분석)
3. [인증 시스템 분석](#인증-시스템-분석)
4. [데이터베이스 스키마 분석](#데이터베이스-스키마-분석)
5. [온보딩 플로우 상세 분석](#온보딩-플로우-상세-분석)
6. [컴포넌트 의존성 분석](#컴포넌트-의존성-분석)
7. [기술 스택 분석](#기술-스택-분석)
8. [마이그레이션 상태 분석](#마이그레이션-상태-분석)
9. [주요 발견 사항 및 이슈](#주요-발견-사항-및-이슈)
10. [개선 제안](#개선-제안)

---

## 프로젝트 개요

### 프로젝트명
**GlobalTalent (SSMHR JobMatching Platform)**
- 외국인 구직자와 한국 기업을 연결하는 채용 매칭 플랫폼
- K-Work 스타일의 복지 및 비자 정보 중심 온보딩

### 기술 스택
```json
{
  "프레임워크": "Next.js 15.5.3",
  "런타임": "React 19.1.0",
  "언어": "TypeScript 5",
  "데이터베이스": "Supabase (PostgreSQL)",
  "인증": "Supabase Auth (Google OAuth 지원)",
  "스타일링": "Tailwind CSS 3.4.17",
  "애니메이션": "Framer Motion 12.23.16",
  "파일 저장소": "Cloudinary",
  "주소 검색": "Daum Postcode API",
  "UI 라이브러리": "Radix UI"
}
```

### 프로젝트 구조
```
20250919jobmatch/
├── app/                          # Next.js 15 App Router
│   ├── onboarding/
│   │   └── job-seeker/           # 개인 회원 온보딩 (2가지 버전)
│   │       ├── page.tsx          # 4단계 온보딩 (미사용)
│   │       └── quick/            # 빠른 온보딩 (현재 사용)
│   │           └── page.tsx      # K-Work 스타일 원페이지
│   ├── signup/
│   │   └── jobseeker/page.tsx    # 이메일 회원가입
│   ├── login/
│   │   └── jobseeker/page.tsx    # 이메일/구글 로그인
│   └── jobseeker-dashboard/      # 개인 회원 대시보드
├── components/
│   ├── onboarding/               # 온보딩 컴포넌트
│   │   └── job-seeker/           # 4단계 온보딩용 (미사용)
│   └── jobseeker-onboarding/     # Quick 온보딩용 컴포넌트
├── contexts/
│   ├── AuthContext.tsx           # Firebase 기반 (구버전)
│   └── AuthContext_Supabase.tsx  # Supabase 기반 (현재 사용)
├── lib/
│   ├── supabase/                 # Supabase 서비스 레이어
│   │   ├── config.ts             # Supabase 클라이언트
│   │   └── jobseeker-service.ts  # 개인 회원 전용 서비스
│   └── firebase/                 # Firebase (레거시, 삭제 예정)
├── types/
│   └── jobseeker-onboarding.types.ts  # 온보딩 타입 정의
├── constants/
│   └── jobseeker-terms.ts        # 약관 정보
└── supabase/
    ├── schema.sql                # DB 스키마
    └── migrations/               # 마이그레이션 스크립트
```

---

## 개인 회원 온보딩 아키텍처 분석

### 온보딩 시스템 구조

프로젝트에는 **2가지 버전**의 개인 회원 온보딩이 존재합니다:

#### 1. 4단계 분할 온보딩 (미사용)
**위치**: [app/onboarding/job-seeker/page.tsx](app/onboarding/job-seeker/page.tsx:1)

```typescript
// 4단계로 구성된 멀티스텝 온보딩
Step 1: 기본 정보 (프로필 사진, 이름, 헤드라인)
Step 2: 경력/학력 (복수 추가 가능)
Step 3: 기술/언어 (복수 추가 가능)
Step 4: 선호 조건 (희망 직무, 근무지, 연봉 등)
```

**특징**:
- URL 쿼리 파라미터로 단계 관리 (`?step=1`)
- 각 단계별 별도 컴포넌트 분리
- Firebase 기반 `updateUserProfile` 사용
- 복잡한 `profileCompleteness` 계산

**사용 여부**: ❌ **현재 미사용** (코드만 존재)

---

#### 2. 빠른 온보딩 (Quick Onboarding) - 현재 사용 ✅
**위치**: [app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:1)

```typescript
// K-Work 스타일의 원페이지 온보딩
Section 1: 기본 정보 (국적, 이름, 연락처)
Section 2: 계정 정보 (이메일, 비밀번호)
Section 3: 주소 (Daum Postcode API)
Section 4: 개인 정보 (성별)
Section 5: 비자 정보 (복수 선택)
Section 6: 언어 능력 (한국어 + 기타 언어)
Section 7: 약관 동의 (필수/선택)
```

**핵심 로직**:
```typescript
// 국적에 따라 입력 필드 분기
const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

if (isKorean) {
  // 한국인: 휴대폰 번호 (010-xxxx-xxxx)
  validatePhone(formData.phone);
} else {
  // 외국인: 외국인등록번호 (123456-1234567)
  validateForeignerNumber(formData.foreignerNumber);
}
```

**사용되는 API**:
```typescript
import { completeOnboarding } from '@/lib/supabase/jobseeker-service';

// Supabase users 테이블 업데이트
await completeOnboarding(user.id, {
  fullName: formData.fullName,
  phone: isKorean ? formData.phone.replace(/-/g, '') : '',
  foreigner_number: !isKorean ? formData.foreignerNumber : undefined,
  address: formData.address,
  nationality: formData.nationality,
  gender: formData.gender,
  visa_types: formData.visaType,
  korean_level: formData.koreanLevel,
  agree_email_receive: formData.agreeEmailReceive,
  agree_privacy_collection: formData.agreePrivacyTerms,
});
```

---

### 온보딩 플로우 비교

| 항목 | 4단계 온보딩 | 빠른 온보딩 (현재) |
|------|--------------|-------------------|
| **페이지 수** | 4개 (멀티스텝) | 1개 (원페이지) |
| **데이터베이스** | Firebase | Supabase ✅ |
| **주요 정보** | 경력/학력/스킬 중심 | 비자/언어/약관 중심 |
| **UX** | 단계별 진행 | 스크롤 진행 |
| **타겟** | 일반 채용 | 외국인 전용 (K-Work) |
| **사용 여부** | ❌ 미사용 | ✅ 현재 사용 중 |

---

## 인증 시스템 분석

### AuthContext 이중화 문제

프로젝트에 **2개의 AuthContext**가 존재합니다:

#### 1. AuthContext.tsx (Firebase 기반) - 구버전
**위치**: `contexts/AuthContext.tsx`
**상태**: ❌ **레거시 (삭제 예정)**

```typescript
// Firebase Auth + Firestore 사용
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// 문제점:
- Firebase와 Supabase 혼용으로 인한 복잡도 증가
- uid vs id 혼용 (Firebase는 uid, Supabase는 id)
- jobseekers 컬렉션과 users 테이블 중복 데이터
```

#### 2. AuthContext_Supabase.tsx (Supabase 기반) - 현재 사용 ✅
**위치**: [contexts/AuthContext_Supabase.tsx](contexts/AuthContext_Supabase.tsx:1)
**상태**: ✅ **현재 활성화**

```typescript
// app/layout.tsx에서 활성화 확인
import { AuthProvider } from "@/contexts/AuthContext_Supabase";
```

**핵심 기능**:

1. **통합 인증 관리**
```typescript
export type UserType = 'company' | 'jobseeker';

export interface AuthUser extends SupabaseUser {
  user_type?: UserType;
}

// 메타데이터에서 사용자 유형 확인
const type = (authUser.user_metadata?.user_type || 'jobseeker') as UserType;
```

2. **타입별 프로필 조회**
```typescript
const fetchUserProfile = async (userId: string, type: UserType) => {
  if (type === 'company') {
    // 기업: companies 테이블
    return await supabase
      .from('companies')
      .select('*')
      .eq('id', userId)
      .single();
  } else {
    // 개인: users 테이블
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  }
};
```

3. **자동 온보딩 리다이렉션**
```typescript
const checkOnboardingAndRedirect = (profile: any, type: UserType) => {
  // 개인 회원 온보딩 체크
  if (type === 'jobseeker' && !profile?.onboarding_completed) {
    router.push('/onboarding/job-seeker/quick');
    return;
  }

  // 기업 회원 온보딩 체크
  if (type === 'company' && !profile?.profile_completed) {
    router.push('/company-auth/onboarding');
    return;
  }
};
```

---

### 회원가입 및 로그인 플로우

#### 이메일 회원가입 ([app/signup/jobseeker/page.tsx](app/signup/jobseeker/page.tsx:1))
```typescript
// 1. Supabase Auth 회원가입
const result = await signUpJobseeker({
  email,
  password
});

// 2. signUpJobseeker 함수 내부 (lib/supabase/jobseeker-service.ts:44)
// 2-1. Supabase Auth 계정 생성
const { data: authData } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      user_type: 'jobseeker',  // 메타데이터에 저장
      full_name: data.fullName || ''
    }
  }
});

// 2-2. users 테이블에 프로필 생성
const { data: userData } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,  // Auth UID와 동일
    email: data.email,
    user_type: 'jobseeker',
    onboarding_completed: false,
    created_at: new Date().toISOString()
  })
  .select()
  .single();

// 3. 온보딩 페이지로 리다이렉션
router.push('/onboarding/job-seeker/quick');
```

#### 구글 로그인 ([app/login/jobseeker/page.tsx](app/login/jobseeker/page.tsx:69))
```typescript
// 1. Supabase OAuth 리다이렉션
await signInWithGoogle();

// 2. signInWithGoogle 함수 내부 (lib/supabase/jobseeker-service.ts:145)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?type=jobseeker`
  }
});

// 3. OAuth 콜백 후 AuthContext에서 자동 처리
// AuthContext_Supabase.tsx:200
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    await handleAuthChange(session.user);
  }
});
```

---

## 데이터베이스 스키마 분석

### Users 테이블 구조 ([supabase/schema.sql](supabase/schema.sql:16))

```sql
CREATE TABLE users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,            -- 마이그레이션용 (향후 삭제)
  email TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'jobseeker',

  -- ===== 온보딩 Step 1: 기본 정보 =====
  full_name TEXT NOT NULL,             -- 이름 (필수)
  headline TEXT,                       -- 헤드라인/간단 소개 (선택)
  profile_image_url TEXT,              -- 프로필 사진 URL

  -- ===== 온보딩 Step 2: 연락처 & 신원 정보 =====
  phone TEXT NOT NULL,                 -- 휴대폰 번호 (하이픈 제거)
  phone_verified BOOLEAN DEFAULT false,
  foreigner_number TEXT NOT NULL,      -- 외국인등록번호
  foreigner_number_verified BOOLEAN DEFAULT false,

  -- ===== 온보딩 Step 3: 주소 =====
  address TEXT NOT NULL,               -- 주소 (Daum Postcode)
  address_detail TEXT,                 -- 상세 주소

  -- ===== 온보딩 Step 4: 개인 정보 =====
  nationality TEXT NOT NULL,           -- 국적 (CN, US, VN, KR 등)
  gender TEXT NOT NULL,                -- 성별 (male | female)
  birth_year INTEGER,                  -- 출생연도

  -- ===== 온보딩 Step 5: 비자 정보 =====
  visa_types TEXT[] NOT NULL,          -- 비자 종류 (F2, F4, F5, F6)
  korean_level TEXT NOT NULL,          -- 한국어 능력

  -- ===== 온보딩 Step 7: 선호 조건 =====
  work_type TEXT,                      -- 고용 형태
  company_size TEXT,                   -- 선호 회사 규모
  visa_sponsorship BOOLEAN DEFAULT false,
  remote_work TEXT,                    -- 재택근무 선호도
  introduction TEXT,                   -- 자기소개

  -- ===== 이력서 =====
  resume_file_url TEXT,                -- Cloudinary URL
  resume_file_name TEXT,
  resume_uploaded_at TIMESTAMPTZ,

  -- ===== 약관 동의 =====
  agree_email_receive BOOLEAN DEFAULT false,
  agree_privacy_collection BOOLEAN DEFAULT false,

  -- ===== 메타 정보 =====
  onboarding_completed BOOLEAN DEFAULT false,  -- 온보딩 완료 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 관련 테이블

#### 1. user_skills (기술)
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  UNIQUE(user_id, skill_name)
);
```

#### 2. user_languages (언어)
```sql
CREATE TABLE user_languages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  proficiency TEXT,  -- BASIC | INTERMEDIATE | FLUENT | NATIVE
  UNIQUE(user_id, language_name)
);
```

#### 3. user_experiences (경력)
```sql
CREATE TABLE user_experiences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT
);
```

#### 4. user_educations (학력)
```sql
CREATE TABLE user_educations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT false
);
```

#### 5. user_desired_positions (희망 직무)
```sql
CREATE TABLE user_desired_positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_name TEXT NOT NULL,
  UNIQUE(user_id, position_name)
);
```

#### 6. user_preferred_locations (희망 근무지)
```sql
CREATE TABLE user_preferred_locations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  UNIQUE(user_id, location_name)
);
```

#### 7. user_salary_range (희망 연봉)
```sql
CREATE TABLE user_salary_range (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  min_salary INTEGER,
  max_salary INTEGER,
  currency TEXT DEFAULT 'KRW'
);
```

---

### 데이터 정규화 전략

**장점**:
✅ 데이터 중복 최소화
✅ 유연한 복수 항목 관리 (스킬, 언어, 경력 등)
✅ 트랜잭션 무결성 보장 (ON DELETE CASCADE)
✅ 인덱스를 통한 빠른 검색

**단점**:
⚠️ 조인 쿼리 필요 (N+1 문제 가능)
⚠️ 복잡한 쿼리 작성

**해결책**:
```typescript
// lib/supabase/jobseeker-service.ts:236
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      skills:user_skills(skill_name),
      languages:user_languages(language_name, proficiency),
      experiences:user_experiences(*),
      educations:user_educations(*),
      desired_positions:user_desired_positions(position_name),
      preferred_locations:user_preferred_locations(location_name),
      salary_range:user_salary_range(*)
    `)
    .eq('id', userId)
    .single();

  return data;
};
```

---

## 온보딩 플로우 상세 분석

### Quick 온보딩 단계별 흐름

#### 1단계: 회원가입
**페이지**: [app/signup/jobseeker/page.tsx](app/signup/jobseeker/page.tsx:1)

```typescript
// 이메일/비밀번호 입력
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 유효성 검증
  if (password !== confirmPassword) {
    setError('비밀번호가 일치하지 않습니다.');
    return;
  }

  if (password.length < 8) {
    setError('비밀번호는 최소 8자 이상이어야 합니다.');
    return;
  }

  // Supabase 회원가입
  const result = await signUpJobseeker({ email, password });

  // 온보딩 페이지로 이동
  router.push('/onboarding/job-seeker/quick');
};
```

**생성되는 데이터**:
- Supabase Auth: 인증 계정
- users 테이블: 기본 프로필 (onboarding_completed: false)

---

#### 2단계: 온보딩 정보 입력
**페이지**: [app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:35)

**Section 1: 국적 선택 (최우선)**
```typescript
// 국적 선택에 따라 입력 필드 동적 변경
<select
  value={formData.nationality}
  onChange={(e) => handleChange('nationality', e.target.value)}
>
  <option value="">국적을 선택해주세요</option>
  {NATIONALITIES.map((nat) => (
    <option key={nat.value} value={nat.value}>
      {nat.label}
    </option>
  ))}
</select>
```

**Section 2: 연락처 (국적 기반 분기)**
```typescript
{formData.nationality === KOREA_NATIONALITY_CODE ? (
  // 한국인: 휴대폰 번호 (3-4-4 분할 입력)
  <div>
    <input placeholder="010" maxLength={3} />
    <input placeholder="1234" maxLength={4} />
    <input placeholder="5678" maxLength={4} />
  </div>
) : (
  // 외국인: 외국인등록번호 (123456-1234567)
  <input placeholder="123456-1234567" />
)}
```

**Section 3: 주소 (Daum Postcode API)**
```typescript
const handleAddressSearch = () => {
  new (window as any).daum.Postcode({
    oncomplete: function (data: any) {
      const addr = data.userSelectedType === 'R'
        ? data.roadAddress
        : data.jibunAddress;
      handleChange('address', addr);
    },
  }).open();
};
```

**Section 4: 비자 정보 (복수 선택)**
```typescript
const VISA_TYPES = [
  { value: 'F2', label: 'F-2 (거주)' },
  { value: 'F4', label: 'F-4 (재외동포)' },
  { value: 'F5', label: 'F-5 (영주)' },
  { value: 'F6', label: 'F-6 (결혼이민)' },
];

<input
  type="checkbox"
  value={visa.value}
  checked={formData.visaType.includes(visa.value)}
  onChange={(e) => {
    const value = e.target.value;
    if (e.target.checked) {
      handleChange('visaType', [...formData.visaType, value]);
    } else {
      handleChange('visaType', formData.visaType.filter(v => v !== value));
    }
  }}
/>
```

**Section 5: 언어 능력 (동적 추가/삭제)**
```typescript
// 한국어 능력
<select
  value={formData.koreanLevel}
  onChange={(e) => handleChange('koreanLevel', e.target.value)}
>
  {KOREAN_LEVELS.map((level) => (
    <option value={level.value}>{level.label}</option>
  ))}
</select>

// 한국어 외 언어 (복수)
const addLanguage = () => {
  setFormData((prev) => ({
    ...prev,
    otherLanguages: [...prev.otherLanguages, { language: '', proficiency: '' }],
  }));
};

{formData.otherLanguages.map((lang, index) => (
  <div key={index}>
    <select
      value={lang.language}
      onChange={(e) => updateLanguage(index, 'language', e.target.value)}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option value={option.value}>{option.label}</option>
      ))}
    </select>

    <select
      value={lang.proficiency}
      onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
    >
      {LANGUAGE_PROFICIENCY.map((option) => (
        <option value={option.value}>{option.label}</option>
      ))}
    </select>

    <button onClick={() => removeLanguage(index)}>삭제</button>
  </div>
))}
```

**Section 6: 약관 동의 (필수/선택 구분)**
```typescript
// 전체 동의
const handleAgreeAll = (checked: boolean) => {
  setFormData((prev) => ({
    ...prev,
    agreeAll: checked,
    agreeServiceTerms: checked,
    agreePrivacyTerms: checked,
    agreeEmailReceive: checked,
  }));
};

// 필수 약관
JOBSEEKER_REQUIRED_TERMS = ['privacy', 'service'];

// 선택 약관
JOBSEEKER_OPTIONAL_TERMS = ['emailReceive'];

// 약관 전문 보기 (Radix UI Dialog)
<Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
  <Dialog.Content>
    <Dialog.Title>{modalContent?.title}</Dialog.Title>
    <pre>{modalContent?.content}</pre>
  </Dialog.Content>
</Dialog.Root>
```

---

#### 3단계: 유효성 검증
**파일**: [types/jobseeker-onboarding.types.ts](types/jobseeker-onboarding.types.ts:177)

```typescript
export const validateJobseekerOnboardingForm = (
  formData: JobseekerOnboardingFormData,
  isEmailSignup: boolean
): ValidationResult => {
  const errors: Record<string, string> = {};
  const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

  // 1. 이름 검증
  if (!formData.fullName.trim()) {
    errors.fullName = '이름을 입력해주세요.';
  }

  // 2. 한국인/외국인 구분 검증
  if (isKorean) {
    if (!validatePhone(formData.phone)) {
      errors.phone = '올바른 휴대폰 번호 형식이 아닙니다.';
    }
  } else {
    if (!validateForeignerNumber(formData.foreignerNumber)) {
      errors.foreignerNumber = '올바른 형식이 아닙니다. (예: 123456-1234567)';
    }
  }

  // 3. 이메일 검증
  if (!validateEmail(formData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  // 4. 비밀번호 검증 (이메일 가입 시만)
  if (isEmailSignup) {
    if (!validatePassword(formData.password)) {
      errors.password = '비밀번호는 8~20자로, 문자와 숫자 또는 특수문자를 포함해야 합니다.';
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
  }

  // 5. 비자 유형 검증
  if (formData.visaType.length === 0) {
    errors.visaType = '비자 유형을 최소 1개 이상 선택해주세요.';
  }

  // 6. 언어 능력 검증
  if (formData.otherLanguages.length === 0) {
    errors.otherLanguages = '한국어 외 구사 가능한 언어를 최소 1개 이상 추가해주세요.';
  } else {
    const invalidLanguage = formData.otherLanguages.find(
      (lang) => !lang.language || !lang.proficiency
    );
    if (invalidLanguage) {
      errors.otherLanguages = '모든 언어의 언어명과 숙련도를 선택해주세요.';
    }
  }

  // 7. 약관 동의 검증
  if (!formData.agreeServiceTerms) {
    errors.terms = '서비스 이용약관에 동의해주세요.';
  }
  if (!formData.agreePrivacyTerms) {
    errors.terms = '개인정보 수집·이용 동의는 필수입니다.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

**유효성 검증 함수들**:
```typescript
// 휴대폰 번호 (010-xxxx-xxxx)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

// 외국인등록번호 (123456-1234567)
export const validateForeignerNumber = (number: string): boolean => {
  const foreignerRegex = /^\d{6}-\d{7}$/;
  return foreignerRegex.test(number);
};

// 이메일
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 (8~20자, 문자+숫자 또는 문자+특수문자)
export const validatePassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 20) return false;

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$^*+=\-]/.test(password);
  const hasInvalidChar = /[^a-zA-Z0-9!@#$^*+=\-]/.test(password);

  if (hasInvalidChar) return false;
  return hasLetter && (hasNumber || hasSpecial);
};
```

---

#### 4단계: 데이터 저장
**파일**: [lib/supabase/jobseeker-service.ts](lib/supabase/jobseeker-service.ts:165)

```typescript
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

  const updateData: any = {
    full_name: data.fullName,
    phone: isKorean ? data.phone.replace(/-/g, '') : '',
    foreigner_number: !isKorean ? data.foreignerNumber : undefined,
    address: data.address,
    address_detail: data.addressDetail,
    nationality: data.nationality,
    gender: data.gender,
    visa_types: data.visaType,  // PostgreSQL Array
    korean_level: data.koreanLevel,
    agree_email_receive: data.agreeEmailReceive,
    agree_privacy_collection: data.agreePrivacyTerms,
    onboarding_completed: true,  // 온보딩 완료 플래그
    updated_at: new Date().toISOString()
  };

  const { data: userData, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return userData;
};
```

---

#### 5단계: 대시보드 리다이렉션
**파일**: [app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:231)

```typescript
// 성공 시 대시보드로 이동
router.push('/jobseeker-dashboard');
```

**AuthContext에서 자동 처리**:
```typescript
// contexts/AuthContext_Supabase.tsx:173
if (type === 'jobseeker' && !profile?.onboarding_completed) {
  // 온보딩 미완료 시 온보딩 페이지로 리다이렉션
  router.push('/onboarding/job-seeker/quick');
  return;
}

// 온보딩 완료 시 대시보드 접근 허용
```

---

## 컴포넌트 의존성 분석

### 온보딩 컴포넌트 구조

#### Quick 온보딩 페이지
**파일**: [app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:1)

**의존 라이브러리**:
```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';  // 인증 컨텍스트
import { motion } from 'framer-motion';  // 애니메이션
import * as Dialog from '@radix-ui/react-dialog';  // 모달
import { completeOnboarding } from '@/lib/supabase/jobseeker-service';  // API
import {
  validateJobseekerOnboardingForm,
  VISA_TYPES,
  KOREAN_LEVELS,
  NATIONALITIES,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY,
  KOREA_NATIONALITY_CODE,
} from '@/types/jobseeker-onboarding.types';  // 타입 및 상수
import { JOBSEEKER_TERMS } from '@/constants/jobseeker-terms';  // 약관
```

**UI 컴포넌트 사용**:
- Lucide React Icons: `Mail`, `Lock`, `MapPin`, `User`, etc.
- Radix UI Dialog: 약관 전문 보기 모달
- Framer Motion: 페이드 인/아웃 애니메이션
- Tailwind CSS: 스타일링

---

### 4단계 온보딩 컴포넌트 (미사용)
**파일**: [app/onboarding/job-seeker/page.tsx](app/onboarding/job-seeker/page.tsx:1)

**하위 컴포넌트**:
```
components/onboarding/job-seeker/
├── Step1ProfileBasic.tsx         # 기본 정보
├── Step2_Experience.tsx          # 경력/학력
├── Step3_Skills.tsx              # 기술/언어
├── Step4_Preferences.tsx         # 선호 조건
└── OnboardingProgressBar.tsx     # 진행률 바
```

**컴포넌트 간 데이터 전달**:
```typescript
// 부모 컴포넌트 (page.tsx)
const [onboardingData, setOnboardingData] = useState<any>({});

// 각 Step 컴포넌트로 props 전달
<Step1ProfileBasic
  data={onboardingData}
  onNext={(data) => {
    updateOnboardingData(data);
    nextStep();
  }}
/>

// Step1ProfileBasic.tsx
interface Props {
  data?: any;
  onNext: (data: any) => void;
}

const handleNext = () => {
  onNext({ fullName, headline, profileImageUrl });
};
```

---

### 공통 컴포넌트

#### 1. ValidationModal
**위치**: `components/ValidationModal.tsx`
**사용처**: 모든 온보딩 Step 컴포넌트

```typescript
<ValidationModal
  isOpen={showErrors && validateForm().length > 0}
  onClose={() => setShowErrors(false)}
  errors={validateForm()}
/>
```

#### 2. CustomCloudinaryUpload
**위치**: `components/CustomCloudinaryUpload.tsx`
**사용처**: 프로필 사진, 이력서 업로드

```typescript
<CustomCloudinaryUpload
  type="profile"
  currentImageUrl={profileImageUrl}
  onUploadSuccess={(url) => setProfileImageUrl(url)}
  onUploadError={(error) => console.error('Upload error:', error)}
  label="프로필 사진 (선택)"
/>
```

#### 3. PhoneInput / ForeignerNumberInput
**위치**: `components/jobseeker-onboarding/`
**사용처**: Quick 온보딩의 연락처 입력 (현재는 인라인으로 구현)

---

## 기술 스택 분석

### 프론트엔드

#### 1. Next.js 15.5.3 (App Router)
- 파일 기반 라우팅
- Server Components vs Client Components
- 동적 라우팅: `[id]` 폴더
- API Routes: `app/api/` 폴더

#### 2. React 19.1.0
- Hooks 중심 설계: `useState`, `useEffect`, `useContext`
- Context API: `AuthContext_Supabase`
- Suspense: 비동기 컴포넌트 로딩

#### 3. TypeScript 5
- 엄격한 타입 체크
- 인터페이스 정의: `jobseeker-onboarding.types.ts`
- 타입 안전성 보장

#### 4. Tailwind CSS 3.4.17
**커스텀 테마**: [tailwind.config.ts](tailwind.config.ts:1)
```typescript
colors: {
  primary: '#00D4AA',  // Teal
  secondary: '#A855F7',  // Purple
  gray: { ... }
},
animation: {
  'gradient': 'gradient 8s linear infinite',
  'float': 'float 6s ease-in-out infinite',
}
```

#### 5. Framer Motion 12.23.16
**사용 예시**:
```typescript
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  ...
</motion.div>
```

#### 6. Radix UI
- Dialog: 약관 전문 보기
- Dropdown Menu: 네비게이션
- Tabs: 탭 UI

---

### 백엔드 및 인프라

#### 1. Supabase (PostgreSQL + Auth)
**설정**: [lib/supabase/config.ts](lib/supabase/config.ts:1)
```typescript
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
```

**주요 기능**:
- Auth: 이메일/비밀번호, Google OAuth
- Database: PostgreSQL 관계형 DB
- Row Level Security (RLS): 보안 정책
- Realtime: 실시간 데이터 동기화 (미사용)

#### 2. Cloudinary
**용도**: 프로필 사진, 이력서 파일 저장
**API Endpoint**: [app/api/upload-resume/route.ts](app/api/upload-resume/route.ts:1)

```typescript
const response = await fetch('/api/upload-resume', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
return data.url;  // Cloudinary URL
```

#### 3. Daum Postcode API
**용도**: 주소 검색
**스크립트 로드**: [app/layout.tsx](app/layout.tsx:30)
```html
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
```

---

## 마이그레이션 상태 분석

### 현재 상태

#### ✅ 완료된 작업
1. **Supabase Auth 통합**
   - 이메일/비밀번호 회원가입
   - Google OAuth 로그인
   - AuthContext_Supabase 활성화

2. **개인 회원 온보딩 Supabase 마이그레이션**
   - Quick 온보딩 페이지 Supabase 연동
   - `completeOnboarding` API 구현
   - 타입 안전성 개선

3. **데이터베이스 스키마**
   - users 테이블 설계 완료
   - 관련 테이블 (skills, languages, experiences 등) 정의
   - 인덱스 및 RLS 정책 설정

#### ⏳ 남은 작업
1. **Firebase 의존성 제거**
   - `lib/firebase/` 폴더 삭제
   - `package.json`에서 firebase 패키지 제거
   - 환경변수 정리

2. **4단계 온보딩 재구현 또는 제거**
   - 현재 미사용 상태
   - Quick 온보딩으로 통합 또는 별도 기능 유지 결정

3. **기존 Firebase 데이터 마이그레이션**
   - Firebase Firestore → Supabase PostgreSQL
   - 마이그레이션 스크립트 작성 및 실행

4. **프로필 편집 페이지 Supabase 연동**
   - [app/profile/edit/page.tsx](app/profile/edit/page.tsx:1)
   - 경력, 학력, 스킬 등 하위 페이지

---

### 마이그레이션 가이드 요약

**참고 문서**: [JOBSEEKER_SUPABASE_MIGRATION_SUMMARY.md](JOBSEEKER_SUPABASE_MIGRATION_SUMMARY.md:1)

**주요 변경 사항**:

| 항목 | AS-IS (Firebase) | TO-BE (Supabase) |
|------|------------------|------------------|
| **Auth** | Firebase Auth | Supabase Auth |
| **Database** | Firestore (NoSQL) | PostgreSQL (관계형) |
| **사용자 식별** | uid (string) | id (UUID) |
| **프로필 저장** | users + jobseekers 컬렉션 | users 테이블 |
| **온보딩 상태** | profileCompleteness (객체) | onboarding_completed (boolean) |
| **타입 안전성** | any 타입 남용 | TypeScript 인터페이스 |

**마이그레이션 체크리스트**:
- [x] AuthContext 교체 (AuthContext_Supabase 활성화)
- [x] 회원가입 페이지 마이그레이션
- [x] 로그인 페이지 마이그레이션
- [x] 온보딩 페이지 마이그레이션
- [ ] 프로필 편집 페이지 마이그레이션
- [ ] Firebase 의존성 제거
- [ ] 기존 데이터 마이그레이션

---

## 주요 발견 사항 및 이슈

### 1. 온보딩 시스템 이중화
**문제**: 2가지 온보딩 방식이 혼재
- 4단계 온보딩: 코드만 존재, 실제 미사용
- Quick 온보딩: 현재 사용 중

**영향**:
- 코드 복잡도 증가
- 유지보수 부담
- 혼란 가능성

**해결 방안**:
1. Quick 온보딩으로 통합 (권장)
2. 4단계 온보딩 코드 제거
3. 또는 두 방식을 명확히 분리하여 선택 가능하게 구현

---

### 2. AuthContext 이중화 (해결됨 ✅)
**문제**: Firebase와 Supabase 인증 컨텍스트 혼용
**현재 상태**: AuthContext_Supabase로 통합 완료
**남은 작업**: Firebase 관련 코드 제거

---

### 3. 비자 정보 입력 필수화
**문제**: 한국인 사용자도 비자 정보 입력 필요
**현재 로직**:
```typescript
// types/jobseeker-onboarding.types.ts:246
if (formData.visaType.length === 0) {
  errors.visaType = '비자 유형을 최소 1개 이상 선택해주세요.';
}
```

**개선 필요**:
```typescript
// 한국인은 비자 입력 제외
if (!isKorean && formData.visaType.length === 0) {
  errors.visaType = '비자 유형을 최소 1개 이상 선택해주세요.';
}
```

---

### 4. 언어 능력 최소 1개 강제
**문제**: 모든 사용자가 한국어 외 언어를 1개 이상 입력해야 함

**현재 로직**:
```typescript
// types/jobseeker-onboarding.types.ts:256
if (formData.otherLanguages.length === 0) {
  errors.otherLanguages = '한국어 외 구사 가능한 언어를 최소 1개 이상 추가해주세요.';
}
```

**개선 방안**:
- 선택 사항으로 변경
- 또는 "없음" 옵션 추가

---

### 5. 외국인등록번호 보안
**문제**: 민감한 개인정보를 평문으로 저장

**현재**:
```sql
-- supabase/schema.sql:31
foreigner_number TEXT NOT NULL,  -- 평문 저장
```

**개선 방안**:
1. **암호화 저장** (권장)
   ```typescript
   // 저장 전 암호화
   const encrypted = encrypt(formData.foreignerNumber);
   await supabase.from('users').update({ foreigner_number: encrypted });

   // 조회 시 복호화
   const decrypted = decrypt(profile.foreigner_number);
   ```

2. **RLS 정책 강화**
   ```sql
   -- 본인만 조회 가능
   CREATE POLICY "Users can view own foreigner_number"
     ON users FOR SELECT
     USING (auth.uid() = id);
   ```

---

### 6. 전화번호 인증 미구현
**문제**: phone_verified, foreigner_number_verified 플래그 존재하나 인증 로직 없음

**현재**:
```typescript
// lib/supabase/jobseeker-service.ts:181
phone_verified: data.phone_verified,  // 항상 false
```

**필요한 구현**:
1. SMS 인증 API 연동 (예: Twilio, 알리고)
2. 인증 번호 발송 및 확인
3. 인증 완료 시 verified 플래그 true 설정

---

### 7. 약관 동의 철회 기능 부재
**문제**: 약관 동의 후 변경/철회 기능 없음

**개선 방안**:
- 프로필 설정에서 약관 동의 관리 페이지 추가
- agree_email_receive는 언제든 변경 가능하도록

---

### 8. 이력서 파일 타입 제한
**현재**: 파일 타입 검증 없음

**개선 필요**:
```typescript
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_FILE_TYPES.includes(file.type)) {
  throw new Error('PDF, DOC, DOCX 파일만 업로드 가능합니다.');
}

if (file.size > MAX_FILE_SIZE) {
  throw new Error('파일 크기는 10MB 이하여야 합니다.');
}
```

---

### 9. N+1 쿼리 문제 가능성
**문제**: 프로필 조회 시 여러 테이블 조인

**현재**:
```typescript
// lib/supabase/jobseeker-service.ts:236
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    skills:user_skills(skill_name),
    languages:user_languages(language_name, proficiency),
    experiences:user_experiences(*),
    educations:user_educations(*),
    desired_positions:user_desired_positions(position_name),
    preferred_locations:user_preferred_locations(location_name),
    salary_range:user_salary_range(*)
  `)
  .eq('id', userId)
  .single();
```

**최적화 방안**:
- 필요한 필드만 선택적으로 조회
- 페이지별로 다른 쿼리 사용
- View 생성하여 미리 조인

---

### 10. 에러 처리 개선 필요
**문제**: 일부 에러 메시지가 사용자 친화적이지 않음

**현재**:
```typescript
catch (error: any) {
  alert(error.message || '오류가 발생했습니다.');
}
```

**개선 방안**:
```typescript
catch (error: any) {
  // Supabase 에러 코드별 처리
  const errorMap: Record<string, string> = {
    '23505': '이미 등록된 이메일입니다.',
    '23503': '잘못된 요청입니다.',
    'PGRST116': '데이터를 찾을 수 없습니다.',
  };

  const message = errorMap[error.code] || error.message || '오류가 발생했습니다.';
  setError(message);

  // 로그 전송 (Sentry, LogRocket 등)
  logError(error);
}
```

---

## 개선 제안

### 1. 온보딩 시스템 단순화
**목표**: 2가지 온보딩 방식 중 1개로 통합

**방안 A: Quick 온보딩만 사용 (권장)**
```typescript
// 삭제 대상
- app/onboarding/job-seeker/page.tsx
- components/onboarding/job-seeker/ (전체 폴더)
- components/onboarding/OnboardingProgressBar.tsx

// 유지
- app/onboarding/job-seeker/quick/page.tsx (현재 사용 중)
```

**방안 B: 두 방식 모두 유지 + 선택 기능**
```typescript
// app/onboarding/job-seeker/page.tsx (선택 페이지)
export default function OnboardingSelectionPage() {
  return (
    <div>
      <h1>온보딩 방식 선택</h1>
      <Link href="/onboarding/job-seeker/quick">
        빠른 가입 (3분)
      </Link>
      <Link href="/onboarding/job-seeker/detailed">
        상세 가입 (10분)
      </Link>
    </div>
  );
}
```

---

### 2. 타입 안전성 강화
**목표**: any 타입 제거

**현재**:
```typescript
// app/onboarding/job-seeker/page.tsx:41
const [onboardingData, setOnboardingData] = useState<any>({});
```

**개선**:
```typescript
import { JobseekerOnboardingFormData } from '@/types/jobseeker-onboarding.types';

const [onboardingData, setOnboardingData] = useState<Partial<JobseekerOnboardingFormData>>({});
```

---

### 3. 유효성 검증 라이브러리 도입
**목표**: 선언적 유효성 검증

**추천 라이브러리**: Zod

```typescript
import { z } from 'zod';

const JobseekerOnboardingSchema = z.object({
  fullName: z.string().min(1, '이름을 입력해주세요.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  nationality: z.string().min(1, '국적을 선택해주세요.'),
  visaType: z.array(z.string()).min(1, '비자 유형을 최소 1개 이상 선택해주세요.'),
  // ...
});

// 사용
const result = JobseekerOnboardingSchema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.flatten().fieldErrors);
}
```

---

### 4. 상태 관리 라이브러리 도입 (선택)
**목표**: 복잡한 폼 상태 관리 개선

**추천**: React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(JobseekerOnboardingSchema),
});

<input
  {...register('fullName')}
  placeholder="홍길동"
/>
{errors.fullName && <span>{errors.fullName.message}</span>}
```

---

### 5. 프로그레스 인디케이터 개선
**목표**: 사용자에게 진행 상황 명확히 전달

**Quick 온보딩에 추가**:
```typescript
// 섹션별 완성도 계산
const calculateProgress = () => {
  const sections = [
    { name: '기본 정보', completed: !!formData.fullName && !!formData.nationality },
    { name: '주소', completed: !!formData.address },
    { name: '비자', completed: formData.visaType.length > 0 },
    { name: '언어', completed: formData.otherLanguages.length > 0 },
    { name: '약관', completed: formData.agreeServiceTerms && formData.agreePrivacyTerms },
  ];

  const completedCount = sections.filter(s => s.completed).length;
  return (completedCount / sections.length) * 100;
};

// UI
<div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
  <div
    className="h-full bg-primary-600 transition-all duration-300"
    style={{ width: `${calculateProgress()}%` }}
  />
</div>
```

---

### 6. 자동 저장 기능
**목표**: 페이지 이탈 시 데이터 손실 방지

```typescript
import { useEffect } from 'react';
import { debounce } from 'lodash';

const saveToLocalStorage = debounce((formData) => {
  localStorage.setItem('jobseeker_onboarding_draft', JSON.stringify(formData));
}, 1000);

useEffect(() => {
  saveToLocalStorage(formData);
}, [formData]);

// 페이지 로드 시 복원
useEffect(() => {
  const draft = localStorage.getItem('jobseeker_onboarding_draft');
  if (draft) {
    setFormData(JSON.parse(draft));
  }
}, []);
```

---

### 7. 다국어 지원 (i18n)
**목표**: 외국인 사용자 편의성 증대

**추천 라이브러리**: next-intl

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('onboarding');

<label>{t('fullName.label')}</label>
<input placeholder={t('fullName.placeholder')} />
```

**메시지 파일**:
```json
// locales/en.json
{
  "onboarding": {
    "fullName": {
      "label": "Full Name",
      "placeholder": "John Doe"
    }
  }
}

// locales/ko.json
{
  "onboarding": {
    "fullName": {
      "label": "이름",
      "placeholder": "홍길동"
    }
  }
}
```

---

### 8. 접근성 (a11y) 개선
**목표**: 스크린 리더 및 키보드 탐색 지원

```typescript
// ARIA 레이블 추가
<input
  type="text"
  id="fullName"
  aria-label="이름"
  aria-required="true"
  aria-invalid={!!errors.fullName}
  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
/>
{errors.fullName && (
  <span id="fullName-error" role="alert">
    {errors.fullName}
  </span>
)}

// 키보드 탐색
<form onSubmit={handleSubmit}>
  {/* tabIndex 자동 관리 */}
</form>
```

---

### 9. 테스트 코드 작성
**목표**: 안정적인 온보딩 플로우 보장

**추천**: Jest + React Testing Library

```typescript
// __tests__/onboarding/quick.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import JobseekerOnboardingPage from '@/app/onboarding/job-seeker/quick/page';

describe('Jobseeker Quick Onboarding', () => {
  it('shows error when submitting without required fields', async () => {
    render(<JobseekerOnboardingPage />);

    const submitButton = screen.getByText('회원가입 완료');
    fireEvent.click(submitButton);

    expect(await screen.findByText('이름을 입력해주세요.')).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    render(<JobseekerOnboardingPage />);

    const phoneInput = screen.getByPlaceholderText('010');
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const submitButton = screen.getByText('회원가입 완료');
    fireEvent.click(submitButton);

    expect(await screen.findByText('올바른 휴대폰 번호 형식이 아닙니다.')).toBeInTheDocument();
  });
});
```

---

### 10. 분석 및 모니터링
**목표**: 사용자 행동 추적 및 이탈 지점 파악

**추천 도구**:
- Google Analytics 4
- Mixpanel
- Hotjar (히트맵)

```typescript
// lib/analytics.ts
export const trackOnboardingStep = (step: string) => {
  gtag('event', 'onboarding_step', {
    step_name: step,
  });
};

// 사용
useEffect(() => {
  trackOnboardingStep('Section 1: 기본 정보');
}, []);

// 에러 추적
const handleSubmit = async () => {
  try {
    await completeOnboarding(user.id, formData);
  } catch (error) {
    gtag('event', 'onboarding_error', {
      error_message: error.message,
      error_code: error.code,
    });
  }
};
```

---

## 결론

### 프로젝트 현황 요약

**강점**:
✅ Supabase 마이그레이션 거의 완료
✅ K-Work 스타일의 외국인 특화 온보딩
✅ 타입 안전성이 높은 TypeScript 코드
✅ 모던한 기술 스택 (Next.js 15, React 19)
✅ Cloudinary 파일 저장소 통합
✅ 약관 시스템 구축 완료

**개선 필요**:
⚠️ 온보딩 시스템 이중화 정리
⚠️ Firebase 의존성 완전 제거
⚠️ 외국인등록번호 보안 강화
⚠️ 전화번호 인증 구현
⚠️ 에러 처리 및 사용자 피드백 개선
⚠️ 테스트 코드 작성

### 우선순위 작업

**High Priority (긴급)**:
1. Firebase 의존성 제거
2. 외국인등록번호 암호화
3. 에러 처리 개선

**Medium Priority (중요)**:
1. 온보딩 시스템 통합 (Quick 온보딩으로)
2. 전화번호 인증 구현
3. 프로필 편집 페이지 Supabase 마이그레이션

**Low Priority (선택)**:
1. Zod 유효성 검증 도입
2. 다국어 지원 (i18n)
3. 테스트 코드 작성

---

**작성일**: 2025-10-15
**작성자**: Claude Code
**버전**: 1.0
**분석 대상**: 개인 회원 온보딩 시스템 전체
