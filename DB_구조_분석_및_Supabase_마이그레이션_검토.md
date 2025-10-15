# 🔍 DB 구조 철저 분석 & Supabase 마이그레이션 검토 보고서

**작성일**: 2025년 10월 14일  
**프로젝트**: GlobalTalent - 외국인 구직자 매칭 플랫폼  
**현재 DB**: Firebase (Firestore + Authentication)

---

## 📊 1. 현재 Firebase 데이터 구조

### 1.1 Firestore Collections 구조

#### **Collection: `users` (구직자)**
```typescript
{
  uid: string;                        // Firebase Auth UID (Primary Key)
  email: string;
  userType: 'jobseeker';
  
  // Step 1: 기본 정보
  fullName: string;
  headline?: string;
  profileImageUrl?: string;           // Cloudinary URL
  
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // 통계
  applicationsCount?: number;
  profileViews?: number;
  savedJobs?: string[];
  messagesCount?: number;
}
```

#### **Collection: `companies` (기업)**
```typescript
{
  uid: string;                        // Firebase Auth UID (Primary Key)
  email: string;
  
  // Step 1: 기본 정보
  name: string;                       // 회사명 (한글)
  nameEn: string;                     // 회사명 (영문)
  registrationNumber: string;         // 사업자등록번호
  ceoName: string;
  established: string;                // 설립년도
  industry: string;
  employeeCount: string;
  phone: string;
  website?: string;
  
  // Step 2: 위치 정보
  location: string;
  address: string;
  offices?: Array<{
    name: string;
    nameEn?: string;
    address: string;
    addressEn?: string;
    detailAddress?: string;
    postalCode?: string;
    type: 'HQ' | 'Branch' | 'Lab' | 'Factory';
    employees?: number;
    lat?: number;
    lng?: number;
    mapUrl?: string;
    isMain?: boolean;
  }>;
  
  // Step 3: 회사 소개
  logo?: string;                      // Cloudinary URL
  bannerImage?: string;               // Cloudinary URL
  description: string;
  slogan?: string;
  vision?: string;
  mission?: string;
  
  // Step 4: 기술 & 복지
  techStack?: string[];
  benefits?: {
    workEnvironment: BenefitItem[];
    growth: BenefitItem[];
    healthWelfare: BenefitItem[];
    compensation: BenefitItem[];
    additional?: BenefitItem[];
  };
  revenue?: string;
  funding?: string;
  stats?: {
    currentEmployees?: number;
    lastYearEmployees?: number;
    avgSalary?: number;
    avgTenure?: number;
    femaleRatio?: number;
    foreignerRatio?: number;
    growthRate?: number;
    turnoverRate?: number;
    recommendRate?: number;
    interviewDifficulty?: number;
  };
  
  // Step 5: 채용 담당자
  recruiters?: Array<{
    name: string;
    position: string;
    email: string;
    phone?: string;
    profileImage?: string;
    isPrimary: boolean;
  }>;
  
  // 메타 정보
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'pending' | 'active' | 'suspended';
  profileCompleted: boolean;
  
  // 평가 정보 (자동 계산)
  rating?: number;
  reviewCount?: number;
  openPositions?: number;
}
```

