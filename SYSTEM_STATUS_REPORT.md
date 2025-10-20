# 🔍 공고 관리 시스템 완전 상태 점검 보고서

**작성일:** 2025-10-20
**목적:** 전체 시스템 구현 상태 및 동작 프로세스 철저 파악

---

## 📊 1. 전체 프로세스 흐름도

### 🏢 기업 측 (현재 상태)

```
┌─────────────────────────────────────────────┐
│ 공고 작성 페이지                             │
│ /company-dashboard/jobs/create              │
│                                             │
│ [임시저장] → status: draft                  │
│ [등록하기] → status: pending_approval       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 기업 대시보드                                │
│ /company-dashboard?tab=jobs                 │
│                                             │
│ - 임시저장 공고 (회색)                       │
│ - 승인대기 공고 (노란색)                     │
│ - 활성 공고 (초록색)                         │
│                                             │
│ [수정] [삭제] 가능 ✅                        │
└─────────────────────────────────────────────┘
```

### 👨‍💼 어드민 측 (현재 상태)

```
┌─────────────────────────────────────────────┐
│ 어드민 페이지                                 │
│ /admin                                      │
│                                             │
│ ✅ 구현됨 - JobsTab 컴포넌트                 │
│                                             │
│ 통계 대시보드:                               │
│ - 전체 공고                                  │
│ - 승인대기 공고                              │
│ - 활성 공고                                  │
│ - 결제 상태별 통계                           │
│                                             │
│ 공고 목록:                                   │
│ - [승인] 버튼 → status: active              │
│ - [반려] 버튼 → status: closed              │
│ - 결제 상태 변경 (드롭다운)                  │
│ - [위치 할당] 버튼 → 모달 팝업               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 위치 할당 모달                               │
│ JobPositionAssignModal                      │
│                                             │
│ ✅ 구현됨                                    │
│                                             │
│ - display_position 선택:                    │
│   • top (최상단)                             │
│   • middle (중단)                            │
│   • bottom (하단)                            │
│                                             │
│ - display_priority 입력 (1-999)             │
│                                             │
│ [위치 설정] → DB 업데이트                    │
└─────────────────────────────────────────────┘
```

### 🌐 메인 페이지 (현재 상태)

```
┌─────────────────────────────────────────────┐
│ 메인 페이지                                  │
│ /                                           │
│                                             │
│ ⚠️ 부분 구현됨                              │
│                                             │
│ - getFeaturedJobs() 호출 ✅                 │
│ - active 상태 공고만 조회 ✅                │
│ - JobCard로 표시 ❌ (더미 데이터 구조)      │
│                                             │
│ [실제 DB 데이터 사용] 체크박스 있음          │
└─────────────────────────────────────────────┘
```

---

## 🐛 2. 발견된 문제들

### **문제 1: Manager Update Error**

**에러:**
```
Manager update error: {}
```

**원인:**
```typescript
// upsert 시 UNIQUE 제약 위반 가능
.upsert({
  job_id: jobId,  // UNIQUE 키
  name: formData.managerName || '',  // ← 빈 문자열이면 에러
  ...
})
```

**DB 스키마:**
```sql
CREATE TABLE job_manager (
  job_id UUID UNIQUE,
  name TEXT NOT NULL,  ← NOT NULL인데 빈 문자열 전송
  email TEXT NOT NULL, ← NOT NULL인데 빈 문자열 전송
  ...
)
```

**해결 필요:** NOT NULL 필드에 빈 값 전송 불가

---

### **문제 2: JobCard 데이터 구조 불일치**

**JobCard가 기대하는 구조 (더미 데이터):**
```typescript
{
  company: {
    name: string,
    nameEn: string,
    bannerImage: string  // ← 이거 없음
  },
  salary: {
    min: number,
    max: number,
    negotiable: boolean
  },
  tags: string[],
  experienceLevel: string,
  employmentType: string
}
```

**실제 DB에서 오는 구조:**
```typescript
{
  companies: {  // ← 'company'가 아님!
    name: string,
    logo: string | null
  },
  salary_min: number,  // ← 'salary' 객체가 아님!
  salary_max: number,
  // tags 배열 없음
  employment_type: string,
  experience_level: string
}
```

**해결 필요:** 데이터 변환 또는 JobCard 수정

---

### **문제 3: 공고 상세 페이지 없음**

**링크:**
```tsx
<Link href={`/jobs/${job.id}`}>
```

**실제 파일:**
```
app/jobs/[id]/page.tsx.disabled  ❌
```

**상태:** 404 에러 발생

---

## ✅ 3. 구현 완료된 기능

### Phase 1: 공고 등록 ✅
- ✅ 2단계 작성 프로세스
- ✅ 임시저장 (draft)
- ✅ 등록하기 (pending_approval)
- ✅ 미리보기 모달
- ✅ 기업 대시보드 목록

### Phase 2: 어드민 시스템 ✅
- ✅ 어드민 페이지 (/admin)
- ✅ 공고 목록 조회
- ✅ 승인/반려 버튼
- ✅ 결제 상태 변경
- ✅ 위치 할당 모달
- ✅ 통계 대시보드
- ✅ 어드민 인증

### Phase 3: 메인 페이지 ⚠️ (부분 구현)
- ✅ DB에서 공고 조회
- ⚠️ 데이터 구조 변환 필요
- ❌ 공고 상세 페이지 없음

---

## 🎯 4. 각 버튼의 동작

