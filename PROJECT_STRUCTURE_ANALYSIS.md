# GlobalTalent 프로젝트 구조 철저 분석

> **분석 일시**: 2025-10-20
> **브랜치**: feature/job-posting-wysiwyg-editor
> **프로젝트 이름**: GlobalTalent (20250919jobmatch)
> **목적**: 글로벌 인재와 한국 기업 매칭 플랫폼

---

## 📊 프로젝트 개요

### 핵심 통계
```
총 TypeScript 파일: 139개
- Pages (app/): 32개
- Components (components/): 15개 디렉토리
- Services (lib/): 23개
- Hooks (hooks/): 9개
- Types (types/): 9개
- Migrations (supabase/): 4개
```

### 기술 스택
```json
{
  "프레임워크": "Next.js 15.5.3 (App Router)",
  "React": "19.1.0",
  "TypeScript": "5.x (엄격 모드)",
  "데이터베이스": "Supabase (PostgreSQL)",
  "인증": "Supabase Auth (OAuth: Google, Kakao, Naver)",
  "파일업로드": "Cloudinary",
  "에디터": "TipTap (WYSIWYG)",
  "스타일링": "Tailwind CSS",
  "상태관리": "React Hooks + Context API",
  "아이콘": "lucide-react"
}
```

---

## 🏗️ 아키텍처 구조

### 1. 페이지 구조 (App Router)
```
app/
├── page.tsx                        # 메인 페이지 (공고 목록)
├── login/page.tsx                  # 통합 로그인 (개인/기업 탭)
├── signup/
│   ├── page.tsx                   # 회원가입 선택
│   ├── company/page.tsx           # 기업 회원가입
│   └── jobseeker/page.tsx         # 개인 회원가입
├── onboarding/job-seeker/
│   └── quick/page.tsx             # 개인 회원 온보딩 (4단계)
├── company-dashboard/
│   ├── page.tsx                   # 기업 대시보드 (6개 탭)
│   ├── jobs/
│   │   ├── create/page.tsx        # 채용공고 작성 (2단계 WYSIWYG)
│   │   └── edit/[id]/page.tsx     # 채용공고 수정
│   └── edit/                      # 기업 정보 수정 (6개 페이지)
├── jobseeker-dashboard/page.tsx   # 개인 대시보드
├── profile/edit/                  # 프로필 수정 (6개 페이지)
├── jobs/
│   ├── page.tsx                   # 채용공고 목록 (3섹션 그리드)
│   └── [id]/page.tsx              # 채용공고 상세
├── talent/
│   ├── page.tsx                   # 인재풀 목록
│   └── [id]/page.tsx              # 인재 프로필 상세
├── admin/page.tsx                 # 어드민 대시보드
└── api/                           # API Routes
    ├── auth/naver/route.ts        # 네이버 OAuth 콜백
    ├── cloudinary/generate-signature/route.ts
    ├── upload-image/route.ts
    └── delete-account/route.ts
```

