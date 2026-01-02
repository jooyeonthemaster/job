// 인재풀 관련 Supabase 서비스
import { supabase } from './config';

/**
 * 인재 프로필 타입 (결제한 기업에게 모든 정보 노출)
 *
 * DB 필드 매핑:
 * - users 테이블: 기본 정보, 개인정보, 비자정보, 선호조건
 * - user_skills: 기술 스택
 * - user_languages: 언어 능력
 * - user_experiences: 경력
 * - user_educations: 학력
 * - user_desired_positions: 희망 직무
 * - user_preferred_locations: 희망 지역
 * - user_salary_range: 희망 연봉
 */
export interface TalentProfile {
  // ===== 기본 정보 (Basic Information) =====
  id: string;                        // users.id
  talentNumber?: string;             // users.talent_number (인재 고유번호: YYMM-01-NNN)
  name: string;                      // users.full_name
  email?: string;                    // users.email (결제 시 노출)
  title: string;                     // users.headline
  nationality: string;               // users.nationality
  location: string;                  // user_preferred_locations[0] (현재 위치)
  profileImage?: string;             // users.profile_image_url
  aboutMe?: string;                  // users.introduction

  // ===== 연락처 정보 (Contact Information) ⭐ 결제 시 필수 노출 =====
  phoneCountryCode?: string;         // users.phone_country_code (예: +82)
  phone?: string;                    // users.phone (예: 10-1234-5678)

  // ===== 개인정보 (Personal Information) ⭐ 결제 시 노출 =====
  birthYear?: number;                // users.birth_year (나이 계산용)
  gender?: string;                   // users.gender
  address?: string;                  // users.address (시/도/구)
  addressDetail?: string;            // users.address_detail (상세 주소)

  // ===== 비자 정보 (Visa Information) ⭐ 중요 =====
  visaTypes?: string[];              // users.visa_types (보유 비자 종류)
  koreanLevel?: string;              // users.korean_level (한국어 능력) ⭐ 최우선
  visaSponsorship?: boolean;         // users.visa_sponsorship (스폰서십 필요 여부)

  // ===== 선호 조건 (Preferences) ⭐ 신규 추가 =====
  desiredJobCategory?: string;       // users.desired_job_category (희망 직군)
  workType?: string;                 // users.work_type (고용 형태: 정규직 등)
  companySize?: string;              // users.company_size (선호 회사 규모)
  remoteWork?: string;               // users.remote_work (재택근무 선호도)

  // ===== 경력 및 스킬 =====
  experience: number;                // user_experiences.length (계산)
  skills: string[];                  // user_skills.skill_name[]
  rating?: number;                   // (향후 평가 기능)
  availability: string;              // (현재: 'Available' 고정)

  // ===== 희망 연봉 (Expected Salary) ⭐ 확장 =====
  expectedSalary?: {
    min: number;                     // user_salary_range.min_salary
    max: number;                     // user_salary_range.max_salary
    currency?: string;               // user_salary_range.currency (KRW, USD 등)
    negotiable?: boolean;            // user_salary_range.negotiable (협상 가능 여부)
  };

  // ===== 언어 능력 =====
  languages?: Array<{
    language: string;                // user_languages.language_name
    level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native'; // user_languages.proficiency
  }>;

  // ===== 경력 사항 (Work Experience) ⭐ description 필수 =====
  workExperience?: Array<{
    company: string;                 // user_experiences.company
    position: string;                // user_experiences.position
    startDate: string;               // user_experiences.start_date
    endDate?: string;                // user_experiences.end_date
    current: boolean;                // user_experiences.is_current
    description?: string;            // user_experiences.description ⭐ 업무 설명
  }>;

  // ===== 학력 사항 (Education) ⭐ field, gpa 필수 =====
  education?: Array<{
    institution: string;             // user_educations.school
    degree: string;                  // user_educations.degree
    field: string;                   // user_educations.field_of_study ⭐ 전공
    startYear: string;               // user_educations.start_year
    endYear?: string;                // user_educations.end_year
    current: boolean;                // user_educations.is_current
    gpa?: string;                    // user_educations.gpa ⭐ 학점
  }>;

  // ===== 희망 직무 및 지역 =====
  desiredPositions?: string[];       // user_desired_positions.position_name[]
  preferredLocations?: string[];     // user_preferred_locations.location_name[]

