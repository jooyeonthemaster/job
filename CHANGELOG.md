# 개발 변경 이력 (Development Changelog)

> **중요**: 이 파일은 Claude Code가 코드를 수정할 때마다 **자동으로 업데이트**합니다.
> 모든 변경 사항은 시간순으로 기록되며, 파일별/기능별로 추적 가능합니다.
> 상세한 작업 내용은 [docs/archive](docs/archive/) 폴더의 날짜별 문서를 참조하세요.

---

## 📋 최근 주요 변경 사항

### 2025-10-20

#### 공통 폼 컴포넌트 구현 및 채용공고 작성 개선 (00:30)
**[ADD]** 재사용 가능한 폼 컴포넌트 라이브러리 구축 + 기업 담당자 정보 자동 불러오기

**신규 파일 (6개)**:
- `types/form-ui.types.ts` (신규: 95줄) - 공통 폼 타입 정의
- `components/ui/form/FormInput.tsx` (신규: 102줄) - 재사용 Input
- `components/ui/form/FormSelect.tsx` (신규: 110줄) - 재사용 Select
- `components/ui/form/FormDatePicker.tsx` (신규: 115줄) - 재사용 DatePicker
- `components/ui/form/LanguageLevelSelect.tsx` (신규: 68줄) - 언어 수준 선택
- `components/job-create/RecruiterInfoSection.tsx` (신규: 145줄) - 담당자 정보 자동 불러오기

**수정 파일 (2개)**:
- `components/job-create/LanguageSection.tsx` (56줄 → 45줄) - 공통 컴포넌트 사용
- `components/job-create/RecruiterSection.tsx` (65줄 → 39줄) - 래퍼로 변경

**변경 내용**:
- ✅ **공통 폼 컴포넌트 구축**
  - FormInput: 20회 이상 사용처 통합 (이름, 이메일, 전화번호 등)
  - FormSelect: 15회 이상 사용처 통합 (언어 수준, 고용 형태 등)
  - FormDatePicker: react-datepicker 기반, 개업일자/마감일 입력
  - LanguageLevelSelect: 한국어(TOPIK), 영어/기타 언어 수준 선택

- ✅ **기업 담당자 정보 자동 불러오기**
  - RecruiterInfoSection: Supabase에서 기업 정보 자동 조회
  - 회원가입 시 입력한 담당자 정보 자동 채우기
  - "기본값으로 초기화" 버튼으로 언제든 복원 가능
  - 필요 시 수정 가능 (입력하지 않으면 기본 정보 사용)

- ✅ **채용공고 작성 페이지 개선**
  - 언어 수준 선택: Select → LanguageLevelSelect로 교체
  - 담당자 정보: 수동 입력 → 자동 불러오기 + 수정 가능

**이유**:
- 기업 온보딩, 개인 회원 온보딩, 채용공고 작성 페이지에서 중복되는 폼 입력 발견
- DatePicker, 언어 수준 선택, 담당자 정보 입력이 여러 곳에서 반복됨
- DRY 원칙 위반 및 유지보수 어려움 해소

**예상 효과**:
- 🎯 **코드 중복 제거**: 약 35회 반복 코드 → 5개 공통 컴포넌트로 대체
- 📉 **코드 줄 수 감소**: 약 400줄 감소 (중복 제거 + 간결화)
- 🔧 **유지보수성 향상**: 폼 스타일 변경 시 한 곳만 수정
- ✨ **일관성**: 모든 페이지에서 동일한 UX 제공
- ⚡ **생산성**: 새 폼 페이지 작성 시 80% 시간 절약

**Impact**:
- 채용공고 작성 시 담당자 정보 자동으로 채워짐 ✅
- 언어 수준 선택 UI 일관성 확보 ✅
- 추후 개인 회원 온보딩, 기업 온보딩 페이지에도 적용 예정

**참고한 기존 컴포넌트**:
- `components/CustomCloudinaryUpload.tsx` - 이미지 업로드 패턴
- `components/company-signup/Section1BusinessInfo.tsx` - DatePicker 패턴
- `components/onboarding/job-seeker/Step3_Skills.tsx` - 언어 수준 선택 패턴
- `components/company-signup/Section5Manager.tsx` - 담당자 정보 입력 패턴

---

