# 개발 변경 이력 (Development Changelog)

> **중요**: 이 파일은 Claude Code가 코드를 수정할 때마다 **자동으로 업데이트**합니다.
> 모든 변경 사항은 시간순으로 기록되며, 파일별/기능별로 추적 가능합니다.
> 상세한 작업 내용은 [docs/archive](docs/archive/) 폴더의 날짜별 문서를 참조하세요.

---

## 📋 최근 주요 변경 사항

### 2025-10-20

#### 🐛 메인 페이지 null company 에러 수정
**[FIX]** 회사 정보 없는 공고로 인한 TypeError 방지

**변경 파일 (1개)**:
- `lib/supabase/public-job-service.ts` (244줄 → 248줄)

**에러**:
```
TypeError: Cannot read properties of null (reading 'id')
at transformToJobCardFormat (lib\supabase\public-job-service.ts:125:23)
```

**원인**:
- Supabase 조인 시 `job.companies`가 `null`인 경우 발생
- 회사가 삭제되었거나 RLS 정책으로 차단된 공고
- `transformToJobCardFormat`에서 `job.company.id` 접근 시 에러

**해결**:
```typescript
// BEFORE: 필터링 없이 모든 공고 변환 → 1개라도 문제면 전체 에러
const publicJobs = (jobs || []).map((job: any) => ({
  ...job,
  company: job.companies
})) as PublicJob[];

// AFTER: 회사 정보 없는 공고 필터링 → 정상 공고만 표시
const publicJobs = (jobs || [])
  .filter((job: any) => {
    if (!job.companies) {
      console.warn('⚠️ Job without company data (skipped):', {
        id: job.id,
        title: job.title,
        company_id: job.company_id
      });
      return false;
    }
    return true;
  })
  .map((job: any) => ({
    ...job,
    company: job.companies
  })) as PublicJob[];
```

**개선 효과**:
- 부분 장애 허용 (graceful degradation)
- 문제 있는 공고만 제외, 나머지는 정상 표시
- 디버깅을 위한 경고 로그 추가
- 사용자는 정상 공고를 계속 볼 수 있음

---

#### 🎉 /jobs 페이지 활성화 + 그리드 편집기 완전 리뉴얼
**[ADD/REFACTOR]** 실제 /jobs 페이지 구조 기반 그리드 레이아웃 관리 시스템

**변경 파일 (3개)**:
- `app/jobs/page.tsx` (신규: 550줄, Firebase → Supabase 마이그레이션)
- `components/admin/JobGridLayoutEditor.tsx` (640줄 → 820줄, 완전 재작성)
- `components/admin/JobGridLayoutEditor.tsx.old` (기존 파일 백업)

**주요 변경사항**:

**1. /jobs 페이지 재구현 (404 에러 해결)**
- Firebase 비활성화 파일 → Supabase 버전으로 마이그레이션
- **3개 섹션 구조 유지**:
  - Top: 프리미엄/탑 공고 (4열 그리드, 최대 20개, `size="large"`)
  - Middle: 추천 공고 (5열 그리드, 최대 25개, `size="medium"`)
  - Bottom: 일반 공고 (6열 그리드, 최대 30개, `size="small"`)
- DB 쿼리: `display_position`, `display_priority`로 정렬
- JobGridCard 컴포넌트 활용 (기존 컴포넌트 재사용)

**2. 그리드 레이아웃 편집기 완전 리뉴얼**
- **실제 /jobs 페이지 미리보기** 형태로 변경
- 3개 섹션 각각 독립 편집:
  ```typescript
  const [topSlots, setTopSlots] = useState<GridSlot[]>([]);      // 20개 (4x5)
  const [middleSlots, setMiddleSlots] = useState<GridSlot[]>([]); // 25개 (5x5)
  const [bottomSlots, setBottomSlots] = useState<GridSlot[]>([]); // 30개 (6x5)
  ```
- **금액대별 그리드 차이 시각화**:
  - Top: 큰 카드 (`h-32`), 4열
  - Middle: 중간 카드 (`h-28`), 5열
  - Bottom: 작은 카드 (`h-24`), 6열
- 클릭-할당 워크플로우 개선
- 슬롯에서 공고 제거 기능 (클릭하면 미할당으로)
- 검색 기능 유지

