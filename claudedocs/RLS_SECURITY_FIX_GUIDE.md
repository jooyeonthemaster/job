# RLS 보안 수정 가이드

> 작성일: 2025-12-17
> 목적: Supabase Linter 보안 경고 해결

---

## 목차

1. [문제 요약](#1-문제-요약)
2. [우선순위별 수정 계획](#2-우선순위별-수정-계획)
3. [테이블별 상세 수정 가이드](#3-테이블별-상세-수정-가이드)
4. [검증 체크리스트](#4-검증-체크리스트)

---

## 1. 문제 요약

### 1.1 현재 상황

Supabase Linter에서 **26개의 보안 경고** 발생:
- SECURITY DEFINER View: 2개
- RLS 비활성화 테이블: 24개

### 1.2 위험도 분류

| 위험도 | 테이블 수 | 설명 |
|--------|----------|------|
| 🔴 **긴급** | 10개 | 개인정보/민감정보 노출 위험 |
| 🟡 **높음** | 8개 | 비즈니스 데이터 노출 위험 |
| 🟢 **보통** | 6개 | 공개 정보 (수정 권한만 보호 필요) |

---

## 2. 우선순위별 수정 계획

### 🔴 Phase 1: 긴급 (개인정보 보호) - 먼저 수정

| 순서 | 테이블 | 위험 내용 | 예상 영향 페이지 |
|------|--------|----------|----------------|
| 1-1 | `job_applications` | 지원 내역 전체 노출 | 지원 현황, 기업 대시보드 |
| 1-2 | `talent_applications` | 인재 신청 내역 노출 | 관리자 페이지 |
| 1-3 | `user_salary_range` | 희망 연봉 노출 | 프로필 수정, 인재 상세 |
| 1-4 | `job_manager` | 담당자 연락처 노출 | 채용공고 상세 |

### 🟡 Phase 2: 높음 (개인 프로필 보호)

| 순서 | 테이블 | 위험 내용 | 예상 영향 페이지 |
|------|--------|----------|----------------|
| 2-1 | `user_skills` | 스킬 정보 노출 | 프로필, 인재 목록 |
| 2-2 | `user_languages` | 언어 능력 노출 | 프로필, 인재 목록 |
| 2-3 | `user_experiences` | 경력 정보 노출 | 프로필, 인재 상세 |
| 2-4 | `user_educations` | 학력 정보 노출 | 프로필, 인재 상세 |
| 2-5 | `user_desired_positions` | 희망 직무 노출 | 프로필 |
| 2-6 | `user_preferred_locations` | 희망 지역 노출 | 프로필 |

### 🟢 Phase 3: 보통 (기업/채용 정보 보호)

| 순서 | 테이블 | 위험 내용 | 예상 영향 페이지 |
|------|--------|----------|----------------|
| 3-1 | `company_basic_benefits` | 복지 정보 | 기업 프로필 |
| 3-2 | `company_tech_stack` | 기술 스택 | 기업 프로필 |
| 3-3 | `company_benefits` | 상세 복지 | 기업 프로필 |
| 3-4 | `company_stats` | 기업 통계 | 기업 상세 |
| 3-5 | `company_recruiters` | 채용담당자 | 기업 상세 |
| 3-6 | `company_offices` | 사무실 위치 | 기업 상세 |
| 3-7 | `job_work_conditions` | 근무 조건 | 채용공고 상세 |
| 3-8 | `job_main_tasks` | 주요 업무 | 채용공고 상세 |
| 3-9 | `job_requirements` | 자격 요건 | 채용공고 상세 |
| 3-10 | `job_benefits` | 공고별 복지 | 채용공고 상세 |
| 3-11 | `job_tags` | 공고 태그 | 채용공고 목록 |

### Phase 4: View 수정

| 순서 | View | 문제 |
|------|------|------|
| 4-1 | `companies_with_job_count` | SECURITY DEFINER |
| 4-2 | `jobs_by_display_position` | SECURITY DEFINER |

---

## 3. 테이블별 상세 수정 가이드

---

### 🔴 1-1. job_applications (지원 내역)

#### 현재 문제
```
- RLS: ❌ 비활성화
- 위험: 누구나 모든 지원 내역 조회 가능
- 민감 정보: 지원자 이메일, 지원 메시지, 지원 상태
```

#### 사용되는 파일
| 파일 | 작업 | 용도 |
|------|------|------|
| `app/api/job-applications/route.ts` | SELECT, INSERT, UPDATE | 지원하기, 내 지원 목록 |
| `app/api/company-applications/route.ts` | SELECT, PATCH | 기업이 지원자 관리 |
| `components/jobseeker-dashboard/ApplicationStatus.tsx` | SELECT | 지원 현황 표시 |
| `lib/supabase/admin-service.ts` | SELECT, COUNT | 관리자 통계 |

#### 필요한 RLS 정책
```sql
-- 1. RLS 활성화
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 2. 지원자 본인: 자기 지원 내역만 조회/생성
CREATE POLICY "Applicants can view own applications"
  ON job_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Applicants can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

-- 3. 기업: 자기 회사에 온 지원만 조회/수정
CREATE POLICY "Companies can view applications to their jobs"
  ON job_applications FOR SELECT
  USING (company_id = auth.uid());

CREATE POLICY "Companies can update applications to their jobs"
  ON job_applications FOR UPDATE
  USING (company_id = auth.uid());

-- 4. 관리자: 전체 접근
CREATE POLICY "Admins can manage all applications"
  ON job_applications FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 구직자로 로그인 → 채용공고 지원 | 지원 성공 | `/jobs/[id]` 상세 페이지 |
| 2 | 구직자로 로그인 → 내 지원 목록 확인 | 본인 지원만 표시 | `/applications` |
| 3 | 기업으로 로그인 → 받은 지원서 확인 | 자기 회사 지원만 표시 | `/company-dashboard/applications` |
| 4 | 기업으로 로그인 → 지원 상태 변경 | 변경 성공 | `/company-dashboard/applications` |
| 5 | 관리자로 로그인 → 전체 지원 통계 | 전체 조회 가능 | `/admin` |
| 6 | 비로그인 상태 → API 직접 호출 | 에러 발생해야 함 | 브라우저 콘솔 |

---

### 🔴 1-2. talent_applications (인재 채용 신청)

#### 현재 문제
```
- RLS: ❌ 비활성화
- 위험: 누구나 인재 채용 신청 내역 조회 가능
- 민감 정보: 회사명, 직책, 연락처, 메시지
```

#### 사용되는 파일
| 파일 | 작업 | 용도 |
|------|------|------|
| `lib/supabase/admin-service.ts` | SELECT, COUNT | 관리자 통계 |
| `app/talent/[id]/page.tsx` | INSERT | 인재에게 연락하기 |

#### 필요한 RLS 정책
```sql
-- 1. RLS 활성화
ALTER TABLE talent_applications ENABLE ROW LEVEL SECURITY;

-- 2. 기업: 자기가 보낸 신청만 조회
CREATE POLICY "Companies can view own talent applications"
  ON talent_applications FOR SELECT
  USING (company_id = auth.uid());

CREATE POLICY "Companies can create talent applications"
  ON talent_applications FOR INSERT
  WITH CHECK (company_id = auth.uid());

-- 3. 인재 본인: 자기에게 온 신청 조회
CREATE POLICY "Talents can view applications to them"
  ON talent_applications FOR SELECT
  USING (talent_id = auth.uid());

-- 4. 관리자: 전체 접근
CREATE POLICY "Admins can manage all talent applications"
  ON talent_applications FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 기업으로 로그인 → 인재에게 연락 | 신청 생성 성공 | `/talent/[id]` |
| 2 | 관리자로 로그인 → 통계 확인 | 전체 통계 표시 | `/admin` |
| 3 | 일반 사용자 → API 직접 호출 | 에러 발생해야 함 | 브라우저 콘솔 |

---

### 🔴 1-3. user_salary_range (희망 연봉)

#### 현재 문제
```
- RLS: ❌ 비활성화
- 위험: 모든 사용자의 희망 연봉 노출
- 민감 정보: 최소/최대 희망 연봉, 협상 가능 여부
```

#### 사용되는 파일
| 파일 | 작업 | 용도 |
|------|------|------|
| `lib/supabase/jobseeker-profile.ts` | SELECT, INSERT, UPDATE | 프로필 수정 |
| `lib/supabase/talent-service.ts` | SELECT | 인재 상세 조회 |
| `contexts/AuthContext_Supabase.tsx` | SELECT | 로그인 시 프로필 로드 |

#### 필요한 RLS 정책
```sql
-- 1. RLS 활성화
ALTER TABLE user_salary_range ENABLE ROW LEVEL SECURITY;

-- 2. 본인: 자기 연봉 정보만 관리
CREATE POLICY "Users can manage own salary range"
  ON user_salary_range FOR ALL
  USING (user_id = auth.uid());

-- 3. 공개 프로필 + 결제한 기업: 조회 가능
CREATE POLICY "Paid companies can view public talent salary"
  ON user_salary_range FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_salary_range.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
    AND (
      -- 결제 확인 또는 관리자
      EXISTS (
        SELECT 1 FROM profile_view_payments p
        WHERE p.talent_id = user_salary_range.user_id
          AND p.company_id = auth.uid()
          AND p.payment_status = 'paid'
      )
      OR auth.jwt() ->> 'email' IN (
        'admin@ssmhr.com',
        'joo.y.oh.ko@gmail.com',
        'nadr110619@gmail.com'
      )
    )
  );

-- 4. 관리자: 전체 접근
CREATE POLICY "Admins can manage all salary ranges"
  ON user_salary_range FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 구직자로 로그인 → 연봉 정보 수정 | 수정 성공 | `/profile/edit` 또는 `/onboarding` |
| 2 | 구직자로 로그인 → 내 프로필 확인 | 연봉 정보 표시 | `/profile` |
| 3 | 기업(미결제) → 인재 상세 조회 | 연봉 정보 숨김 | `/talent/[id]` |
| 4 | 기업(결제완료) → 인재 상세 조회 | 연봉 정보 표시 | `/talent/[id]` |
| 5 | 비로그인 → 인재 상세 조회 | 연봉 정보 숨김 | `/talent/[id]` |

---

### 🔴 1-4. job_manager (채용 담당자)

#### 현재 문제
```
- RLS: ❌ 비활성화
- 위험: 담당자 개인정보 노출
- 민감 정보: 이름, 이메일, 전화번호
```

#### 사용되는 파일
| 파일 | 작업 | 용도 |
|------|------|------|
| `lib/supabase/job-service.ts` | SELECT, INSERT, UPDATE | 공고 생성/수정 |
| `app/jobs/[id]/page.tsx` | SELECT | 공고 상세에서 담당자 표시 |
| `app/admin/jobs/[id]/edit/page.tsx` | SELECT, UPDATE | 관리자 공고 수정 |
| `app/company-dashboard/jobs/edit/[id]/page.tsx` | SELECT, UPDATE | 기업 공고 수정 |

#### 필요한 RLS 정책
```sql
-- 1. RLS 활성화
ALTER TABLE job_manager ENABLE ROW LEVEL SECURITY;

-- 2. 공고 소유 기업: 관리 가능
CREATE POLICY "Companies can manage own job managers"
  ON job_manager FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_manager.job_id
        AND j.company_id = auth.uid()
    )
  );

-- 3. 누구나: 활성 공고의 담당자 조회 가능
CREATE POLICY "Anyone can view active job managers"
  ON job_manager FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_manager.job_id
        AND j.status = 'active'
    )
  );

