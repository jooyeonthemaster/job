// Supabase 개인 회원 프로필 관련 서비스
import { supabase } from './config';
import type {
  ProfileUpdateData,
  ExperienceData,
  EducationData,
  LanguageData,
  SalaryRangeData
} from './jobseeker-types';

// =====================================================
// 프로필 조회
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

// =====================================================
// 프로필 업데이트 (기본 정보)
// =====================================================

/**
 * 프로필 업데이트 (기본 정보)
 */
export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdateData
) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: updates.fullName,
      desired_job_category: updates.desiredJobCategory,  // ✅ 희망 직군 추가
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

// =====================================================
// 스킬 관리
// =====================================================

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

// =====================================================
// 언어 관리
// =====================================================

/**
 * 언어 업데이트
 */
export const updateLanguages = async (
  userId: string,
  languages: LanguageData[]
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

// =====================================================
// 경력 관리
// =====================================================

/**
 * 경력 추가
 */
export const addExperience = async (userId: string, experience: ExperienceData) => {
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
 * 경력 수정
 */
export const updateExperience = async (
  experienceId: string,
  updates: Partial<ExperienceData>
) => {
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

// =====================================================
// 학력 관리
// =====================================================

/**
 * 학력 추가
 */
export const addEducation = async (userId: string, education: EducationData) => {
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
 * 학력 수정
 */
export const updateEducation = async (
  educationId: string,
  updates: Partial<EducationData>
) => {
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

// =====================================================
// 희망 조건 관리
// =====================================================

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
export const updateSalaryRange = async (
  userId: string,
  salaryRange: SalaryRangeData
) => {
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