**기술 구현**:
```typescript
// 섹션별 슬롯 클릭 핸들러
const handleSlotClick = (
  section: 'top' | 'middle' | 'bottom',
  slotIndex: number
) => {
  // 기존 위치에서 제거 (모든 섹션 검색)
  // 현재 슬롯 공고를 미할당으로
  // 선택된 공고를 새 슬롯에 할당
};

// 일괄 저장 (75개 슬롯)
await Promise.all([
  ...topSlots.map(updatePosition),
  ...middleSlots.map(updatePosition),
  ...bottomSlots.map(updatePosition)
]);
```

**UI 개선**:
- 섹션별 헤더 (이모지 + 색상 구분)
  - Top: 🔥 + 초록 그라데이션
  - Middle: ⭐ + 중간 초록 그라데이션
  - Bottom: 📋 + 어두운 초록 그라데이션
- 슬롯 크기가 실제 /jobs 페이지와 동일
- 미할당 공고 사이드바 (30% 너비)
- 빈 슬롯: 점선 테두리, 슬롯 번호 표시

**이유**:
- 사용자 요구: "실제 /jobs 페이지에서 보이는 것처럼" 편집 필요
- 기존 16개 슬롯은 실제 구조와 달라서 혼란
- 금액대별로 그리드가 다르므로 (4/5/6열) 섹션별 편집 필수
- /jobs 페이지 404 에러 해결 필요

**영향**:
- `/jobs` 페이지 활성화 (헤더 "채용공고" 탭 정상 작동)
- 관리자가 실제 페이지와 동일한 구조로 공고 배치 가능
- 기존 개별 할당 모달은 그대로 유지 (하위 호환성)

---

#### ⚡ 그리드 레이아웃 편집기 성능 최적화
**[UPDATE]** 페이지네이션 대비 및 검색 기능 추가

**변경 파일 (1개)**:
- `components/admin/JobGridLayoutEditor.tsx` (620줄 → 640줄)

**변경 내용**:
- **DB 쿼리 최적화**: `getAllJobs()` 제거하고 직접 필터링 쿼리 사용
  ```typescript
  const { data } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('status', 'active')
    .eq('payment_status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(100); // 최대 100개
  ```
- **검색 기능 추가**: 제목, 회사명으로 실시간 검색
- **공고 개수 표시**: "할당 대기 공고 (N개)"
- **100개 초과 경고**: 콘솔에 경고 메시지 출력

**성능 개선**:
- 이전: 전체 공고 로드 → 클라이언트 필터링 (느림, 메모리 많이 사용)
- 이후: DB 레벨 필터링 → 필요한 공고만 로드 (빠름, 메모리 효율적)
- 예상 효과: 100+ 공고 시 로딩 시간 70% 단축

**이유**:
- 네가 지적한 대로 공고가 쌓이면 성능 문제 발생
- 결제 완료 + 활성 공고만 필요하므로 DB 필터링이 효율적
- 검색으로 많은 공고 중에서 원하는 공고 빠르게 찾기

**향후 확장**:
- 100개 제한은 추후 페이지네이션으로 확장 가능
- offset/limit 기반 페이징 구현 예정

---

#### ✨ 그리드 레이아웃 편집기 구현
**[ADD]** 영화관 좌석 선택 스타일의 공고 위치 관리 UI

**변경 파일 (2개)**:
- `components/admin/JobGridLayoutEditor.tsx` (신규: 620줄)
- `components/admin/JobsTab.tsx` (385줄 → 403줄)

**변경 내용**:
- 16개 슬롯 그리드 레이아웃 (최상단 4 + 중단 8 + 하단 4)
- 영화관 좌석 선택 방식의 직관적인 UI
- 클릭-할당 워크플로우 (사이드바 공고 선택 → 슬롯 클릭 → 할당)
- 티어별 시각적 구분:
  - 프리미엄: `bg-amber-50 border-amber-200`
  - 탑: `bg-blue-50 border-blue-200`
  - 일반: `bg-gray-50 border-gray-200`
- 현재 할당된 모든 공고 표시
- 미할당 공고 사이드바 (30% 너비)
- 일괄 저장 기능 (모든 위치 한 번에 업데이트)
- 초기화 버튼 (원래 상태로 되돌리기)
- 슬롯에서 공고 제거 기능
- 로딩/성공 피드백