#### **Collection: `jobs` (채용공고)** ⭐ **실제 코드 분석 완료**
```typescript
{
  id: string;                         // Auto-generated Document ID
  companyId: string;                  // companies 컬렉션 참조
  
  // 기업 정보 (중복 저장 - NoSQL 비정규화)
  company: {
    id: string;
    name: string;
    nameEn: string;
    logo: string;
    industry: string;
    location: string;
    employeeCount: string;
  };
  
  // 공고 기본 정보
  title: string;
  titleEn: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  
  // 급여 정보
  salary: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  
  // 상세 정보
  description: string;
  mainTasks: string[];                // 주요 업무
  requirements: string[];             // 필수 자격요건
  preferredQualifications: string[];  // 우대 사항
  benefits: string[];                 // 복리후생
  tags: string[];                     // 태그
  
  // 언어 요구사항
  visaSponsorship: boolean;
  languageRequirements: {
    korean: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
    english: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
  };
  
  // 근무 조건
  workConditions: {
    type: string;                     // 고용형태 (정규직, 계약직 등)
    probation: string;                // 수습 기간
    location: string;                 // 근무지
    workHours: string;                // 근무시간
    salary: string;                   // 급여 (문자열)
    startDate: string;                // 입사 예정일
  };
  
  // 🔥 과금 시스템 (중요!)
  posting: {
    tier: 'standard' | 'top' | 'premium';  // 공고 등급
    price: number;                    // 가격 (₩)
    duration: number;                 // 게재 기간 (일)
    vatAmount: number;                // 부가세
    totalAmount: number;              // 총액
  };
  
  // 🔥 결제 관리 (워크플로우)
  payment: {
    status: 'pending' | 'paid' | 'confirmed';
    requestedAt: Timestamp;           // 결제 요청 시각
    paidAt?: Timestamp;               // 결제 완료 시각
    confirmedAt?: Timestamp;          // 관리자 확인 시각
    billingContact: {
      name: string;                   // 결제 담당자
      phone: string;
    };
  };
  
  // 🔥 UI 노출 위치 (관리자가 할당)
  display?: {
    position: 'top' | 'middle' | 'bottom' | null;
    priority: number;                 // 우선순위 (낮을수록 상단)
    assignedAt?: Timestamp;           // 할당 시각
    assignedBy?: string;              // 할당한 관리자 ID
  };
  
  // 채용 담당자
  manager: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  
  // 메타 정보
  deadline: string;                   // 마감일
  postedAt: Timestamp;                // 게시일
  views: number;                      // 조회수
  applicants: number;                 // 지원자 수
  status: 'pending_payment' | 'active' | 'closed' | 'draft';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**⚠️ 현재 구조의 문제점:**
1. **데이터 중복**: company 정보를 통째로 중복 저장 (NoSQL 비정규화)
2. **복잡한 워크플로우**: 등록 → 결제 → 관리자 확인 → UI 위치 할당 (4단계)
3. **상태 관리 복잡**: payment.status와 status 필드 분리

#### **Collection: `talent_applications` (인재 채용 신청)**
```typescript
{
  id: string;                         // Auto-generated
  talentId: string;                   // users 컬렉션 참조
  talentName: string;
  companyName: string;
  position: string;
  message: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  notes?: string;                     // 관리자 메모
}
```

#### **Collection: `job_applications` (채용공고 지원)**
```typescript
{
  id: string;                         // Auto-generated
  jobId: string;                      // jobs 컬렉션 참조
  jobTitle: string;
  companyId: string;                  // companies 컬렉션 참조
  companyName: string;
  applicantId: string;                // users 컬렉션 참조
  applicantName: string;
  applicantEmail: string;
  message: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  notes?: string;
}
```

### 1.2 Firebase Authentication 구조
- **Email/Password** 인증
- **Google OAuth** 인증
- **사용자 타입**: `userType` 필드로 구분 ('company' | 'jobseeker')
- **UID**: 각 사용자의 고유 식별자 (Firestore의 Document ID로 사용)

### 1.3 Cloudinary (이미지 저장)
- 프로필 사진
- 회사 로고
- 회사 배너
- 이력서 파일 (예정)

### 1.4 실제 쿼리 패턴 분석 ⭐ **코드 분석 결과**

#### **🔍 패턴 1: 채용공고 목록 조회** (`app/jobs/page.tsx`)
```typescript
// 1. 활성 공고 전체 조회
const q = query(jobsRef, where('status', '==', 'active'));
const querySnapshot = await getDocs(q);

// 2. 클라이언트에서 display.position별 필터링 및 정렬
const top = allJobs
  .filter((job: any) => job.display?.position === 'top')
  .sort((a: any, b: any) => (a.display?.priority || 999) - (b.display?.priority || 999))
  .slice(0, 20);
```

**⚠️ 문제점**: 
- 모든 활성 공고를 읽어온 후 클라이언트에서 필터링 → **비효율적**
- display.position에 인덱스 필요하지만 Firestore는 중첩 필드 인덱스 제한
- 공고 1000개면 1000개 모두 읽기 → 비용 증가

#### **🔍 패턴 2: 기업 목록 + 채용공고 수 (N+1 문제!)** (`lib/firebase/company-service.ts`)
```typescript
// 1. 기업 목록 조회 (1번 쿼리)
const companies = await getDocs(q);

// 2. 각 기업의 채용공고 수를 별도 쿼리로 조회 (N번 쿼리!)
const companiesWithJobCount = await Promise.all(
  companiesData.map(async (company) => {
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', company.id),
      where('status', '==', 'active')
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    return { ...company, openPositions: jobsSnapshot.size };
  })
);
```

**⚠️ 치명적 문제**: 
- **N+1 쿼리 문제**: 기업 100개면 **101번의 쿼리** 발생
- Firestore 읽기 비용 폭증 가능성 (100개 기업 x 각 10개 공고 = 1,000 reads)
- 성능 저하 (순차 처리 시 10초 이상 소요 가능)

**Supabase로 전환 시 해결책**:
```sql
SELECT c.*, COUNT(j.id) as open_positions
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id AND j.status = 'active'
WHERE c.profile_completed = true
GROUP BY c.id;
```
→ **단 1번의 쿼리로 해결!**

#### **🔍 패턴 3: 기업 대시보드 공고 조회** (`app/company-dashboard/page.tsx`)
```typescript
const jobsQuery = query(
  collection(db, 'jobs'),
  where('companyId', '==', company.uid)
);
const querySnapshot = await getDocs(jobsQuery);

// 클라이언트에서 정렬 (orderBy 사용 불가)
jobsData.sort((a, b) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
});
```

**⚠️ 문제점**: 
- Firestore에서 `where + orderBy`를 동시에 사용하려면 복합 인덱스 필요
- 클라이언트 정렬로 우회 → 비효율적
- 공고 많아지면 메모리 부담

#### **🔍 패턴 4: 인재풀 전체 조회** (`lib/firebase/jobseeker-service.ts`)
```typescript
const usersRef = collection(db, 'users');
const querySnapshot = await getDocs(usersRef);  // 전체 조회!

