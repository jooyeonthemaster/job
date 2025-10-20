# 프로필 완성도 체크리스트 - 데이터 구조 분석 보고서 (인재풀 구현용)

> **분석 목표**:
> 1. 대시보드의 "프로필 완성하기" 체크리스트 전체 데이터 필드 철저 파악
> 2. 인재풀 페이지 구현을 위한 데이터 구조 완전 매핑
> 3. Supabase 스키마와의 비교 분석

---

## 📊 프로필 완성하기 구조

### 🎯 체크리스트 7개 항목

```typescript
// lib/utils/profile-checklist.ts
const checklist = [
  { id: 'resume', title: '이력서' },
  { id: 'experience', title: '경력 사항' },
  { id: 'education', title: '학력 사항' },
  { id: 'skills', title: '보유 기술' },
  { id: 'languages', title: '언어 능력' },
  { id: 'preferences', title: '선호 조건' },
  { id: 'introduction', title: '자기소개' }
];
```

---

## 1️⃣ 온보딩 vs 프로필 완성 필드 비교

### ✅ 온보딩에서 수집 → 프로필 완성에도 포함

| 필드 | 온보딩 섹션 | 프로필 완성 항목 | DB 저장 |
|------|----------|---------------|--------|
| **언어 능력** | Section 6: LanguageSection | ✅ 체크리스트 #5 | `user_languages` |

**결과**: 온보딩에서 언어 능력을 입력하면 → 프로필 완성 14% 달성 (1/7 완료)

---

### ❌ 온보딩에서 수집했지만 프로필 완성에 **없는** 필드

| 온보딩 필드 | 온보딩 섹션 | 프로필 완성 | 이유 |
|-----------|----------|-----------|------|
| **국적** | Section 4 | ❌ 없음 | 기본 정보, 수정 불필요 |
| **성별** | Section 4 | ❌ 없음 | 기본 정보, 수정 불필요 |
| **출생연도** | Section 4 | ❌ 없음 | 기본 정보, 수정 불필요 |
| **비자 종류** | Section 5 | ❌ 없음 | 기본 정보, 수정 불필요 |
| **한국어 능력** | Section 5 | ❌ 없음 | 온보딩에서만 입력 |
| **주소** | Section 3 | ❌ 없음 | 프로필 수정에서 변경 가능 |
| **전화번호** | Section 2 | ❌ 없음 | 프로필 수정에서 변경 가능 |
| **희망 근무 직군** | Section 1 | ❌ 없음 | 🔴 **누락!** 프로필 완성에 추가 필요 |

**⚠️ 발견된 문제점**:

#### 🟡 **한국어 능력이 프로필 완성 체크리스트에 없음**
- 온보딩에서 **필수 입력**
- 하지만 프로필 완성 체크리스트에는 "한국어 외 언어"만 포함
- **결과**: 한국어 능력은 입력했지만 체크리스트에 반영 안 됨

**권장 조치**:
1. 체크리스트 #5를 "언어 능력"에서 "한국어 외 언어 능력"으로 명확히 변경
2. 또는 한국어 능력도 프로필 완성 요소에 포함 (별도 항목)

#### 🔴 **희망 근무 직군이 프로필 완성에 누락**
- 온보딩 Section 1에서 **필수 입력** (`desiredJobCategory`)
- 하지만 DB에 저장 안 됨 + 프로필 완성에도 없음
- **해결**: JOBSEEKER_ANALYSIS.md의 P0 버그 수정 필요

---

### 🆕 프로필 완성에만 있는 필드 (온보딩에 없음)

| 프로필 완성 항목 | 수집 필드 | 온보딩 | 대시보드 편집 |
|--------------|---------|-------|------------|
| **1. 이력서** | `resumeFileUrl` | ❌ | ✅ `/profile/edit/resume` |
| **2. 경력 사항** | `experiences[]` | ❌ | ✅ `/profile/edit/experience` |
| **3. 학력 사항** | `educations[]` | ❌ | ✅ `/profile/edit/experience` |
| **4. 보유 기술** | `skills[]` | ❌ | ✅ `/profile/edit/skills` |
| **5. 언어 능력** | `languages[]` | ✅ (한국어 외) | ✅ `/profile/edit/skills` |
| **6. 선호 조건** | `desiredPositions`, `preferredLocations`, `salaryRange`, `workType`, `companySize`, `visaSponsorship`, `remoteWork` | ❌ | ✅ `/profile/edit/preferences` |
| **7. 자기소개** | `introduction` | ❌ | ✅ `/profile/edit/introduction` |

---

## 2️⃣ 프로필 완성 "선호 조건" 상세 분석

### 📍 Step4_Preferences 컴포넌트가 수집하는 필드

```typescript
// components/onboarding/job-seeker/Step4_Preferences.tsx
{
  desiredPositions: string[],       // 희망 직무 (필수)
  preferredLocations: string[],     // 희망 근무지 (필수)
  salaryRange: { min, max },        // 희망 연봉 (필수)
  workType: string,                 // 고용 형태 (필수)
  companySize: string,              // 회사 규모 (선택)
  visaSponsorship: boolean,         // 비자 후원 (선택)
  remoteWork: string,               // 재택근무 (선택)
  introduction: string              // 자기소개 (선택)
}
```