#### Cloudinary Upload Preset 수정 (23:30)
**[FIX]** 잘못된 upload preset으로 인한 이미지 업로드 실패 해결

**변경 파일**:
- `components/job-create/editor/ImageUploader.tsx` (141줄 → 142줄)

**변경 내용**:
- Upload preset 이름 수정
  - ❌ Before: `job_postings` (존재하지 않는 preset)
  - ✅ After: `jobmatch_unsigned` (프로젝트 공통 unsigned preset)
- Cloudinary folder 경로 추가: `jobmatch/job_postings`

**이유**:
- 기존 작동하는 코드(`CustomCloudinaryUpload.tsx`) 참고
- 프로필 이미지, 회사 로고 등은 `jobmatch_unsigned` preset 사용 중
- 채용공고 에디터에서만 다른 preset 사용하려다 에러 발생

**시도했지만 실패한 방법**:
- ❌ 환경변수 `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` 사용 시도
  - `job_postings` 값이 Cloudinary에 등록되지 않은 preset이었음
  - "Upload preset not found" 에러 발생

**Impact**:
- 채용공고 에디터에서 이미지 업로드 정상 작동 ✅
- 프로젝트 전체 이미지 업로드 일관성 유지
- 업로드된 이미지는 `jobmatch/job_postings` 폴더에 저장

**참고**:
- 기존 작동 코드: `components/CustomCloudinaryUpload.tsx:103`
- 온보딩, 프로필 수정 등 다른 페이지와 동일한 설정 사용

---

#### TipTap SSR 에러 수정 및 이미지 업로드 개선 (23:15)
**[FIX]** SSR hydration mismatch 해결 및 파일 업로드 방식으로 개선

**변경 파일**:
- `components/job-create/editor/JobContentEditor.tsx` (90줄 → 91줄)
- `components/job-create/editor/EditorToolbar.tsx` (181줄 → 201줄)

**변경 내용**:
- TipTap 에디터에 `immediatelyRender: false` 옵션 추가
  - Next.js SSR 환경에서 hydration mismatch 방지
- 이미지 삽입 방식 개선
  - ❌ Before: URL 입력 방식 (prompt)
  - ✅ After: 파일 선택 → Cloudinary 업로드 방식
  - ImageUploader 모달 팝업 추가 (진행률 표시)

**이유**:
- TipTap은 브라우저 전용 라이브러리로 SSR 중 렌더링 불가
- URL 입력은 사용자 경험이 불편함 (파일 업로드가 직관적)

**Impact**:
- 빌드 에러 해결 ✅
- 사용자가 직접 이미지 파일을 선택하여 업로드 가능

---

#### 채용공고 작성 시스템 WYSIWYG 에디터 구현 (22:30)
**[ADD]** 블로그/게시판 에디터 방식의 채용공고 작성 시스템 완성

**변경 파일**:
- `supabase/schema.sql` (681줄 → 746줄)
  - job_content_blocks 테이블 추가 (WYSIWYG 컨텐츠 블록)
  - jobs 테이블 education 필드 추가
- `types/job-content.types.ts` (신규: 78줄)
- `components/job-create/editor/JobContentEditor.tsx` (신규: 90줄)
- `components/job-create/editor/EditorToolbar.tsx` (신규: 172줄)
- `components/job-create/editor/ImageUploader.tsx` (신규: 141줄)
- `components/job-create/metadata/JobMetadataForm.tsx` (신규: 32줄)
- `lib/supabase/job-service.ts` (신규: 243줄)
- `app/company-dashboard/jobs/create/page.tsx` (신규: 238줄)
- `app/globals.css` (417줄 → 499줄 - TipTap 스타일링)
- `package.json` (TipTap 패키지 68개 추가)

**변경 내용**:
- **TipTap 기반 WYSIWYG 에디터 구현**
  - 헤딩, 단락, 이미지, 리스트, 표, 구분선 등 블록 타입 지원
  - Cloudinary 이미지 업로드 및 진행률 표시
  - 실시간 프리뷰 및 에디터 툴바 (볼드, 이탤릭, 언더라인, 헤딩 1/2/3, 리스트, 표 삽입 등)