const jobseekers = querySnapshot.docs
  .filter(doc => doc.data().onboardingCompleted && doc.data().userType === 'jobseeker')
  .map(doc => ({ uid: doc.id, ...doc.data() }));
```

**⚠️ 문제점**: 
- **전체 users 조회** 후 클라이언트 필터링
- 구직자가 10,000명이면 10,000번 읽기 발생
- 매우 비효율적이고 비용 많이 듦

**Supabase로 전환 시**:
```sql
SELECT * FROM users 
WHERE onboarding_completed = true 
AND user_type = 'jobseeker';
```
→ 필요한 데이터만 조회!

### 1.5 데이터 흐름 다이어그램

```
[사용자 회원가입]
     ↓
[Firebase Auth 계정 생성]
     ↓
[users 또는 companies 컬렉션에 문서 생성]
     ├─ userType: 'jobseeker' → users 컬렉션
     └─ userType: 'company' → companies 컬렉션
     ↓
[온보딩 프로세스]
     ├─ 구직자: 5단계 (기본정보 → 경력 → 기술 → 선호조건 → 완료)
     └─ 기업: 5단계 (기본정보 → 위치 → 소개 → 복지 → 채용담당자)
     ↓
[대시보드 접근]
     ├─ 구직자: 인재풀에 노출, 채용공고 지원
     └─ 기업: 채용공고 등록
     ↓
[채용공고 등록 워크플로우] (기업)
     ↓
1. 공고 작성 및 제출
   status: 'pending_payment'
   payment.status: 'pending'
     ↓
2. 결제 담당자에게 연락
   (박윤미 010-8014-5573)
     ↓
3. 결제 완료 (관리자가 수동 확인)
   payment.status: 'paid'
     ↓
4. 관리자가 결제 확인
   payment.status: 'confirmed'
     ↓
5. 관리자가 UI 위치 할당
   display.position: 'top' | 'middle' | 'bottom'
   display.priority: number
   status: 'active'
     ↓
6. 공고 게시 완료
   - 채용공고 목록에 노출
   - display.position과 priority에 따라 정렬
     ↓
[구직자가 지원]
     ↓