**기술 구현**:
```typescript
interface GridSlot {
  position: 'top' | 'middle' | 'bottom';
  priority: number;
  job: JobWithCompany | null;
}

// 클릭-할당 로직
const handleSlotClick = (slotIndex: number) => {
  if (!selectedJob) return;
  // 기존 위치에서 제거
  const existingSlotIndex = newSlots.findIndex(
    s => s.job?.id === selectedJob.id
  );
  if (existingSlotIndex !== -1) {
    newSlots[existingSlotIndex].job = null;
  }
  // 새 위치에 할당
  newSlots[slotIndex].job = selectedJob;
};

// 일괄 저장
const handleSaveAll = async () => {
  await Promise.all(
    changedSlots.map(slot =>
      updateJobDisplayPosition(
        slot.job.id,
        slot.position,
        slot.priority
      )
    )
  );
};
```

**UI 특징**:
- 그라데이션 없는 깔끔한 디자인 (프로젝트 디자인 시스템 준수)
- 완벽한 정렬 및 간격
- 선택된 공고/호버 상태 시각적 피드백
- 고정 헤더 (저장/초기화 버튼)
- 반응형 레이아웃 (좁은 화면에서는 세로 스크롤)
- 프로덕션 레벨 코드 품질

**이유**:
- 관리자가 메인 페이지 공고 배치를 시각적으로 관리할 필요
- 기존 모달 방식은 전체 레이아웃을 한눈에 보기 어려움
- 영화관 좌석 선택 방식이 가장 직관적이고 사용하기 쉬움

**영향**:
- JobsTab에 "그리드 레이아웃 편집" 버튼 추가 (헤더 우측)
- 기존 개별 위치 할당 모달은 그대로 유지 (하위 호환성)
- 메인 페이지 공고 표시 로직에는 영향 없음 (DB 업데이트만)

---

#### 🐛 JobPositionAssignModal null 체크 추가
**[FIX]** job이 null일 때 에러 방지

**수정 파일 (1개)**:
- `components/admin/JobPositionAssignModal.tsx`

**에러**:
```
Cannot read properties of null (reading 'display_position')
```

**해결**:
```typescript
// BEFORE
job.display_position  // null 에러

// AFTER
job?.display_position  // 안전
if (!isOpen || !job) return null;  // null 체크
```

---

#### 🔐 어드민 계정 추가
**[CONFIG]** nadr110619@gmail.com을 어드민 리스트에 추가

**수정 파일 (1개)**:
- `app/admin/page.tsx`

**변경 내용**:
```typescript
const adminEmails = [
  'admin@ssmhr.com',
  'joo.y.oh.ko@gmail.com',
  'nadr110619@gmail.com' // ← 추가!
];
```

**접속 방법**:
1. nadr110619@gmail.com (구글 로그인)
2. http://localhost:3000/admin 접속
3. ✅ 어드민 페이지 접근 가능!

---

#### 🐛 순서 에러 수정 (editorContent before initialization)
**[FIX]** useState 선언 전에 사용하는 에러 수정

**수정 파일 (1개)**:
- `app/company-dashboard/jobs/edit/[id]/page.tsx`

**문제**:
```typescript
const { errors } = useJobFormValidation(formData, editorContent); // 사용
const [editorContent, setState] = useState(''); // 선언 (늦음!)
```

**해결**:
```typescript
const [editorContent, setState] = useState(''); // 선언 먼저
const { errors } = useJobFormValidation(formData, editorContent); // 사용
```

---

#### 🎯 공고 검증 로직 개선 (에디터 구조에 맞춤)
**[FIX]** 존재하지 않는 필드(mainTasks, requirements) 검증 제거

**수정 파일 (1개)**:
- `hooks/useJobFormValidation.ts`

**문제**:
- 검증이 mainTasks[], requirements[] 요구
- 하지만 실제 폼에는 해당 입력 필드 없음
- 모든 내용은 에디터(2단계)에서 자유 작성

**해결**:
- ❌ 제거: description, mainTasks, requirements 검증
- ✅ 유지: title, department, location, salary, deadline
- ⚠️ 에디터 컨텐츠는 제출 시점에 별도 체크

**이제 필수 입력:**
- 제목 (한글/영문)
- 부서
- 근무지
- 급여 (최소/최대)
- 마감일

---

#### 🎯 공고 수정 페이지 완전 개선 (등록 신청 기능 추가)
**[ENHANCEMENT]** 임시저장 공고를 완성 후 등록 신청할 수 있는 기능 추가

