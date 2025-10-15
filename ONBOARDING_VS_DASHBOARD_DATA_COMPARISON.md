# 개인 회원 온보딩 완료 vs 대시보드 데이터 구조 비교 분석

## 📋 목차
1. [개요](#개요)
2. [온보딩 완료 시 저장되는 데이터](#온보딩-완료-시-저장되는-데이터)
3. [대시보드에서 요구하는 데이터](#대시보드에서-요구하는-데이터)
4. [데이터 구조 차이 분석](#데이터-구조-차이-분석)
5. [문제점 및 해결방안](#문제점-및-해결방안)

---

## 개요

### 목적
개인 회원이 **온보딩 완료 시 입력하는 데이터**와 **대시보드에서 표시하려는 데이터** 간의 차이를 분석하여, 데이터 누락으로 인한 오류를 사전에 방지합니다.

### 비교 대상
- **온보딩 페이지**: [app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:1)
- **대시보드 페이지**: [app/jobseeker-dashboard/page.tsx](app/jobseeker-dashboard/page.tsx:1)

---

## 온보딩 완료 시 저장되는 데이터

### 코드 분석 (Quick 온보딩)

[app/onboarding/job-seeker/quick/page.tsx](app/onboarding/job-seeker/quick/page.tsx:210)

```typescript
await completeOnboarding(user.id, {
  fullName: formData.fullName,
  phone: isKorean ? formData.phone.replace(/-/g, '') : '',
  headline: formData.headline || '',
  resumeFileUrl: null,
  resumeFileName: null,
  foreigner_number: !isKorean ? formData.foreignerNumber : undefined,
  address: formData.address,
  address_detail: formData.addressDetail,
  nationality: formData.nationality,
  gender: formData.gender,
  visa_types: formData.visaType,  // 외국인만 입력
  korean_level: formData.koreanLevel,
  // ❌ 언어 능력 (otherLanguages) 저장 안 됨!
  agree_email_receive: formData.agreeEmailReceive,
  agree_privacy_collection: formData.agreePrivacyTerms,
});
```

### 온보딩에서 입력받는 데이터 항목

| 섹션 | 필드명 | 타입 | 필수 | 저장 여부 | 비고 |
|------|--------|------|------|----------|------|
| **기본 정보** | fullName | string | ✅ | ✅ | |
| | nationality | string | ✅ | ✅ | |
| | phone | string | ✅ (한국인) | ✅ | 하이픈 제거 |
| | foreignerNumber | string | ✅ (외국인) | ✅ | |
| **계정 정보** | email | string | ✅ | ✅ | Auth에 저장 |
| | password | string | ✅ | ✅ | Auth에 저장 |
| **주소** | address | string | ✅ | ✅ | |
| | addressDetail | string | ❌ | ✅ | |
| **개인 정보** | gender | string | ✅ | ✅ | |
| **비자 정보** | visaType | string[] | ✅ (외국인) | ✅ | 한국인은 선택 |
| **언어 능력** | koreanLevel | string | ✅ | ✅ | |
| | otherLanguages | array | ✅ | ❌ | **저장 안 됨!** |
| **약관 동의** | agreeServiceTerms | boolean | ✅ | ❌ | |
| | agreePrivacyTerms | boolean | ✅ | ✅ | |
| | agreeEmailReceive | boolean | ❌ | ✅ | |
| **선택 항목** | headline | string | ❌ | ✅ | |
| | resumeFile | File | ❌ | ❌ | Quick 온보딩에서는 미제공 |

### ❌ 저장되지 않는 중요 데이터

1. **otherLanguages (한국어 외 언어 능력)**
   - 온보딩에서 입력받지만 저장하지 않음
   - 대시보드에서 표시 필요

2. **agreeServiceTerms (서비스 이용약관)**
   - 입력받지만 저장하지 않음

3. **resumeFile (이력서)**
   - Quick 온보딩에서는 입력받지 않음
   - 대시보드 완성도 체크리스트에 포함됨

---

## 대시보드에서 요구하는 데이터

### 코드 분석 (대시보드)

[app/jobseeker-dashboard/page.tsx](app/jobseeker-dashboard/page.tsx:56)

```typescript
const profile = await getJobseekerProfile(user.uid);

// ❌ Firebase 함수 사용 (마이그레이션 필요)
```

### 대시보드에 표시되는 데이터 항목

#### 1. **헤더 섹션** (Hero Section)
```typescript
// app/jobseeker-dashboard/page.tsx:187-227
profileData?.profileImageUrl     // ❌ 온보딩에 없음
profileData?.fullName             // ✅
profileData?.headline             // ✅
profileData?.preferredLocations   // ❌ 온보딩에 없음
profileData?.salaryRange          // ❌ 온보딩에 없음
profileData?.visaSponsorship      // ❌ 온보딩에 없음
```

#### 2. **프로필 완성도 체크리스트**
```typescript
// app/jobseeker-dashboard/page.tsx:106-171
const getProfileChecklist = () => {
  return [
    // ❌ 온보딩에서 입력받지 않는 항목들
    { id: 'resume', completed: !!(profileData?.resumeFileUrl) },
    { id: 'experience', completed: !!(profileData?.experiences?.length > 0) },
    { id: 'education', completed: !!(profileData?.educations?.length > 0) },
    { id: 'skills', completed: !!(profileData?.skills?.length > 0) },
    { id: 'languages', completed: !!(profileData?.languages?.length > 0) },
    { id: 'preferences', completed: !!(
      profileData?.desiredPositions?.length > 0 &&
      profileData?.preferredLocations?.length > 0 &&
      profileData?.salaryRange?.min
    ) },
    { id: 'introduction', completed: !!(profileData?.introduction) }
  ];
};
```

#### 3. **경력 사항**
```typescript
// app/jobseeker-dashboard/page.tsx:448-478
profileData?.experiences?.map((exp: any) => (
  <div>
    <p>{exp.position}</p>
    <p>{exp.company}</p>
    <p>{exp.startDate} ~ {exp.current ? '현재' : exp.endDate}</p>
    <p>{exp.description}</p>
  </div>
))
```

#### 4. **학력 사항**
```typescript
// app/jobseeker-dashboard/page.tsx:481-498
profileData?.educations?.map((edu: any) => (
  <div>
    <p>{edu.school}</p>
    <p>{edu.degree} • {edu.field}</p>
    <p>{edu.startYear} ~ {edu.current ? '재학 중' : edu.endYear}</p>
  </div>
))
```

#### 5. **보유 기술**
```typescript
// app/jobseeker-dashboard/page.tsx:625-629
profileData?.skills?.map((skill: string) => (
  <span>{skill}</span>
))
```

#### 6. **언어 능력**
```typescript
// app/jobseeker-dashboard/page.tsx:634-641
profileData?.languages?.map((lang: string) => (
  <div>
    <span>{lang}</span>
    <span>유창함</span>  // ❌ 숙련도 정보 없음
  </div>
))
```

#### 7. **선호 조건**
```typescript
// app/jobseeker-dashboard/page.tsx:650-707
profileData?.desiredPositions      // ❌ 온보딩에 없음
profileData?.workType              // ❌ 온보딩에 없음
profileData?.companySize           // ❌ 온보딩에 없음
profileData?.remoteWork            // ❌ 온보딩에 없음
```

#### 8. **이력서**
```typescript
// app/jobseeker-dashboard/page.tsx:710-756
profileData?.resumeFileUrl         // ❌ Quick 온보딩에 없음
profileData?.resumeFileName        // ❌ Quick 온보딩에 없음
profileData?.resumeUploadedAt      // ❌ Quick 온보딩에 없음
```

#### 9. **자기소개**
```typescript
// app/jobseeker-dashboard/page.tsx:759-768
profileData?.introduction          // ❌ Quick 온보딩에 없음
```

---

## 데이터 구조 차이 분석

### Quick 온보딩 vs 대시보드 필드 매핑

| 대시보드 필드 | Quick 온보딩 | 4단계 온보딩 | 비고 |
|--------------|-------------|------------|------|
| **기본 정보** ||||
| profileImageUrl | ❌ 없음 | ✅ Step1 | Quick 온보딩에 추가 필요 |
| fullName | ✅ | ✅ | |
| headline | ✅ (선택) | ✅ | |
| phone | ✅ | ❌ | Quick만 있음 |
| nationality | ✅ | ❌ | Quick만 있음 |
| gender | ✅ | ❌ | Quick만 있음 |
| address | ✅ | ❌ | Quick만 있음 |
| **경력/학력** ||||
| experiences | ❌ 없음 | ✅ Step2 | 대시보드 필수 |
| educations | ❌ 없음 | ✅ Step2 | 대시보드 필수 |
| **기술/언어** ||||
| skills | ❌ 없음 | ✅ Step3 | 대시보드 필수 |
| languages | ⚠️ 입력O, 저장X | ✅ Step3 | **버그!** |
| koreanLevel | ✅ | ❌ | Quick만 있음 |
| **비자 정보** ||||
| visaTypes | ✅ (외국인) | ❌ | Quick만 있음 |
| visaSponsorship | ❌ 없음 | ✅ Step4 | 선호 조건 |
| **선호 조건** ||||
| desiredPositions | ❌ 없음 | ✅ Step4 | 대시보드 필수 |
| preferredLocations | ❌ 없음 | ✅ Step4 | 대시보드 필수 |
| salaryRange | ❌ 없음 | ✅ Step4 | 대시보드 필수 |
| workType | ❌ 없음 | ✅ Step4 | 선호 조건 |
| companySize | ❌ 없음 | ✅ Step4 | 선호 조건 |
| remoteWork | ❌ 없음 | ✅ Step4 | 선호 조건 |
| **기타** ||||
| resumeFileUrl | ❌ 없음 | ❌ 없음 | 별도 업로드 필요 |
| introduction | ❌ 없음 | ✅ Step4 | 자기소개 |

---

## 문제점 및 해결방안

### 🚨 치명적 문제

#### 1. **otherLanguages 저장 안 됨**
**문제**:
```typescript
// app/onboarding/job-seeker/quick/page.tsx:210
await completeOnboarding(user.id, {
  // ...
  korean_level: formData.koreanLevel,
  // ❌ otherLanguages 저장 안 됨!
  agree_email_receive: formData.agreeEmailReceive,
});
```

**해결 방안**:
```typescript
// lib/supabase/jobseeker-service.ts:165
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  // 1. users 테이블 업데이트
  await supabase
    .from('users')
    .update({
      // ... 기존 필드들
      korean_level: data.korean_level,
      onboarding_completed: true,
    })
    .eq('id', userId);

  // 2. user_languages 테이블에 언어 저장 (신규)
  if (data.otherLanguages && data.otherLanguages.length > 0) {
    const languageData = data.otherLanguages.map(lang => ({
      user_id: userId,
      language_name: lang.language,
      proficiency: lang.proficiency,
    }));

    await supabase
      .from('user_languages')
      .insert(languageData);
  }
};
```

**온보딩 페이지 수정**:
```typescript
// app/onboarding/job-seeker/quick/page.tsx:210
await completeOnboarding(user.id, {
  // ... 기존 필드들
  korean_level: formData.koreanLevel,
  otherLanguages: formData.otherLanguages,  // 추가
  agree_email_receive: formData.agreeEmailReceive,
});
```

---

#### 2. **대시보드가 Firebase 함수 사용**
**문제**:
```typescript
// app/jobseeker-dashboard/page.tsx:62
const profile = await getJobseekerProfile(user.uid);

// ❌ Firebase 함수 (lib/firebase/jobseeker-service.ts)
```

**해결 방안**:
```typescript
// 1. Supabase 함수 생성 (lib/supabase/jobseeker-service.ts)
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      skills:user_skills(skill_name),
      languages:user_languages(language_name, proficiency),
      experiences:user_experiences(*),
      educations:user_educations(*),
      desired_positions:user_desired_positions(position_name),
      preferred_locations:user_preferred_locations(location_name),
      salary_range:user_salary_range(*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// 2. 대시보드 수정
// app/jobseeker-dashboard/page.tsx:62
import { getUserProfile } from '@/lib/supabase/jobseeker-service';

const profile = await getUserProfile(user.id);  // ✅ user.uid → user.id
```

---

#### 3. **Quick 온보딩 데이터 부족**
**문제**:
Quick 온보딩은 최소한의 정보만 입력받아, 대시보드 프로필 완성도가 매우 낮음 (예상: 20~30%)

**대시보드 체크리스트 7개 항목 중 Quick 온보딩에서 완료되는 항목: 0개**

**해결 방안 A: Quick 온보딩 확장** (권장)
```typescript
// Quick 온보딩에 추가 섹션 추가 (선택 항목)
Section 8: 선호 조건 (선택)
- 희망 직무
- 희망 근무지
- 희망 연봉

Section 9: 간단한 자기소개 (선택)

// 최소 입력 후 "나중에 추가하기" 버튼 제공
```

**해결 방안 B: 온보딩 후 추가 정보 입력 유도**
```typescript
// 온보딩 완료 후 대시보드 리다이렉션 시
router.push('/jobseeker-dashboard?firstTime=true');

// 대시보드에서 "프로필 완성하기" 모달 표시
if (searchParams.get('firstTime') === 'true' && profileCompletion < 50) {
  // 프로필 완성 안내 모달 표시
  <Modal>
    <h2>환영합니다! 프로필을 더 완성해볼까요?</h2>
    <p>경력, 기술, 선호 조건을 추가하면 더 좋은 매칭을 받을 수 있어요.</p>
    <button onClick={() => router.push('/profile/edit')}>
      지금 완성하기
    </button>
    <button>나중에 하기</button>
  </Modal>
}
```

**해결 방안 C: 4단계 온보딩 활성화**
```typescript
// app/onboarding/job-seeker/page.tsx 활성화
// Supabase 함수로 마이그레이션 후 사용

// 회원가입 후 선택
<Link href="/onboarding/job-seeker/quick">빠른 가입 (3분)</Link>
<Link href="/onboarding/job-seeker">상세 가입 (10분)</Link>
```

---

#### 4. **프로필 완성도 계산 불일치**
**문제**:
```typescript
// app/jobseeker-dashboard/page.tsx:103
const profileCompletion = calculateProfileCompletion(profileData);

// ❌ Firebase 함수 (lib/firebase/jobseeker-service.ts)
```

**해결 방안**:
```typescript
// lib/supabase/jobseeker-service.ts
export const calculateProfileCompletion = (profile: any): number => {
  const weights = {
    basicInfo: 20,        // 이름, 이메일, 연락처 등
    resume: 15,           // 이력서
    experience: 15,       // 경력
    education: 10,        // 학력
    skills: 15,           // 기술
    languages: 10,        // 언어
    preferences: 10,      // 선호 조건
    introduction: 5,      // 자기소개
  };

  let score = 0;

  // 기본 정보 (20%)
  if (profile?.full_name && profile?.email && profile?.phone) {
    score += weights.basicInfo;
  }

  // 이력서 (15%)
  if (profile?.resume_file_url) {
    score += weights.resume;
  }

  // 경력 (15%)
  if (profile?.experiences && profile.experiences.length > 0) {
    score += weights.experience;
  }

  // 학력 (10%)
  if (profile?.educations && profile.educations.length > 0) {
    score += weights.education;
  }

  // 기술 (15%)
  if (profile?.skills && profile.skills.length > 0) {
    score += weights.skills;
  }

  // 언어 (10%)
  if (profile?.languages && profile.languages.length > 0) {
    score += weights.languages;
  }

  // 선호 조건 (10%)
  if (
    profile?.desired_positions?.length > 0 &&
    profile?.preferred_locations?.length > 0 &&
    profile?.salary_range?.min
  ) {
    score += weights.preferences;
  }

  // 자기소개 (5%)
  if (profile?.introduction && profile.introduction.trim().length > 0) {
    score += weights.introduction;
  }

  return Math.min(score, 100);
};
```

---

### ⚠️ 중요 문제

#### 5. **user.uid vs user.id 혼용**
**문제**:
```typescript
// Firebase: user.uid
// Supabase: user.id

// app/jobseeker-dashboard/page.tsx:62
const profile = await getJobseekerProfile(user.uid);  // ❌
```

**해결 방안**:
```typescript
// 모든 파일에서 user.id로 통일
const profile = await getUserProfile(user.id);  // ✅
```

---

#### 6. **언어 능력 숙련도 누락**
**문제**:
```typescript
// app/jobseeker-dashboard/page.tsx:634
profileData?.languages?.map((lang: string) => (
  <div>
    <span>{lang}</span>
    <span>유창함</span>  // ❌ 하드코딩
  </div>
))
```

**해결 방안**:
```typescript
// user_languages 테이블에 proficiency 저장
profileData?.languages?.map((lang: { language_name: string, proficiency: string }) => (
  <div>
    <span>{lang.language_name}</span>
    <span>
      {lang.proficiency === 'native' ? '원어민' :
       lang.proficiency === 'fluent' ? '유창함' :
       lang.proficiency === 'business' ? '비즈니스' :
       lang.proficiency === 'intermediate' ? '중급' : '초급'}
    </span>
  </div>
))
```

---

### 💡 개선 제안

#### 7. **추천 채용공고 매칭 로직**
**현재**:
```typescript
// app/jobseeker-dashboard/page.tsx:77
const recommended = getRecommendedJobs(profile, jobs, 3);

// lib/utils.ts
export const getRecommendedJobs = (profile: any, jobs: any[], limit: number) => {
  // ❌ profile.desiredPositions 필요 (Quick 온보딩에 없음)
  // ❌ profile.preferredLocations 필요 (Quick 온보딩에 없음)
  // ❌ profile.skills 필요 (Quick 온보딩에 없음)
};
```

**개선**:
```typescript
// Quick 온보딩 데이터만으로도 추천 가능하도록
export const getRecommendedJobs = (profile: any, jobs: any[], limit: number) => {
  let matchedJobs = jobs;

  // 1. 국적 기반 매칭
  if (profile.nationality && profile.nationality !== 'KR') {
    matchedJobs = matchedJobs.filter(job =>
      job.foreignerFriendly === true ||
      job.visaSponsorship === true
    );
  }

  // 2. 비자 유형 기반 매칭
  if (profile.visa_types && profile.visa_types.length > 0) {
    matchedJobs = matchedJobs.filter(job =>
      job.acceptedVisas?.some(visa => profile.visa_types.includes(visa))
    );
  }

  // 3. 한국어 능력 기반 매칭
  if (profile.korean_level) {
    const levelNum = parseInt(profile.korean_level.replace('topik', ''));
    matchedJobs = matchedJobs.filter(job =>
      !job.minKoreanLevel || levelNum >= job.minKoreanLevel
    );
  }

  // 4. 선호 조건이 있으면 추가 필터링
  if (profile.desired_positions?.length > 0) {
    // 기존 로직
  }

  return matchedJobs.slice(0, limit);
};
```

---

## 결론

### 요약

| 문제 | 심각도 | 영향 | 해결 방안 |
|------|--------|------|----------|
| otherLanguages 저장 안 됨 | 🔴 높음 | 대시보드 언어 섹션 비어있음 | completeOnboarding 함수 수정 |
| Firebase 함수 사용 | 🔴 높음 | 빌드 에러 발생 | getUserProfile Supabase 함수 생성 |
| Quick 온보딩 데이터 부족 | 🟠 중간 | 프로필 완성도 낮음 | Quick 온보딩 확장 또는 추가 유도 |
| user.uid vs user.id 혼용 | 🟠 중간 | 런타임 에러 가능 | user.id로 통일 |
| 언어 숙련도 누락 | 🟡 낮음 | UX 저하 | proficiency 표시 |
| 추천 로직 개선 | 🟡 낮음 | 추천 정확도 낮음 | Quick 데이터 활용 |

### 우선순위 작업

**1단계 (긴급)**
1. otherLanguages 저장 로직 추가
2. getUserProfile Supabase 함수 생성
3. 대시보드 Firebase → Supabase 마이그레이션

**2단계 (중요)**
1. Quick 온보딩 확장 (선호 조건 추가)
2. 온보딩 완료 후 추가 정보 입력 유도 모달
3. user.uid → user.id 통일

**3단계 (개선)**
1. 언어 숙련도 표시 개선
2. Quick 데이터 기반 추천 로직 개선
3. 프로필 완성도 계산 로직 최적화

---

**작성일**: 2025-10-15
**작성자**: Claude Code
**버전**: 1.0