job_applications 컬렉션에 저장
status: 'pending' → 'reviewing' → 'accepted' | 'rejected'
```

### 1.6 현재 시스템의 성능 병목점 요약

| 문제 | 영향도 | 비용 | 해결 방법 (Supabase) |
|------|--------|------|---------------------|
| N+1 쿼리 (기업 목록) | 🔴 높음 | $$$$ | LEFT JOIN 사용 |
| 전체 users 조회 | 🔴 높음 | $$$$ | WHERE 절로 필터링 |
| 클라이언트 정렬/필터링 | 🟡 중간 | $$ | ORDER BY, WHERE 사용 |
| 데이터 중복 저장 | 🟡 중간 | $ | 정규화 + FK 사용 |
| 복잡한 중첩 필드 | 🟡 중간 | - | 별도 테이블로 분리 |
| 인덱스 제한 | 🟢 낮음 | - | 자유로운 인덱스 생성 |

---

## 🔥 2. 현재 Firebase 사용의 장단점

### ✅ 장점

1. **빠른 개발 속도**
   - 설정이 간단하고 SDK가 잘 되어있음
   - Next.js와의 통합이 매우 자연스러움
   - 실시간 업데이트 (Firestore Realtime)
   
2. **관리가 쉬움**
   - NoSQL 구조로 스키마 변경이 유연함
   - Firebase Console에서 GUI로 쉽게 관리
   - 자동 백업 및 복구
   
3. **통합 서비스**
   - Authentication + Database + Storage + Hosting 등 올인원
   - 서비스 간 연동이 자연스러움
   - Google Cloud 인프라 활용
   
4. **확장성**
   - 서버리스 아키텍처
   - 자동 스케일링
   - 트래픽에 따른 자동 분산

### ❌ 단점

1. **비용 문제**
   - 읽기/쓰기 작업당 과금 (Document Read/Write 단위)
   - 대량의 쿼리 시 비용 급증 가능
   - 예측 불가능한 요금
   
2. **쿼리 제한**
   - 복잡한 쿼리가 어려움 (JOIN 불가)
   - 인덱스 사전 정의 필요
   - 정렬과 필터링을 동시에 적용하기 어려움
   
3. **데이터 중복**
   - NoSQL 특성상 데이터 중복 저장 필요
   - 예: `jobTitle`, `companyName` 등을 여러 곳에 중복 저장
   - 데이터 정합성 관리가 어려움
   
4. **벤더 락인 (Vendor Lock-in)**
   - Firebase에 종속됨
   - 다른 DB로 마이그레이션 어려움
   - 특정 기능이 Firebase에만 의존

5. **복잡한 분석 작업**
   - 통계 쿼리가 제한적
   - BI 도구와의 연동이 어려움
   - 대시보드 생성 불편

---

## 🐘 3. Supabase로 전환 시 장단점
### ✅ Supabase의 장점

1. **PostgreSQL 기반**
   - 관계형 DB의 모든 기능 사용 가능
   - JOIN, 트랜잭션, 외래키 등 완벽 지원
   - 복잡한 쿼리 자유롭게 작성 가능
   
2. **예측 가능한 비용**
   - 스토리지 + 대역폭 기반 과금
   - 읽기/쓰기 횟수에 영향 없음
   - Free Tier: 500MB DB + 1GB 파일 저장
   - Pro: $25/월 (8GB DB + 100GB 파일)
   
3. **강력한 쿼리 기능**
   - SQL의 모든 기능 사용
   - 복잡한 통계 쿼리 가능
   - PostgREST로 자동 REST API 생성
   - GraphQL 지원 (pg_graphql)
   
4. **오픈소스**
   - 완전한 오픈소스 (벤더 락인 없음)
   - 필요시 자체 호스팅 가능
   - 커뮤니티 활발
   
5. **통합 서비스**
   - Database (PostgreSQL)
   - Authentication (다양한 OAuth 지원)
   - Storage (파일 업로드)
   - Edge Functions (서버리스)
   - Realtime (실시간 구독)
   
6. **개발자 친화적**
   - SQL 스튜디오 제공 (GUI)
   - 자동 API 생성
   - TypeScript SDK 우수
   - Next.js와의 완벽한 통합

7. **분석 및 보고**
   - SQL로 직접 통계 쿼리
   - BI 도구와 쉽게 연동
   - 관리자 대시보드 구현이 훨씬 쉬움

### ❌ Supabase의 단점

1. **마이그레이션 비용**
   - 초기 마이그레이션 작업 필요
   - 모든 서비스 코드 재작성
   - 데이터 이전 작업
   - 테스트 기간 필요
   
2. **학습 곡선**
   - Firebase에 비해 설정이 복잡
   - SQL 지식 필요
   - 관계형 DB 설계 지식 필요
   
3. **Realtime 기능**
   - Firebase보다 제한적 (개선 중)
   - 복잡한 실시간 기능은 추가 작업 필요
   
4. **초기 설정**
   - 스키마 설계 필수
   - 마이그레이션 스크립트 작성 필요
   - Row Level Security 설정 필요

---

## 🔄 4. Supabase 마이그레이션 시 DB 스키마 설계

### 4.1 테이블 구조

#### **Table: `users` (구직자)**
```sql
CREATE TABLE users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,           -- Firebase Auth UID (마이그레이션용)
  email TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'jobseeker',
  
  -- Step 1: 기본 정보
  full_name TEXT NOT NULL,
  headline TEXT,
  profile_image_url TEXT,
  
  -- Step 4: 선호 조건 (단순 필드)
  work_type TEXT,
  company_size TEXT,
  visa_sponsorship BOOLEAN DEFAULT false,
  remote_work TEXT,
  introduction TEXT,
  
  -- 이력서
  resume_file_url TEXT,
  resume_file_name TEXT,
  resume_uploaded_at TIMESTAMPTZ,
  
  -- 메타 정보
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 통계
  applications_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### **Table: `user_skills` (구직자 기술)**
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_name ON user_skills(skill_name);
```

#### **Table: `user_languages` (구직자 언어)**
```sql
CREATE TABLE user_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  proficiency TEXT,                    -- BASIC | INTERMEDIATE | FLUENT | NATIVE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, language_name)
);

CREATE INDEX idx_user_languages_user_id ON user_languages(user_id);
```

#### **Table: `user_experiences` (경력)**
```sql
CREATE TABLE user_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_experiences_user_id ON user_experiences(user_id);
CREATE INDEX idx_user_experiences_current ON user_experiences(is_current);
```

#### **Table: `user_educations` (학력)**
```sql
CREATE TABLE user_educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_educations_user_id ON user_educations(user_id);
```

#### **Table: `user_desired_positions` (희망 직무)**
```sql
CREATE TABLE user_desired_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, position_name)
);

CREATE INDEX idx_user_desired_positions_user_id ON user_desired_positions(user_id);
```

#### **Table: `user_preferred_locations` (희망 근무지)**
```sql
CREATE TABLE user_preferred_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, location_name)
);

CREATE INDEX idx_user_preferred_locations_user_id ON user_preferred_locations(user_id);
```

#### **Table: `user_salary_range` (희망 연봉)**
```sql
CREATE TABLE user_salary_range (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  min_salary INTEGER,
  max_salary INTEGER,
  currency TEXT DEFAULT 'KRW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_salary_range_user_id ON user_salary_range(user_id);
```

---

#### **Table: `companies` (기업)**
```sql
CREATE TABLE companies (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,           -- Firebase Auth UID
  email TEXT UNIQUE NOT NULL,
  
  -- Step 1: 기본 정보
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  ceo_name TEXT NOT NULL,
  established TEXT NOT NULL,
  industry TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  
  -- Step 2: 위치 정보
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Step 3: 회사 소개
  logo TEXT,
  banner_image TEXT,
  description TEXT NOT NULL,
  slogan TEXT,
  vision TEXT,
  mission TEXT,
  
  -- Step 4: 비즈니스 정보
  revenue TEXT,
  funding TEXT,
  
  -- 메타 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',      -- pending | active | suspended
  profile_completed BOOLEAN DEFAULT false,
  
  -- 평가 정보
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  open_positions INTEGER DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_profile_completed ON companies(profile_completed);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);
```

#### **Table: `company_tech_stack` (기업 기술 스택)**
```sql
CREATE TABLE company_tech_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tech_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, tech_name)
);