### 🔍 온보딩과의 비교

| 선호 조건 필드 | 온보딩 | 프로필 완성 | DB 테이블 |
|-------------|-------|-----------|---------|
| `desiredPositions` | ❌ | ✅ | `user_desired_positions` |
| `preferredLocations` | ❌ | ✅ | `user_preferred_locations` |
| `salaryRange` | ❌ | ✅ | `user_salary_range` |
| `workType` | ❌ | ✅ | `users.work_type` |
| `companySize` | ❌ | ✅ | `users.company_size` |
| `visaSponsorship` | ❌ | ✅ | `users.visa_sponsorship` |
| `remoteWork` | ❌ | ✅ | `users.remote_work` |
| `introduction` | ❌ | ✅ | `users.introduction` |

**분석 결과**:
- 모든 선호 조건 필드는 **온보딩에 없음**
- 프로필 완성하기 단계에서만 입력 가능
- 이는 정상적인 설계 (온보딩은 기본 정보만, 상세 조건은 나중에)

---

## 3️⃣ 온보딩에는 있는데 프로필 완성에 누락된 필드

### 🔴 **치명적 누락: `desired_job_category` (희망 근무 직군)**

**온보딩**:
```typescript
// types/jobseeker-onboarding.types.ts:11
desiredJobCategory: string;  // 필수 입력

// components/jobseeker-onboarding/BasicInfoSection.tsx
<input name="desiredJobCategory" required />
```

**프로필 완성**:
```typescript
// ❌ Step4_Preferences에 없음
// ❌ 다른 어떤 Step에도 없음
// ❌ DB 저장도 안 됨 (schema.sql에 컬럼 없음)
```

**문제점**:
1. 온보딩에서 **필수 입력**하지만 **DB 저장 안 됨**
2. 프로필 완성 "선호 조건"에 **`desiredPositions`는 있지만 `desiredJobCategory`는 없음**
3. 두 필드의 차이:
   - `desiredJobCategory`: 희망 **직군** (예: "개발", "디자인", "마케팅")
   - `desiredPositions`: 희망 **직무** (예: "프론트엔드 개발자", "백엔드 개발자")

**해결 방안**:
```typescript
// Step4_Preferences.tsx에 추가
const [formData, setFormData] = useState({
  // 기존 필드들...
  desiredJobCategory: data?.desiredJobCategory || '',  // 🆕 추가
  desiredPositions: data?.desiredPositions || [],
  // ...
});

// 입력 필드 추가
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    희망 직군 (필수)
  </label>
  <select
    value={formData.desiredJobCategory}
    onChange={(e) => handleChange('desiredJobCategory', e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">선택하세요</option>
    <option value="개발">개발</option>
    <option value="디자인">디자인</option>
    <option value="마케팅">마케팅</option>
    <option value="영업">영업</option>
    <option value="경영/기획">경영/기획</option>
    <option value="재무/회계">재무/회계</option>
    <option value="인사/총무">인사/총무</option>
  </select>
</div>
```

---

### 🟡 **한국어 능력 누락**

**온보딩**:
```typescript
// Section 5: VisaSection
koreanLevel: string;  // TOPIK 1~6급, 모국어 수준, 해당 없음
```

**프로필 완성**:
```typescript
// ❌ 체크리스트에 없음
// ❌ Step3_Skills에도 없음 (한국어 외 언어만)
```

**문제점**:
- 온보딩에서 **필수 입력**
- DB에는 저장됨 (`users.korean_level`)
- 하지만 프로필 완성 체크리스트에 **포함 안 됨**
- 사용자가 대시보드에서 확인/수정 불가

**해결 방안**:
1. **옵션 1**: 체크리스트에 별도 항목 추가
   ```typescript
   {
     id: 'korean_level',
     title: '한국어 능력',
     description: 'TOPIK 등급 또는 수준',
     completed: !!(profileData?.koreanLevel),
     link: '/profile/edit/korean'
   }
   ```

2. **옵션 2**: Step3_Skills에 한국어 능력 필드 추가
   ```typescript
   // Step3_Skills.tsx
   <div>
     <label>한국어 능력</label>
     <select value={formData.koreanLevel}>
       <option>TOPIK 1급</option>
       <option>TOPIK 2급</option>
       // ...
     </select>
   </div>
   ```

3. **옵션 3**: PreferencesCard에 표시만 (수정 불가)
   ```typescript
   // 온보딩에서 입력한 값을 읽기 전용으로 표시
   <div>
     <p className="text-sm text-gray-600">한국어 능력</p>
     <p className="text-gray-900">{profileData.koreanLevel}</p>
   </div>
   ```

---

## 4️⃣ 프로필 완성도 계산 로직 문제점

### 현재 로직 (lib/supabase/jobseeker-utils.ts)