-- 4. 관리자: 전체 접근
CREATE POLICY "Admins can manage all job managers"
  ON job_manager FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 기업으로 로그인 → 공고 생성 시 담당자 입력 | 저장 성공 | `/company-dashboard/jobs/create` |
| 2 | 기업으로 로그인 → 공고 수정 시 담당자 변경 | 수정 성공 | `/company-dashboard/jobs/edit/[id]` |
| 3 | 비로그인 → 활성 공고 상세 조회 | 담당자 정보 표시 | `/jobs/[id]` |
| 4 | 비로그인 → 비활성 공고 담당자 조회 | 정보 안 보임 | API 직접 테스트 |
| 5 | 관리자 → 모든 공고 담당자 수정 | 수정 성공 | `/admin/jobs/[id]/edit` |

---

### 🟡 2-1 ~ 2-6. user_* 테이블 (개인 프로필)

#### 해당 테이블
- `user_skills` (스킬)
- `user_languages` (언어)
- `user_experiences` (경력)
- `user_educations` (학력)
- `user_desired_positions` (희망 직무)
- `user_preferred_locations` (희망 지역)

#### 현재 문제
```
- RLS: ❌ 모두 비활성화
- 위험: 모든 구직자의 프로필 정보 노출
```

#### 사용되는 파일 (공통)
| 파일 | 작업 | 용도 |
|------|------|------|
| `lib/supabase/jobseeker-profile.ts` | CRUD | 프로필 관리 |
| `lib/supabase/talent-service.ts` | SELECT | 인재 목록/상세 |
| `lib/supabase/jobseeker-onboarding.ts` | INSERT, DELETE | 온보딩 |
| `contexts/AuthContext_Supabase.tsx` | SELECT | 로그인 시 로드 |
| `lib/supabase/profile-checklist.ts` | CRUD | 프로필 체크리스트 |

