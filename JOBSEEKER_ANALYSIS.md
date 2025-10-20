# 개인 회원 온보딩 → 대시보드 구조 철저 분석

> **분석 목표**: 온보딩에서 수집한 데이터가 대시보드에서 어떻게 활용되는지, 어떤 필드가 누락되었는지, 향후 추가해야 할 기능은 무엇인지 파악

---

## 📊 전체 데이터 흐름 다이어그램

```
[회원가입/로그인]
       ↓
[온보딩 페이지] → 7개 섹션 입력
       ↓
[Supabase DB 저장]
       ↓
[대시보드 로딩] → getUserProfileWithCompletion()
       ↓
[transformSupabaseProfile()] → 대시보드 형식 변환
       ↓
[대시보드 렌더링] → 17개 컴포넌트 표시
```

---

## 1️⃣ 온보딩 페이지 데이터 수집 구조

### 📝 온보딩 7개 섹션 (app/onboarding/job-seeker/quick/page.tsx)

| 섹션 | 컴포넌트 | 수집 데이터 | DB 저장 위치 |
|------|---------|-----------|------------|
| **1. 기본 정보** | `BasicInfoSection` | `fullName`, `desiredJobCategory` | `users.full_name`, ❌ `desired_job_category` |
| **2. 계정 정보** | `AccountSection` | `email`, `password`, `passwordConfirm` | `users.email` + Supabase Auth |
| **3. 주소** | `AddressSection` | `address`, `addressDetail` | `users.address`, `users.address_detail` |
| **4. 개인 정보** | `PersonalInfoSection` | `nationality`, `gender`, `birthYear` | `users.nationality`, `users.gender`, `users.birth_year` |
| **5. 비자 정보** | `VisaSection` | `visaType[]`, `koreanLevel` | `users.visa_types[]`, `users.korean_level` |
| **6. 언어 능력** | `LanguageSection` | `otherLanguages[]` | `user_languages` 테이블 |
| **7. 약관 동의** | `TermsSection` | `agreeAll`, `agreeServiceTerms`, `agreePrivacyTerms`, `agreeEmailReceive` | `users.agree_email_receive`, `users.agree_privacy_collection` |

### ⚠️ **발견된 문제점**

#### 🔴 **치명적 문제: `desired_job_category` 누락**
```typescript
// ❌ 온보딩에서 수집하지만 DB에 저장 안 됨!
// types/jobseeker-onboarding.types.ts:11
desiredJobCategory: string;  // 희망 근무 직군 (필수)

// ❌ schema.sql에 컬럼이 없음
// 온보딩에서 필수 입력하지만 버려지는 데이터!
```

**해결 방법**:
1. `schema.sql`에 컬럼 추가:
   ```sql
   desired_job_category TEXT,  -- 희망 근무 직군
   ```
2. `jobseeker-onboarding.ts`의 `completeOnboarding()` 함수에 저장 로직 추가
3. 대시보드에서 표시하거나 채용공고 추천 시 활용

---

## 2️⃣ Supabase DB 스키마 구조

### 📦 메인 테이블: `users`

```sql
-- 온보딩에서 직접 저장되는 필드
full_name TEXT NOT NULL,                  -- ✅ 온보딩 Section 1
phone TEXT NOT NULL,                      -- ✅ 온보딩 Section 1 (한국인)
foreigner_number TEXT NOT NULL,           -- ✅ 온보딩 Section 1 (외국인)
address TEXT NOT NULL,                    -- ✅ 온보딩 Section 3
address_detail TEXT,                      -- ✅ 온보딩 Section 3
nationality TEXT NOT NULL,                -- ✅ 온보딩 Section 4
gender TEXT NOT NULL,                     -- ✅ 온보딩 Section 4
birth_year INTEGER,                       -- ✅ 온보딩 Section 4
visa_types TEXT[] NOT NULL,               -- ✅ 온보딩 Section 5
korean_level TEXT NOT NULL,               -- ✅ 온보딩 Section 5
agree_email_receive BOOLEAN,              -- ✅ 온보딩 Section 7
agree_privacy_collection BOOLEAN,         -- ✅ 온보딩 Section 7

-- 온보딩에서 수집하지만 저장 안 되는 필드
-- ❌ desired_job_category → 누락!

-- 대시보드에서 추가로 입력하는 필드 (온보딩 이후)
headline TEXT,                            -- 간단 소개
profile_image_url TEXT,                   -- 프로필 사진
work_type TEXT,                           -- 고용 형태
company_size TEXT,                        -- 선호 회사 규모
visa_sponsorship BOOLEAN,                 -- 비자 스폰서십
remote_work TEXT,                         -- 재택근무
introduction TEXT,                        -- 자기소개
resume_file_url TEXT,                     -- 이력서
```