```typescript
const weights = {
  basicInfo: 20,        // 이름, 이메일, 연락처
  resume: 15,           // 이력서
  experience: 15,       // 경력
  education: 10,        // 학력
  skills: 15,           // 기술
  languages: 10,        // 언어 (한국어 외)
  preferences: 10,      // 선호 조건
  introduction: 5,      // 자기소개
};
```

### ⚠️ **문제점**

#### 1. 온보딩에서 입력한 데이터가 완성도에 반영 안 됨

**온보딩 완료 시 입력한 필드**:
- ✅ 이름, 이메일, 연락처 → **20점**
- ✅ 한국어 외 언어 → **10점**
- **총 30점** (30%)

**반영 안 되는 온보딩 데이터**:
- ❌ 국적, 성별, 출생연도 → 0점
- ❌ 비자 종류 → 0점
- ❌ 한국어 능력 → 0점
- ❌ 주소 → 0점
- ❌ 희망 근무 직군 (저장 안 됨) → 0점

**결과**: 온보딩에서 7개 섹션 모두 입력했는데 **30%밖에 안 됨**

#### 2. 언어 능력 중복 계산

**현재**:
- 온보딩 Section 5: 한국어 능력 (TOPIK) → 완성도 **0점**
- 온보딩 Section 6: 한국어 외 언어 → 완성도 **10점**
- 프로필 완성 #5: 언어 능력 → 완성도 **10점**

**문제**:
- 한국어 능력과 한국어 외 언어가 **같은 가중치** (10점)
- 하지만 한국어 능력은 완성도에 **반영 안 됨**

---

### ✅ **개선 방안**

#### 방안 1: 온보딩 데이터 가중치 추가

```typescript
const weights = {
  basicInfo: 15,        // 이름, 이메일, 연락처
  onboardingInfo: 15,   // 🆕 국적, 성별, 비자, 한국어, 주소, 희망 직군
  resume: 15,
  experience: 10,
  education: 10,
  skills: 10,
  languages: 10,        // 한국어 외 언어
  preferences: 10,
  introduction: 5,
};

// 온보딩 정보 점수 계산
if (
  profile.nationality &&
  profile.gender &&
  profile.birth_year &&
  profile.visa_types?.length > 0 &&
  profile.korean_level &&
  profile.address &&
  profile.desired_job_category  // 🆕 추가 필요
) {
  score += weights.onboardingInfo;
}
```

**결과**: 온보딩 완료 후 **45%** (기본 15 + 온보딩 15 + 언어 10 + 선호 조건 일부 5)

#### 방안 2: 한국어 능력 별도 항목

```typescript
const weights = {
  basicInfo: 15,
  resume: 15,
  experience: 10,
  education: 10,
  skills: 10,
  koreanLevel: 5,       // 🆕 한국어 능력
  otherLanguages: 10,   // 한국어 외 언어
  preferences: 10,
  introduction: 5,
  onboardingComplete: 10  // 🆕 온보딩 완료 보너스
};

// 한국어 능력
if (profile.korean_level && profile.korean_level !== 'none') {
  score += weights.koreanLevel;
}

// 온보딩 완료 보너스
if (profile.onboarding_completed) {
  score += weights.onboardingComplete;
}
```

**결과**: 온보딩 완료 후 **50%** (기본 15 + 한국어 5 + 언어 10 + 온보딩 보너스 10 + 선호 조건 일부 10)

---

## 5️⃣ 최종 분석 결과

### 🔴 **즉시 수정 필요 (P0)**

#### 1. `desired_job_category` 필드 추가
- **문제**: 온보딩에서 필수 입력하지만 DB 저장 안 됨
- **영향**: 채용공고 추천 기능 마비
- **해결**:
  1. ✅ `schema.sql`에 컬럼 추가
  2. ✅ `jobseeker-onboarding.ts`에 저장 로직 추가
  3. ✅ `Step4_Preferences.tsx`에 입력 필드 추가
  4. ✅ 프로필 완성도 계산에 포함

#### 2. 프로필 완성도 계산 로직 수정
- **문제**: 온보딩 완료 후 30%밖에 안 됨
- **영향**: 사용자 경험 저하, 동기 부여 감소
- **해결**:
  1. ✅ 온보딩 데이터 가중치 추가 (15점)
  2. ✅ 한국어 능력 별도 항목 (5점)
  3. ✅ 온보딩 완료 보너스 (10점)
  4. **결과**: 온보딩 완료 후 **45-50%**

---

### 🟡 **빠른 시일 내 개선 (P1)**

#### 3. 한국어 능력 프로필 완성에 추가
- **옵션 1**: 별도 체크리스트 항목 추가
- **옵션 2**: Step3_Skills에 포함
- **옵션 3**: PreferencesCard에 읽기 전용 표시

#### 4. 온보딩 데이터 대시보드 표시
- 국적, 성별, 출생연도, 비자, 주소 → PreferencesCard에 추가
- 수정 가능 여부 결정 (읽기 전용 vs 수정 가능)

#### 5. 체크리스트 명칭 명확화
- "언어 능력" → "한국어 외 언어 능력"으로 변경
- 한국어 능력과 혼동 방지