#### 필요한 RLS 정책 (6개 테이블 동일 패턴)

```sql
-- ============================================
-- user_skills
-- ============================================
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- 본인: 자기 스킬 관리
CREATE POLICY "Users can manage own skills"
  ON user_skills FOR ALL
  USING (user_id = auth.uid());

-- 공개 프로필: 누구나 조회
CREATE POLICY "Anyone can view public user skills"
  ON user_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_skills.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

-- 관리자: 전체 접근
CREATE POLICY "Admins can manage all skills"
  ON user_skills FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- user_languages
-- ============================================
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own languages"
  ON user_languages FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public user languages"
  ON user_languages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_languages.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

CREATE POLICY "Admins can manage all languages"
  ON user_languages FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- user_experiences
-- ============================================
ALTER TABLE user_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experiences"
  ON user_experiences FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public user experiences"
  ON user_experiences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_experiences.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

CREATE POLICY "Admins can manage all experiences"
  ON user_experiences FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- user_educations
-- ============================================
ALTER TABLE user_educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own educations"
  ON user_educations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public user educations"
  ON user_educations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_educations.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

CREATE POLICY "Admins can manage all educations"
  ON user_educations FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- user_desired_positions
-- ============================================
ALTER TABLE user_desired_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own desired positions"
  ON user_desired_positions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public user desired positions"
  ON user_desired_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_desired_positions.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

CREATE POLICY "Admins can manage all desired positions"
  ON user_desired_positions FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- user_preferred_locations
-- ============================================
ALTER TABLE user_preferred_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferred locations"
  ON user_preferred_locations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public user preferred locations"
  ON user_preferred_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_preferred_locations.user_id
        AND u.is_public = true
        AND u.profile_completed = true
    )
  );

CREATE POLICY "Admins can manage all preferred locations"
  ON user_preferred_locations FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법 (6개 테이블 공통)

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 구직자로 로그인 → 온보딩 완료 | 모든 정보 저장 성공 | `/onboarding` |
| 2 | 구직자로 로그인 → 프로필 수정 | 수정 성공 | `/profile/edit` |
| 3 | 구직자로 로그인 → 내 프로필 확인 | 모든 정보 표시 | `/profile` |
| 4 | 다른 사용자 → 공개 인재 조회 | 정보 표시 | `/talent` |
| 5. | 다른 사용자 → 비공개 인재 조회 | 정보 안 보임 | API 테스트 |
| 6 | 비로그인 → 인재 목록 | 공개 인재만 표시 | `/talent` |

---

### 🟢 3-1 ~ 3-6. company_* 테이블

#### 해당 테이블
- `company_basic_benefits`
- `company_tech_stack`
- `company_benefits`
- `company_stats`
- `company_recruiters`
- `company_offices`

#### 필요한 RLS 정책

```sql
-- ============================================
-- company_basic_benefits
-- ============================================
ALTER TABLE company_basic_benefits ENABLE ROW LEVEL SECURITY;

