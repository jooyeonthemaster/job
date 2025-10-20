// 인재풀 관련 Supabase 서비스
import { supabase } from './config';

export interface TalentProfile {
  id: string;
  name: string;
  title: string;
  nationality: string;
  location: string;
  experience: number;
  skills: string[];
  rating?: number;
  availability: string;
  expectedSalary?: {
    min: number;
    max: number;
  };
  languages?: Array<{
    language: string;
    level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
  }>;
  profileImage?: string;
  aboutMe?: string;
  workExperience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear?: string;
    current: boolean;
    gpa?: string;
  }>;
  desiredPositions?: string[];
  preferredLocations?: string[];
}

/**
 * 모든 인재 조회 (공개 설정된 사용자만)
 */
export const getAllTalents = async (): Promise<TalentProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        headline,
        nationality,
        profile_image_url,
        skills:user_skills(skill_name),
        languages:user_languages(language_name, proficiency),
        experiences:user_experiences(*),
        desired_positions:user_desired_positions(position_name),
        preferred_locations:user_preferred_locations(location_name),
        salary_range:user_salary_range(*)
      `)
      .eq('user_type', 'jobseeker')
      .eq('onboarding_completed', true);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No talents found in database');
      return [];
    }

    // 데이터 변환
    const converted: TalentProfile[] = data.map((user: any) => {
      // 스킬 추출
      const skills = (user.skills || []).map((s: any) => s.skill_name);

      // 언어 추출
      const languages = (user.languages || []).map((l: any) => ({
        language: l.language_name,
        level: (l.proficiency || 'INTERMEDIATE') as 'Basic' | 'Intermediate' | 'Fluent' | 'Native'
      }));

      // 경력 연수 계산
      const experience = (user.experiences || []).length;

      // 희망 직무 (첫 번째 것 사용)
      const desiredPosition = user.desired_positions?.[0]?.position_name || '';

      // 희망 지역 (첫 번째 것 사용)
      const preferredLocation = user.preferred_locations?.[0]?.location_name || 'Not specified';

      // 희망 연봉
      const salaryRange = user.salary_range?.[0];
      const expectedSalary = salaryRange ? {
        min: salaryRange.min_salary || 0,
        max: salaryRange.max_salary || 0
      } : undefined;

      return {
        id: user.id,
        name: user.full_name || 'Unknown',
        title: user.headline || desiredPosition || 'Job Seeker',
        nationality: user.nationality || 'Not specified',
        location: preferredLocation,
        experience,
        skills,
        rating: undefined,
        availability: 'Available', // TODO: availability 필드 추가 시 사용
        expectedSalary,
        languages,
        profileImage: user.profile_image_url
      };
    });

    console.log(`✅ Loaded ${converted.length} talents from Supabase`);
    return converted;
  } catch (error) {
    console.error('Failed to load talents:', error);
    return [];
  }
};

/**
 * 특정 인재 상세 조회
 */
export const getTalentById = async (id: string): Promise<TalentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        headline,
        nationality,
        profile_image_url,
        introduction,
        resume_file_url,
        skills:user_skills(skill_name),
        languages:user_languages(language_name, proficiency),
        experiences:user_experiences(*),
        educations:user_educations(*),
        desired_positions:user_desired_positions(position_name),
        preferred_locations:user_preferred_locations(location_name),
        salary_range:user_salary_range(*)
      `)
      .eq('id', id)
      .eq('user_type', 'jobseeker')
      .single();

    if (error) throw error;
    if (!data) return null;

    // 데이터 변환
    const skills = (data.skills || []).map((s: any) => s.skill_name);
    const languages = (data.languages || []).map((l: any) => ({
      language: l.language_name,
      level: (l.proficiency || 'INTERMEDIATE') as 'Basic' | 'Intermediate' | 'Fluent' | 'Native'
    }));

    // 경력 정보
    const workExperience = (data.experiences || []).map((exp: any) => ({
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date || undefined,
      current: exp.is_current || false,
      description: exp.description || undefined
    }));
    const experience = workExperience.length;

    // 학력 정보
    const education = (data.educations || []).map((edu: any) => ({
      institution: edu.school || '',
      degree: edu.degree || '',
      field: edu.field_of_study || '',
      startYear: edu.start_year || '',
      endYear: edu.end_year || undefined,
      current: edu.is_current || false,
      gpa: edu.gpa || undefined
    }));

    // 희망 직무 (전체 배열)
    const desiredPositions = (data.desired_positions || []).map((p: any) => p.position_name);
    const desiredPosition = desiredPositions[0] || '';

    // 희망 지역 (전체 배열)
    const preferredLocations = (data.preferred_locations || []).map((l: any) => l.location_name);
    const preferredLocation = preferredLocations[0] || 'Not specified';

    const salaryRange = data.salary_range?.[0];
    const expectedSalary = salaryRange ? {
      min: salaryRange.min_salary || 0,
      max: salaryRange.max_salary || 0
    } : undefined;

    return {
      id: data.id,
      name: data.full_name || 'Unknown',
      title: data.headline || desiredPosition || 'Job Seeker',
      nationality: data.nationality || 'Not specified',
      location: preferredLocation,
      experience,
      skills,
      rating: undefined,
      availability: 'Available',
      expectedSalary,
      languages,
      profileImage: data.profile_image_url,
      aboutMe: data.introduction || undefined,
      workExperience,
      education,
      desiredPositions,
      preferredLocations
    };
  } catch (error) {
    console.error('Failed to load talent:', error);
    return null;
  }
};
