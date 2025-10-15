import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Job } from "@/types"

// Supabase 타입 정의
interface JobseekerProfile {
  fullName?: string;
  skills?: string[];
  desiredPositions?: string[];
  preferredLocations?: string[];
  salaryRange?: {
    min?: string | number;
    max?: string | number;
    currency?: string;
    negotiable?: boolean;
  } | null;
  workType?: string;
  visaSponsorship?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 구직자 프로필과 채용공고를 비교하여 매칭 점수 계산
 * 점수 범위: 0-100
 */
export function calculateJobMatchScore(
  profile: JobseekerProfile,
  job: Job
): number {
  let score = 0;
  let maxScore = 0;

  // 1. 기술 스택 매칭 (40점)
  maxScore += 40;
  if (profile.skills && profile.skills.length > 0 && job.tags && job.tags.length > 0) {
    const profileSkillsLower = profile.skills.map(s => s.toLowerCase());
    const jobTagsLower = job.tags.map(t => t.toLowerCase());
    
    const matchingSkills = profileSkillsLower.filter(skill =>
      jobTagsLower.some(tag => tag.includes(skill) || skill.includes(tag))
    );
    
    const skillMatchRate = matchingSkills.length / profileSkillsLower.length;
    score += skillMatchRate * 40;
  }

  // 2. 위치 매칭 (25점)
  maxScore += 25;
  if (profile.preferredLocations && profile.preferredLocations.length > 0) {
    const locationMatch = profile.preferredLocations.some(location =>
      job.location.includes(location) || location.includes(job.location.split(' ')[0])
    );
    if (locationMatch) {
      score += 25;
    }
  }

  // 3. 연봉 범위 매칭 (20점)
  maxScore += 20;
  if (profile.salaryRange?.min && profile.salaryRange?.max) {
    const profileMinSalary = typeof profile.salaryRange.min === 'string' 
      ? parseInt(profile.salaryRange.min) * 10000 
      : profile.salaryRange.min;
    const profileMaxSalary = typeof profile.salaryRange.max === 'string'
      ? parseInt(profile.salaryRange.max) * 10000
      : profile.salaryRange.max;
    
    // 구직자 희망 연봉과 공고 연봉의 겹치는 범위 계산
    const overlapMin = Math.max(profileMinSalary, job.salary.min);
    const overlapMax = Math.min(profileMaxSalary, job.salary.max);
    
    if (overlapMin <= overlapMax) {
      // 겹치는 범위가 있으면 점수 부여
      const overlapRange = overlapMax - overlapMin;
      const profileRange = profileMaxSalary - profileMinSalary;
      const overlapRate = Math.min(overlapRange / profileRange, 1);
      score += overlapRate * 20;
    }
  }

  // 4. 직무명 매칭 (15점)
  maxScore += 15;
  if (profile.desiredPositions && profile.desiredPositions.length > 0) {
    const positionMatch = profile.desiredPositions.some(position =>
      job.title.toLowerCase().includes(position.toLowerCase()) ||
      position.toLowerCase().includes(job.title.toLowerCase())
    );
    if (positionMatch) {
      score += 15;
    }
  }

  // 5. 고용 형태 매칭 (10점)
  maxScore += 10;
  if (profile.workType) {
    const workTypeMap: Record<string, string> = {
      '정규직': 'FULL_TIME',
      '계약직': 'CONTRACT',
      '인턴': 'INTERNSHIP',
      '프리랜서': 'CONTRACT'
    };
    const profileWorkType = workTypeMap[profile.workType];
    if (profileWorkType && job.employmentType === profileWorkType) {
      score += 10;
    }
  }

  // 6. 비자 후원 필터링 (필수 조건)
  if (profile.visaSponsorship && !job.visaSponsorship) {
    // 비자 후원이 필요한데 제공하지 않는 공고는 점수 대폭 감점
    score = score * 0.3; // 70% 감점
  }

  // 정규화된 점수 반환 (0-100)
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

/**
 * 구직자 프로필 기반 추천 채용공고 필터링 및 정렬
 */
export function getRecommendedJobs(
  profile: JobseekerProfile | null,
  allJobs: Job[],
  limit: number = 5
): Job[] {
  if (!profile) {
    // 프로필이 없으면 최신 공고 반환
    return allJobs.slice(0, limit);
  }

  // 1단계: 필수 조건 필터링
  let filteredJobs = allJobs;
  
  // 비자 후원 필수인 경우 필터링
  if (profile.visaSponsorship) {
    filteredJobs = filteredJobs.filter(job => job.visaSponsorship);
  }

  // 2단계: 각 공고에 매칭 점수 계산
  const jobsWithScores = filteredJobs.map(job => ({
    job,
    score: calculateJobMatchScore(profile, job)
  }));

  // 3단계: 점수 순으로 정렬하고 상위 N개 반환
  return jobsWithScores
    .filter(item => item.score > 20) // 최소 20점 이상만
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.job);
}