-- 기업 본인: 관리 가능
CREATE POLICY "Companies can manage own basic benefits"
  ON company_basic_benefits FOR ALL
  USING (company_id = auth.uid());

-- 누구나: 활성 기업의 복지 조회
CREATE POLICY "Anyone can view active company basic benefits"
  ON company_basic_benefits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_basic_benefits.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

-- 관리자: 전체 접근
CREATE POLICY "Admins can manage all basic benefits"
  ON company_basic_benefits FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- company_tech_stack
-- ============================================
ALTER TABLE company_tech_stack ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own tech stack"
  ON company_tech_stack FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Anyone can view active company tech stack"
  ON company_tech_stack FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_tech_stack.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all tech stacks"
  ON company_tech_stack FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- company_benefits
-- ============================================
ALTER TABLE company_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own benefits"
  ON company_benefits FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Anyone can view active company benefits"
  ON company_benefits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_benefits.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all benefits"
  ON company_benefits FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- company_stats
-- ============================================
ALTER TABLE company_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own stats"
  ON company_stats FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Anyone can view active company stats"
  ON company_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_stats.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all stats"
  ON company_stats FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- company_recruiters
-- ============================================
ALTER TABLE company_recruiters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own recruiters"
  ON company_recruiters FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Anyone can view active company recruiters"
  ON company_recruiters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_recruiters.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all recruiters"
  ON company_recruiters FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- company_offices