---

## 6️⃣ 구현 우선순위

### Phase 1: 치명적 버그 수정 (1-2일)
1. ✅ `desired_job_category` DB 컬럼 추가
2. ✅ 온보딩 저장 로직 수정
3. ✅ Step4_Preferences에 희망 직군 필드 추가
4. ✅ 프로필 완성도 계산 로직 개선

### Phase 2: UX 개선 (3-5일)
5. ✅ 한국어 능력 표시 추가 (PreferencesCard)
6. ✅ 온보딩 데이터 대시보드 표시 (국적, 성별, 비자 등)
7. ✅ 체크리스트 명칭 개선

### Phase 3: 기능 강화 (1-2주)
8. ✅ 온보딩 데이터 수정 기능 (별도 페이지)
9. ✅ 한국어 능력 수정 기능
10. ✅ 프로필 완성도 단계별 가이드

---

## 📊 개선 전후 비교

| 지표 | 개선 전 | 개선 후 |
|-----|--------|--------|
| **온보딩 완료 후 완성도** | 30% | 45-50% |
| **희망 직군 데이터** | 손실 | 저장 + 활용 |
| **한국어 능력** | 표시 안 됨 | 표시 + 수정 가능 |
| **온보딩 데이터 활용** | 30% | 70% |
| **사용자 만족도** | 낮음 | 높음 |
| **채용공고 추천 정확도** | 낮음 (직군 누락) | 높음 |

---

## 🎯 결론

### 핵심 발견 사항

1. **🔴 치명적**: `desired_job_category` 필드가 온보딩에서 수집되지만 DB 저장 안 됨
2. **🟡 중요**: 프로필 완성도 계산이 온보딩 데이터를 충분히 반영하지 못함 (30% → 45-50% 가능)
3. **🟡 중요**: 한국어 능력이 프로필 완성 체크리스트에 누락
4. **🟢 개선**: 온보딩 데이터를 대시보드에서 확인/수정할 방법 필요

### 다음 단계

1. ✅ **즉시**: `desired_job_category` 버그 수정
2. ✅ **빠르게**: 프로필 완성도 계산 로직 개선
3. ✅ **점진적**: 온보딩 데이터 표시 및 수정 기능 추가

---

**작성일**: 2025-10-19 (Updated)
**작성자**: Claude Code
**목적**: 인재풀 페이지 구현을 위한 데이터 구조 철저 분석
**관련 문서**: [JOBSEEKER_ANALYSIS.md](JOBSEEKER_ANALYSIS.md), [app/talent/page.tsx.disabled](app/talent/page.tsx.disabled)

---

# 🎯 인재풀 구현을 위한 추가 분석

## 7️⃣ 체크리스트 전체 데이터 필드 매핑

### 항목별 상세 분석

#### 1. 기본 정보 (Basic Info)
**페이지**: `/profile/edit/basic`
**컴포넌트**: `Step1ProfileBasic`

**수집 필드**:
```typescript
{
  fullName: string;              // 이름 (필수)
  headline: string;              // 한 줄 소개 (필수)
  profileImageUrl?: string;      // 프로필 사진 (선택, Cloudinary)
}
```

**Supabase 매핑**:
- `full_name` (users 테이블)
- `headline` (users 테이블)
- `profile_image_url` (users 테이블)

**완성 조건**: `fullName` AND `headline` 존재

---

#### 2. 이력서 (Resume)
**페이지**: `/profile/edit/resume`

**수집 필드**:
```typescript
{
  resume_file_url: string;       // Cloudinary URL
  resume_file_name: string;      // 파일명
  resume_uploaded_at: string;    // 업로드 시각 (ISO)
}
```

**Supabase 매핑**:
- `resume_file_url` (users 테이블)
- `resume_file_name` (users 테이블)
- `resume_uploaded_at` (users 테이블)

**파일 제한**: PDF/DOC/DOCX, 최대 10MB

**완성 조건**: `resume_file_url` 존재

---

#### 3. 경력 사항 (Experience)
**페이지**: `/profile/edit/experience`
**컴포넌트**: `Step2_Experience`

**수집 필드**:
```typescript
interface Experience {
  id: string;                    // UUID
  company: string;               // 회사명 (필수)
  position: string;              // 직책 (필수)
  startDate: string;             // 시작일 (YYYY-MM)
  endDate: string;               // 종료일 (YYYY-MM)
  current: boolean;              // 현재 재직 여부
  description: string;           // 업무 설명 (필수)
}

experiences: Experience[];       // 배열
```

**Supabase 매핑**:
- `experiences` (users 테이블, JSONB) - ❌ **현재 스키마에 없음! 추가 필요**

**완성 조건**: `experiences.length > 0`

---

#### 4. 학력 사항 (Education)
**페이지**: `/profile/edit/experience` (경력과 같은 페이지)
**컴포넌트**: `Step2_Experience`