CREATE INDEX idx_company_tech_stack_company_id ON company_tech_stack(company_id);
CREATE INDEX idx_company_tech_stack_tech_name ON company_tech_stack(tech_name);
```

#### **Table: `company_benefits` (기업 복지)**
```sql
CREATE TABLE company_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,             -- workEnvironment | growth | healthWelfare | compensation
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_benefits_company_id ON company_benefits(company_id);
CREATE INDEX idx_company_benefits_category ON company_benefits(category);
```

#### **Table: `company_stats` (기업 통계)**
```sql
CREATE TABLE company_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  current_employees INTEGER,
  last_year_employees INTEGER,
  avg_salary INTEGER,
  avg_tenure DECIMAL(3,1),
  female_ratio DECIMAL(5,2),
  foreigner_ratio DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  turnover_rate DECIMAL(5,2),
  recommend_rate DECIMAL(5,2),
  interview_difficulty DECIMAL(2,1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_stats_company_id ON company_stats(company_id);
```

#### **Table: `company_recruiters` (채용 담당자)**
```sql
CREATE TABLE company_recruiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_image TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_recruiters_company_id ON company_recruiters(company_id);
CREATE INDEX idx_company_recruiters_is_primary ON company_recruiters(is_primary);
```

#### **Table: `company_offices` (사무실 위치)**
```sql
CREATE TABLE company_offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  address TEXT NOT NULL,
  address_en TEXT,
  detail_address TEXT,
  postal_code TEXT,
  office_type TEXT NOT NULL,          -- HQ | Branch | Lab | Factory
  employees INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  map_url TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_offices_company_id ON company_offices(company_id);
CREATE INDEX idx_company_offices_is_main ON company_offices(is_main);
```

---

#### **Table: `jobs` (채용공고)** ⭐ **과금 시스템 포함**
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- 공고 기본 정보
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,      -- FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP
  experience_level TEXT NOT NULL,     -- ENTRY | JUNIOR | MID | SENIOR | EXECUTIVE
  
  -- 급여 정보
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'KRW',
  salary_negotiable BOOLEAN DEFAULT false,
  
  -- 상세 정보
  description TEXT NOT NULL,
  visa_sponsorship BOOLEAN DEFAULT false,
  korean_level TEXT,                  -- NONE | BASIC | INTERMEDIATE | FLUENT | NATIVE
  english_level TEXT,
  
  -- 🔥 과금 정보
  posting_tier TEXT NOT NULL,         -- standard | top | premium
  posting_price INTEGER NOT NULL,     -- 공고 가격
  posting_duration INTEGER NOT NULL,  -- 게재 기간 (일)
  posting_vat_amount INTEGER NOT NULL,-- 부가세
  posting_total_amount INTEGER NOT NULL, -- 총액
  
  -- 🔥 결제 정보
  payment_status TEXT DEFAULT 'pending', -- pending | paid | confirmed
  payment_requested_at TIMESTAMPTZ DEFAULT NOW(),
  payment_paid_at TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  payment_billing_contact_name TEXT,
  payment_billing_contact_phone TEXT,
  
  -- 🔥 UI 노출 위치 (관리자 할당)
  display_position TEXT,              -- top | middle | bottom | NULL
  display_priority INTEGER,           -- 우선순위 (낮을수록 상단)
  display_assigned_at TIMESTAMPTZ,
  display_assigned_by TEXT,           -- 관리자 ID
  
  -- 메타 정보
  deadline DATE,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  applicants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending_payment', -- pending_payment | active | closed | draft
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_jobs_payment_status ON jobs(payment_status);  -- 🔥 결제 상태 인덱스
CREATE INDEX idx_jobs_display_position_priority ON jobs(display_position, display_priority);  -- 🔥 UI 정렬용
```

#### **Table: `job_main_tasks` (주요 업무)**
```sql
CREATE TABLE job_main_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_main_tasks_job_id ON job_main_tasks(job_id);
```

#### **Table: `job_requirements` (채용공고 자격요건)**
```sql
CREATE TABLE job_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  is_preferred BOOLEAN DEFAULT false,  -- false: 필수, true: 우대
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_requirements_job_id ON job_requirements(job_id);
```

#### **Table: `job_manager` (채용 담당자 정보)**
```sql
CREATE TABLE job_manager (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_manager_job_id ON job_manager(job_id);
```

#### **Table: `job_work_conditions` (근무 조건)**
```sql
CREATE TABLE job_work_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  probation TEXT,                     -- 수습 기간
  work_hours TEXT,                    -- 근무 시간
  start_date TEXT,                    -- 입사 예정일
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_work_conditions_job_id ON job_work_conditions(job_id);
```

#### **Table: `job_benefits` (채용공고 복리후생)**
```sql
CREATE TABLE job_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_benefits_job_id ON job_benefits(job_id);
```

#### **Table: `job_tags` (채용공고 태그)**
```sql
CREATE TABLE job_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, tag_name)
);

CREATE INDEX idx_job_tags_job_id ON job_tags(job_id);
CREATE INDEX idx_job_tags_tag_name ON job_tags(tag_name);
```

---

#### **Table: `talent_applications` (인재 채용 신청)**
```sql
CREATE TABLE talent_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  talent_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending | approved | rejected | contacted
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talent_applications_talent_id ON talent_applications(talent_id);
CREATE INDEX idx_talent_applications_status ON talent_applications(status);
CREATE INDEX idx_talent_applications_created_at ON talent_applications(created_at DESC);
```

#### **Table: `job_applications` (채용공고 지원)**
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending | reviewing | accepted | rejected
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_company_id ON job_applications(company_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
```

---

### 4.2 관계형 DB의 장점 활용

#### **복잡한 쿼리 예시**

**1. 특정 기술을 가진 구직자 찾기 (JOIN 활용)**
```sql
SELECT u.*, 
       array_agg(DISTINCT s.skill_name) as skills,
       array_agg(DISTINCT l.language_name) as languages
FROM users u
LEFT JOIN user_skills s ON u.id = s.user_id
LEFT JOIN user_languages l ON u.id = l.user_id
WHERE s.skill_name IN ('React', 'TypeScript')
AND u.onboarding_completed = true
GROUP BY u.id;
```

**2. 기업의 평균 연봉과 채용공고 수 (JOIN + 집계)**
```sql
SELECT c.id, 
       c.name,
       cs.avg_salary,
       COUNT(j.id) as active_jobs
FROM companies c
LEFT JOIN company_stats cs ON c.id = cs.company_id
LEFT JOIN jobs j ON c.id = j.company_id AND j.status = 'active'
WHERE c.profile_completed = true
GROUP BY c.id, c.name, cs.avg_salary
ORDER BY active_jobs DESC;
```

**3. 인재 매칭 (복잡한 조건)**
```sql
SELECT u.id, 
       u.full_name,
       COUNT(DISTINCT us.skill_name) as matched_skills,
       AVG(usr.min_salary) as desired_salary
FROM users u
JOIN user_skills us ON u.id = us.user_id
JOIN job_tags jt ON us.skill_name = jt.tag_name
JOIN jobs j ON jt.job_id = j.id
LEFT JOIN user_salary_range usr ON u.id = usr.user_id
WHERE j.id = $1
AND u.onboarding_completed = true
GROUP BY u.id
HAVING COUNT(DISTINCT us.skill_name) >= 3
ORDER BY matched_skills DESC
LIMIT 10;
```

---

## 📦 5. 마이그레이션 계획

### 5.1 단계별 마이그레이션 프로세스

#### **Phase 1: 준비 단계 (1-2일)**
1. Supabase 프로젝트 생성
2. 스키마 설계 완료 및 검토
3. 마이그레이션 스크립트 작성
4. 테스트 데이터로 검증

#### **Phase 2: 데이터 마이그레이션 (2-3일)**
1. Firebase에서 데이터 Export
2. 데이터 변환 스크립트 실행
3. Supabase로 Import
4. 데이터 정합성 검증
5. 인덱스 생성 및 최적화

#### **Phase 3: 코드 리팩토링 (3-5일)**
1. Supabase Client 설치 및 설정
2. Firebase 코드를 Supabase로 교체
   - `auth-service.ts` → Supabase Auth
   - `company-service.ts` → Supabase DB
   - `jobseeker-service.ts` → Supabase DB
   - `application-service.ts` → Supabase DB
3. 모든 CRUD 함수 재작성
4. Row Level Security (RLS) 정책 적용

#### **Phase 4: 테스트 (2-3일)**
1. 단위 테스트
2. 통합 테스트
3. 성능 테스트
4. 보안 테스트

#### **Phase 5: 배포 및 모니터링 (1-2일)**
1. 스테이징 환경 배포
2. 프로덕션 배포
3. 모니터링 및 버그 수정

**총 예상 기간: 9-15일 (2-3주)**

---

### 5.2 데이터 마이그레이션 스크립트 예시

```typescript
// migrate-firebase-to-supabase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  const usersSnapshot = await getDocs(collection(firestore, 'users'));
  
  for (const doc of usersSnapshot.docs) {
    const firebaseData = doc.data();
    
    // 1. users 테이블에 기본 정보 저장
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        uid: doc.id,
        email: firebaseData.email,
        full_name: firebaseData.fullName,
        headline: firebaseData.headline,
        profile_image_url: firebaseData.profileImageUrl,
        // ... 기타 필드
      })
      .select()
      .single();
    
    if (userError) {
      console.error(`❌ Error migrating user ${doc.id}:`, userError);
      continue;
    }
    
    // 2. skills 테이블에 저장
    if (firebaseData.skills) {
      const skillsData = firebaseData.skills.map((skill: string) => ({
        user_id: user.id,
        skill_name: skill
      }));
      
      await supabase.from('user_skills').insert(skillsData);
    }
    
    // 3. experiences 테이블에 저장
    if (firebaseData.experiences) {
      const experiencesData = firebaseData.experiences.map((exp: any) => ({
        user_id: user.id,
        company: exp.company,
        position: exp.position,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.current,
        description: exp.description
      }));
      
      await supabase.from('user_experiences').insert(experiencesData);
    }
    
    // ... 나머지 관련 테이블들도 동일하게 처리
    
    console.log(`✅ User ${firebaseData.fullName} migrated`);
  }
  
  console.log('✅ Users migration completed!');
}