-- ============================================
ALTER TABLE company_offices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own offices"
  ON company_offices FOR ALL
  USING (company_id = auth.uid());

CREATE POLICY "Anyone can view active company offices"
  ON company_offices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_offices.company_id
        AND c.profile_completed = true
        AND c.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all offices"
  ON company_offices FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 기업으로 로그인 → 회원가입 시 복지 선택 | 저장 성공 | `/signup/company` |
| 2 | 기업으로 로그인 → 프로필 수정 | 수정 성공 | `/company-dashboard/edit` |
| 3 | 비로그인 → 기업 상세 조회 | 공개 정보 표시 | `/companies/[id]` |
| 4 | 다른 기업 → 경쟁사 정보 수정 시도 | 실패해야 함 | API 테스트 |

---

### 🟢 3-7 ~ 3-11. job_* 테이블 (채용공고 관련)

#### 해당 테이블
- `job_work_conditions`
- `job_main_tasks`
- `job_requirements`
- `job_benefits`
- `job_tags`

#### 필요한 RLS 정책

```sql
-- ============================================
-- job_work_conditions
-- ============================================
ALTER TABLE job_work_conditions ENABLE ROW LEVEL SECURITY;

-- 공고 소유 기업: 관리 가능
CREATE POLICY "Companies can manage own job work conditions"
  ON job_work_conditions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_work_conditions.job_id
        AND j.company_id = auth.uid()
    )
  );

-- 누구나: 활성 공고의 근무 조건 조회
CREATE POLICY "Anyone can view active job work conditions"
  ON job_work_conditions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_work_conditions.job_id
        AND j.status = 'active'
    )
  );

-- 관리자: 전체 접근
CREATE POLICY "Admins can manage all job work conditions"
  ON job_work_conditions FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- job_main_tasks
-- ============================================
ALTER TABLE job_main_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own job main tasks"
  ON job_main_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_main_tasks.job_id
        AND j.company_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active job main tasks"
  ON job_main_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_main_tasks.job_id
        AND j.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all job main tasks"
  ON job_main_tasks FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- job_requirements
-- ============================================
ALTER TABLE job_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own job requirements"
  ON job_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_requirements.job_id
        AND j.company_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active job requirements"
  ON job_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_requirements.job_id
        AND j.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all job requirements"
  ON job_requirements FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- job_benefits
-- ============================================
ALTER TABLE job_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own job benefits"
  ON job_benefits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_benefits.job_id
        AND j.company_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active job benefits"
  ON job_benefits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_benefits.job_id
        AND j.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all job benefits"
  ON job_benefits FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- ============================================
-- job_tags
-- ============================================
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own job tags"
  ON job_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_tags.job_id
        AND j.company_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active job tags"
  ON job_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_tags.job_id
        AND j.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all job tags"
  ON job_tags FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 기업으로 로그인 → 공고 생성 | 모든 정보 저장 성공 | `/company-dashboard/jobs/create` |
| 2 | 기업으로 로그인 → 공고 수정 | 수정 성공 | `/company-dashboard/jobs/edit/[id]` |
| 3 | 비로그인 → 활성 공고 상세 | 모든 정보 표시 | `/jobs/[id]` |
| 4 | 비로그인 → 비활성 공고 조회 | 정보 안 보임 | API 테스트 |

---

### Phase 4: View 수정

#### 4-1, 4-2. SECURITY DEFINER View 수정

```sql
-- ============================================
-- companies_with_job_count View 재생성
-- ============================================
DROP VIEW IF EXISTS companies_with_job_count;

CREATE VIEW companies_with_job_count
WITH (security_invoker = true)  -- SECURITY INVOKER로 변경
AS
SELECT
  c.*,
  COUNT(j.id) FILTER (WHERE j.status = 'active') as open_positions
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
WHERE c.profile_completed = true AND c.status = 'active'
GROUP BY c.id;