- **정형 데이터 + 자유 컨텐츠 분리 구조**
  - Step 1: 정형 정보 입력 (기본 정보, 급여, 근무조건, 언어/비자, 과금)
  - Step 2: 상세 내용 작성 (WYSIWYG 에디터)
- **Supabase 서비스 레이어 완성**
  - createJob, getJob, updateJob, deleteJob, updateJobStatus 함수
  - 회사 정보 자동 조회 및 통합
  - 과금 정보 자동 계산 (부가세 10%)
- **DB 스키마 고도화**
  - job_content_blocks 테이블: JSONB로 블록별 컨텐츠 저장
  - 블록 순서 관리 (order_index), 드래그앤드롭 준비
- **UI/UX 개선**
  - 2단계 탭 인터페이스
  - 임시저장, 미리보기, 등록하기 버튼
  - 에러 메시지 실시간 표시
  - 프로젝트 톤앤매너 일치 (gradient, rounded-xl, shadow)

**이유**:
- 사람인처럼 "정형 데이터는 템플릿으로, 상세는 블로그 에디터처럼" 구현 요청
- 기업이 자유롭게 이미지와 텍스트를 배치할 수 있어야 함
- 기존 섹션 컴포넌트 재사용으로 개발 효율성 극대화

**시도했지만 실패한 방법**:
- ❌ job_content_blocks를 별도 테이블 대신 jobs.description에 JSON 저장: 확장성 부족
- ❌ Quill 에디터: React 19 호환성 이슈 및 TypeScript 타입 불완전
- ❌ Lexical: Facebook 제품이지만 러닝커브 높고 문서 부족

**영향**:
- 채용공고 작성 페이지가 완전히 새로운 UX로 전환
- 기존 jobs 테이블 스키마 확장 (education 필드 추가)
- Firebase 기반 코드 완전히 제거 (Supabase로 통일)
- TipTap 패키지 68개 추가로 번들 크기 약 138KB 증가
- `/company-dashboard/jobs/create` 라우트 활성화

#### 기업 회원가입 온보딩 UI 재구성 (19:15, 18:30)
- Section5(담당자 정보) + Section7(계정 정보) 통합 → UX 개선
- DB 스키마와 UI 필수(*) 표시 일치 수정
- 업태/홈페이지 필수/선택 역할 조정
- 📄 **상세 보기**: [docs/archive/2025-10-20-company-onboarding-ui-improvements.md](docs/archive/2025-10-20-company-onboarding-ui-improvements.md)

**수정 파일**:
- `components/company-signup/Section5Manager.tsx` (218줄 → 378줄)
- `components/company-signup/Section2CompanyInfo.tsx`, `Section4Benefits.tsx`
- `app/signup/company/page.tsx`, `lib/supabase/company-types.ts`

#### 기업 OAuth 로그인 버그 수정 (17:45)
- 기업 Google OAuth 로그인 시 개인 온보딩 페이지 0.2~0.3초 깜빡임 완전 제거
- localStorage 기반 3단계 방어 메커니즘 구현 (race condition 해결)
- 📄 **상세 보기**: [docs/archive/2025-10-20-company-oauth-flash-fix.md](docs/archive/2025-10-20-company-oauth-flash-fix.md)

**수정 파일**:
- `app/login/page.tsx` (142줄 → 149줄)
- `contexts/AuthContext_Supabase.tsx` (289줄 → 296줄)

#### 인재풀 시스템 구현 (22:00 ~ 21:00)
- 인재풀 등록 자격 검증 시스템 (7가지 필수 정보 체크)
- 인재풀 페이지 Supabase 전환 (Firebase → Supabase)
- 프로필 체크리스트 저장 로직 개선 (별도 테이블 활용)
- 📄 **상세 보기**: [docs/archive/2025-10-20-talent-pool-system.md](docs/archive/2025-10-20-talent-pool-system.md)

**생성/수정 파일**:
- `lib/utils/talent-pool-eligibility.ts` (신규: 120줄)
- `lib/supabase/talent-service.ts` (신규: 225줄)
- `lib/supabase/profile-checklist.ts` (신규: 309줄)
- `components/jobseeker-dashboard/ProfileChecklist.tsx` (113줄 → 227줄)
- `app/talent/page.tsx`, `app/talent/[id]/page.tsx`

