// Supabase 개인 회원 서비스
import { supabase } from './config';

// =====================================================
// 타입 정의
// =====================================================

export interface JobseekerSignupData {
  email: string;
  password: string;
  fullName?: string;
}

export interface JobseekerOnboardingData {
  fullName: string;
  phone: string;                // 휴대폰 번호 (한국인만)
  headline?: string;
  resumeFileUrl?: string;
  resumeFileName?: string;
  // K-Work 확장 필드
  phone_verified?: boolean;
  foreigner_number?: string;    // 외국인등록번호 (외국인만)
  foreigner_number_verified?: boolean;
  address?: string;
  address_detail?: string;
  nationality?: string;
  birth_year?: number;
  gender?: string;
  visa_types?: string[];
  korean_level?: string;
  otherLanguages?: Array<{      // 한국어 외 언어 능력
    language: string;
    proficiency: string;
  }>;
  agree_email_receive?: boolean;
  agree_privacy_collection?: boolean;
}

// =====================================================
// 회원가입
// =====================================================

/**
 * 개인 회원가입 (이메일/비밀번호)
 * 1. Supabase Auth로 계정 생성
 * 2. users 테이블에 기본 정보 저장
 */
export const signUpJobseeker = async (data: JobseekerSignupData) => {
  // 1. Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        user_type: 'jobseeker',
        full_name: data.fullName || ''
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('회원가입 실패');

  const userId = authData.user.id;

  // 2. users 테이블에 기본 정보 저장
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: data.email,
      user_type: 'jobseeker',
      full_name: data.fullName || '',
      phone: '',
      foreigner_number: '',
      address: '',
      address_detail: '',
      nationality: '',
      gender: '',
      korean_level: '',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (userError) {
    console.error('User insert failed, auth user created:', userId);
    throw userError;
  }

  return {
    user: authData.user,
    profile: userData
  };
};

/**
 * 구글 로그인 후 프로필 초기화
 */