async function migrateCompanies() {
  // companies 마이그레이션
  // ... 유사한 로직
}

async function migrateJobs() {
  // jobs 마이그레이션
  // ... 유사한 로직
}

async function main() {
  try {
    await migrateUsers();
    await migrateCompanies();
    await migrateJobs();
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

main();
```

---

## 💰 6. 비용 비교

### Firebase (현재)

#### **Firestore 비용**
- 읽기: $0.06 / 100,000 documents
- 쓰기: $0.18 / 100,000 documents
- 삭제: $0.02 / 100,000 documents
- 저장: $0.18 / GB / 월

**예상 사용량 (월 1만명 활성 사용자 기준)**
- 읽기: 1,000만 reads = $6.00
- 쓰기: 200만 writes = $3.60
- 저장: 5GB = $0.90
- **월 총액: ~$10-15**

문제는 **트래픽이 급증하면 비용도 급증**

#### **Firebase Authentication**
- 무료 (SMS 제외)

#### **총 Firebase 비용: $10-15/월 (소규모)**

---

### Supabase

#### **Free Tier**
- 데이터베이스: 500MB
- 파일 저장소: 1GB
- 대역폭: 5GB
- 완전 무료

#### **Pro Tier ($25/월)**
- 데이터베이스: 8GB
- 파일 저장소: 100GB
- 대역폭: 250GB
- 무제한 API 요청
- 일일 백업

#### **Team Tier ($599/월)**
- 대규모 서비스용

**결론: 월 1만명까지는 Free Tier로도 충분, 그 이후 Pro로 업그레이드해도 $25로 고정**

---

## 🎯 7. 최종 권장 사항

### ✅ **Supabase로 마이그레이션을 강력히 권장합니다!**

#### 이유:

**1. 비용 효율성 🔥**
- Firebase: 읽기/쓰기 횟수에 따라 비용 급증 가능
- Supabase: 고정 비용 ($25/월), 무제한 쿼리
- **장기적으로 훨씬 저렴함**

**2. 쿼리 유연성 🔥**
현재 프로젝트는 복잡한 필터링과 매칭이 핵심:
- 인재 검색 (기술 + 경력 + 위치 필터링)
- 채용공고 매칭 (AI 추천)
- 통계 대시보드 (관리자 페이지)

→ **PostgreSQL의 강력한 쿼리 기능이 필수적**

**3. 데이터 정합성 🔥**
- 외래키 제약조건으로 데이터 무결성 보장
- 트랜잭션 지원으로 안전한 데이터 처리
- 데이터 중복 최소화

**4. 확장성 🔥**
- 향후 추가될 기능 (메시징, 알림, 통계 등)에 유리
- BI 도구 연동 쉬움
- 복잡한 분석 쿼리 가능

**5. 개발 생산성 🔥**
- SQL 스튜디오로 쉬운 데이터 관리
- 자동 REST API 생성
- TypeScript 타입 자동 생성
- RLS로 보안 강화

---

### 🚀 실행 계획

#### **즉시 시작 가능한 옵션 A: 완전 전환**
**기간**: 2-3주  
**비용**: 개발 시간만  
**장점**: 장기적으로 최선  
**단점**: 초기 작업량 큼  

**단계**:
1. Supabase 프로젝트 생성
2. 스키마 설계 및 마이그레이션
3. 코드 리팩토링
4. 테스트 및 배포

---

#### **안전한 옵션 B: 점진적 전환**
**기간**: 4-6주  
**비용**: 개발 시간 + 병행 운영  
**장점**: 위험 최소화  
**단점**: 관리 복잡도 증가  

**단계**:
1. Supabase 설정 및 스키마 구축
2. **신규 기능을 Supabase로 개발** (예: 메시징)
3. 기존 기능을 하나씩 이전
4. Firebase 완전 제거

---

#### **보수적 옵션 C: Firebase 유지**
**기간**: -  
**비용**: Firebase 종량제  
**장점**: 현재 안정적  
**단점**: 장기 비용 및 제약  

Firebase를 유지하되:
1. 복잡한 쿼리가 필요한 부분만 별도 처리
2. 데이터 중복 최소화
3. 인덱스 최적화

**⚠️ 권장하지 않음 - 문제가 점점 커질 것**

---

## 📋 8. 체크리스트

### Supabase 마이그레이션 체크리스트

#### **준비 단계**
- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 스키마 설계 검토
- [ ] 팀원과 논의

#### **마이그레이션 단계**
- [ ] 테이블 생성 (SQL 실행)
- [ ] 인덱스 생성
- [ ] RLS 정책 설정
- [ ] 데이터 마이그레이션 스크립트 작성
- [ ] Firebase 데이터 Export
- [ ] Supabase로 Import
- [ ] 데이터 검증

#### **코드 리팩토링 단계**
- [ ] Supabase Client 설치
- [ ] Auth 서비스 전환
- [ ] Company 서비스 전환
- [ ] Jobseeker 서비스 전환
- [ ] Application 서비스 전환
- [ ] Admin 서비스 전환
- [ ] 이미지 저장소 (Cloudinary 유지 또는 Supabase Storage)

#### **테스트 단계**
- [ ] 로그인/회원가입 테스트
- [ ] 온보딩 프로세스 테스트
- [ ] 프로필 수정 테스트
- [ ] 채용공고 CRUD 테스트
- [ ] 인재 검색 테스트
- [ ] 지원/신청 테스트
- [ ] 관리자 기능 테스트

#### **배포 단계**
- [ ] 스테이징 환경 배포
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 백업 설정
- [ ] Firebase 연결 해제

---

## 🎓 9. Supabase 학습 자료

### 공식 문서
- https://supabase.com/docs
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/auth

### 유용한 가이드
- PostgreSQL 기초: https://www.postgresqltutorial.com/
- Supabase + Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- RLS 가이드: https://supabase.com/docs/guides/auth/row-level-security

### 예제 프로젝트
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples

---

## 💬 10. 자주 묻는 질문 (FAQ)

### Q1: 마이그레이션 중 서비스 중단이 있나요?
**A**: 옵션 B (점진적 전환)을 선택하면 서비스 중단 없이 가능합니다. 새로운 기능은 Supabase로 개발하고, 기존 기능을 하나씩 이전하면 됩니다.

### Q2: Firebase Authentication은 어떻게 하나요?
**A**: Supabase도 자체 Authentication 시스템이 있습니다. 기존 사용자 데이터를 Supabase Auth로 마이그레이션하거나, Firebase Auth를 계속 사용하면서 DB만 Supabase로 전환할 수도 있습니다.

### Q3: 기존 Firebase 데이터는 어떻게 하나요?
**A**: 마이그레이션 스크립트를 작성해서 모든 데이터를 Supabase로 이전합니다. 데이터 정합성 검증 후 Firebase를 제거합니다.

### Q4: 비용이 정말 저렴해지나요?
**A**: 네! Firebase는 읽기/쓰기 횟수에 비례하지만, Supabase는 고정 비용입니다. 사용자가 늘어날수록 Supabase가 훨씬 저렴합니다.

### Q5: 개발 난이도는 어떤가요?
**A**: PostgreSQL을 처음 사용한다면 초기 학습 곡선이 있지만, 장기적으로는 더 쉽고 강력합니다. 특히 복잡한 쿼리를 작성할 때 Firebase보다 훨씬 직관적입니다.

### Q6: Cloudinary는 계속 사용하나요?
**A**: 선택 가능합니다:
- **옵션 1**: Cloudinary 유지 (추천) - 이미지 최적화 기능 우수
- **옵션 2**: Supabase Storage로 전환 - 통합 관리 가능

### Q7: 실시간 기능은 어떻게 하나요?
**A**: Supabase도 Realtime 기능을 지원합니다. PostgreSQL의 변경사항을 실시간으로 구독할 수 있습니다.

```typescript
// Supabase Realtime 예시
const channel = supabase
  .channel('job_applications')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'job_applications' },
    (payload) => {
      console.log('New application:', payload.new);
    }
  )
  .subscribe();