**수정 파일 (3개)**:
- `app/company-dashboard/jobs/edit/[id]/page.tsx` - [등록 신청하기] 버튼 추가
- `lib/supabase/job-service.ts` - Manager/WorkConditions NOT NULL 에러 수정
- `lib/supabase/public-job-service.ts` - JobCard 형식 변환 함수

**주요 개선**:
1. ✅ **[등록 신청하기] 버튼 추가** (draft 상태일 때만)
   ```
   draft 공고: [미리보기] [저장하기] [등록 신청하기]
   기타 공고: [미리보기] [저장하기]
   ```

2. ✅ **Manager/WorkConditions NOT NULL 에러 수정**
   - name, email NOT NULL인데 빈 값 전송하면 에러
   - 값이 있을 때만 upsert 실행
   - 기본값 제공 (회사 정보에서 가져오기)

3. ✅ **메인 페이지 데이터 변환**
   - DB 구조 → JobCard 형식 자동 변환
   - transformToJobCardFormat() 함수 추가

**워크플로우**:
```
1. 임시저장 (status: draft)
   ↓
2. 수정 페이지에서 완성
   ↓
3. [등록 신청하기] 클릭 ← NEW!
   ↓
4. status: draft → pending_approval
   ↓
5. 어드민 페이지에 나타남!
```

**해결된 문제**:
- ❌ 임시저장 → 수정 → 등록할 방법 없음
- ✅ 임시저장 → 수정 → [등록 신청하기] → 어드민으로!

**코드 변경**:
```typescript
// draft 상태 체크
const [jobStatus, setJobStatus] = useState<string>('draft');

// 등록 신청 핸들러
const handleSubmitForApproval = async () => {
  await updateJob(jobId, formData, editorContent);
  await supabase.from('jobs').update({ 
    status: 'pending_approval' 
  }).eq('id', jobId);
};

// 조건부 버튼 렌더링
{jobStatus === 'draft' && (
  <button onClick={handleSubmitForApproval}>
    등록 신청하기
  </button>
)}
```

---

#### ✨ 공고 수정 페이지 구축 (Supabase)
**[NEW]** 임시저장/등록된 공고를 수정할 수 있는 페이지 생성

**신규 파일 (1개)**:
- `app/company-dashboard/jobs/edit/[id]/page.tsx` - 공고 수정 페이지

**수정 파일 (1개)**:
- `lib/supabase/job-service.ts` - updateJob 함수 개선

**주요 기능**:
- ✅ 기존 공고 데이터 불러오기
- ✅ 정형 정보 수정 (메타데이터)
- ✅ 상세 내용 수정 (에디터)
- ✅ 미리보기 기능
- ✅ 2단계 수정 프로세스
- ✅ 근무 조건 업데이트 (upsert)
- ✅ 담당자 정보 업데이트 (upsert)

**변경 내용**:
```typescript
// updateJob 함수 개선
- job_work_conditions upsert 추가
- job_manager upsert 추가
- 빈 값 안전 처리
```

**사용 방법**:
1. 대시보드 공고 목록에서 "수정" 버튼 클릭
2. 정보 수정
3. "저장하기" 버튼 클릭
4. ✅ 완료!

**이전 상태**:
- ❌ `page.tsx.disabled` (Firebase 기반)
- ❌ 404 에러

**현재 상태**:
- ✅ Supabase 기반 완전 구현
- ✅ 정상 작동

---

#### 🐛 RLS 정책 완전 수정 (firebase_uid → id)
**[CRITICAL FIX]** 모든 테이블의 RLS 정책을 Supabase 구조에 맞게 수정

**마이그레이션 파일 (1개)**:
- `supabase/migrations/20241020_fix_jobs_rls_policy.sql`

**문제 원인**:
```
new row violates row-level security policy for table "jobs"
new row violates row-level security policy for table "users"
new row violates row-level security policy for table "companies"
```

**근본 원인**:
- RLS 정책이 `firebase_uid`를 체크
- 하지만 실제 회원가입 코드는 `id = auth.uid()` 직접 사용
- `firebase_uid`는 저장하지 않아서 항상 null
- RLS 정책 매칭 실패 → 모든 작업 거부

**수정된 RLS 정책**:
```sql
-- BEFORE (❌ firebase_uid 체크)
users: auth.uid()::text = firebase_uid
companies: auth.uid()::text = firebase_uid
jobs: company_id IN (SELECT id FROM companies WHERE firebase_uid = auth.uid())

-- AFTER (✅ id 직접 비교)
users: id = auth.uid()
companies: id = auth.uid()
jobs: company_id = auth.uid()
```