### 2. 컴포넌트 구조
```
components/
├── ui/                            # 재사용 UI 컴포넌트
│   └── form/                      # 폼 컴포넌트 라이브러리
│       ├── FormInput.tsx          # 기본 입력 (102줄)
│       ├── FormSelect.tsx         # 선택박스 (110줄)
│       ├── FormDatePicker.tsx     # 날짜 선택 (115줄)
│       ├── PhoneInput.tsx         # 전화번호 3칸 (155줄)
│       ├── AddressSearchInput.tsx # 카카오 주소 검색 (147줄)
│       └── LanguageLevelSelect.tsx # 언어 수준 (68줄)
│
├── company-signup/                # 기업 회원가입 섹션 (7개)
│   ├── Section1BusinessInfo.tsx  # 사업자 정보
│   ├── Section2CompanyInfo.tsx   # 기업 정보
│   ├── Section3Images.tsx        # 이미지 업로드
│   ├── Section4Benefits.tsx      # 복지 정보
│   ├── Section5Manager.tsx       # 담당자 + 계정 (통합)
│   ├── Section6Address.tsx       # 주소 정보
│   └── Section7Account.tsx       # (Section5로 통합됨)
│
├── job-create/                    # 채용공고 작성
│   ├── metadata/                  # Step 1: 정형 정보
│   │   └── JobMetadataForm.tsx
│   ├── editor/                    # Step 2: 자유 컨텐츠 (WYSIWYG)
│   │   ├── JobContentEditor.tsx  # TipTap 에디터
│   │   ├── EditorToolbar.tsx     # 툴바 (볼드, 이미지 등)
│   │   └── ImageUploader.tsx     # Cloudinary 업로드
│   ├── BasicInfoSection.tsx      # 기본 정보 (90줄)
│   ├── SalarySection.tsx         # 급여 정보
│   ├── LanguageSection.tsx       # 언어/비자
│   ├── WorkConditionsSection.tsx # 근무 조건
│   ├── PostingTierSection.tsx    # 과금 정보
│   ├── RecruiterInfoSection.tsx  # 담당자 (145줄)
│   └── JobPreviewModal.tsx       # 미리보기 모달
│
├── company-dashboard/             # 기업 대시보드
│   └── tabs/
│       └── JobsTab.tsx            # 공고 관리 탭 (403줄)
│
├── admin/                         # 어드민 시스템
│   ├── JobsTab.tsx                # 공고 승인/관리
│   ├── JobPositionAssignModal.tsx # UI 위치 할당 모달
│   └── JobGridLayoutEditor.tsx    # 그리드 레이아웃 편집기 (835줄)
│
├── jobseeker-dashboard/           # 개인 대시보드
│   ├── ProfileChecklist.tsx      # 프로필 완성도 (8개 항목)
│   ├── PreferencesCard.tsx       # 희망 조건 카드
│   └── AccountSettings.tsx       # 계정 설정
│
├── jobseeker-onboarding/          # 개인 온보딩
│   ├── BasicInfoSection.tsx      # 기본 정보
│   └── AccountSection.tsx        # 계정 정보 (209줄)
│
├── onboarding/job-seeker/         # 온보딩 4단계
│   ├── Step1_Profile.tsx         # 프로필 기본
│   ├── Step2_Experience.tsx      # 경력/학력 (471줄)
│   ├── Step3_Skills.tsx          # 스킬/언어 (365줄)
│   └── Step4_Preferences.tsx     # 희망 조건 (394줄)
│
├── signup/                        # 회원가입 공통
│   └── OAuthButtons.tsx          # OAuth 버튼 (구글, 카카오, 네이버)
│
└── Header.tsx                     # 공통 헤더
```

### 3. 서비스 레이어 (lib/supabase/)
```
lib/supabase/
├── config.ts                      # Supabase 클라이언트 설정
├── company-service.ts             # 기업 회원 서비스 (11KB)
├── company-types.ts               # 기업 회원 타입 (17KB)
├── jobseeker-auth.ts              # 개인 회원 인증
├── jobseeker-onboarding.ts        # 개인 온보딩 저장
├── jobseeker-profile.ts           # 개인 프로필 CRUD
├── jobseeker-service.ts           # 개인 회원 서비스
├── jobseeker-types.ts             # 개인 회원 타입
├── jobseeker-utils.ts             # 개인 회원 유틸
├── job-service.ts                 # 채용공고 CRUD (10KB)
├── public-job-service.ts          # 공개 공고 조회 (8KB)
├── talent-service.ts              # 인재풀 서비스 (7KB)
├── admin-service.ts               # 어드민 서비스 (12KB)
└── profile-checklist.ts           # 프로필 체크리스트 (8KB)
```

### 4. 커스텀 훅 (hooks/)
```
hooks/
├── useSignup.ts                   # 회원가입 로직 (534줄)
├── useJobseekerOnboarding.ts     # 개인 온보딩 (239줄)
├── useCompanyAuth.ts              # 기업 인증
├── useJobForm.ts                  # 공고 작성 폼
├── useJobFormValidation.ts       # 공고 검증
├── useCompanyJobs.ts              # 기업 공고 목록
├── useDashboardData.ts            # 대시보드 데이터
├── useAccountDeletion.ts          # 계정 삭제
└── useDeleteAccount.ts            # 계정 삭제 UI
```

### 5. 타입 정의 (types/)
```
types/
├── company-dashboard.types.ts     # 기업 대시보드 (3.3KB)
├── jobseeker-dashboard.types.ts  # 개인 대시보드 (1.8KB)
├── jobseeker-onboarding.types.ts # 개인 온보딩 (12KB)
├── job-form.types.ts              # 공고 작성 폼 (3.2KB)
├── job-content.types.ts           # 공고 컨텐츠 (WYSIWYG)
├── form-ui.types.ts               # 공통 폼 UI (2.3KB)
├── admin.types.ts                 # 어드민 (788B)
├── signup.types.ts                # 회원가입 (579B)
└── index.ts                       # 타입 통합 export
```

---

## 🗄️ 데이터베이스 구조 (Supabase)