```

---

## 🎯 11. 결론 및 액션 아이템

### 핵심 요약
1. ✅ **Firebase 현황**: 기본적으로 잘 작동하지만, 쿼리 제한과 비용 문제 존재
2. ✅ **Supabase 장점**: 강력한 쿼리, 예측 가능한 비용, 데이터 정합성
3. ✅ **마이그레이션**: 2-3주 소요, 장기적으로 큰 이득
4. ✅ **비용**: Firebase 변동 비용 → Supabase 고정 $25/월

### 🚀 즉시 시작할 액션
1. **이 문서 검토 후 결정**
2. **Supabase 계정 생성** (무료)
3. **테스트 프로젝트로 검증**
4. **본격 마이그레이션 시작**

### 📅 타임라인
- **Week 1-2**: 스키마 설계 + 데이터 마이그레이션
- **Week 3-4**: 코드 리팩토링 + 테스트
- **Week 5**: 배포 및 모니터링

### 💡 최종 의견
**지금 마이그레이션하는 것을 강력히 권장합니다!**

이유:
- 프로젝트가 아직 작아서 마이그레이션이 쉬움
- 향후 기능 추가 시 PostgreSQL이 필수적
- 장기 비용 절감
- 더 나은 개발 경험

Firebase를 유지하면 나중에 더 큰 문제가 됩니다.

---

## 📞 다음 단계

이 보고서를 검토한 후:

1. **결정**: Firebase 유지 vs Supabase 전환
2. **일정**: 마이그레이션 시작 시점 결정
3. **실행**: 체크리스트 따라 진행

질문이 있으면 언제든지 물어보세요! 🚀

---

**작성자**: AI Assistant  
**작성일**: 2025년 10월 14일  
**문서 버전**: 1.0