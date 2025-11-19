# 어드민 시스템 완벽 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [전체 프로세스](#전체-프로세스)
3. [어드민 시스템 사용법](#어드민-시스템-사용법)
4. [기술 구조](#기술-구조)
5. [데이터베이스 스키마](#데이터베이스-스키마)

---

## 🎯 시스템 개요

### 구축 완료된 기능

#### ✅ Phase 1: 공고 등록 시스템
- **임시저장** (`status: draft`)
- **등록하기** (`status: pending_approval`)
- **미리보기** (실시간 공고 미리보기 모달)
- **기업 대시보드** (공고 상태별 확인)

#### ✅ Phase 2: 어드민 시스템
- **어드민 페이지** (`/admin`)
- **공고 승인/반려** 기능
- **결제 상태 관리** (pending → paid → confirmed)
- **UI 위치 할당** (top/middle/bottom + priority)
- **어드민 인증** (이메일 기반)

#### ✅ Phase 3: 메인 페이지 노출
- **실제 DB 데이터 사용**
- **display_position별 정렬**
- **우선순위 적용**

---

## 🔄 전체 프로세스

### 1. 기업이 공고 작성
```
기업 대시보드 → "새 공고 등록" 버튼 클릭
  ↓
1단계: 정형 정보 입력 (JobMetadataForm)
  - 기본 정보, 급여, 언어, 근무조건 등
  ↓
2단계: 상세 내용 작성 (JobContentEditor)
  - WYSIWYG 에디터로 자유 작성
  ↓
[임시저장] or [미리보기] or [등록하기]
```

### 2. 임시저장
```
"임시저장" 버튼 클릭
  ↓
status: 'draft' 저장
  ↓
기업 대시보드에서 "임시저장" 상태로 표시
```

### 3. 등록하기
```
"등록하기" 버튼 클릭
  ↓
status: 'pending_approval' 저장
payment_status: 'pending'
  ↓
기업 대시보드에서 "승인대기" 상태로 표시
  ↓
어드민 페이지에 나타남
```

### 4. 어드민 승인 프로세스
```
어드민 로그인 (/admin)
  ↓
공고 관리 탭에서 pending_approval 공고 확인
  ↓
1. 결제 상태 확인
   pending → paid (입금 확인) → confirmed (결제 완료)
  ↓
2. UI 위치 할당
   - display_position 선택 (top/middle/bottom)
   - display_priority 설정 (숫자가 낮을수록 상단)
  ↓
3. 공고 승인
   status: 'pending_approval' → 'active'
  ↓
메인 페이지에 노출 시작!
```

### 5. 메인 페이지 노출
```
메인 페이지 접속
  ↓
Supabase에서 active 상태 공고 조회
  ↓
display_position별 그룹화:
  - topJobs (최상단 영역)
  - middleJobs (중단 영역)
  - bottomJobs (하단 영역)
  ↓
각 영역 내에서 display_priority 순서대로 정렬
  ↓
화면에 표시
```

---

## 👨‍💼 어드민 시스템 사용법

### 어드민 로그인

1. **URL 접속**
   ```
   http://localhost:3000/admin
   ```

2. **인증 이메일**
   ```typescript
   // app/admin/page.tsx에 정의됨
   const adminEmails = [
     'admin@ssmhr.com',
     'joo.y.oh.ko@gmail.com'
   ];
   ```

3. **로그인**
   - 위 이메일로 로그인하면 자동으로 어드민 페이지 접근 가능

### 공고 관리

#### 1. 통계 확인
대시보드 상단에 실시간 통계 표시:
- 전체 공고 수
- 승인대기 공고
- 활성 공고
- 임시저장 공고
- 입금대기/확인/완료
- 위치미할당 공고
- 마감 공고

#### 2. 공고 목록
각 공고별로 다음 정보 표시:
- **공고 정보**: 제목, 회사명, 로고
- **상태**: active/pending_approval/draft/closed
- **노출 위치**: premium/top/standard
- **결제 정보**: 금액, 기간
- **결제 상태**: pending/paid/confirmed (드롭다운으로 변경 가능)
- **UI 위치**: top/middle/bottom + priority

#### 3. 결제 상태 변경
```
드롭다운 메뉴에서 선택:
  - 입금 대기 (pending)
  - 입금 확인 (paid)
  - 결제 완료 (confirmed)
```

#### 4. UI 위치 할당
```
"위치 할당하기" 버튼 클릭
  ↓
모달 팝업
  ↓
1. 노출 위치 선택:
   - 최상단 영역 (프리미엄 공고)
   - 중단 영역 (일반 공고)
   - 하단 영역 (추가 공고)
  ↓
2. 우선순위 입력 (1-999)
   - 1이 최상단
  ↓
"위치 설정" 버튼 클릭
```

#### 5. 공고 승인/반려
```
승인대기 상태 공고:
  - ✓ 버튼: 승인 → status: 'active'
  - ✕ 버튼: 반려 → status: 'closed'
```

---

## 🏗️ 기술 구조

### 파일 구조

```
프로젝트/
├── app/
│   ├── admin/
│   │   └── page.tsx                    # 어드민 메인 페이지
│   ├── company-dashboard/
│   │   └── jobs/
│   │       └── create/
│   │           └── page.tsx            # 공고 등록 페이지
│   └── page.tsx                        # 메인 페이지 (공고 노출)
│
├── components/
│   ├── admin/
│   │   ├── JobsTab.tsx                 # 어드민 공고 관리 탭
│   │   └── JobPositionAssignModal.tsx  # 위치 할당 모달
│   ├── job-create/
│   │   ├── JobPreviewModal.tsx         # 미리보기 모달
│   │   ├── metadata/
│   │   │   └── JobMetadataForm.tsx     # 정형 정보 입력
│   │   └── editor/
│   │       └── JobContentEditor.tsx    # 상세 내용 에디터
│   └── company-dashboard/
│       └── tabs/
│           └── JobsTab.tsx             # 기업 공고 관리 탭
│
└── lib/
    └── supabase/
        ├── admin-service.ts            # 어드민 서비스 레이어
        ├── job-service.ts              # 공고 서비스 레이어
        └── public-job-service.ts       # 공개 공고 서비스
```

### 주요 함수

#### 1. 공고 등록
```typescript
// lib/supabase/job-service.ts
createJob(
  formData: JobFormData,
  companyId: string,
  editorContent: string,
  isDraft: boolean = false
)
```

#### 2. 어드민 서비스
```typescript
// lib/supabase/admin-service.ts

// 통계 조회
getAdminStats()
getJobStats()

// 공고 조회
getAllJobs()
getPendingApprovalJobs()

// 상태 업데이트
updateJobStatus(jobId, status, adminId)
updatePaymentStatus(jobId, paymentStatus)
updateJobDisplayPosition(jobId, displayPosition, displayPriority, adminId)
```

#### 3. 공개 공고 조회
```typescript
// lib/supabase/public-job-service.ts

// 위치별 공고 조회
getActiveJobs() // { topJobs, middleJobs, bottomJobs }

// 추천 공고
getFeaturedJobs(limit)

// 프리미엄 공고
getPremiumJobs(limit)
```

---

## 💾 데이터베이스 스키마

### jobs 테이블 주요 필드

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  
  -- 기본 정보
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  
  -- 급여
  salary_min INTEGER,
  salary_max INTEGER,
  salary_negotiable BOOLEAN,
  
  -- 상세 정보
  description TEXT NOT NULL,
  visa_sponsorship BOOLEAN,
  korean_level TEXT,
  english_level TEXT,
  
  -- 과금 정보
  posting_tier TEXT NOT NULL,        -- standard | top | premium
  posting_price INTEGER NOT NULL,
  posting_duration INTEGER NOT NULL,
  posting_vat_amount INTEGER NOT NULL,
  posting_total_amount INTEGER NOT NULL,
  
  -- 결제 정보
  payment_status TEXT DEFAULT 'pending',  -- pending | paid | confirmed
  payment_paid_at TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  
  -- UI 노출 위치 (관리자 할당)
  display_position TEXT,             -- top | middle | bottom | NULL
  display_priority INTEGER,          -- 우선순위 (낮을수록 상단)
  display_assigned_at TIMESTAMPTZ,
  display_assigned_by TEXT,
  
  -- 메타 정보
  deadline DATE,
  status TEXT DEFAULT 'pending_approval',  -- pending_approval | active | closed | draft
  views INTEGER DEFAULT 0,
  applicants INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 상태(status) 정의

| 상태 | 의미 | 설명 |
|------|------|------|
| `draft` | 임시저장 | 아직 제출하지 않은 공고 |
| `pending_approval` | 승인대기 | 제출했지만 어드민 승인 대기 중 |
| `active` | 활성 | 승인되어 메인 페이지에 노출 중 |
| `closed` | 마감 | 마감되거나 반려된 공고 |

### 결제 상태(payment_status) 정의

| 상태 | 의미 | 설명 |
|------|------|------|
| `pending` | 입금대기 | 결제 대기 중 |
| `paid` | 입금확인 | 입금 확인됨 |
| `confirmed` | 결제완료 | 결제 완료 (위치 할당 가능) |

### 노출 위치(display_position) 정의

| 위치 | 의미 | 용도 |
|------|------|------|
| `top` | 최상단 영역 | 프리미엄/최상단 공고 |
| `middle` | 중단 영역 | 일반 공고 |
| `bottom` | 하단 영역 | 추가 공고 |
| `NULL` | 미할당 | 아직 위치가 할당되지 않음 |

---

## 🎬 시작하기

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 어드민 계정으로 로그인
```
1. http://localhost:3000/login 접속
2. admin@ssmhr.com (또는 설정된 어드민 이메일) 로그인
3. http://localhost:3000/admin 접속
```

### 3. 테스트 플로우
```
1. 기업 계정으로 로그인
2. 공고 작성 및 등록
3. 어드민 계정으로 전환
4. 어드민 페이지에서 공고 확인
5. 결제 상태 변경
6. UI 위치 할당
7. 공고 승인
8. 메인 페이지에서 확인
```

---

## 🔒 보안 고려사항

### 현재 구현
- 이메일 기반 어드민 체크
- Supabase Row Level Security (RLS) 적용

### 프로덕션 권장사항
1. **Role-Based Access Control (RBAC)**
   - users 테이블에 role 필드 추가
   - admin, manager, editor 등 역할 구분

2. **감사 로그(Audit Log)**
   - 어드민 액션 기록
   - 누가, 언제, 무엇을 변경했는지 추적

3. **2FA (Two-Factor Authentication)**
   - 어드민 계정에 2단계 인증 추가

---

## 📝 향후 개선 사항

### 우선순위 높음
- [ ] 공고 수정 기능
- [ ] 공고 통계 (조회수, 지원자 수)
- [ ] 이메일 알림 (승인/반려 시)

### 우선순위 중간
- [ ] 대량 공고 관리 (일괄 승인/반려)
- [ ] 공고 검색/필터링
- [ ] 엑셀 내보내기

### 우선순위 낮음
- [ ] 구직자 관리 탭
- [ ] 기업 관리 탭
- [ ] 신청 관리 탭
- [ ] 대시보드 차트/그래프

---

## 🆘 문제 해결

### Q: 어드민 페이지 접속이 안 돼요
**A:** `app/admin/page.tsx`의 `adminEmails` 배열에 이메일이 추가되어 있는지 확인하세요.

### Q: 공고가 메인 페이지에 안 나타나요
**A:** 다음을 확인하세요:
1. status가 'active'인지
2. display_position이 할당되어 있는지
3. 메인 페이지에서 "실제 DB 데이터 사용" 체크박스가 켜져 있는지

### Q: 위치 할당이 안 돼요
**A:** payment_status가 'confirmed'인지 확인하세요. 결제 완료 후에만 위치 할당이 가능합니다.

---

## 📞 연락처

문제가 발생하면 시스템 관리자에게 문의하세요.

---

**마지막 업데이트:** 2025-10-20
**버전:** 1.0.0
**작성자:** AI Development Team
