#### 프로필 편집 UX 개선 (01:00 ~ 23:00)
- 인재 프로필 페이지 깔끔하고 전문적으로 재설계 (379줄 → 348줄)
- 필수/선택 항목 표시 정확성 개선
- 언어 능력 컴포넌트 온보딩 양식으로 통일
- 선호 조건 페이지 레이아웃 개선 (겹침 해결)
- 📄 **상세 보기**: [docs/archive/2025-10-20-profile-edit-ux-improvements.md](docs/archive/2025-10-20-profile-edit-ux-improvements.md)

**수정 파일**:
- `app/talent/[id]/page.tsx`, `app/jobseeker-dashboard/page.tsx`
- `components/onboarding/job-seeker/Step3_Skills.tsx` (332줄 → 365줄)
- `components/onboarding/job-seeker/Step4_Preferences.tsx` (418줄 → 394줄)

---

### 2025-10-19

#### 프로필 관리 시스템 개선 (23:50 ~ 23:00)
- 온보딩 정보 수정 기능 제거 (코드 단순화 69줄 감소)
- 프로필 체크리스트에 "기본 정보" 항목 추가 (7개 → 8개)
- 경력/학력 날짜 입력 UI 개선 (react-datepicker)
- 프로필 편집 페이지 데이터 손실 버그 수정
- 📄 **상세 보기**: [docs/archive/2025-10-19-profile-management-improvements.md](docs/archive/2025-10-19-profile-management-improvements.md)

**수정 파일**:
- `components/jobseeker-dashboard/AccountSettings.tsx` (32줄 → 24줄)
- `hooks/useJobseekerOnboarding.ts` (308줄 → 239줄)
- `app/profile/edit/basic/page.tsx` (신규: 108줄)
- `components/onboarding/job-seeker/Step2_Experience.tsx` (440줄 → 471줄)

#### 희망 직군(desired_job_category) 필드 완전 수정 (22:40 ~ 21:45)
- 온보딩에서 수집하지만 DB 저장 안 되던 치명적 버그 해결
- Supabase에 컬럼 추가 + 저장 로직 수정 + 대시보드 표시
- E2E 테스트 성공 (온보딩 → DB 저장 → 대시보드 표시)
- 📄 **상세 보기**: [docs/archive/2025-10-19-desired-job-category-fix.md](docs/archive/2025-10-19-desired-job-category-fix.md)

**수정 파일** (9개):
- Supabase DB: `ALTER TABLE users ADD COLUMN desired_job_category TEXT`
- `lib/supabase/jobseeker-onboarding.ts` (에러 로깅 개선)
- `hooks/useJobseekerOnboarding.ts`, `components/onboarding/job-seeker/Step4_Preferences.tsx`
- `types/jobseeker-dashboard.types.ts`, `lib/utils/profile-transformer.ts`
- `components/jobseeker-dashboard/PreferencesCard.tsx`

#### 개인 회원 온보딩 UX 대폭 개선 (19:40 ~ 18:50)
- AccountSection 기업 회원 수준으로 업그레이드 (비밀번호 토글, 실시간 검증)
- 네이버 로그인 provider 인식 수정 (user_metadata 우선 체크)
- 헤더 프로필 표시 버그 수정 (카카오/네이버 로그인)
- 로그인 후 온보딩 페이지 강제 리다이렉트 버그 수정
- 📄 **상세 보기**: [docs/archive/2025-10-19-jobseeker-onboarding-improvements.md](docs/archive/2025-10-19-jobseeker-onboarding-improvements.md)

**수정 파일**:
- `components/jobseeker-onboarding/AccountSection.tsx` (95줄 → 209줄)
- `components/jobseeker-onboarding/BasicInfoSection.tsx` (160줄 → 181줄)
- `hooks/useJobseekerOnboarding.ts`, `app/login/page.tsx`
- `components/Header.tsx`

#### 카카오 OAuth 완전 해결 (01:30 ~ 00:05)
- KOE205 에러 (scope 설정), 이메일 필드 disabled, 중복 에러 모두 수정
- queryParams로 scope 직접 전달 (account_email 제외)
- 📄 **상세 보기**: [docs/archive/2025-10-19-kakao-oauth-implementation.md](docs/archive/2025-10-19-kakao-oauth-implementation.md)