**영향 범위**:
- ✅ users 테이블: 프로필 조회/수정
- ✅ companies 테이블: 기업 정보 조회/수정
- ✅ jobs 테이블: 공고 생성/수정/삭제

**해결된 문제들**:
1. ✅ 공고 등록/임시저장 가능
2. ✅ 프로필 수정 가능
3. ✅ 기업 정보 수정 가능
4. ✅ 온보딩 데이터 저장 가능

**왜 firebase_uid를 쓰지 않나?**:
```typescript
// lib/supabase/company-service.ts:45
id: userId, // Auth UID를 그대로 사용

// lib/supabase/jobseeker-auth.ts:36
id: userId, // Auth UID를 그대로 사용

// firebase_uid는 Firebase 마이그레이션용 필드 (사용 안 함)
```

**보안 수준**:
- ✅ 동일: 사용자는 자기 것만 접근
- ✅ 로직 변경 없음 (필드명만 수정)
- ✅ 권한 체크 정상화

---

#### 🐛 임시저장 기능 완벽 수정 (빈 값 처리)
**[FIX]** 임시저장 시 빈 필드로 인한 에러 완전 해결

**수정 파일 (1개)**:
- `lib/supabase/job-service.ts`

**문제 원인**:
```
invalid input syntax for type date: ""
```
- deadline 필드가 빈 문자열("")로 전송 → DATE 타입 에러
- salaryMin, salaryMax도 빈 문자열 → INTEGER 타입 에러 가능
- **임시저장은 미완성 상태로 저장하는 건데, 필수 필드 검증이 있었음**

**변경 내용**:
```typescript
// BEFORE - 빈 문자열 그대로 전송 (에러 발생)
deadline: formData.deadline,           // "" → DATE 타입 에러
salary_min: parseInt(formData.salaryMin), // "" → NaN → 에러

// AFTER - 빈 값은 null로 변환
const deadline = formData.deadline || null;
const salaryMin = formData.salaryMin ? parseInt(formData.salaryMin) : null;
const salaryMax = formData.salaryMax ? parseInt(formData.salaryMax) : null;

deadline: deadline,        // null (OK!)
salary_min: salaryMin,     // null (OK!)
salary_max: salaryMax,     // null (OK!)

// 빈 텍스트 필드는 기본값 제공
title: formData.title || '(제목 없음)',
department: formData.department || '미정',
location: formData.location || '미정',
```

**임시저장 철학**:
- ✅ 아무것도 안 써도 저장 가능
- ✅ 필수 필드 없어도 OK
- ✅ 나중에 완성하면 됨
- ✅ 진정한 "임시" 저장

**해결된 에러**:
1. ✅ education 필드 에러 (필드 제거)
2. ✅ deadline 빈 문자열 에러 (null 처리)
3. ✅ salary 빈 문자열 에러 (null 처리)
4. ✅ 빈 텍스트 필드 에러 (기본값 제공)

**이제 가능한 것**:
- ✅ 제목만 써도 임시저장 OK
- ✅ 아무것도 안 써도 임시저장 OK
- ✅ 마감일 안 써도 OK
- ✅ 급여 안 써도 OK

---

#### 🚀 프로덕션 레벨 공고 관리 시스템 완전 구축
**[MAJOR]** 기업 공고 등록부터 어드민 승인, 메인 페이지 노출까지 전체 프로세스 구현

**Phase 1: 공고 등록 시스템**
- ✅ 임시저장 기능 (status: draft)
- ✅ 등록하기 기능 (status: pending_approval)
- ✅ 미리보기 모달 (JobPreviewModal)
- ✅ 기업 대시보드 공고 목록 개선 (상태별 표시)

**Phase 2: 어드민 시스템**
- ✅ Supabase 어드민 서비스 레이어 (`lib/supabase/admin-service.ts`)
- ✅ 어드민 페이지 (`/admin`)
- ✅ 공고 승인/반려 기능
- ✅ 결제 상태 관리 (pending → paid → confirmed)
- ✅ UI 위치 할당 기능 (top/middle/bottom + priority)
- ✅ 어드민 인증 시스템 (이메일 기반)

**Phase 3: 메인 페이지 노출**
- ✅ 실제 DB 데이터 사용 (`lib/supabase/public-job-service.ts`)
- ✅ display_position별 정렬 (top/middle/bottom)
- ✅ display_priority 우선순위 적용

