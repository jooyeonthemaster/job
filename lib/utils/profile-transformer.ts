// Supabase 프로필 데이터 → 대시보드 형식 변환

import type { ProfileData } from '@/types/jobseeker-dashboard.types';

export const transformSupabaseProfile = (supabaseData: any): ProfileData => {
  return {
    fullName: supabaseData.full_name,
    email: supabaseData.email,
    phone: supabaseData.phone,
    desiredJobCategory: supabaseData.desired_job_category,  // ✅ 희망 근무 직군 추가
    headline: supabaseData.headline,
    profileImageUrl: supabaseData.profile_image_url,
    resumeFileUrl: supabaseData.resume_file_url,
    resumeFileName: supabaseData.resume_file_name,
    resumeUploadedAt: supabaseData.resume_uploaded_at,
    introduction: supabaseData.introduction,
    workType: supabaseData.work_type,
    companySize: supabaseData.company_size,
    visaSponsorship: supabaseData.visa_sponsorship,
    remoteWork: supabaseData.remote_work,
    skills: supabaseData.skills?.map((s: any) => s.skill_name) || [],
    languages: supabaseData.languages?.map((l: any) => l.language_name) || [],
    experiences: supabaseData.experiences?.map((exp: any) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: exp.start_date,
      endDate: exp.end_date,
      current: exp.is_current,
      description: exp.description
    })) || [],
    educations: supabaseData.educations?.map((edu: any) => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      startYear: edu.start_year,
      endYear: edu.end_year,
      current: edu.is_current
    })) || [],
    desiredPositions: supabaseData.desired_positions?.map((p: any) => p.position_name) || [],
    preferredLocations: supabaseData.preferred_locations?.map((l: any) => l.location_name) || [],
    salaryRange: supabaseData.salary_range ? {
      min: supabaseData.salary_range.min_salary,
      max: supabaseData.salary_range.max_salary,
      currency: supabaseData.salary_range.currency,
      negotiable: supabaseData.salary_range.negotiable
    } : null,
    profileCompletion: supabaseData.profileCompletion
  };
};