### 📦 관련 테이블들

| 테이블 | 용도 | 대시보드 표시 여부 |
|--------|------|------------------|
| `user_skills` | 보유 기술 | ✅ SkillsLanguages 카드 |
| `user_languages` | 언어 능력 | ✅ SkillsLanguages 카드 |
| `user_experiences` | 경력 사항 | ✅ ExperienceSection |
| `user_educations` | 학력 사항 | ✅ EducationSection |
| `user_desired_positions` | 희망 직무 | ✅ PreferencesCard |
| `user_preferred_locations` | 희망 근무지 | ✅ PreferencesCard |
| `user_salary_range` | 희망 연봉 | ✅ PreferencesCard |

---

## 3️⃣ 대시보드 데이터 로딩 흐름

### 🔄 데이터 조회 → 변환 → 렌더링

```typescript
// 1. Supabase 조회 (lib/supabase/jobseeker-utils.ts)
getUserProfileWithCompletion(userId)
  → getUserProfile(userId)  // users + 7개 관련 테이블 JOIN
  → calculateProfileCompletion(profile)  // 완성도 계산

// 2. 프로필 변환 (lib/utils/profile-transformer.ts)
transformSupabaseProfile(supabaseData)
  → snake_case → camelCase 변환
  → 배열 데이터 매핑 (skills, languages, experiences, educations)
  → ProfileData 타입으로 반환

// 3. 대시보드 렌더링 (app/jobseeker-dashboard/page.tsx)
useDashboardData(userId)
  → profileData 상태 설정
  → 17개 컴포넌트에 데이터 전달
```

---

## 4️⃣ 대시보드 컴포넌트 구조

### 📱 대시보드 레이아웃 (3개 영역)

```
┌─────────────────────────────────────────────────┐
│              HeroSection                        │ ← 프로필 사진, 이름, 헤드라인
├─────────────────────────────────────────────────┤
│      ProfileCompletionBanner (100% 미만)        │ ← 완성도 진행률
├─────────────────────────────────────────────────┤
│  LEFT COLUMN (2/3)    │  RIGHT COLUMN (1/3)     │
│  ─────────────────    │  ──────────────────     │
│  ProfileChecklist     │  QuickActions           │ ← 빠른 작업 버튼
│  ApplicationStatus    │  SkillsLanguages        │ ← 기술 + 언어
│  ExperienceSection    │  PreferencesCard        │ ← 선호 조건
│  EducationSection     │  ResumeCard             │ ← 이력서
│  RecommendedJobs      │  IntroductionCard       │ ← 자기소개
│                       │  CareerTip              │ ← 팁
│                       │  AccountSettings        │ ← 계정 설정
└───────────────────────┴─────────────────────────┘
```

### 📊 각 컴포넌트가 사용하는 데이터

| 컴포넌트 | 사용 데이터 | 온보딩 연결 여부 |
|---------|-----------|---------------|
| **HeroSection** | `fullName`, `headline`, `profileImageUrl` | ✅ 이름만 온보딩 |
| **ProfileCompletionBanner** | `profileCompletion` (0-100) | ✅ 계산값 |
| **ProfileChecklist** | 7개 항목 완성도 체크 | ✅ 부분적 |
| **ApplicationStatus** | 지원 현황 (현재 하드코딩) | ❌ |
| **ExperienceSection** | `experiences[]` | ❌ 대시보드에서 입력 |
| **EducationSection** | `educations[]` | ❌ 대시보드에서 입력 |
| **RecommendedJobs** | `skills`, `languages`, `preferredLocations`, `desiredPositions` | ✅ 언어만 온보딩 |
| **QuickActions** | 없음 (링크만) | - |
| **SkillsLanguages** | `skills[]`, `languages[]` | ✅ 언어만 온보딩 |
| **PreferencesCard** | `workType`, `companySize`, `visaSponsorship`, `remoteWork` | ❌ 대시보드에서 입력 |
| **ResumeCard** | `resumeFileUrl`, `resumeFileName` | ❌ 대시보드에서 업로드 |
| **IntroductionCard** | `introduction` | ❌ 대시보드에서 입력 |

---