### 주요 테이블
```sql
-- 회원 테이블
users                              -- 개인 회원 (구직자)
├── id (UUID, PK)
├── email, full_name, phone
├── profile_image_url, headline
├── desired_job_category           -- 희망 직군
├── introduction, work_type
├── skills[], languages[]
├── visa_sponsorship, remote_work
└── profile_completion (INTEGER)

companies                          -- 기업 회원
├── id (UUID, PK)
├── name, name_en, email
├── logo, company_image
├── registration_number, ceo_name
├── industry, employee_count
├── address, location
├── manager_name, manager_phone
└── status (active/pending/inactive)

-- 채용공고
jobs                               -- 채용 공고
├── id (UUID, PK)
├── company_id (FK → companies)
├── title, department, location
├── status (draft/pending_approval/active/closed)
├── deadline, views, applicants
├── posting_tier, payment_status
├── display_position (top/middle/bottom)
├── display_priority (INTEGER)
└── created_at, updated_at

job_work_conditions               -- 근무 조건 (1:1)
├── job_id (FK → jobs)
├── employment_type, work_hours
├── overtime, vacation_days
└── start_date

job_manager                       -- 담당자 정보 (1:1)
├── job_id (FK → jobs)
├── name, email, phone
└── department

job_languages                     -- 언어 요구사항 (1:N)
├── job_id (FK → jobs)
├── language, level
└── required

job_content_blocks                -- WYSIWYG 컨텐츠 블록 (1:N)
├── job_id (FK → jobs)
├── block_type (heading/paragraph/image/list/table)
├── content (JSONB)
└── order_index

-- 경력/학력
user_experiences                  -- 경력 (1:N)
├── user_id (FK → users)
├── company, position
├── start_date, end_date, current
└── description

user_educations                   -- 학력 (1:N)
├── user_id (FK → users)
├── school, degree, field
└── start_year, end_year, current

-- 이력서
user_resumes                      -- 이력서 파일
├── user_id (FK → users)
├── file_url, file_name
├── file_size, file_type
└── uploaded_at

-- 지원/매칭
talent_applications               -- 인재풀 지원
├── user_id (FK → users)
├── status (pending/approved/rejected)
└── applied_at

job_applications                  -- 채용공고 지원
├── job_id (FK → jobs)
├── user_id (FK → users)
├── status, applied_at
└── resume_url
```

### RLS 정책
```sql
-- users 테이블: 본인 데이터만 조회/수정
CREATE POLICY "users_select" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (id = auth.uid());

-- companies 테이블: 본인 회사만 조회/수정
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (id = auth.uid());

-- jobs 테이블: 본인 회사 공고만 수정
CREATE POLICY "jobs_insert" ON jobs
  FOR INSERT WITH CHECK (company_id = auth.uid());

CREATE POLICY "jobs_update" ON jobs
  FOR UPDATE USING (company_id = auth.uid());

-- 공개 공고는 모두 조회 가능
CREATE POLICY "jobs_select_active" ON jobs
  FOR SELECT USING (status = 'active');
```

---

## 🔄 주요 기능 플로우

### 1. 기업 회원가입 → 공고 등록 → 어드민 승인 → 메인 노출
```
1. 기업 회원가입 (7개 섹션)
   ↓
2. 회사 정보 companies 테이블 저장
   ↓
3. 기업 대시보드 진입
   ↓
4. 채용공고 작성 (2단계)
   - Step 1: 정형 정보 (메타데이터)
   - Step 2: 자유 컨텐츠 (WYSIWYG 에디터)
   ↓
5. 임시저장 (status: draft) 또는 등록 (status: pending_approval)
   ↓
6. 어드민 페이지 (/admin)
   - 결제 상태 확인 (pending → paid → confirmed)
   - UI 위치 할당 (top/middle/bottom + priority)
   - 공고 승인 (pending_approval → active)
   ↓
7. 메인 페이지 노출
   - display_position별 정렬 (top/middle/bottom)
   - display_priority 우선순위 적용
   - 3개 섹션 그리드 레이아웃
     - Top: 4열, 최대 20개 (프리미엄)
     - Middle: 5열, 최대 25개 (추천)
     - Bottom: 6열, 최대 30개 (일반)
```

### 2. 개인 회원가입 → 프로필 완성 → 인재풀 등록
```
1. 개인 회원가입 (OAuth or 이메일)
   ↓
2. 온보딩 (4단계)
   - Step 1: 기본 정보 (이름, 연락처)
   - Step 2: 경력/학력
   - Step 3: 스킬/언어
   - Step 4: 희망 조건
   ↓
3. users 테이블 저장
   ↓
4. 개인 대시보드 진입
   - 프로필 완성도 체크리스트 (8개 항목)
   - 미완성 항목 안내
   ↓
5. 프로필 수정 페이지
   - 기본 정보, 경력, 학력, 스킬, 자기소개, 이력서, 희망 조건
   ↓
6. 7가지 필수 정보 완성 시 인재풀 자격 획득
   - ✅ 이름, 이메일, 전화번호
   - ✅ 경력 1개 이상
   - ✅ 학력 1개 이상
   - ✅ 스킬 1개 이상
   - ✅ 자기소개
   ↓
7. 인재풀 페이지 (/talent)
   - 자격 충족 시 자동 노출
   - 기업이 검색/열람 가능
```