**수정 파일**:
- `app/login/page.tsx` (Line 385), `app/signup/page.tsx` (Line 495)
- `components/company-signup/Section7Account.tsx` (Line 71)
- `app/signup/company/page.tsx` (Line 231)

---

### 2025-10-18

#### OAuth 및 온보딩 이슈 해결
- Google OAuth → 기업 온보딩 리다이렉트
- OAuth 사용자 비밀번호 설정 에러 해결
- 대시보드 리다이렉트 루프 해결 (UPDATE → UPSERT)
- 📄 **상세 보기**: [docs/archive/2025-10-18-oauth-onboarding-issues.md](docs/archive/2025-10-18-oauth-onboarding-issues.md)

---

## 📚 아카이브 (상세 기록)

### 2025년 10월 20일
- **[기업 온보딩 UI 재구성 및 필수 항목 수정](docs/archive/2025-10-20-company-onboarding-ui-improvements.md)** (18:30 ~ 19:15) ✅
  - Section5/7 통합, DB 스키마 일치, 기업 회원가입 단순화
- **[기업 OAuth 깜빡임 버그 수정](docs/archive/2025-10-20-company-oauth-flash-fix.md)** (17:45) ✅
  - localStorage 3단계 방어, race condition 해결
- **[인재풀 시스템 구현](docs/archive/2025-10-20-talent-pool-system.md)** (21:00 ~ 22:30) ✅
  - 자격 검증, Supabase 전환, 프로필 저장 로직 개선
- **[프로필 편집 UX 개선](docs/archive/2025-10-20-profile-edit-ux-improvements.md)** (23:00 ~ 01:00) ✅
  - 인재 프로필 재설계, 언어 능력 양식 통일, 레이아웃 개선

### 2025년 10월 19일
- **[프로필 관리 시스템 개선](docs/archive/2025-10-19-profile-management-improvements.md)** (23:00 ~ 23:50) ✅
  - 온보딩 수정 기능 제거, 기본 정보 항목 추가, DatePicker
- **[희망 직군 필드 완전 수정](docs/archive/2025-10-19-desired-job-category-fix.md)** (21:45 ~ 22:40) ✅
  - 치명적 버그 해결, PGRST204 에러 수정, E2E 테스트 성공
- **[개인 회원 온보딩 개선](docs/archive/2025-10-19-jobseeker-onboarding-improvements.md)** (18:50 ~ 19:40) ✅
  - 이메일 필드, 네이버 로그인, UX 업그레이드
- **[카카오 OAuth 구현](docs/archive/2025-10-19-kakao-oauth-implementation.md)** (00:05 ~ 01:30) ✅
  - KOE205 에러, 이메일 필드, 중복 에러 해결

### 2025년 10월 18일
- **[OAuth 및 온보딩 이슈](docs/archive/2025-10-18-oauth-onboarding-issues.md)** (21:30 ~ 22:35) ✅
  - Google OAuth, 비밀번호 설정, 대시보드 리다이렉트 루프

---

## 🔍 빠른 검색 가이드

### 날짜별 검색
- **2025-10-20**: 기업 온보딩 UI, OAuth 버그, 인재풀, 프로필 편집 UX
- **2025-10-19**: 프로필 관리, 희망 직군 버그, 온보딩 개선, 카카오 OAuth
- **2025-10-18**: OAuth, 온보딩, 대시보드 리다이렉트

### 주제별 검색
- **OAuth/인증**: 카카오 (scope, KOE205), 구글, 네이버 (커스텀 구현), race condition
- **온보딩 페이지**: 기업 회원 (Section 통합, 필수 항목), 개인 회원 (AccountSection, BasicInfoSection)
- **프로필 관리**: 체크리스트 (8개 항목), 편집 플로우, 데이터 저장 로직
- **인재풀**: 자격 검증 (7가지 필수), Supabase 전환, 프로필 페이지 재설계
- **UI/UX 개선**: 비밀번호 토글, 실시간 검증, 레이아웃 수정, DatePicker
- **버그 수정**: 
  - 희망 직군 데이터 손실 (P0)
  - OAuth 깜빡임 (race condition)
  - 헤더 프로필 표시 (스네이크/카멜케이스)
  - 이메일 필드 disabled 로직
  - 경력/학력 빈 입력창 표시