## 5️⃣ 프로필 완성도 계산 로직

### 🎯 완성도 가중치 (총 100점)

```typescript
// lib/supabase/jobseeker-utils.ts
const weights = {
  basicInfo: 20,        // 이름, 이메일, 연락처
  resume: 15,           // 이력서
  experience: 15,       // 경력
  education: 10,        // 학력
  skills: 15,           // 기술
  languages: 10,        // 언어
  preferences: 10,      // 선호 조건 (포지션, 지역, 연봉)
  introduction: 5,      // 자기소개
};
```

### ✅ 체크리스트 7개 항목

```typescript
// lib/utils/profile-checklist.ts
1. 이력서 (resumeFileUrl)           → 온보딩 ❌, 대시보드 ✅
2. 경력 사항 (experiences)          → 온보딩 ❌, 대시보드 ✅
3. 학력 사항 (educations)           → 온보딩 ❌, 대시보드 ✅
4. 보유 기술 (skills)               → 온보딩 ❌, 대시보드 ✅
5. 언어 능력 (languages)            → 온보딩 ✅, 대시보드 수정 가능
6. 선호 조건 (positions, locations) → 온보딩 ❌, 대시보드 ✅
7. 자기소개 (introduction)          → 온보딩 ❌, 대시보드 ✅
```

**분석 결과**:
- 온보딩 완료 직후 프로필 완성도: **약 30%** (기본 정보 20% + 언어 10%)
- 나머지 70%는 대시보드에서 추가 입력 필요

---

## 6️⃣ 온보딩 vs 대시보드 필드 매핑표

### ✅ 온보딩에서 수집 → 대시보드에서 표시

| 온보딩 필드 | DB 컬럼 | 대시보드 표시 위치 | 수정 가능 여부 |
|-----------|--------|-----------------|-------------|
| `fullName` | `full_name` | HeroSection | ✅ 프로필 수정 |
| `phone` | `phone` | 미표시 | ✅ 프로필 수정 |
| `foreignerNumber` | `foreigner_number` | 미표시 | ❌ 온보딩에서만 |
| `address` | `address` | 미표시 | ✅ 프로필 수정 |
| `nationality` | `nationality` | 미표시 | ❌ 온보딩에서만 |
| `gender` | `gender` | 미표시 | ❌ 온보딩에서만 |
| `birthYear` | `birth_year` | 미표시 | ❌ 온보딩에서만 |
| `visaType` | `visa_types[]` | 미표시 | ❌ 온보딩에서만 |
| `koreanLevel` | `korean_level` | 미표시 | ❌ 온보딩에서만 |
| `otherLanguages` | `user_languages` | SkillsLanguages | ✅ 대시보드 수정 |

### ❌ 온보딩에서 수집했지만 DB에 저장 안 됨

| 온보딩 필드 | 현재 상태 | 권장 조치 |
|-----------|---------|---------|
| `desiredJobCategory` | ❌ DB 저장 안 됨 | 🔴 **즉시 수정 필요** - 채용공고 추천에 필수 |

### 🆕 대시보드에서만 추가 입력

| 필드 | 온보딩 | 대시보드 |
|-----|-------|---------|
| `headline` | ❌ | ✅ |
| `profileImageUrl` | ❌ | ✅ |
| `resumeFileUrl` | ❌ | ✅ |
| `introduction` | ❌ | ✅ |
| `workType` | ❌ | ✅ |
| `companySize` | ❌ | ✅ |
| `visaSponsorship` | ❌ | ✅ |
| `remoteWork` | ❌ | ✅ |
| `skills[]` | ❌ | ✅ |
| `experiences[]` | ❌ | ✅ |
| `educations[]` | ❌ | ✅ |
| `desiredPositions[]` | ❌ | ✅ |
| `preferredLocations[]` | ❌ | ✅ |
| `salaryRange` | ❌ | ✅ |

---

## 7️⃣ 발견된 문제점 및 개선 방안

### 🔴 **치명적 문제**

#### 1. `desired_job_category` 필드 누락
**문제**:
- 온보딩에서 필수 입력하지만 DB에 저장되지 않음
- 채용공고 추천 시 핵심 데이터인데 활용 불가

**해결 방법**:
```sql
-- 1. schema.sql 수정
ALTER TABLE users ADD COLUMN desired_job_category TEXT;

-- 2. jobseeker-onboarding.ts 수정
updateData.desired_job_category = data.desired_job_category;

-- 3. 대시보드에서 표시 (PreferencesCard)
<div>
  <p className="text-sm text-gray-600">희망 직군</p>
  <p className="text-gray-900">{profileData.desiredJobCategory}</p>
</div>
```