### 3. OAuth 로그인 플로우
```
-- 구글/카카오 --
1. 사용자가 OAuth 버튼 클릭
   ↓
2. app/login/page.tsx
   - localStorage에 user_type 저장 (company/jobseeker)
   - supabase.auth.signInWithOAuth() 호출
   ↓
3. OAuth Provider 인증
   ↓
4. 콜백: app/login/page.tsx (hash fragment)
   - localStorage user_type 읽기
   - 중복 가입 체크 (반대 테이블 확인)
   - 신규 사용자 → 온보딩 페이지
   - 기존 사용자 → 대시보드

-- 네이버 --
1. 사용자가 네이버 버튼 클릭
   ↓
2. app/auth/naver/login/page.tsx
   - state 파라미터에 user_type 포함
   - 네이버 인증 페이지로 리다이렉트
   ↓
3. 네이버 인증
   ↓
4. 콜백: app/auth/naver/callback/route.ts (서버 사이드)
   - Authorization Code → Access Token 교환
   - 네이버 프로필 API 호출
   - Supabase 사용자 생성/로그인
   - 중복 가입 체크 (반대 테이블 확인)
   - 신규 사용자 → 온보딩 페이지
   - 기존 사용자 → 대시보드
```

---

## 📦 주요 모듈 의존성

### 핵심 라이브러리
```json
{
  "@supabase/supabase-js": "2.75.0",     // 데이터베이스 + 인증
  "@tiptap/react": "3.7.2",              // WYSIWYG 에디터
  "@cloudinary/react": "1.14.3",         // 이미지 업로드
  "@radix-ui/*": "^1.x",                 // UI Primitives (Dialog, Select, Tabs 등)
  "lucide-react": "0.544.0",             // 아이콘
  "framer-motion": "12.23.16",           // 애니메이션
  "react-datepicker": "8.7.0",           // 날짜 선택
  "clsx": "2.1.1",                       // 클래스명 조합
  "tailwind-merge": "3.3.1",             // Tailwind 충돌 해결
  "uuid": "13.0.0"                       // UUID 생성
}
```

---

## 🚨 현재 상태 및 이슈

### ✅ 완료된 기능
- ✅ 기업/개인 회원가입 및 온보딩
- ✅ OAuth 로그인 (구글, 카카오, 네이버)
- ✅ 중복 회원가입 방지 (OAuth 계정 단일 회원 유형)
- ✅ 채용공고 작성 (WYSIWYG 에디터)
- ✅ 채용공고 임시저장/등록
- ✅ 어드민 공고 승인 시스템
- ✅ 그리드 레이아웃 편집기 (75개 슬롯, 페이지네이션)
- ✅ 메인 페이지 공고 노출 (3개 섹션)
- ✅ 인재풀 시스템 (자격 검증)
- ✅ 프로필 완성도 체크리스트 (8개 항목)
- ✅ 프로필 수정 페이지
- ✅ 공통 폼 컴포넌트 라이브러리

### ⚠️ 알려진 이슈
- ⚠️ 채용공고 수정 페이지 editorContent 초기화 에러 (수정 완료)
- ⚠️ 메인 페이지 null company 에러 (수정 완료)
- ⚠️ 희망 직군 필드 저장 안 되던 버그 (수정 완료)
- ⚠️ RLS 정책 firebase_uid → id 수정 완료

### 🔜 향후 작업 예정
- [ ] 채용공고 수정 페이지 완성 (등록 신청 기능 추가)
- [ ] 지원자 관리 시스템
- [ ] 이메일 알림 시스템
- [ ] 결제 시스템 통합
- [ ] 검색 필터링 고도화
- [ ] 추천 알고리즘
- [ ] 대시보드 통계 차트

### 📏 코드 품질 지표
```
총 파일 줄 수:
- 최대 파일: JobGridLayoutEditor.tsx (835줄) ⚠️ 500줄 초과!
- 평균 파일 크기: ~250줄
- 500줄 초과 파일: 1개
- 공통 컴포넌트: 11개 (ui/form/)
- 재사용 비율: 약 40%
```

---

## 🔐 환경 변수