**수집 필드**:
```typescript
interface Education {
  id: string;                    // UUID
  school: string;                // 학교명 (필수)
  degree: string;                // 학위 (필수: 고등학교/전문학사/학사/석사/박사)
  field: string;                 // 전공 (필수)
  startYear: string;             // 입학년도 (YYYY)
  endYear: string;               // 졸업년도 (YYYY)
  current: boolean;              // 재학 중 여부
}

educations: Education[];         // 배열
```

**Supabase 매핑**:
- `educations` (users 테이블, JSONB) - ❌ **현재 스키마에 없음! 추가 필요**

**완성 조건**: `educations.length > 0`

---

#### 5. 보유 기술 (Skills)
**페이지**: `/profile/edit/skills`
**컴포넌트**: `Step3_Skills`

**수집 필드**:
```typescript
{
  skills: string[];              // 스킬 배열 (예: ["React", "TypeScript"])
}
```

**스킬 카테고리** (12개):
1. 개발/IT
2. 디자인
3. 마케팅/광고
4. 영업/비즈니스
5. 재무/회계
6. 인사/HR
7. 기획/전략
8. 운영/생산
9. 서비스/고객지원
10. 법률/특허
11. 연구/R&D
12. 기타

**Supabase 매핑**:
- `skills` (users 테이블, JSONB) - ❌ **현재 스키마에 없음! 추가 필요**

**완성 조건**: `skills.length > 0`

---

#### 6. 언어 능력 (Languages)
**페이지**: `/profile/edit/skills` (스킬과 같은 페이지)
**컴포넌트**: `Step3_Skills`

**수집 필드**:
```typescript
{
  languages: string[];           // 언어 배열 (예: ["영어", "일본어"])
}
```

**Supabase 매핑**:
- `languages` (users 테이블, JSONB) - ⚠️ **현재 `other_languages`로 저장됨**
- ✅ 온보딩에서 이미 수집 (`LanguageSection`)

**완성 조건**: `languages.length > 0` OR `other_languages.length > 0`

---

#### 7. 선호 조건 (Preferences)
**페이지**: `/profile/edit/preferences`
**컴포넌트**: `Step4_Preferences`

**수집 필드**:
```typescript
{
  desiredJobCategory: string;           // 희망 직군 (필수) - ❌ 현재 누락!
  desiredPositions: string[];           // 희망 직무 (필수, 최소 1개)
  preferredLocations: string[];         // 희망 지역 (필수, 최소 1개)
  salaryRange: {
    min: string;                        // 최소 연봉 (필수, 만원)
    max: string;                        // 최대 연봉 (선택, 만원)
  };
  workType: string;                     // 고용 형태 (필수: 정규직/계약직/인턴/프리랜서)
  companySize: string;                  // 기업 규모 (선택: 스타트업/중견기업/대기업/무관)
  visaSponsorship: boolean;             // 비자 스폰서십 (외국인만)
  remoteWork: string;                   // 재택근무 (선택: 풀타임/하이브리드/불가능/무관)
}
```

**Supabase 매핑**:
- ❌ `desired_job_category` - **스키마에 없음! 추가 필요**
- ✅ `desired_positions` (JSONB)
- ✅ `preferred_locations` (JSONB)
- ✅ `salary_range` (JSONB)
- ✅ `work_type` (VARCHAR)
- ✅ `company_size` (VARCHAR)
- ✅ `visa_sponsorship` (BOOLEAN)
- ✅ `remote_work` (VARCHAR)

**필수 유효성 검증**:
- desiredJobCategory ✅
- desiredPositions (최소 1개) ✅
- preferredLocations (최소 1개) ✅
- salaryRange.min ✅
- workType ✅

**완성 조건**: 위 5개 필수 필드 모두 존재

---

#### 8. 자기소개 (Introduction)
**페이지**: `/profile/edit/introduction`

**수집 필드**:
```typescript
{
  introduction: string;          // 최대 1000자
}
```

**Supabase 매핑**:
- ✅ `introduction` (users 테이블, TEXT)

**완성 조건**: `introduction` 존재 AND `introduction.length > 0`

---

## 8️⃣ Supabase 스키마 분석

### 현재 `users` 테이블 필드 (존재하는 것)

#### ✅ 기본 정보
```sql
full_name VARCHAR(100)
headline VARCHAR(200)
profile_image_url TEXT
```

#### ✅ 이력서
```sql
resume_file_url TEXT
resume_file_name VARCHAR(255)
resume_uploaded_at TIMESTAMP
```

#### ✅ 개인 정보 (온보딩에서 수집)
```sql
phone VARCHAR(20)
address TEXT
address_detail TEXT
nationality VARCHAR(50)
birth_year INTEGER
gender VARCHAR(10)
foreigner_number VARCHAR(50)
korean_level VARCHAR(50)
```

#### ✅ 희망 근무 조건 (일부)
```sql
desired_positions JSONB
preferred_locations JSONB
salary_range JSONB
work_type VARCHAR(50)
company_size VARCHAR(50)
visa_sponsorship BOOLEAN
remote_work VARCHAR(50)
```

#### ✅ 자기소개 & 비자
```sql
introduction TEXT
visa_types JSONB
```

