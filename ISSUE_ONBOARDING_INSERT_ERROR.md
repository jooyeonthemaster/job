# 온보딩 완료 시 INSERT 에러 이슈

> **발생 시간**: 2025-10-19 22:15
> **상태**: 🔴 조사 중 (미해결)
> **우선순위**: P0 (치명적 - 온보딩 완료 불가)

---

## 🐛 에러 증상

### 에러 메시지
```
[Login] users INSERT 에러: {}
[completeOnboarding] INSERT 에러: {}
[completeOnboarding] 최종 에러: {}
[Jobseeker Onboarding] 에러: {}
```

### 발생 위치
1. `lib/supabase/jobseeker-onboarding.ts:99` - completeOnboarding INSERT 에러
2. `lib/supabase/jobseeker-onboarding.ts:142` - completeOnboarding 최종 에러
3. `hooks/useJobseekerOnboarding.ts:211` - Jobseeker Onboarding 에러
4. `app/login/page.tsx:185` - Login users INSERT 에러

### 증상
- 온보딩 완료 버튼 클릭 시 에러 발생
- 사용자가 대시보드로 이동하지 못함
- DB에 사용자 데이터가 저장되지 않음

---

## 🔍 원인 분석

### 1차 분석: NOT NULL 제약 조건 위반 의심

**DB 스키마 확인 결과** (`supabase/schema.sql`):

```sql
CREATE TABLE users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'jobseeker',

  -- 온보딩 필드
  full_name TEXT NOT NULL,             -- ✅ 필수
  desired_job_category TEXT,           -- ✅ NULL 허용 (방금 추가)
  headline TEXT,                       -- ✅ NULL 허용

  -- 연락처 & 신원 정보
  phone TEXT NOT NULL,                 -- ⚠️ 필수 (외국인은 빈 값?)
  phone_verified BOOLEAN DEFAULT false,
  foreigner_number TEXT NOT NULL,      -- ⚠️ 필수 (한국인은 빈 값?)
  foreigner_number_verified BOOLEAN DEFAULT false,

  -- 주소
  address TEXT NOT NULL,               -- ⚠️ 필수
  address_detail TEXT,                 -- ✅ NULL 허용

  -- 개인 정보
  nationality TEXT NOT NULL,           -- ⚠️ 필수
  gender TEXT NOT NULL,                -- ⚠️ 필수
  birth_year INTEGER,                  -- ✅ NULL 허용

  -- 비자 정보
  visa_types TEXT[] NOT NULL,          -- ⚠️ 필수
  korean_level TEXT NOT NULL,          -- ⚠️ 필수

  -- 선호 조건
  work_type TEXT,                      -- ✅ NULL 허용
  company_size TEXT,                   -- ✅ NULL 허용
  visa_sponsorship BOOLEAN DEFAULT false,
  remote_work TEXT,                    -- ✅ NULL 허용
  introduction TEXT,                   -- ✅ NULL 허용

  -- 약관
  agree_email_receive BOOLEAN DEFAULT false,
  agree_privacy_collection BOOLEAN DEFAULT false,

  -- 메타
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 문제점 발견

**NOT NULL 제약 조건이 있는 필드들**:
1. ✅ `full_name` - completeOnboarding에서 전달 O
2. ⚠️ `phone` - 외국인은 빈 문자열('') 전달 → **NOT NULL 제약 위반 가능**
3. ⚠️ `foreigner_number` - 한국인은 undefined 전달 → **NOT NULL 제약 위반!**
4. ⚠️ `address` - completeOnboarding에서 전달 O
5. ⚠️ `nationality` - completeOnboarding에서 전달 O
6. ⚠️ `gender` - completeOnboarding에서 전달 O
7. ⚠️ `visa_types` - 배열, completeOnboarding에서 전달 O
8. ⚠️ `korean_level` - completeOnboarding에서 전달 O

### 코드 확인: `jobseeker-onboarding.ts:33-57`

```typescript
const updateData: any = {
  full_name: data.fullName,
  desired_job_category: data.desired_job_category || null,
  phone: data.phone,                              // ✅ 전달됨
  headline: data.headline,
  resume_file_url: data.resumeFileUrl,
  resume_file_name: data.resumeFileName,
  resume_uploaded_at: data.resumeFileUrl ? new Date().toISOString() : null,
  onboarding_completed: true,
  updated_at: new Date().toISOString()
};