### 필수 환경 변수
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # 서버 사이드 전용

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=jobmatch_unsigned
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=              # 서버 사이드 전용

# 기타
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📝 명명 규칙 및 컨벤션

### 파일 명명
```
- Pages: page.tsx (App Router)
- Components: PascalCase.tsx (예: LoginForm.tsx)
- Hooks: camelCase.ts (예: useLogin.ts)
- Types: kebab-case.types.ts (예: job-form.types.ts)
- Services: kebab-case.ts (예: job-service.ts)
- Utils: kebab-case.ts (예: profile-transformer.ts)
```

### 변수 명명
```typescript
// 컴포넌트: PascalCase
export default function LoginForm() {}

// 함수: camelCase
const handleSubmit = () => {}

// 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 타입: PascalCase
type UserProfile = {...}

// 인터페이스: PascalCase
interface Job {...}
```

### DB 필드 명명
```sql
-- 테이블: snake_case (복수형)
users, companies, jobs, user_experiences

-- 컬럼: snake_case
full_name, created_at, profile_image_url

-- enum: snake_case
status: 'active' | 'pending' | 'inactive'
```

---

## 🎯 프로젝트 원칙

### 1. 파일 크기 제한
- **절대 규칙**: 단일 파일 최대 500줄
- **초과 시**: 즉시 분리 (로직 → 훅, UI → 컴포넌트)

### 2. 재사용성
- **3회 이상 사용** → 공통 컴포넌트화 필수
- **독립적 동작** 가능하게 설계
- **props로 커스터마이징** 가능

### 3. 타입 안정성
- **any 타입 금지** (명시적 타입 정의 필수)
- **모든 props 타입 명시**
- **함수 반환 타입 명시**

### 4. 기술 스택 준수
- **Supabase 전용** (Firebase 절대 금지)
- **Tailwind CSS** (인라인 스타일 금지)
- **TypeScript 엄격 모드**

### 5. 변경 로그 작성
- **모든 코드 수정** → CHANGELOG.md 업데이트 필수
- **변경 유형** 명시 ([ADD/UPDATE/DELETE/REFACTOR/FIX/STYLE])
- **파일별 줄 수 변화** 기록

---

## 🔍 주요 컴포넌트 상세

### Header.tsx (공통 헤더)
```typescript
역할: 프로젝트 전체 공통 헤더
기능:
- 로고 클릭 → 메인 페이지
- 메뉴: 채용공고, 인재풀, 글로벌 채용, 회사소개
- 로그인/회원가입 버튼
- 로그인 시: 프로필 드롭다운
  - 개인: 내 대시보드, 프로필 수정, 로그아웃
  - 기업: 기업 대시보드, 로그아웃
- 프로필 이미지/이름 표시
```

### JobGridLayoutEditor.tsx (그리드 편집기)
```typescript
역할: 어드민이 메인 페이지 공고 배치 관리
기능:
- 75개 슬롯 (Top 20 + Middle 25 + Bottom 30)
- 실제 /jobs 페이지와 동일한 미리보기
- 클릭-할당 워크플로우
- 섹션별 독립 편집
- 페이지네이션 (페이지당 75개)
- 검색 기능
- 일괄 저장
크기: 835줄 ⚠️ (500줄 초과, 추후 분리 필요)
```

### JobContentEditor.tsx (WYSIWYG 에디터)
```typescript
역할: 채용공고 상세 내용 작성
기반: TipTap (ProseMirror 기반)
기능:
- 헤딩, 단락, 이미지, 리스트, 표, 구분선
- Cloudinary 이미지 업로드
- 실시간 프리뷰
- HTML 출력
옵션: immediatelyRender: false (SSR 호환)
```

### FormInput.tsx (공통 입력 컴포넌트)
```typescript
역할: 프로젝트 전체 재사용 입력 필드
props:
- label, type, value, onChange
- placeholder, required, disabled
- error, helperText
- icon (lucide-react)
사용처: 20회 이상 (이름, 이메일, 전화번호 등)
```

---

## 📚 참고 문서

### 프로젝트 문서
- [CHANGELOG.md](CHANGELOG.md) - 전체 변경 이력
- [CLAUDE.md](CLAUDE.md) - Claude Code 규칙
- [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) - 컴포넌트 가이드
- [docs/archive/](docs/archive/) - 날짜별 상세 작업 기록

### 외부 문서
- [Next.js 15 App Router](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TipTap Docs](https://tiptap.dev/docs/editor/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**마지막 업데이트**: 2025-10-20
**분석자**: Claude Code
**목적**: 프로젝트 구조 완전 파악 및 문서화