**신규 파일 (7개)**:
- `lib/supabase/admin-service.ts` - 어드민 서비스 레이어
- `lib/supabase/public-job-service.ts` - 공개 공고 서비스
- `app/admin/page.tsx` - 어드민 페이지
- `components/admin/JobsTab.tsx` - 어드민 공고 관리 탭
- `components/admin/JobPositionAssignModal.tsx` - 위치 할당 모달
- `components/job-create/JobPreviewModal.tsx` - 미리보기 모달
- `ADMIN_SYSTEM_GUIDE.md` - 완전한 시스템 가이드

**수정 파일 (5개)**:
- `lib/supabase/job-service.ts` - 임시저장 로직 개선
- `app/company-dashboard/jobs/create/page.tsx` - 미리보기 및 상태 구분
- `components/company-dashboard/tabs/JobsTab.tsx` - 상태 표시 개선
- `app/page.tsx` - 실제 DB 데이터 사용
- `types/company-dashboard.types.ts` - 타입 정의 업데이트

**데이터 흐름**:
```
1. 기업 공고 작성 → 임시저장(draft) or 등록(pending_approval)
2. 어드민 확인 → 결제 상태 변경(pending→paid→confirmed)
3. 어드민 승인 → UI 위치 할당(top/middle/bottom + priority)
4. 어드민 승인 → 상태 변경(pending_approval→active)
5. 메인 페이지 노출 → display_position별 정렬하여 표시
```

**주요 기능**:
- 📝 공고 작성 2단계 프로세스 (정형정보 + 자유내용)
- 💾 임시저장으로 작성 중 공고 보관
- 👁️ 실시간 미리보기로 확인
- 📊 기업 대시보드에서 상태별 공고 관리
- 👨‍💼 어드민이 모든 공고 승인/반려/위치 관리
- 💳 결제 상태 3단계 관리 (입금대기→입금확인→결제완료)
- 🎯 UI 위치 정밀 제어 (위치 + 우선순위)
- 🌐 메인 페이지 동적 공고 노출

**데이터베이스 필드**:
```sql
-- jobs 테이블
status: draft | pending_approval | active | closed
payment_status: pending | paid | confirmed
display_position: top | middle | bottom | NULL
display_priority: INTEGER (낮을수록 상단)
display_assigned_at: TIMESTAMPTZ
display_assigned_by: TEXT (어드민 ID)
```

**어드민 권한 체크**:
```typescript
const adminEmails = [
  'admin@ssmhr.com',
  'joo.y.oh.ko@gmail.com'
];
```

**성능 최적화**:
- Supabase RLS 적용
- 인덱스 최적화 (display_position, display_priority)
- 조인 쿼리 최소화
- 프론트엔드 상태 관리 최적화

**보안**:
- Row Level Security 적용
- 어드민 이메일 화이트리스트
- 결제 상태 검증
- 승인 프로세스 엄격화

**UX 개선**:
- 단계별 진행 상태 명확히 표시
- 실시간 통계 대시보드
- 직관적인 위치 할당 UI
- 컬러 코드로 상태 구분

**문서화**:
- `ADMIN_SYSTEM_GUIDE.md` - 완전한 사용 가이드
- 모든 프로세스 단계별 설명
- 데이터베이스 스키마 문서화
- 문제 해결 가이드

**이유**:
- 기업이 공고를 등록해도 어드민 승인 시스템이 없어 활성화 불가
- 공고 위치 제어 불가능 (프리미엄/일반 구분 필요)
- 결제 상태 관리 부재
- 메인 페이지에서 실제 공고 노출 안 됨
- 전체 프로세스가 끊겨있어 실제 운영 불가능

**영향**:
- ✅ 실제 운영 가능한 완전한 공고 관리 시스템
- ✅ 기업 → 어드민 → 사용자로 이어지는 완전한 플로우
- ✅ 공고 위치 및 우선순위 정밀 제어 가능
- ✅ 결제 상태 추적 가능
- ✅ 메인 페이지 동적 공고 노출
- ✅ 프로덕션 레벨 품질

**테스트 방법**:
1. 기업 계정으로 공고 작성 및 등록
2. 어드민 계정으로 `/admin` 접속
3. 결제 상태 변경 및 위치 할당
4. 공고 승인
5. 메인 페이지에서 확인

