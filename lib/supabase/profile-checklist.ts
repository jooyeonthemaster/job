// 프로필 완성도 체크리스트 페이지용 통합 저장 함수
import { supabase } from './config';
import {
  updateUserProfile,
  updateSkills,
  updateLanguages,
  updateDesiredPositions,
  updatePreferredLocations,
  updateSalaryRange,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation
} from './jobseeker-profile';

// =====================================================
// 경력 & 학력 통합 저장
// =====================================================

interface ExperienceItem {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EducationItem {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  current: boolean;
}

/**
 * 경력 및 학력 통합 저장
 * Step2_Experience 컴포넌트에서 사용
 */
export const saveExperienceAndEducation = async (
  userId: string,
  data: {
    experiences?: ExperienceItem[];
    educations?: EducationItem[];
  }
) => {
  try {
    // 1. 기존 데이터 조회
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select(`
        experiences:user_experiences(id),
        educations:user_educations(id)
      `)
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // 2. 경력 저장
    if (data.experiences) {
      const existingExpIds = (existingData.experiences || []).map((e: any) => e.id);
      const newExpIds = data.experiences.filter(e => e.id).map(e => e.id);

      // 삭제된 경력 처리
      const toDeleteExp = existingExpIds.filter((id: string) => !newExpIds.includes(id));
      for (const id of toDeleteExp) {
        await deleteExperience(id);
      }

      // 추가 또는 수정
      for (const exp of data.experiences) {
        const expData = {
          company: exp.company,
          position: exp.position,
          start_date: exp.startDate,
          end_date: exp.endDate,
          is_current: exp.current,
          description: exp.description
        };

        if (exp.id && existingExpIds.includes(exp.id)) {
          // 수정
          await updateExperience(exp.id, expData);
        } else {
          // 추가
          await addExperience(userId, expData);
        }
      }
    }

    // 3. 학력 저장
    if (data.educations) {
      const existingEduIds = (existingData.educations || []).map((e: any) => e.id);
      const newEduIds = data.educations.filter(e => e.id).map(e => e.id);

      // 삭제된 학력 처리
      const toDeleteEdu = existingEduIds.filter((id: string) => !newEduIds.includes(id));
      for (const id of toDeleteEdu) {
        await deleteEducation(id);
      }

      // 추가 또는 수정
      for (const edu of data.educations) {
        const eduData = {
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          start_year: parseInt(edu.startYear),
          end_year: edu.endYear ? parseInt(edu.endYear) : undefined,
          is_current: edu.current
        };

        if (edu.id && existingEduIds.includes(edu.id)) {
          // 수정
          await updateEducation(edu.id, eduData);
        } else {
          // 추가
          await addEducation(userId, eduData);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Save experience and education error:', error);
    throw error;
  }
};

// =====================================================
// 스킬 & 언어 통합 저장
// =====================================================

/**
 * 스킬 및 언어 통합 저장
 * Step3_Skills 컴포넌트에서 사용
 */
export const saveSkillsAndLanguages = async (
  userId: string,
  data: {
    skills?: string[];
    korean_level?: string;
    otherLanguages?: Array<{ language: string; proficiency: string }>;
  }
) => {
  try {
    // 1. 스킬 저장
    if (data.skills !== undefined) {
      await updateSkills(userId, data.skills);
    }

    // 2. 한국어 능력 저장 (users 테이블)
    if (data.korean_level !== undefined) {
      await updateUserProfile(userId, { korean_level: data.korean_level });
    }

    // 3. 한국어 외 언어 저장 (user_languages 테이블)
    if (data.otherLanguages !== undefined) {
      const languageData = data.otherLanguages.map(lang => ({
        language_name: lang.language,
        proficiency: lang.proficiency.toUpperCase()
      }));
      await updateLanguages(userId, languageData);
    }

    return { success: true };
  } catch (error) {
    console.error('Save skills and languages error:', error);
    throw error;
  }
};

// =====================================================
// 선호 조건 통합 저장
// =====================================================

/**
 * 선호 조건 통합 저장
 * Step4_Preferences 컴포넌트에서 사용
 */
export const savePreferences = async (
  userId: string,
  data: {
    desiredJobCategory?: string;
    desiredPositions?: string[];
    preferredLocations?: string[];
    salaryRange?: { min: string; max: string };
    workType?: string;
    companySize?: string;
    visaSponsorship?: boolean;
    remoteWork?: string;
  }
) => {
  try {
    // 1. users 테이블 업데이트 (기본 정보)
    await updateUserProfile(userId, {
      desiredJobCategory: data.desiredJobCategory,
      workType: data.workType,
      companySize: data.companySize,
      visaSponsorship: data.visaSponsorship,
      remoteWork: data.remoteWork
    });

    // 2. 희망 직무 저장
    if (data.desiredPositions) {
      await updateDesiredPositions(userId, data.desiredPositions);
    }

    // 3. 희망 지역 저장
    if (data.preferredLocations) {
      await updatePreferredLocations(userId, data.preferredLocations);
    }

    // 4. 희망 연봉 저장
    if (data.salaryRange) {
      await updateSalaryRange(userId, {
        min_salary: parseInt(data.salaryRange.min),
        max_salary: data.salaryRange.max ? parseInt(data.salaryRange.max) : undefined
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Save preferences error:', error);
    throw error;
  }
};

// =====================================================
// 이력서 저장
// =====================================================

/**
 * 이력서 파일 정보 저장
 */
export const saveResume = async (
  userId: string,
  data: {
    resumeFileUrl: string;
    resumeFileName: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        resume_file_url: data.resumeFileUrl,
        resume_file_name: data.resumeFileName,
        resume_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Save resume error:', error);
    throw error;
  }
};

// =====================================================
// 기본 정보 저장
// =====================================================

/**
 * 기본 정보 저장 (이름, 한 줄 소개, 프로필 사진)
 */
export const saveBasicInfo = async (
  userId: string,
  data: {
    fullName?: string;
    headline?: string;
    profileImageUrl?: string;
  }
) => {
  try {
    await updateUserProfile(userId, data);
    return { success: true };
  } catch (error) {
    console.error('Save basic info error:', error);
    throw error;
  }
};

// =====================================================
// 자기소개 저장
// =====================================================

/**
 * 자기소개 저장
 */
export const saveIntroduction = async (
  userId: string,
  introduction: string
) => {
  try {
    await updateUserProfile(userId, { introduction });
    return { success: true };
  } catch (error) {
    console.error('Save introduction error:', error);
    throw error;
  }
};