#### ✅ 언어 능력 (온보딩)
```sql
other_languages JSONB  -- ⚠️ 체크리스트에서는 'languages'로 사용
```

#### ✅ 약관 동의
```sql
agree_email_receive BOOLEAN
agree_privacy_collection BOOLEAN
```

---

### ❌ 추가 필요 필드

#### 필수 추가 필드 (인재풀 구현 필수)
```sql
ALTER TABLE users
-- 경력 사항
ADD COLUMN experiences JSONB DEFAULT '[]'::jsonb,

-- 학력 사항
ADD COLUMN educations JSONB DEFAULT '[]'::jsonb,

-- 보유 기술
ADD COLUMN skills JSONB DEFAULT '[]'::jsonb,

-- 희망 직군 (온보딩에서 수집하지만 저장 안 됨!)
ADD COLUMN desired_job_category VARCHAR(100);
```

#### 선택 추가 필드 (인재풀 기능 향상)
```sql
ALTER TABLE users
-- 인재풀 공개 여부
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,

-- 프로필 완성 시점
ADD COLUMN profile_completed_at TIMESTAMP,

-- 가용성 상태
ADD COLUMN availability VARCHAR(50) DEFAULT 'Available',

-- 경력 연수 (자동 계산 또는 직접 입력)
ADD COLUMN years_of_experience INTEGER;
```

#### 필드명 통일 (권장)
```sql
ALTER TABLE users
-- other_languages → languages 로 변경
RENAME COLUMN other_languages TO languages;
```

---

## 9️⃣ 인재풀 등록 조건 제안

### Option 1: 최소 조건 (기본 인재풀 등록)
```typescript
function canRegisterBasic(user: User): boolean {
  return (
    // 기본 정보
    !!user.full_name &&
    !!user.headline &&

    // 희망 근무 조건 (필수)
    !!user.desired_job_category &&
    (user.desired_positions?.length ?? 0) > 0 &&
    (user.preferred_locations?.length ?? 0) > 0 &&
    !!user.salary_range?.min &&
    !!user.work_type
  );
}
```
→ **7개 필수 필드** 완성 = 인재풀 등록 가능

---

### Option 2: 권장 조건 (프로필 우선 노출)
```typescript
function canRegisterRecommended(user: User): boolean {
  return (
    canRegisterBasic(user) &&

    // 추가 권장 필드
    !!user.profile_image_url &&
    (
      (user.experiences?.length ?? 0) > 0 ||
      (user.educations?.length ?? 0) > 0
    ) &&
    (user.skills?.length ?? 0) > 0 &&
    !!user.introduction
  );
}
```
→ **12개 필드** 완성 = 인재풀 우선 노출

---

### Option 3: 완벽 조건 (프리미엄 배지)
```typescript
function canRegisterPremium(user: User): boolean {
  return (
    canRegisterRecommended(user) &&

    // 프리미엄 필드
    !!user.resume_file_url &&
    (user.experiences?.length ?? 0) > 0 &&
    (user.educations?.length ?? 0) > 0 &&
    (user.languages?.length ?? 0) > 0
  );
}
```
→ **모든 필드** 완성 = 프리미엄 인재 배지

---

## 🔟 프로필 완성도 계산 (개선안)

### 현재 가중치 (총 100점)
```typescript
const weights = {
  basicInfo: 20,        // 이름, 이메일, 연락처
  resume: 15,           // 이력서
  experience: 15,       // 경력
  education: 10,        // 학력
  skills: 15,           // 기술
  languages: 10,        // 언어
  preferences: 10,      // 선호 조건
  introduction: 5,      // 자기소개
};
```

### 개선안 (인재풀 고려)
```typescript
const weights = {
  // 필수 (50점)
  basicInfo: 10,              // 이름, 한 줄 소개
  preferences: 25,            // 희망 조건 (직군, 직무, 지역, 연봉, 고용형태)
  profileImage: 5,            // 프로필 사진
  onboardingData: 10,         // 온보딩 완료 데이터 (국적, 성별, 주소 등)

  // 권장 (40점)
  resume: 10,                 // 이력서
  experience: 10,             // 경력
  education: 7,               // 학력
  skills: 10,                 // 기술
  introduction: 3,            // 자기소개

  // 선택 (10점)
  languages: 7,               // 한국어 외 언어
  koreanLevel: 3,             // 한국어 능력
};
```