// K-Work 확장 필드 추가
updateData.phone_verified = data.phone_verified ?? false;
updateData.foreigner_number = data.foreigner_number || '';  // ⚠️ undefined일 때 ''
updateData.foreigner_number_verified = data.foreigner_number_verified ?? false;
updateData.address = data.address || '';                    // ⚠️ undefined일 때 ''
updateData.address_detail = data.address_detail || '';
updateData.nationality = data.nationality || '';            // ⚠️ undefined일 때 ''
updateData.birth_year = data.birth_year || null;
updateData.gender = data.gender || '';                      // ⚠️ undefined일 때 ''
updateData.visa_types = data.visa_types || [];              // ⚠️ undefined일 때 []
updateData.korean_level = data.korean_level || '';          // ⚠️ undefined일 때 ''
updateData.agree_email_receive = data.agree_email_receive ?? false;
updateData.agree_privacy_collection = data.agree_privacy_collection ?? false;
```

### 코드 확인: `useJobseekerOnboarding.ts:186-204`

```typescript
await completeOnboarding(user.id, {
  fullName: formData.fullName,
  desired_job_category: formData.desiredJobCategory,
  phone: isKorean ? formData.phone.replace(/-/g, '') : '',  // 외국인: ''
  headline: formData.headline || '',
  resumeFileUrl: undefined,
  resumeFileName: undefined,
  foreigner_number: !isKorean ? formData.foreignerNumber : undefined,  // ⚠️ 한국인: undefined
  address: formData.address,
  address_detail: formData.addressDetail,
  nationality: formData.nationality,
  birth_year: formData.birthYear ? parseInt(formData.birthYear) : undefined,
  gender: formData.gender,
  visa_types: formData.visaType,
  korean_level: formData.koreanLevel,
  otherLanguages: formData.otherLanguages,
  agree_email_receive: formData.agreeEmailReceive,
  agree_privacy_collection: formData.agreePrivacyTerms,
});
```

---

## 🎯 추정 원인 (우선순위 순)

### 원인 1: `foreigner_number` NOT NULL 제약 위반 (가능성 높음 ⭐⭐⭐)

**문제**:
- 스키마: `foreigner_number TEXT NOT NULL`
- 한국인의 경우: `foreigner_number: undefined` 전달
- jobseeker-onboarding.ts에서 `|| ''`로 빈 문자열 처리
- **빈 문자열('')도 NOT NULL 제약은 통과하지만, 의미상 문제 가능**

**근거**:
- 한국인은 외국인등록번호가 없어야 정상
- 하지만 DB 스키마는 `NOT NULL` 요구
- 빈 문자열('')과 NULL의 차이 문제

### 원인 2: 빈 문자열('') vs NULL 처리 불일치 (가능성 중간 ⭐⭐)

**문제**:
- 여러 필드가 `|| ''` 처리로 빈 문자열 저장
- DB 스키마는 `NOT NULL`이지만 빈 문자열 허용 여부 불명확
- Supabase Postgres는 빈 문자열을 NULL과 다르게 처리

### 원인 3: 에러 객체가 빈 객체로 출력되는 문제 (디버깅 방해 ⭐)

**문제**:
- `console.error('[completeOnboarding] INSERT 에러:', insertError);`
- 출력 결과: `{}`
- 실제 에러 내용이 숨겨져 있어 원인 파악 어려움

**가능한 이유**:
- Supabase 에러 객체가 직렬화되지 않음
- `JSON.stringify()` 필요
- 또는 `insertError.message`, `insertError.code` 등 개별 속성 출력 필요

---

## 🔧 해결 시도 방법 (순차적)

### 시도 1: 에러 로깅 개선 (디버깅 우선)

**목적**: 실제 에러 메시지 확인

**변경 위치**:
- `lib/supabase/jobseeker-onboarding.ts:99`
- `lib/supabase/jobseeker-onboarding.ts:142`

**변경 내용**:
```typescript
// BEFORE
console.error('[completeOnboarding] INSERT 에러:', insertError);

// AFTER
console.error('[completeOnboarding] INSERT 에러:', {
  message: insertError?.message,
  code: insertError?.code,
  details: insertError?.details,
  hint: insertError?.hint,
  fullError: JSON.stringify(insertError, null, 2)
});
```

**예상 결과**: 실제 에러 메시지 확인 가능

---

### 시도 2: DB 스키마 수정 (근본적 해결)

**목적**: NOT NULL 제약 완화

**방법 A - 특정 필드 NULL 허용**:
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE public.users
ALTER COLUMN foreigner_number DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN address DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN nationality DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN gender DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN visa_types DROP NOT NULL;

ALTER TABLE public.users
ALTER COLUMN korean_level DROP NOT NULL;
```

**장점**:
- 한국인/외국인 구분 시 유연함
- 온보딩 단계별 저장 가능

**단점**:
- 데이터 무결성 약화
- 필수 필드가 누락될 위험

**방법 B - DEFAULT 값 설정**:
```sql
-- 빈 문자열을 기본값으로
ALTER TABLE public.users
ALTER COLUMN foreigner_number SET DEFAULT '';

ALTER TABLE public.users
ALTER COLUMN phone SET DEFAULT '';

-- 배열은 빈 배열로
ALTER TABLE public.users
ALTER COLUMN visa_types SET DEFAULT '{}';
```

**장점**:
- NOT NULL 제약 유지
- INSERT 시 값 누락해도 기본값 사용

**단점**:
- 의미 없는 빈 값이 저장될 수 있음

---

### 시도 3: 코드 로직 수정 (임시 회피)

**목적**: NOT NULL 제약을 위반하지 않도록 데이터 보정