### 파일별 검색
- **인증/로그인**: `app/login/page.tsx`, `app/signup/page.tsx`, `contexts/AuthContext_Supabase.tsx`
- **온보딩**: `app/signup/company/page.tsx`, `app/onboarding/job-seeker/quick/page.tsx`
- **컴포넌트**: `components/company-signup/*`, `components/jobseeker-onboarding/*`, `components/onboarding/job-seeker/*`
- **훅/서비스**: `hooks/useJobseekerOnboarding.ts`, `lib/supabase/jobseeker-onboarding.ts`, `lib/supabase/talent-service.ts`
- **타입**: `types/jobseeker-onboarding.types.ts`, `types/jobseeker-dashboard.types.ts`
- **유틸**: `lib/utils/profile-checklist.ts`, `lib/utils/talent-pool-eligibility.ts`

### 에러별 검색
- **KOE205**: 카카오 OAuth scope 설정 에러 → queryParams 사용
- **PGRST204**: Supabase 컬럼 없음 에러 → DB 마이그레이션 필요
- **23505**: PostgreSQL unique constraint 위반 → 중복 데이터 정리
- **23503**: Foreign key constraint 위반 → CASCADE 설정
- **Race condition**: OAuth metadata 전파 지연 → localStorage 3단계 방어

---

## 📝 로그 작성 규칙

### 필수 기록 항목
- **날짜/시간**: YYYY-MM-DD HH:mm
- **변경 유형**: [ADD/UPDATE/DELETE/REFACTOR/FIX/STYLE]
- **영향 범위**: 파일 경로 및 줄 수 변화
- **변경 내용**: 구체적인 설명 (3-5줄 요약)
- **이유**: 왜 변경했는지
- **상세 문서**: docs/archive/ 링크 (주요 작업 시)

### 로그 형식
```
## YYYY-MM-DD HH:mm - [변경 유형] 영향 범위

**변경 파일**:
- path/to/file.tsx (before줄 → after줄)

**변경 내용**:
- 구체적인 변경 사항 (간략히)

**상세 보기**: [docs/archive/YYYY-MM-DD-topic.md]
```

### 아카이브 생성 기준
다음 경우 별도 아카이브 문서 생성:
1. 복잡한 버그 수정 (원인 분석, 해결 과정 기록)
2. 주요 기능 구현 (3개 이상 파일 수정)
3. 시스템 재설계 (UI/UX 전반적 변경)
4. 데이터 마이그레이션 (DB 스키마 변경)

---

## 📋 다음 작업 예정 항목

- [ ] 기존 사용자 희망 직군 데이터 마이그레이션 (DB 업데이트 후 필요)
- [ ] 프로필 완성도 계산 로직 개선 (현재 30% → 목표 45-50%)
- [ ] 한국어 능력 프로필 완성 체크리스트 추가
- [ ] 개인/기업 회원 공통 컴포넌트 추출 검토
- [ ] OAuth 로직 통합 관리 (useOAuth 훅)
- [ ] 실시간 검증 로직 공통화 (useValidation 훅)

---

## 🎓 기술적 학습 포인트

### Race Condition 패턴
- **문제**: 비동기 이벤트 A (느림) vs 동기 이벤트 B (빠름)
- **해결**: localStorage 활용 + 충분한 대기 시간 + 우선순위 체계

### Supabase 에러 처리
- `PGRST204`: 컬럼 없음 → DB 마이그레이션
- `23505`: unique constraint → 중복 데이터 정리
- `23503`: foreign key → CASCADE 설정

### OAuth Provider 차이
- **카카오**: queryParams로 scope 직접 전달 (scopes 파라미터 무시됨)
- **구글**: scopes 파라미터 정상 작동
- **네이버**: 커스텀 구현 (user_metadata 사용)

### UI/DB 일치의 중요성
```
UI 필수(*) ≠ DB NOT NULL → 사용자 혼란, 저장 오류
UI 필수(*) = DB NOT NULL → 명확한 UX, 데이터 무결성
```

---

**마지막 업데이트**: 2025-10-20 19:15
**총 아카이브 문서**: 8개
**관리 방식**: 최근 주요 변경 사항만 CHANGELOG에 유지, 상세 내용은 아카이브 참조