### 완성도 계산 로직
```typescript
function calculateCompletion(profile: User): {
  score: number;
  category: 'basic' | 'recommended' | 'premium';
  canRegisterTalentPool: boolean;
} {
  let score = 0;

  // 필수 (50점)
  if (profile.full_name && profile.headline) score += 10;
  if (profile.profile_image_url) score += 5;
  if (
    profile.desired_job_category &&
    (profile.desired_positions?.length ?? 0) > 0 &&
    (profile.preferred_locations?.length ?? 0) > 0 &&
    profile.salary_range?.min &&
    profile.work_type
  ) score += 25;
  if (
    profile.nationality &&
    profile.gender &&
    profile.birth_year &&
    profile.address
  ) score += 10;

  // 권장 (40점)
  if (profile.resume_file_url) score += 10;
  if ((profile.experiences?.length ?? 0) > 0) score += 10;
  if ((profile.educations?.length ?? 0) > 0) score += 7;
  if ((profile.skills?.length ?? 0) > 0) score += 10;
  if (profile.introduction) score += 3;

  // 선택 (10점)
  if ((profile.languages?.length ?? 0) > 0) score += 7;
  if (profile.korean_level) score += 3;

  // 카테고리 판정
  let category: 'basic' | 'recommended' | 'premium' = 'basic';
  if (score >= 90) category = 'premium';
  else if (score >= 70) category = 'recommended';

  // 인재풀 등록 가능 여부 (최소 50점 필요)
  const canRegisterTalentPool = score >= 50;

  return { score, category, canRegisterTalentPool };
}
```

---

## 1️⃣1️⃣ Firebase 시대 vs. Supabase 현재 데이터 매핑

### Firebase 시대 (app/talent/page.tsx.disabled)
```typescript
interface TalentProfile {
  id: string;
  name: string;
  title: string;
  nationality: string;            // ❌ TODO 필요했음
  location: string;
  experience: number;             // experiences.length
  skills: string[];
  rating?: number;
  availability: string;           // ❌ TODO 필요했음
  expectedSalary: { min: string; max: string };
  languages: string[];
  profileImage?: string;
}

const converted = jobseekers.map(js => ({
  id: js.uid,
  name: js.fullName || 'Unknown',
  title: js.headline || js.desiredPositions?.[0] || 'Job Seeker',
  nationality: 'Korea',           // ❌ 하드코딩
  location: js.preferredLocations?.[0] || 'Not specified',
  experience: js.experiences?.length || 0,
  skills: js.skills || [],
  rating: undefined,
  availability: 'Available',      // ❌ 하드코딩
  expectedSalary: js.salaryRange,
  languages: js.languages,
  profileImage: js.profileImageUrl
}));
```

### Supabase 현재 (제안)
```typescript
interface TalentProfile {
  id: string;
  name: string;
  title: string;
  nationality: string;            // ✅ users.nationality 존재
  location: string;
  experience: number;             // ❌ users.experiences 없음 → 추가 필요
  skills: string[];               // ❌ users.skills 없음 → 추가 필요
  rating?: number;
  availability: string;           // ❌ users.availability 없음 → 추가 권장
  expectedSalary: { min: string; max: string };
  languages: string[];            // ⚠️ users.other_languages → languages 통일
  profileImage?: string;
  resumeUrl?: string;             // 🆕 추가: 이력서 링크
  isPublic: boolean;              // 🆕 추가: 공개 여부
  profileCompletedAt?: string;    // 🆕 추가: 완성 시점
}

const converted = jobseekers
  .filter(js => js.is_public)     // 🆕 공개 설정한 사용자만
  .map(js => ({
    id: js.id,
    name: js.full_name || 'Unknown',
    title: js.headline || js.desired_positions?.[0] || 'Job Seeker',
    nationality: js.nationality || 'Not specified',  // ✅ DB에 있음
    location: js.preferred_locations?.[0] || 'Not specified',
    experience: js.experiences?.length || 0,         // ✅ 추가 후 사용 가능
    skills: js.skills || [],                         // ✅ 추가 후 사용 가능
    rating: undefined,
    availability: js.availability || 'Available',    // ✅ 추가 권장
    expectedSalary: js.salary_range,
    languages: js.languages || js.other_languages || [], // ⚠️ 필드명 통일
    profileImage: js.profile_image_url,
    resumeUrl: js.resume_file_url,                   // 🆕 이력서
    isPublic: js.is_public,                          // 🆕 공개 여부
    profileCompletedAt: js.profile_completed_at       // 🆕 완성 시점
  }));
```

---

## 1️⃣2️⃣ 구현 단계 제안

### Phase 1: Supabase 스키마 업데이트 (30분)
```sql
-- 1. 필수 필드 추가
ALTER TABLE users
ADD COLUMN experiences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN educations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN desired_job_category VARCHAR(100);

-- 2. 인재풀 관련 필드 추가
ALTER TABLE users
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN profile_completed_at TIMESTAMP,
ADD COLUMN availability VARCHAR(50) DEFAULT 'Available';

-- 3. 필드명 통일 (선택)
ALTER TABLE users
RENAME COLUMN other_languages TO languages;

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_users_is_public ON users(is_public) WHERE is_public = true;
CREATE INDEX idx_users_desired_job_category ON users(desired_job_category);
CREATE INDEX idx_users_skills ON users USING GIN(skills);
```

### Phase 2: 프로필 완성도 계산 로직 (1시간)
```typescript
// lib/supabase/jobseeker-utils.ts 개선
export function calculateProfileCompletion(profile: User): ProfileCompletion {
  // 위에서 정의한 calculateCompletion 함수 구현
}

export function getProfileCompletionDetails(profile: User): ChecklistItem[] {
  // 8개 체크리스트 항목별 완성 여부 반환
  return [
    {
      id: 'basic',
      title: '기본 정보',
      completed: !!(profile.full_name && profile.headline),
      link: '/profile/edit/basic'
    },
    {
      id: 'resume',
      title: '이력서',
      completed: !!profile.resume_file_url,
      link: '/profile/edit/resume'
    },
    // ... 나머지 6개 항목
  ];
}
```