### **[임시저장] 버튼**
```typescript
// 현재 동작
1. createJob(formData, userId, editorContent, true)
2. status: 'draft' 저장
3. 대시보드로 이동
4. ✅ "임시저장" 상태로 표시

// 결과
- DB에 저장됨 ✅
- 어드민에는 안 보임 (draft 상태)
- 메인 페이지에 안 보임
```

### **[등록하기] 버튼**
```typescript
// 현재 동작
1. createJob(formData, userId, editorContent, false)
2. status: 'pending_approval' 저장
3. payment_status: 'pending'
4. 대시보드로 이동
5. ✅ "승인대기" 상태로 표시

// 결과
- DB에 저장됨 ✅
- 어드민에 보임 ✅ (pending_approval 목록)
- 메인 페이지에는 안 보임 (아직 승인 안 됨)
```

### **어드민 [승인] 버튼**
```typescript
// 구현된 동작
1. updateJobStatus(jobId, 'active')
2. status: 'pending_approval' → 'active'
3. ✅ DB 업데이트

// 결과
- 공고가 활성화됨 ✅
- 메인 페이지에 노출 가능 ⚠️ (위치 할당 필요)
```

### **어드민 [위치 할당] 버튼**
```typescript
// 구현된 동작
1. 모달 팝업 ✅
2. display_position 선택 (top/middle/bottom)
3. display_priority 입력
4. updateJobDisplayPosition(jobId, position, priority)
5. ✅ DB 업데이트

// 결과
- display_position 설정됨 ✅
- display_priority 설정됨 ✅
```

---

## 🌐 5. 메인 페이지 노출 조건

### **현재 구현:**
```typescript
// lib/supabase/public-job-service.ts
export async function getFeaturedJobs(limit: number = 6) {
  const { data: jobs } = await supabase
    .from('jobs')
    .select(...)
    .eq('status', 'active')  // ✅ active만
    .order('posted_at', { ascending: false })
    .limit(limit);
}
```

### **노출 조건:**
```
✅ status = 'active'
⚠️ display_position 체크 안 함 (모든 active 공고 표시)
✅ posted_at 기준 정렬
```

### **완벽한 노출 조건 (개선 필요):**
```
✅ status = 'active'
✅ display_position IS NOT NULL
✅ display_position별 그룹화
✅ display_priority 순서대로 정렬
```

---

## 🚨 6. 관리자 페이지에 공고 띄우는 방법

### **Step-by-Step**

```
1. 기업 계정으로 로그인
   ↓
2. 공고 작성 페이지 이동
   /company-dashboard/jobs/create
   ↓
3. 정보 입력 (일부만 입력해도 OK)
   ↓
4. [등록하기] 버튼 클릭 ← 중요!
   (임시저장 말고 등록하기!)
   ↓
5. status: 'pending_approval' 저장
   ↓
6. 어드민 계정으로 로그인
   (admin@ssmhr.com 또는 joo.y.oh.ko@gmail.com)
   ↓
7. /admin 접속
   ↓
8. ✅ 공고 목록에 나타남!
```

---

## 📋 7. 현재 DB 데이터 확인

실제로 DB에 공고가 어떻게 저장되어 있는지 확인 필요:

```sql
-- Supabase SQL Editor에서 실행
SELECT 
  id,
  title,
  status,
  payment_status,
  display_position,
  display_priority,
  created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🛠️ 8. 즉시 수정 필요한 것들

### **우선순위 1: Manager/WorkConditions 에러**
```typescript
// 문제: NOT NULL 필드에 빈 값
// 해결: 빈 값이면 upsert 자체를 스킵
```

### **우선순위 2: JobCard 데이터 변환**
```typescript
// 문제: DB 구조와 컴포넌트 구조 불일치
// 해결: 변환 함수 또는 JobCard 수정
```

### **우선순위 3: 공고 상세 페이지**
```typescript
// 문제: /jobs/[id] 페이지 없음
// 해결: 페이지 생성 또는 링크 제거
```

---

## 🎯 9. 완전한 테스트 플로우

### **테스트 1: 공고 등록 → 승인 → 노출**

```
1. 기업 로그인
2. 공고 작성
3. [등록하기] 클릭
4. status: pending_approval ✅

5. 어드민 로그인
6. /admin 접속
7. pending_approval 공고 확인 ✅
8. 결제 상태: pending → confirmed
9. [위치 할당] → top, priority: 1
10. [승인] 클릭 → status: active

11. 메인 페이지 이동
12. "실제 DB 데이터 사용" 체크
13. ⚠️ 공고 표시 (데이터 구조 문제)
```

---

## 📝 10. 정리

### ✅ 완벽히 작동하는 것
- 공고 작성 (2단계)
- 임시저장 (draft)
- 등록하기 (pending_approval)
- 미리보기
- 기업 대시보드 목록
- 공고 수정 페이지
- 어드민 페이지 기본 구조
- 어드민 인증
- 어드민 통계
- 공고 승인/반려 로직
- 위치 할당 로직
- DB 조회 로직

### ⚠️ 부분 작동하는 것
- 메인 페이지 공고 노출 (데이터 구조 문제)
- upsert 로직 (NOT NULL 에러)

### ❌ 아직 안 되는 것
- 공고 상세 페이지 (/jobs/[id])
- JobCard 데이터 매핑

---

## 🔧 11. 즉시 수정 사항

1. **Manager/WorkConditions upsert 수정**
2. **JobCard 데이터 변환 함수**
3. **공고 상세 페이지 생성** (선택)

이제 하나씩 수정하겠습니다!


