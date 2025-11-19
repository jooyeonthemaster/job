// 채용 공고 관련 포맷팅 유틸리티 함수

/**
 * 급여를 한국어 형식으로 포맷팅
 * @param min 최소 급여
 * @param max 최대 급여
 * @returns 포맷된 급여 문자열 (예: "3,000만 - 5,000만")
 */
export const formatSalary = (min: number | null, max: number | null): string => {
  // null 체크 - 급여 정보가 없는 경우
  if (min === null || max === null) {
    return '협의';
  }

  const format = (num: number): string => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
    return num.toLocaleString();
  };
  return `${format(min)} - ${format(max)}`;
};

/**
 * 경력 레벨을 한국어 라벨로 변환
 * @param level 경력 레벨 (ENTRY, JUNIOR, MID, SENIOR, EXECUTIVE)
 * @returns 한국어 라벨
 */
export const getExperienceLabel = (level: string): string => {
  const labels: Record<string, string> = {
    ENTRY: '신입',
    JUNIOR: '주니어',
    MID: '미드레벨',
    SENIOR: '시니어',
    EXECUTIVE: '임원급'
  };
  return labels[level] || level;
};

/**
 * 고용 형태를 한국어 라벨로 변환
 * @param type 고용 형태 (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
 * @returns 한국어 라벨
 */
export const getEmploymentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    FULL_TIME: '정규직',
    PART_TIME: '파트타임',
    CONTRACT: '계약직',
    INTERNSHIP: '인턴십'
  };
  return labels[type] || type;
};

/**
 * 한국어 수준을 한국어 라벨로 변환
 * @param level 한국어 수준 (NONE, BASIC, INTERMEDIATE, ADVANCED, NATIVE)
 * @returns 한국어 라벨
 */
export const getKoreanLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    NONE: '무관',
    BASIC: '기초',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
    NATIVE: '원어민'
  };
  return labels[level] || level;
};

/**
 * 마감일을 한국어 형식으로 포맷팅
 * @param deadline 마감일 (ISO 날짜 문자열 또는 null)
 * @returns 포맷된 마감일 문자열 (예: "2025. 12. 31.") 또는 "미정"
 */
export const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return '미정';

  try {
    const date = new Date(deadline);
    // Invalid Date 체크
    if (isNaN(date.getTime())) return '미정';

    return date.toLocaleDateString('ko-KR');
  } catch {
    return '미정';
  }
};