**변경 위치**: `lib/supabase/jobseeker-onboarding.ts:33-57`

**변경 내용**:
```typescript
// BEFORE
updateData.foreigner_number = data.foreigner_number || '';

// AFTER
updateData.foreigner_number = data.foreigner_number || '해당없음';  // 또는 'N/A'

// 또는 조건부 처리
if (data.foreigner_number) {
  updateData.foreigner_number = data.foreigner_number;
} else {
  updateData.foreigner_number = 'N/A';  // 명시적 표시
}
```

**장점**:
- 빠른 회피 가능
- DB 스키마 수정 불필요

**단점**:
- 'N/A' 같은 더미 데이터 저장
- 근본적 해결 아님

---

## 📊 다음 단계

### 1단계: 에러 로깅 개선 (즉시 실행)
- [ ] `jobseeker-onboarding.ts` 에러 로깅 상세화
- [ ] 실제 에러 메시지 확인
- [ ] CHANGELOG.md 업데이트

### 2단계: 실제 에러 확인 후 원인 분석
- [ ] Supabase에서 정확한 에러 코드 확인
- [ ] 어떤 필드가 제약 위반인지 특정
- [ ] 한국인 vs 외국인 케이스 분석

### 3단계: 근본 원인 해결
- [ ] DB 스키마 수정 (방법 A 또는 B)
- [ ] 코드 로직 수정 (필요시)
- [ ] 테스트 (한국인, 외국인 각각)

### 4단계: 검증 및 문서화
- [ ] 온보딩 E2E 테스트
- [ ] 해결 방법 CHANGELOG.md 기록
- [ ] TEST_GUIDE 업데이트

---

## 🔍 추가 조사 필요 사항

1. **Supabase 콘솔에서 직접 확인**:
   - SQL Editor에서 users 테이블 제약 조건 확인
   - `\d users` 또는 `SHOW CREATE TABLE users`

2. **브라우저 콘솔에서 확인**:
   - Network 탭에서 Supabase API 응답 확인
   - 실제 INSERT 쿼리 내용 확인

3. **로컬 테스트**:
   - 한국인 케이스로 온보딩 진행
   - 외국인 케이스로 온보딩 진행
   - 각각 어디서 에러 나는지 확인

---

## 📝 작업 기록

### 2025-10-19 22:30 - ✅ 원인 확정 및 해결 방법 제시

**에러 메시지 (확정)**:
```
Could not find the 'desired_job_category' column of 'users' in the schema cache
code: 'PGRST204'
```

**원인 (확정)**:
- ❌ schema.sql 파일만 수정했음
- ❌ 실제 Supabase 데이터베이스에는 컬럼이 존재하지 않음
- ✅ 코드에서 존재하지 않는 컬럼에 INSERT 시도 → PGRST204 에러

**해결 방법**:
1. **방법 1 (권장)**: Supabase SQL Editor에서 컬럼 추가
   ```sql
   ALTER TABLE public.users
   ADD COLUMN desired_job_category TEXT;
   ```

2. **방법 2 (임시)**: 코드에서 `desired_job_category` 필드 주석 처리
   - jobseeker-onboarding.ts:35 주석 처리 완료
   - 온보딩은 작동하지만 희망 직군 데이터는 저장 안 됨

**다음 단계**:
- Supabase에서 컬럼 추가 후 주석 해제
- 온보딩 테스트 재시도

---

### 2025-10-19 22:20 - 이슈 조사 시작

**조사 내용**:
- 에러 메시지 분석: `{}` 빈 객체로 출력됨
- DB 스키마 확인: 7개 필드에 NOT NULL 제약
- 코드 흐름 추적: useJobseekerOnboarding → completeOnboarding → Supabase INSERT

**발견 사항**:
- `foreigner_number TEXT NOT NULL` 제약 vs 한국인 `undefined` 전달
- 빈 문자열('') 처리로 회피 시도하지만 여전히 에러
- 에러 객체가 직렬화되지 않아 디버깅 어려움

**시도한 방법**:
- ✅ 에러 로깅 개선 → 실제 에러 메시지 확인 성공

---

### 2025-10-19 22:35 - ✅ 해결 완료

**해결 방법**:
```sql
-- Supabase SQL Editor에서 실행 완료
ALTER TABLE public.users
ADD COLUMN desired_job_category TEXT;
```

**확인 결과**:
```
column_name           | data_type | is_nullable
----------------------+-----------+------------
desired_job_category  | text      | YES
```

**코드 복구**:
- lib/supabase/jobseeker-onboarding.ts:35 주석 제거 완료
- 정상 코드로 복구: `desired_job_category: data.desired_job_category || null`

**결과**:
- ✅ 컬럼 추가 완료
- ✅ 온보딩 정상 작동 예상
- ✅ 희망 직군 데이터 저장 가능

**다음 단계**:
- 온보딩 E2E 테스트 진행

---

**작성자**: Claude Code
**최종 수정**: 2025-10-19 22:35
**상태**: ✅ 해결 완료