### Phase 3: 인재풀 등록 조건 체크 (30분)
```typescript
// lib/supabase/talent-pool.ts (신규 파일)
export function canRegisterTalentPool(user: User): {
  eligible: boolean;
  missing: string[];
  level: 'basic' | 'recommended' | 'premium';
} {
  const missing: string[] = [];

  // 필수 체크
  if (!user.full_name) missing.push('이름');
  if (!user.headline) missing.push('한 줄 소개');
  if (!user.desired_job_category) missing.push('희망 직군');
  if (!user.desired_positions?.length) missing.push('희망 직무');
  if (!user.preferred_locations?.length) missing.push('희망 지역');
  if (!user.salary_range?.min) missing.push('최소 희망 연봉');
  if (!user.work_type) missing.push('고용 형태');

  const eligible = missing.length === 0;

  // 레벨 판정
  let level: 'basic' | 'recommended' | 'premium' = 'basic';
  if (eligible) {
    const { category } = calculateProfileCompletion(user);
    level = category;
  }

  return { eligible, missing, level };
}

export async function toggleTalentPoolPublic(
  userId: string,
  isPublic: boolean
): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('사용자를 찾을 수 없습니다');

  const { eligible, missing } = canRegisterTalentPool(user);

  if (isPublic && !eligible) {
    throw new Error(
      `인재풀 등록을 위해 다음 정보가 필요합니다: ${missing.join(', ')}`
    );
  }

  await supabase
    .from('users')
    .update({
      is_public: isPublic,
      profile_completed_at: isPublic ? new Date().toISOString() : null
    })
    .eq('id', userId);
}
```

### Phase 4: 인재풀 페이지 활성화 (3-4시간)
1. `app/talent/page.tsx.disabled` → `app/talent/page.tsx` 복사
2. Firebase 코드 → Supabase 코드 변환
3. 데이터 변환 로직 업데이트 (위 매핑 참고)
4. 필터링 및 검색 기능 Supabase 쿼리로 재작성

```typescript
// app/talent/page.tsx (Supabase 버전)
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import type { TalentProfile } from '@/types/talent.types';

export default function TalentPoolPage() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    skills: [],
    location: '',
    experienceMin: 0
  });

  useEffect(() => {
    fetchTalents();
  }, [filters]);

  const fetchTalents = async () => {
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_public', true)  // 🆕 공개 설정한 사용자만
      .eq('user_type', 'jobseeker');

    // 필터 적용
    if (filters.category) {
      query = query.eq('desired_job_category', filters.category);
    }

    if (filters.skills.length > 0) {
      query = query.contains('skills', filters.skills);
    }

    if (filters.location) {
      query = query.contains('preferred_locations', [filters.location]);
    }

    const { data, error } = await query;

    if (!error && data) {
      const converted = data.map(js => ({
        id: js.id,
        name: js.full_name || 'Unknown',
        title: js.headline || js.desired_positions?.[0] || 'Job Seeker',
        nationality: js.nationality || 'Not specified',
        location: js.preferred_locations?.[0] || 'Not specified',
        experience: js.experiences?.length || 0,
        skills: js.skills || [],
        availability: js.availability || 'Available',
        expectedSalary: js.salary_range,
        languages: js.languages || [],
        profileImage: js.profile_image_url
      }));

      setTalents(converted);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* 인재풀 UI */}
    </div>
  );
}
```

---

## 1️⃣3️⃣ 최종 정리

### 누락된 필드 요약
| 필드 | 위치 | 상태 | 우선순위 |
|------|------|------|---------|
| `experiences` | users 테이블 | ❌ 없음 | 🔴 필수 |
| `educations` | users 테이블 | ❌ 없음 | 🔴 필수 |
| `skills` | users 테이블 | ❌ 없음 | 🔴 필수 |
| `desired_job_category` | users 테이블 | ❌ 없음 | 🔴 필수 |
| `is_public` | users 테이블 | ❌ 없음 | 🟡 권장 |
| `availability` | users 테이블 | ❌ 없음 | 🟡 권장 |
| `profile_completed_at` | users 테이블 | ❌ 없음 | 🟢 선택 |
| `languages` | users 테이블 | ⚠️ `other_languages` | 🟢 통일 권장 |

### 작업 예상 시간
- **Phase 1** (스키마): 30분
- **Phase 2** (완성도 계산): 1시간
- **Phase 3** (등록 조건): 30분
- **Phase 4** (인재풀 페이지): 3-4시간
- **총 예상**: 약 6시간

---

**최종 업데이트**: 2025-10-19
**분석 완료**: 체크리스트 8개 항목 전체 데이터 필드 철저 분석 완료
**다음 단계**: Supabase 스키마 업데이트 → 인재풀 페이지 활성화