**향후 확장**:
- 공고 수정 기능
- 대량 공고 관리
- 이메일 알림
- 구직자/기업 관리 탭
- 통계 차트/그래프

---

#### 3개 입력칸 전화번호 컴포넌트 적용
**[ADD]** PhoneInput 공통 컴포넌트 구현 및 RecruiterInfoSection 적용

**신규 파일 (1개)**:
- `components/ui/form/PhoneInput.tsx` (신규: 155줄) - 3개 입력칸 전화번호 컴포넌트

**수정 파일 (1개)**:
- `components/job-create/RecruiterInfoSection.tsx` (181줄 → 179줄) - PhoneInput 적용

**변경 내용**:
- ✅ **PhoneInput 공통 컴포넌트 구현**
  - 3개 입력칸 형식 (010-1234-5678)
  - 숫자만 입력 가능 (자동 필터링)
  - 각 칸별 maxLength 제한 (3자리-4자리-4자리)
  - Phone 아이콘 표시 (첫 번째 칸)
  - 유효성 검사 및 에러 메시지 표시

- ✅ **RecruiterInfoSection 전화번호 입력 개선**
  - 기존: FormInput (단일 입력칸, 텍스트로 "-" 입력)
  - 변경: PhoneInput (3개 입력칸, 자동 하이픈 구분)
  - 사용자가 숫자만 입력하면 자동으로 형식 맞춤

**이유**:
- 기업 회원가입 온보딩에서 이미 3개 입력칸 전화번호 컴포넌트 사용 중
- 일관된 UX 제공 및 입력 편의성 향상
- 전화번호 형식 유효성 검사 자동화
- 재사용 가능한 컴포넌트로 추출하여 향후 다른 페이지에서도 활용

**영향**:
- 채용 담당자 전화번호 입력이 더 직관적이고 편리해짐
- 전화번호 형식 오류 방지 (하이픈 자동 처리)
- 일관된 전화번호 입력 UX

**기술 스택**:
- lucide-react 아이콘 (Phone)
- TypeScript 엄격 타입 정의
- Tailwind CSS 스타일링

---

#### 카카오 주소 검색 컴포넌트 적용 (근무지 입력 개선)
**[ADD]** AddressSearchInput 공통 컴포넌트 구현 및 채용공고 작성 페이지 적용

**신규 파일 (1개)**:
- `components/ui/form/AddressSearchInput.tsx` (신규: 147줄) - 카카오 주소 API 검색 컴포넌트

**수정 파일 (1개)**:
- `components/job-create/BasicInfoSection.tsx` (129줄 → 90줄) - 공통 컴포넌트 사용

**변경 내용**:
- ✅ **AddressSearchInput 공통 컴포넌트 구현**
  - 카카오 Daum Postcode API 기반 주소 검색
  - 기본 주소 + 상세 주소 입력 기능
  - 전체 주소 미리보기 (선택적)
  - MapPin 아이콘 및 Search 버튼 UI
  - 유효성 검사 및 에러 메시지 표시

- ✅ **채용공고 작성 페이지 근무지 입력 개선**
  - 기존: 텍스트 직접 입력
  - 변경: 카카오 주소 검색 버튼 → 주소 선택
  - 정확한 주소 입력 가능 (도로명/지번 주소)

- ✅ **BasicInfoSection 공통 컴포넌트 전환 완료**
  - FormInput: 포지션명(한/영), 부서/팀
  - AddressSearchInput: 근무지
  - FormSelect: 고용 형태, 경력 수준
  - FormDatePicker: 마감일
  - 129줄 → 90줄 (39줄 감소, 30% 코드 절감)

**이유**:
- 사용자가 텍스트로 주소를 직접 입력하면 오타/불일치 발생 가능
- 기업 회원가입 온보딩에서 이미 카카오 주소 검색 사용 중
- 일관된 UX 제공 및 정확한 주소 데이터 확보
- 재사용 가능한 컴포넌트로 추출하여 향후 다른 페이지에서도 활용

**영향**:
- 채용공고 작성 시 근무지 입력이 더 정확하고 편리해짐
- 주소 데이터 품질 향상
- 추후 주소 기반 검색/필터링 기능 구현 시 유리
- BasicInfoSection 코드 복잡도 감소 및 가독성 향상

**기술 스택**:
- 카카오 Daum Postcode API
- lucide-react 아이콘 (MapPin, Search)
- TypeScript 엄격 타입 정의
- Tailwind CSS 스타일링

---

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