### 🟡 **중요 개선 사항**

#### 2. 온보딩에서 수집한 데이터가 대시보드에 표시되지 않음
**문제**:
- 국적, 성별, 나이, 비자 정보, 한국어 능력 → 대시보드에서 확인 불가
- 사용자가 본인이 입력한 정보를 볼 수 없음

**해결 방법**:
```typescript
// PreferencesCard에 추가
<div className="space-y-3">
  <h3 className="font-semibold">기본 정보</h3>
  <div>
    <p className="text-sm text-gray-600">국적</p>
    <p className="text-gray-900">{NATIONALITIES.find(n => n.value === profileData.nationality)?.label}</p>
  </div>
  <div>
    <p className="text-sm text-gray-600">성별</p>
    <p className="text-gray-900">{profileData.gender === 'male' ? '남성' : '여성'}</p>
  </div>
  <div>
    <p className="text-sm text-gray-600">한국어 능력</p>
    <p className="text-gray-900">{KOREAN_LEVELS.find(k => k.value === profileData.koreanLevel)?.label}</p>
  </div>
</div>
```

#### 3. 프로필 완성도 계산 로직 개선
**문제**:
- 온보딩 완료 직후 30%밖에 안 됨
- 온보딩에서 입력한 데이터가 완성도에 반영 안 됨

**해결 방법**:
```typescript
// calculateProfileCompletion() 수정
const weights = {
  basicInfo: 15,        // 기존 20 → 15 (이름, 이메일, 연락처)
  onboardingInfo: 15,   // 🆕 추가 (국적, 성별, 비자, 한국어)
  resume: 15,
  experience: 10,
  education: 10,
  skills: 10,
  languages: 10,        // 온보딩에서 입력함
  preferences: 10,
  introduction: 5,
};

// 온보딩 정보 점수 추가
if (profile.nationality && profile.gender && profile.korean_level) {
  score += weights.onboardingInfo;
}
```

→ 온보딩 완료 직후 완성도: **45%** (기본 15% + 온보딩 15% + 언어 10% + 약간의 선호 조건)

#### 4. 언어 능력 데이터 구조 불일치
**온보딩**:
```typescript
otherLanguages: Array<{
  language: string;      // 'english', 'chinese'
  proficiency: string;   // 'native', 'fluent'
}>
```

**대시보드 표시**:
```typescript
languages: string[]  // ['English', 'Chinese']  ← 숙련도 정보 누락!
```

**해결 방법**:
```typescript
// profile-transformer.ts 수정
languages: supabaseData.languages?.map((l: any) => ({
  name: l.language_name,
  proficiency: l.proficiency  // 숙련도 포함
})) || [],

// SkillsLanguages.tsx 수정
{profileData.languages.map((lang) => (
  <div key={lang.name} className="flex justify-between">
    <span>{lang.name}</span>
    <span className="text-gray-600">{lang.proficiency}</span>
  </div>
))}
```

---

## 8️⃣ 채용공고 추천 로직 분석

### 📍 현재 추천 로직 (lib/utils/index.ts - getRecommendedJobs)

```typescript
export const getRecommendedJobs = (
  profile: ProfileData,
  allJobs: Job[],
  limit: number = 3
): Job[] => {
  // 1. 스킬 매칭 점수
  // 2. 선호 지역 매칭 점수
  // 3. 희망 포지션 매칭 점수
  // → 종합 점수로 정렬
};
```

### ⚠️ **추천 로직에서 누락된 데이터**

| 누락 데이터 | 추천에 미치는 영향 |
|-----------|-----------------|
| `desiredJobCategory` | 🔴 **치명적** - 직군 필터링 불가 |
| `nationality` | 🟡 중요 - 외국인 전용 공고 필터링 |
| `visaTypes` | 🟡 중요 - 비자 종류별 공고 필터링 |
| `koreanLevel` | 🟢 선택 - 한국어 요구사항 매칭 |
| `salaryRange` | 🟡 중요 - 연봉 범위 필터링 |

