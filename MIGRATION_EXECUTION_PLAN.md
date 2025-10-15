# 개인 회원 시스템 Supabase 완전 마이그레이션 실행 계획

## 📋 목차
1. [전략 요약](#전략-요약)
2. [Phase 1: 긴급 버그 수정](#phase-1-긴급-버그-수정)
3. [Phase 2: Supabase 프로필 함수 구현](#phase-2-supabase-프로필-함수-구현)
4. [Phase 3: 대시보드 마이그레이션](#phase-3-대시보드-마이그레이션)
5. [Phase 4: 프로필 편집 페이지 마이그레이션](#phase-4-프로필-편집-페이지-마이그레이션)
6. [Phase 5: 검증 및 테스트](#phase-5-검증-및-테스트)
7. [체크리스트](#체크리스트)

---

## 전략 요약

### 핵심 원칙
1. ✅ **온보딩은 그대로** - Quick 온보딩 유지 (최소 정보만 입력)
2. ✅ **대시보드에서 추가 입력 유도** - 프로필 완성도 시스템으로 나머지 정보 입력
3. ✅ **Firebase 완전 제거** - 모든 데이터 조회/저장을 Supabase로 전환
4. ✅ **버그 즉시 수정** - otherLanguages 저장 안 되는 치명적 버그 수정

### 작업 흐름
```
Phase 1 (10분) → Phase 2 (15분) → Phase 3 (20분) → Phase 4 (30분) → Phase 5 (15분)
총 소요 시간: 약 90분
```

---

## Phase 1: 긴급 버그 수정 🔴

### 목표
온보딩에서 입력받은 `otherLanguages`를 `user_languages` 테이블에 저장

### 작업 1.1: completeOnboarding 함수 수정

**파일**: `lib/supabase/jobseeker-service.ts`

**현재 코드**:
```typescript
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  const updateData: any = {
    full_name: data.fullName,
    phone: data.phone,
    // ... 기타 필드
    korean_level: data.koreanLevel,
    // ❌ otherLanguages 저장 안 됨!
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };

  const { data: userData, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return userData;
};
```

**수정 후 코드**:
```typescript
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  // 1. users 테이블 업데이트
  const updateData: any = {
    full_name: data.fullName,
    phone: data.phone,
    headline: data.headline || '',
    foreigner_number: data.foreigner_number,
    address: data.address,
    address_detail: data.address_detail,
    nationality: data.nationality,
    gender: data.gender,
    visa_types: data.visa_types || [],
    korean_level: data.korean_level,
    agree_email_receive: data.agree_email_receive,
    agree_privacy_collection: data.agree_privacy_collection,
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };

  const { data: userData, error: userError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (userError) throw userError;

  // 2. user_languages 테이블에 언어 저장 (신규)
  if (data.otherLanguages && data.otherLanguages.length > 0) {
    // 기존 언어 삭제 (중복 방지)
    await supabase
      .from('user_languages')
      .delete()
      .eq('user_id', userId);

    // 새로운 언어 삽입
    const languageData = data.otherLanguages.map((lang) => ({
      user_id: userId,
      language_name: lang.language,
      proficiency: lang.proficiency,
    }));

    const { error: langError } = await supabase
      .from('user_languages')
      .insert(languageData);

    if (langError) {
      console.error('언어 저장 실패:', langError);
      // 언어 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  return userData;
};
```

---

### 작업 1.2: JobseekerOnboardingData 타입 수정

**파일**: `types/jobseeker-onboarding.types.ts`

**인터페이스 확인 및 수정**:
```typescript
export interface JobseekerOnboardingData {
  fullName: string;
  phone: string;
  headline?: string;
  foreigner_number?: string;
  address: string;
  address_detail?: string;
  nationality: string;
  gender: string;
  visa_types?: string[];
  korean_level: string;
  otherLanguages?: Array<{  // ✅ 추가
    language: string;
    proficiency: string;
  }>;
  agree_email_receive: boolean;
  agree_privacy_collection: boolean;
}
```

---

### 작업 1.3: 온보딩 페이지에서 otherLanguages 전달

**파일**: `app/onboarding/job-seeker/quick/page.tsx`

**현재 코드** (210줄 근처):
```typescript
await completeOnboarding(user.id, {
  fullName: formData.fullName,
  phone: isKorean ? formData.phone.replace(/-/g, '') : '',
  headline: formData.headline || '',
  // ❌ otherLanguages 전달 안 함
  // ...
});
```

**수정 후 코드**:
```typescript
await completeOnboarding(user.id, {
  fullName: formData.fullName,
  phone: isKorean ? formData.phone.replace(/-/g, '') : '',
  headline: formData.headline || '',
  foreigner_number: !isKorean ? formData.foreignerNumber : undefined,
  address: formData.address,
  address_detail: formData.addressDetail,
  nationality: formData.nationality,
  gender: formData.gender,
  visa_types: formData.visaType,
  korean_level: formData.koreanLevel,
  otherLanguages: formData.otherLanguages,  // ✅ 추가
  agree_email_receive: formData.agreeEmailReceive,
  agree_privacy_collection: formData.agreePrivacyTerms,
});
```

---

## Phase 2: Supabase 프로필 함수 구현 🔴

### 목표
Firebase 함수를 대체할 Supabase 프로필 조회/업데이트 함수 구현

### 작업 2.1: getUserProfile 함수

**파일**: `lib/supabase/jobseeker-service.ts`

```typescript
/**
 * 개인 회원 프로필 조회 (관계 테이블 포함)
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      skills:user_skills(skill_name),
      languages:user_languages(language_name, proficiency),
      experiences:user_experiences(
        id,
        company,
        position,
        start_date,
        end_date,
        is_current,
        description,
        created_at
      ),
      educations:user_educations(
        id,
        school,
        degree,
        field,
        start_year,
        end_year,
        is_current,
        created_at
      ),
      desired_positions:user_desired_positions(position_name),
      preferred_locations:user_preferred_locations(location_name),
      salary_range:user_salary_range(
        min_salary,
        max_salary,
        currency
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[getUserProfile] 에러:', error);
    throw error;
  }

  // 데이터 구조 변환 (Firebase 형식과 호환)
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    headline: data.headline,
    profileImageUrl: data.profile_image_url,
    phone: data.phone,
    nationality: data.nationality,
    gender: data.gender,
    address: data.address,
    addressDetail: data.address_detail,
    visaTypes: data.visa_types || [],
    koreanLevel: data.korean_level,
    resumeFileUrl: data.resume_file_url,
    resumeFileName: data.resume_file_name,
    resumeUploadedAt: data.resume_uploaded_at,

    // 관계 테이블 데이터
    skills: data.skills?.map((s: any) => s.skill_name) || [],
    languages: data.languages?.map((l: any) => ({
      name: l.language_name,
      proficiency: l.proficiency
    })) || [],
    experiences: data.experiences?.map((e: any) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      startDate: e.start_date,
      endDate: e.end_date,
      current: e.is_current,
      description: e.description
    })) || [],
    educations: data.educations?.map((e: any) => ({
      id: e.id,
      school: e.school,
      degree: e.degree,
      field: e.field,
      startYear: e.start_year,
      endYear: e.end_year,
      current: e.is_current
    })) || [],
    desiredPositions: data.desired_positions?.map((p: any) => p.position_name) || [],
    preferredLocations: data.preferred_locations?.map((l: any) => l.location_name) || [],
    salaryRange: data.salary_range ? {
      min: data.salary_range.min_salary,
      max: data.salary_range.max_salary
    } : null,

    // 선호 조건
    workType: data.work_type,
    companySize: data.company_size,
    visaSponsorship: data.visa_sponsorship,
    remoteWork: data.remote_work,
    introduction: data.introduction,

    // 메타 정보
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
```

---

### 작업 2.2: calculateProfileCompletion 함수

**파일**: `lib/supabase/jobseeker-service.ts`

```typescript
/**
 * 프로필 완성도 계산
 */
export const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

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

  let score = 0;

  // 기본 정보 (20%)
  if (profile.fullName && profile.email && profile.phone) {
    score += weights.basicInfo;
  }

  // 이력서 (15%)
  if (profile.resumeFileUrl) {
    score += weights.resume;
  }

  // 경력 (15%)
  if (profile.experiences && profile.experiences.length > 0) {
    score += weights.experience;
  }

  // 학력 (10%)
  if (profile.educations && profile.educations.length > 0) {
    score += weights.education;
  }

  // 기술 (15%)
  if (profile.skills && profile.skills.length > 0) {
    score += weights.skills;
  }

  // 언어 (10%)
  if (profile.languages && profile.languages.length > 0) {
    score += weights.languages;
  }

  // 선호 조건 (10%)
  if (
    profile.desiredPositions?.length > 0 &&
    profile.preferredLocations?.length > 0 &&
    profile.salaryRange?.min
  ) {
    score += weights.preferences;
  }

  // 자기소개 (5%)
  if (profile.introduction && profile.introduction.trim().length > 0) {
    score += weights.introduction;
  }

  return Math.min(score, 100);
};
```

---

### 작업 2.3: 프로필 업데이트 함수들

**파일**: `lib/supabase/jobseeker-service.ts`

```typescript
/**
 * 기본 프로필 정보 업데이트
 */
export const updateBasicProfile = async (
  userId: string,
  data: {
    fullName?: string;
    headline?: string;
    profileImageUrl?: string;
    phone?: string;
    nationality?: string;
    gender?: string;
    address?: string;
    addressDetail?: string;
  }
) => {
  const updateData: any = {};

  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.profileImageUrl !== undefined) updateData.profile_image_url = data.profileImageUrl;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.nationality !== undefined) updateData.nationality = data.nationality;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.addressDetail !== undefined) updateData.address_detail = data.addressDetail;

  updateData.updated_at = new Date().toISOString();

  const { data: result, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return result;
};

/**
 * 기술 업데이트
 */
export const updateSkills = async (userId: string, skills: string[]) => {
  // 기존 기술 삭제
  await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId);

  // 새로운 기술 삽입
  if (skills.length > 0) {
    const skillData = skills.map((skill) => ({
      user_id: userId,
      skill_name: skill,
    }));

    const { error } = await supabase
      .from('user_skills')
      .insert(skillData);

    if (error) throw error;
  }
};

/**
 * 언어 업데이트
 */
export const updateLanguages = async (
  userId: string,
  languages: Array<{ name: string; proficiency: string }>
) => {
  // 기존 언어 삭제
  await supabase
    .from('user_languages')
    .delete()
    .eq('user_id', userId);

  // 새로운 언어 삽입
  if (languages.length > 0) {
    const langData = languages.map((lang) => ({
      user_id: userId,
      language_name: lang.name,
      proficiency: lang.proficiency,
    }));

    const { error } = await supabase
      .from('user_languages')
      .insert(langData);

    if (error) throw error;
  }
};

/**
 * 경력 추가
 */
export const addExperience = async (
  userId: string,
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }
) => {
  const { data, error } = await supabase
    .from('user_experiences')
    .insert({
      user_id: userId,
      company: experience.company,
      position: experience.position,
      start_date: experience.startDate,
      end_date: experience.endDate,
      is_current: experience.isCurrent,
      description: experience.description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 경력 업데이트
 */
export const updateExperience = async (
  experienceId: string,
  experience: {
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }
) => {
  const updateData: any = {};

  if (experience.company !== undefined) updateData.company = experience.company;
  if (experience.position !== undefined) updateData.position = experience.position;
  if (experience.startDate !== undefined) updateData.start_date = experience.startDate;
  if (experience.endDate !== undefined) updateData.end_date = experience.endDate;
  if (experience.isCurrent !== undefined) updateData.is_current = experience.isCurrent;
  if (experience.description !== undefined) updateData.description = experience.description;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_experiences')
    .update(updateData)
    .eq('id', experienceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 경력 삭제
 */
export const deleteExperience = async (experienceId: string) => {
  const { error } = await supabase
    .from('user_experiences')
    .delete()
    .eq('id', experienceId);

  if (error) throw error;
};

/**
 * 학력 추가
 */
export const addEducation = async (
  userId: string,
  education: {
    school: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
    isCurrent: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('user_educations')
    .insert({
      user_id: userId,
      school: education.school,
      degree: education.degree,
      field: education.field,
      start_year: education.startYear,
      end_year: education.endYear,
      is_current: education.isCurrent,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 학력 업데이트
 */
export const updateEducation = async (
  educationId: string,
  education: {
    school?: string;
    degree?: string;
    field?: string;
    startYear?: number;
    endYear?: number;
    isCurrent?: boolean;
  }
) => {
  const updateData: any = {};

  if (education.school !== undefined) updateData.school = education.school;
  if (education.degree !== undefined) updateData.degree = education.degree;
  if (education.field !== undefined) updateData.field = education.field;
  if (education.startYear !== undefined) updateData.start_year = education.startYear;
  if (education.endYear !== undefined) updateData.end_year = education.endYear;
  if (education.isCurrent !== undefined) updateData.is_current = education.isCurrent;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_educations')
    .update(updateData)
    .eq('id', educationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 학력 삭제
 */
export const deleteEducation = async (educationId: string) => {
  const { error } = await supabase
    .from('user_educations')
    .delete()
    .eq('id', educationId);

  if (error) throw error;
};

/**
 * 선호 조건 업데이트
 */
export const updatePreferences = async (
  userId: string,
  preferences: {
    desiredPositions?: string[];
    preferredLocations?: string[];
    salaryRange?: { min: number; max: number };
    workType?: string;
    companySize?: string;
    visaSponsorship?: boolean;
    remoteWork?: string;
  }
) => {
  // 1. users 테이블 업데이트
  const updateData: any = {};

  if (preferences.workType !== undefined) updateData.work_type = preferences.workType;
  if (preferences.companySize !== undefined) updateData.company_size = preferences.companySize;
  if (preferences.visaSponsorship !== undefined) updateData.visa_sponsorship = preferences.visaSponsorship;
  if (preferences.remoteWork !== undefined) updateData.remote_work = preferences.remoteWork;

  updateData.updated_at = new Date().toISOString();

  if (Object.keys(updateData).length > 1) {
    await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
  }

  // 2. 희망 직무 업데이트
  if (preferences.desiredPositions !== undefined) {
    await supabase
      .from('user_desired_positions')
      .delete()
      .eq('user_id', userId);

    if (preferences.desiredPositions.length > 0) {
      const posData = preferences.desiredPositions.map((pos) => ({
        user_id: userId,
        position_name: pos,
      }));

      await supabase
        .from('user_desired_positions')
        .insert(posData);
    }
  }

  // 3. 희망 근무지 업데이트
  if (preferences.preferredLocations !== undefined) {
    await supabase
      .from('user_preferred_locations')
      .delete()
      .eq('user_id', userId);

    if (preferences.preferredLocations.length > 0) {
      const locData = preferences.preferredLocations.map((loc) => ({
        user_id: userId,
        location_name: loc,
      }));

      await supabase
        .from('user_preferred_locations')
        .insert(locData);
    }
  }

  // 4. 희망 연봉 업데이트
  if (preferences.salaryRange !== undefined) {
    // 기존 연봉 정보 확인
    const { data: existingSalary } = await supabase
      .from('user_salary_range')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSalary) {
      // 업데이트
      await supabase
        .from('user_salary_range')
        .update({
          min_salary: preferences.salaryRange.min,
          max_salary: preferences.salaryRange.max,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // 삽입
      await supabase
        .from('user_salary_range')
        .insert({
          user_id: userId,
          min_salary: preferences.salaryRange.min,
          max_salary: preferences.salaryRange.max,
        });
    }
  }
};

/**
 * 자기소개 업데이트
 */
export const updateIntroduction = async (userId: string, introduction: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      introduction,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 이력서 업로드 정보 업데이트
 */
export const updateResumeInfo = async (
  userId: string,
  resumeUrl: string,
  fileName: string
) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      resume_file_url: resumeUrl,
      resume_file_name: fileName,
      resume_uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

---

## Phase 3: 대시보드 마이그레이션 🔴

### 목표
대시보드 페이지의 Firebase 함수를 Supabase로 전환

### 작업 3.1: Import 변경

**파일**: `app/jobseeker-dashboard/page.tsx`

**변경 전**:
```typescript
import { getJobseekerProfile, calculateProfileCompletion, JobseekerProfile } from '@/lib/firebase/jobseeker-service';
```

**변경 후**:
```typescript
import { getUserProfile, calculateProfileCompletion } from '@/lib/supabase/jobseeker-service';
```

---

### 작업 3.2: 프로필 조회 로직 변경

**파일**: `app/jobseeker-dashboard/page.tsx` (54~93줄)

**변경 전**:
```typescript
useEffect(() => {
  const fetchProfile = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const profile = await getJobseekerProfile(user.uid);  // ❌ Firebase
      // ...
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [user, router]);
```

**변경 후**:
```typescript
useEffect(() => {
  const fetchProfile = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const profile = await getUserProfile(user.id);  // ✅ Supabase (user.uid → user.id)
      console.log('📊 Loaded Profile Data:', profile);
      console.log('📍 Preferred Locations:', profile?.preferredLocations);
      console.log('💰 Salary Range:', profile?.salaryRange);
      console.log('🎯 Desired Positions:', profile?.desiredPositions);
      console.log('💻 Skills:', profile?.skills);

      if (!profile) {
        // 프로필이 없으면 온보딩으로 리다이렉트
        router.push('/onboarding/job-seeker/quick');
        return;
      }
      setProfileData(profile);

      // 프로필 기반 추천 채용공고 계산
      const recommended = getRecommendedJobs(profile, jobs, 3);
      console.log('✨ Recommended Jobs:', recommended.map(j => ({
        title: j.title,
        company: j.company.name,
        tags: j.tags,
        location: j.location
      })));
      setRecommendedJobs(recommended);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // 에러 시 온보딩으로 리다이렉트
      router.push('/onboarding/job-seeker/quick');
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [user, router]);
```

---

### 작업 3.3: 타입 정의 제거

**파일**: `app/jobseeker-dashboard/page.tsx` (6줄)

**변경 전**:
```typescript
import { getJobseekerProfile, calculateProfileCompletion, JobseekerProfile } from '@/lib/firebase/jobseeker-service';
```

**변경 후**:
```typescript
import { getUserProfile, calculateProfileCompletion } from '@/lib/supabase/jobseeker-service';

// JobseekerProfile 타입은 제거하고 any 사용 (또는 별도 타입 파일 생성)
```

---

## Phase 4: 프로필 편집 페이지 마이그레이션 🟠

### 목표
프로필 편집 페이지들을 Supabase 함수로 전환

### 작업 대상 파일
```
✅ app/profile/edit/page.tsx (메인)
✅ app/profile/edit/resume/page.tsx
✅ app/profile/edit/experience/page.tsx
✅ app/profile/edit/skills/page.tsx
✅ app/profile/edit/preferences/page.tsx
✅ app/profile/edit/introduction/page.tsx
```

### 작업 순서
1. 각 파일의 Firebase import 확인
2. Supabase 함수로 교체
3. user.uid → user.id 변경
4. 에러 처리 추가

---

## Phase 5: 검증 및 테스트 ✅

### 테스트 시나리오

#### 시나리오 1: 신규 회원가입 플로우
```
1. /signup/jobseeker 접속
2. 이메일/비밀번호 입력 후 회원가입
3. /onboarding/job-seeker/quick 자동 이동
4. 온보딩 정보 입력 (국적, 이름, 연락처, 주소, 성별, 비자, 언어)
5. "회원가입 완료" 클릭
6. /jobseeker-dashboard 자동 이동
7. 프로필 완성도 확인 (20~30% 예상)
8. Supabase Dashboard에서 데이터 확인
   - users 테이블: 기본 정보 저장 확인
   - user_languages 테이블: otherLanguages 저장 확인 ✅
```

#### 시나리오 2: 프로필 편집 플로우
```
1. /jobseeker-dashboard 접속
2. "프로필 편집" 클릭 → /profile/edit
3. 각 섹션 편집
   - 이력서 업로드
   - 경력 추가
   - 학력 추가
   - 기술 추가
   - 선호 조건 추가
   - 자기소개 작성
4. 각 섹션 저장 후 Supabase 확인
5. 대시보드로 돌아가서 프로필 완성도 확인 (100% 예상)
```

#### 시나리오 3: 로그인 플로우
```
1. 로그아웃
2. /login/jobseeker 접속
3. 이메일/비밀번호 로그인
4. /jobseeker-dashboard 자동 이동
5. 프로필 정보 정상 표시 확인
```

---

## 체크리스트

### Phase 1: 긴급 버그 수정
- [ ] completeOnboarding 함수 수정 (user_languages 저장)
- [ ] JobseekerOnboardingData 타입 수정
- [ ] 온보딩 페이지에서 otherLanguages 전달
- [ ] 테스트: 온보딩 완료 후 user_languages 테이블 확인

### Phase 2: Supabase 프로필 함수 구현
- [ ] getUserProfile 함수 구현
- [ ] calculateProfileCompletion 함수 구현
- [ ] updateBasicProfile 함수 구현
- [ ] updateSkills 함수 구현
- [ ] updateLanguages 함수 구현
- [ ] addExperience, updateExperience, deleteExperience 함수 구현
- [ ] addEducation, updateEducation, deleteEducation 함수 구현
- [ ] updatePreferences 함수 구현
- [ ] updateIntroduction 함수 구현
- [ ] updateResumeInfo 함수 구현

### Phase 3: 대시보드 마이그레이션
- [ ] Import 변경 (Firebase → Supabase)
- [ ] getUserProfile 호출로 변경
- [ ] user.uid → user.id 변경
- [ ] 에러 처리 추가
- [ ] 테스트: 대시보드 정상 표시 확인

### Phase 4: 프로필 편집 페이지 마이그레이션
- [ ] /profile/edit/page.tsx 마이그레이션
- [ ] /profile/edit/resume/page.tsx 마이그레이션
- [ ] /profile/edit/experience/page.tsx 마이그레이션
- [ ] /profile/edit/skills/page.tsx 마이그레이션
- [ ] /profile/edit/preferences/page.tsx 마이그레이션
- [ ] /profile/edit/introduction/page.tsx 마이그레이션
- [ ] 테스트: 각 페이지 정상 동작 확인

### Phase 5: 검증 및 테스트
- [ ] 시나리오 1 테스트 (신규 회원가입)
- [ ] 시나리오 2 테스트 (프로필 편집)
- [ ] 시나리오 3 테스트 (로그인)
- [ ] Supabase Dashboard에서 데이터 확인
- [ ] 에러 로그 확인
- [ ] 성능 테스트

---

**작성일**: 2025-10-15
**작성자**: Claude Code
**예상 소요 시간**: 90분
**우선순위**: 🔴 최우선
