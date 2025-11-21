// 인재풀 관련 유틸리티 함수
// app/talent/page.tsx에서 분리 (기능 변경 없음)

/**
 * 급여를 한국 통화 형식으로 포맷팅
 */
export const formatSalary = (min?: number, max?: number): string => {
  const format = (num?: number): string => {
    if (!num || num === undefined || num === null) return '협의';
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
    return num.toLocaleString();
  };

  if (!min && !max) return '연봉 협의';
  if (!min) return `~₩${format(max)}`;
  if (!max) return `₩${format(min)}~`;
  return `₩${format(min)} - ${format(max)}`;
};

/**
 * 언어 레벨에 따른 색상 클래스 반환
 */
export const getLanguageColor = (level: string): string => {
  const colors: Record<string, string> = {
    'Native': 'bg-green-100 text-green-700',
    'Fluent': 'bg-blue-100 text-blue-700',
    'Intermediate': 'bg-yellow-100 text-yellow-700',
    'Basic': 'bg-gray-100 text-gray-700'
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
};