  // ===== 이력서 파일 (Resume) ⭐ 신규 추가 =====
  resumeFileUrl?: string;            // users.resume_file_url (Cloudinary URL)
  resumeFileName?: string;           // users.resume_file_name
  resumeUploadedAt?: string;         // users.resume_uploaded_at (업로드 일시)
}

/**
 * 모든 인재 조회 (공개 설정된 사용자만)
 *
 * ✅ 필터 조건:
 * - user_type = 'jobseeker'
 * - onboarding_completed = true
 * - is_public = true (인재풀 공개 여부)
 * - profile_completed = true (프로필 100% 완성)
 */
export const getAllTalents = async (): Promise<TalentProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        talent_number,
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
      .eq('onboarding_completed', true)
      .eq('is_public', true)              // ✅ 인재풀 공개 필터 추가
      .eq('profile_completed', true);     // ✅ 프로필 완성 필터 추가

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
        talentNumber: user.talent_number || undefined,
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
 *
 * ✅ 권한 체크:
 * - is_public = true → 누구나 볼 수 있음
 * - is_public = false → 본인만 볼 수 있음 (다른 사람이 접근 시 null 반환)
 */
export const getTalentById = async (id: string): Promise<TalentProfile | null> => {
  try {
    // 1. 현재 로그인한 사용자 정보 가져오기
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 2. 인재 정보 조회 (결제 시 모든 필드 노출)
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        talent_number,
        email,
        full_name,
        headline,
        nationality,
        profile_image_url,
        introduction,
        phone_country_code,
        phone,
        birth_year,
        gender,
        address,
        address_detail,
        visa_types,
        korean_level,
        visa_sponsorship,
        desired_job_category,
        work_type,
        company_size,
        remote_work,
        resume_file_url,
        resume_file_name,
        resume_uploaded_at,
        is_public,
        profile_completed,
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

    // 3. 권한 체크: 비공개 프로필인 경우 본인만 볼 수 있음
    if (!data.is_public) {
      // 로그인하지 않았거나, 본인이 아닌 경우
      if (!currentUser || currentUser.id !== data.id) {
        console.log(`[getTalentById] 비공개 프로필 접근 차단: ${id}`);
        return null;
      }
    }

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

    // 희망 연봉 (currency, negotiable 포함)
    const salaryRange = data.salary_range?.[0];
    const expectedSalary = salaryRange ? {
      min: salaryRange.min_salary || 0,
      max: salaryRange.max_salary || 0,
      currency: salaryRange.currency || 'KRW',
      negotiable: salaryRange.negotiable || false
    } : undefined;

    return {
      // 기본 정보
      id: data.id,
      talentNumber: data.talent_number || undefined,
      name: data.full_name || 'Unknown',
      email: data.email,
      title: data.headline || desiredPosition || 'Job Seeker',
      nationality: data.nationality || 'Not specified',
      location: preferredLocation,
      profileImage: data.profile_image_url,
      aboutMe: data.introduction || undefined,

      // 연락처 정보 ⭐
      phoneCountryCode: data.phone_country_code || undefined,
      phone: data.phone || undefined,

      // 개인정보 ⭐
      birthYear: data.birth_year || undefined,
      gender: data.gender || undefined,
      address: data.address || undefined,
      addressDetail: data.address_detail || undefined,

      // 비자 정보 ⭐
      visaTypes: data.visa_types || undefined,
      koreanLevel: data.korean_level || undefined,
      visaSponsorship: data.visa_sponsorship || undefined,

      // 선호 조건 ⭐
      desiredJobCategory: data.desired_job_category || undefined,
      workType: data.work_type || undefined,
      companySize: data.company_size || undefined,
      remoteWork: data.remote_work || undefined,

      // 경력 및 스킬
      experience,
      skills,
      rating: undefined,
      availability: 'Available',

      // 희망 연봉 (확장)
      expectedSalary,

      // 언어 능력
      languages,

      // 경력 및 학력
      workExperience,
      education,

      // 희망 직무 및 지역
      desiredPositions,
      preferredLocations,

      // 이력서 파일 ⭐
      resumeFileUrl: data.resume_file_url || undefined,
      resumeFileName: data.resume_file_name || undefined,
      resumeUploadedAt: data.resume_uploaded_at || undefined
    };
  } catch (error) {
    console.error('Failed to load talent:', error);
    return null;
  }
};