export const initializeGoogleUser = async (userId: string, email: string, displayName?: string) => {
  // users 테이블에 레코드가 있는지 확인
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  // 이미 존재하면 리턴
  if (existing) {
    return existing;
  }

  // 없으면 생성
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      user_type: 'jobseeker',
      full_name: displayName || '',
      phone: '',
      foreigner_number: '',
      address: '',
      address_detail: '',
      nationality: '',
      gender: '',
      korean_level: '',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

// =====================================================
// 로그인
// =====================================================

/**
 * 이메일/비밀번호 로그인
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
};

/**
 * 구글 로그인 (OAuth)
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?type=jobseeker`
    }
  });

  if (error) throw error;

  return data;
};

// =====================================================
// 온보딩
// =====================================================

/**
 * 온보딩 데이터 저장
 */
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  // 1. 먼저 users 테이블에 레코드가 있는지 확인
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', userId)
    .maybeSingle();

  const updateData: any = {
    full_name: data.fullName,
    phone: data.phone,
    headline: data.headline,
    resume_file_url: data.resumeFileUrl,
    resume_file_name: data.resumeFileName,
    resume_uploaded_at: data.resumeFileUrl ? new Date().toISOString() : null,
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };

  // K-Work 확장 필드 추가 (NOT NULL 제약이 있는 필드는 기본값 설정)
  updateData.phone_verified = data.phone_verified ?? false;
  updateData.foreigner_number = data.foreigner_number || ''; // 빈 문자열 기본값
  updateData.foreigner_number_verified = data.foreigner_number_verified ?? false;
  updateData.address = data.address || '';
  updateData.address_detail = data.address_detail || '';
  updateData.nationality = data.nationality || '';
  updateData.birth_year = data.birth_year || null;
  updateData.gender = data.gender || '';
  updateData.visa_types = data.visa_types || [];
  updateData.korean_level = data.korean_level || '';
  updateData.agree_email_receive = data.agree_email_receive ?? false;
  updateData.agree_privacy_collection = data.agree_privacy_collection ?? false;

  let userData;

  if (existingUser) {
    // 레코드가 있으면 업데이트
    const { data, error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;
    userData = data;
  } else {
    // 레코드가 없으면 생성 (Google OAuth 등의 경우)
    const { data: authUser } = await supabase.auth.getUser();

    const insertData = {
      id: userId,
      email: authUser.user?.email || '',
      user_type: 'jobseeker',
      ...updateData,
      created_at: new Date().toISOString()
    };

    const { data, error: insertError } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (insertError) throw insertError;
    userData = data;
  }

  // 2. user_languages 테이블에 언어 저장 (otherLanguages 버그 수정)
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
      console.error('[completeOnboarding] 언어 저장 실패:', langError);
      // 언어 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  return userData;
};

/**
 * 이력서 파일 업로드 (Cloudinary)
 */
export const uploadResume = async (file: File, userId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/resumes/${userId}`);
  formData.append('type', 'resume');

  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '이력서 업로드 실패');
  }

  const data = await response.json();
  return data.url;
};

// =====================================================
// 프로필 조회 및 업데이트
// =====================================================

/**
 * 사용자 프로필 조회
 */
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

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getUserProfile(user.id);
};

/**
 * 프로필 업데이트 (기본 정보)
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<{
    fullName: string;
    headline: string;
    phone: string;
    profileImageUrl: string;
    workType: string;
    companySize: string;
    visaSponsorship: boolean;
    remoteWork: string;
    introduction: string;
  }>
) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: updates.fullName,
      headline: updates.headline,
      phone: updates.phone,
      profile_image_url: updates.profileImageUrl,
      work_type: updates.workType,
      company_size: updates.companySize,
      visa_sponsorship: updates.visaSponsorship,
      remote_work: updates.remoteWork,
      introduction: updates.introduction,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * 스킬 업데이트
 */
export const updateSkills = async (userId: string, skills: string[]) => {
  // 기존 스킬 삭제
  await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId);

  // 새로 추가
  if (skills.length > 0) {
    const skillsToInsert = skills.map(skill => ({
      user_id: userId,
      skill_name: skill
    }));

    const { error } = await supabase
      .from('user_skills')
      .insert(skillsToInsert);

    if (error) throw error;
  }
};

/**
 * 언어 업데이트
 */
export const updateLanguages = async (
  userId: string,
  languages: Array<{ language_name: string; proficiency: string }>
) => {
  // 기존 언어 삭제
  await supabase
    .from('user_languages')
    .delete()
    .eq('user_id', userId);

  // 새로 추가
  if (languages.length > 0) {
    const languagesToInsert = languages.map(lang => ({
      user_id: userId,
      language_name: lang.language_name,
      proficiency: lang.proficiency
    }));

    const { error } = await supabase
      .from('user_languages')
      .insert(languagesToInsert);

    if (error) throw error;
  }
};

/**
 * 경력 추가
 */
export const addExperience = async (userId: string, experience: {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}) => {
  const { data, error } = await supabase
    .from('user_experiences')
    .insert({
      user_id: userId,
      ...experience,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * 학력 추가
 */
export const addEducation = async (userId: string, education: {
  school: string;
  degree: string;
  field: string;
  start_year: number;
  end_year?: number;
  is_current: boolean;
}) => {
  const { data, error } = await supabase
    .from('user_educations')
    .insert({
      user_id: userId,
      ...education,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * 경력 수정
 */
export const updateExperience = async (experienceId: string, updates: {
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}) => {
  const { data, error } = await supabase
    .from('user_experiences')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
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
 * 학력 수정
 */
export const updateEducation = async (educationId: string, updates: {
  school?: string;
  degree?: string;
  field?: string;
  start_year?: number;
  end_year?: number;
  is_current?: boolean;
}) => {
  const { data, error } = await supabase
    .from('user_educations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
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
 * 희망 포지션 업데이트
 */
export const updateDesiredPositions = async (userId: string, positions: string[]) => {
  // 기존 포지션 삭제
  await supabase
    .from('user_desired_positions')
    .delete()
    .eq('user_id', userId);

  // 새로 추가
  if (positions.length > 0) {
    const positionsToInsert = positions.map(position => ({
      user_id: userId,
      position_name: position
    }));

    const { error } = await supabase
      .from('user_desired_positions')
      .insert(positionsToInsert);

    if (error) throw error;
  }
};

/**
 * 선호 지역 업데이트
 */
export const updatePreferredLocations = async (userId: string, locations: string[]) => {
  // 기존 지역 삭제
  await supabase
    .from('user_preferred_locations')
    .delete()
    .eq('user_id', userId);

  // 새로 추가
  if (locations.length > 0) {
    const locationsToInsert = locations.map(location => ({
      user_id: userId,
      location_name: location
    }));

    const { error } = await supabase
      .from('user_preferred_locations')
      .insert(locationsToInsert);

    if (error) throw error;
  }
};

/**
 * 희망 연봉 업데이트
 */
export const updateSalaryRange = async (userId: string, salaryRange: {
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  negotiable?: boolean;
}) => {
  // 기존 연봉 정보 확인
  const { data: existing } = await supabase
    .from('user_salary_range')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('user_salary_range')
      .update({
        ...salaryRange,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // 신규 생성
    const { data, error } = await supabase
      .from('user_salary_range')
      .insert({
        user_id: userId,
        ...salaryRange,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * 프로필 완성도 계산
 */
export const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  // 각 항목별 가중치 (총 100점)
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

  let score = 0;

  // 1. 기본 정보 (20점)
  if (profile.full_name && profile.email && profile.phone) {
    score += weights.basicInfo;
  } else if (profile.full_name && profile.email) {
    score += weights.basicInfo * 0.6;
  }

  // 2. 이력서 (15점)
  if (profile.resume_file_url) {
    score += weights.resume;
  }

  // 3. 경력 (15점)
  if (profile.experiences && profile.experiences.length > 0) {
    score += weights.experience;
  }

  // 4. 학력 (10점)
  if (profile.educations && profile.educations.length > 0) {
    score += weights.education;
  }

  // 5. 기술 (15점)
  if (profile.skills && profile.skills.length > 0) {
    score += weights.skills;
  }

  // 6. 언어 (10점)
  if (profile.languages && profile.languages.length > 0) {
    score += weights.languages;
  }

  // 7. 선호 조건 (10점)
  let preferencesScore = 0;
  if (profile.desired_positions && profile.desired_positions.length > 0) {
    preferencesScore += weights.preferences * 0.4;
  }
  if (profile.preferred_locations && profile.preferred_locations.length > 0) {
    preferencesScore += weights.preferences * 0.3;
  }
  if (profile.salary_range) {
    preferencesScore += weights.preferences * 0.3;
  }
  score += preferencesScore;

  // 8. 자기소개 (5점)
  if (profile.introduction && profile.introduction.length > 50) {
    score += weights.introduction;
  } else if (profile.introduction) {
    score += weights.introduction * 0.5;
  }

  return Math.min(Math.round(score), 100);
};

/**
 * 프로필 완성도와 함께 프로필 조회
 */
export const getUserProfileWithCompletion = async (userId: string) => {
  const profile = await getUserProfile(userId);
  const completionRate = calculateProfileCompletion(profile);

  return {
    ...profile,
    profileCompletion: completionRate
  };
};

// =====================================================
// 로그아웃
// =====================================================

/**
 * 로그아웃
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// =====================================================
// 이메일 중복 확인
// =====================================================

/**
 * 이메일 중복 확인
 */
export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Email check error:', error);
    return false;
  }

  return data !== null;
};