-- ============================================
-- jobs_by_display_position View 재생성
-- ============================================
DROP VIEW IF EXISTS jobs_by_display_position;

CREATE VIEW jobs_by_display_position
WITH (security_invoker = true)  -- SECURITY INVOKER로 변경
AS
SELECT
  j.*,
  c.name as company_name,
  c.logo as company_logo,
  c.industry
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.status = 'active'
ORDER BY
  CASE j.display_position
    WHEN 'top' THEN 1
    WHEN 'middle' THEN 2
    WHEN 'bottom' THEN 3
    ELSE 4
  END;
```

#### 검증 방법

| 단계 | 테스트 | 예상 결과 | 확인 페이지 |
|------|--------|----------|------------|
| 1 | 메인 페이지 → 기업 목록 | 채용중 공고 수 표시 | `/` 또는 `/companies` |
| 2 | 채용공고 목록 → 정렬 확인 | display_position 순서대로 | `/jobs` |

---

## 4. 검증 체크리스트

### Phase 1 적용 후 (긴급)

- [ ] **지원하기 기능**
  - [ ] 구직자 → 채용공고 지원 가능
  - [ ] 지원 후 내 지원 목록에 표시
  - [ ] 다른 사용자 지원 내역 안 보임

- [ ] **기업 지원자 관리**
  - [ ] 기업 → 받은 지원서 목록 조회 가능
  - [ ] 지원 상태 변경 가능 (검토중/합격/불합격)
  - [ ] 다른 기업 지원서 안 보임

- [ ] **관리자 통계**
  - [ ] 관리자 → 전체 지원 통계 조회 가능
  - [ ] 인재 신청 통계 조회 가능

- [ ] **인재 연봉 정보**
  - [ ] 구직자 → 본인 연봉 수정 가능
  - [ ] 기업(미결제) → 연봉 정보 안 보임
  - [ ] 기업(결제완료) → 연봉 정보 보임

- [ ] **채용 담당자 정보**
  - [ ] 기업 → 담당자 정보 수정 가능
  - [ ] 활성 공고 → 담당자 정보 표시
  - [ ] 비활성 공고 → 담당자 정보 숨김

### Phase 2 적용 후 (개인 프로필)

- [ ] **온보딩 플로우**
  - [ ] 구직자 회원가입 → 온보딩 완료 가능
  - [ ] 스킬, 언어, 경력, 학력 모두 저장됨

- [ ] **프로필 수정**
  - [ ] 구직자 → 모든 프로필 정보 수정 가능
  - [ ] 수정 후 즉시 반영

- [ ] **인재 목록/상세**
  - [ ] 공개 설정된 인재 → 정보 표시
  - [ ] 비공개 인재 → 목록에 안 나옴
  - [ ] 비공개 인재 → 직접 URL 접근해도 정보 안 보임

### Phase 3 적용 후 (기업/채용 정보)

- [ ] **기업 회원가입**
  - [ ] 회원가입 시 복지 선택 저장됨
  - [ ] 기술 스택 저장됨

- [ ] **기업 프로필 수정**
  - [ ] 기업 → 모든 정보 수정 가능
  - [ ] 다른 기업 정보 수정 불가

- [ ] **채용공고 생성/수정**
  - [ ] 기업 → 공고 생성 가능
  - [ ] 근무조건, 업무내용, 자격요건 모두 저장됨
  - [ ] 공고 수정 가능

- [ ] **채용공고 조회**
  - [ ] 활성 공고 → 모든 정보 표시
  - [ ] 비활성/마감 공고 → 제한된 정보만

### Phase 4 적용 후 (View)

- [ ] **기업 목록**
  - [ ] 채용중 공고 수 정상 표시

- [ ] **채용공고 목록**
  - [ ] 상단 노출 공고가 먼저 표시

---

## 부록: 빠른 실행 SQL

### 전체 마이그레이션 한 번에 실행

아래 SQL을 Supabase SQL Editor에서 실행하세요.

**주의**: 백업 먼저 하세요!

```sql
-- 마이그레이션 파일로 분리해서 실행하는 것을 권장합니다.
-- supabase/migrations/20251217_enable_rls_all_tables.sql 파일 참조
```

---

## 문서 정보

- **작성자**: Claude Code
- **작성일**: 2025-12-17
- **프로젝트**: GlobalTalent (20250919jobmatch)
- **관련 이슈**: Supabase Linter 보안 경고 26개