**개선 방안**:
```typescript
export const getRecommendedJobs = (
  profile: ProfileData,
  allJobs: Job[],
  limit: number = 3
): Job[] => {
  let scored = allJobs.map((job) => {
    let score = 0;

    // 1. 🆕 희망 직군 매칭 (가장 중요)
    if (profile.desiredJobCategory && job.category === profile.desiredJobCategory) {
      score += 50;
    }

    // 2. 🆕 국적 필터링 (외국인 전용 공고)
    if (job.foreignerOnly && profile.nationality !== 'KR') {
      score += 20;
    }

    // 3. 🆕 비자 요구사항 매칭
    if (job.requiredVisaTypes && profile.visaTypes) {
      const hasMatchingVisa = job.requiredVisaTypes.some(v => profile.visaTypes?.includes(v));
      if (hasMatchingVisa) score += 15;
    }

    // 4. 기존: 스킬 매칭
    if (profile.skills && job.skills) {
      const matchingSkills = profile.skills.filter(s => job.skills.includes(s));
      score += matchingSkills.length * 10;
    }

    // 5. 기존: 지역 매칭
    if (profile.preferredLocations?.includes(job.location)) {
      score += 15;
    }

    // 6. 🆕 연봉 범위 매칭
    if (profile.salaryRange && job.salary) {
      if (job.salary.min >= profile.salaryRange.min) {
        score += 10;
      }
    }

    return { job, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.job);
};
```

---

## 9️⃣ 기업 회원과 비교

### 기업 회원 온보딩 구조 (참고)

```typescript
// 기업은 온보딩에서 대부분의 정보 수집
Section 1: 사업자 정보 (필수)
Section 2: 기업 분류 (필수)
Section 3: 연락처 (필수)
Section 4: 소개 (선택)
Section 5: 위치 (필수)
Section 6: 기술 스택 (선택)
Section 7: 계정 (필수)
```

### 🔍 **개인 회원과의 차이점**

| 구분 | 개인 회원 | 기업 회원 |
|-----|---------|---------|
| **온보딩 완성도** | ~30% | ~60% |
| **온보딩 후 추가 입력** | 많음 (경력, 학력, 기술, 선호 조건 등) | 적음 (채용공고 작성) |
| **대시보드 역할** | 프로필 완성 + 지원 관리 | 채용공고 관리 |

---

## 🎯 최종 결론 및 권장 조치

### 🔴 **즉시 수정 필요 (P0)**

1. **`desired_job_category` 필드 추가**
   - DB 스키마 수정
   - 온보딩 저장 로직 수정
   - 대시보드 표시
   - 채용공고 추천에 활용

### 🟡 **빠른 시일 내 개선 (P1)**

2. **프로필 완성도 계산 로직 개선**
   - 온보딩 데이터 가중치 추가
   - 완성도 40-50%로 상향

3. **온보딩 데이터 대시보드 표시**
   - 국적, 성별, 비자, 한국어 능력
   - "기본 정보" 섹션 추가

4. **언어 능력 숙련도 표시**
   - 언어명 + 숙련도 함께 표시

5. **채용공고 추천 로직 강화**
   - 직군, 국적, 비자, 연봉 매칭 추가

### 🟢 **장기 개선 사항 (P2)**

6. **프로필 수정 기능**
   - 온보딩에서 입력한 데이터 수정 가능
   - 국적, 성별, 비자 등

7. **대시보드 개인화**
   - 국적별 맞춤 팁
   - 비자별 채용공고 필터링

8. **통계 데이터 활용**
   - `applications_count`, `profile_views`, `messages_count`
   - ApplicationStatus 컴포넌트에 실제 데이터 표시

---

## 📈 개선 후 예상 효과

| 지표 | 현재 | 개선 후 |
|-----|------|--------|
| **온보딩 완료 후 프로필 완성도** | 30% | 45% |
| **대시보드 표시 정보** | 기본 정보만 | 온보딩 전체 데이터 |
| **채용공고 추천 정확도** | 낮음 (직군 누락) | 높음 (직군 + 비자 + 연봉) |
| **사용자 경험** | 입력한 정보 확인 불가 | 모든 정보 확인 가능 |

---

## 📝 다음 단계

1. ✅ **이 분석 문서를 바탕으로 `desired_job_category` 필드부터 수정**
2. ✅ **프로필 완성도 계산 로직 개선**
3. ✅ **대시보드에 온보딩 데이터 표시**
4. ✅ **채용공고 추천 로직 강화**
5. ✅ **기업 회원도 동일한 방식으로 분석**

---

**작성일**: 2025-10-19
**작성자**: Claude Code
**목적**: 개인 회원 온보딩 → 대시보드 데이터 흐름 철저 분석
