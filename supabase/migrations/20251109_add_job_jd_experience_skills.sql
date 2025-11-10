-- =====================================================
-- 채용공고 JD, 필요 경력 사항, 스킬 필드 추가
-- 생성일: 2025-11-09
-- =====================================================

-- jobs 테이블에 3개 컬럼 추가
ALTER TABLE jobs
  ADD COLUMN job_description TEXT,           -- JD (Job Description) - 직무 상세 설명
  ADD COLUMN required_experience TEXT,       -- 필요 경력 사항 (예: "의료기기 자동화 장비 제조 경력 5년 이상")
  ADD COLUMN required_skills TEXT[];         -- 필요 스킬 (배열 형태, 예: ['Python', 'React', 'AWS'])

-- 코멘트 추가
COMMENT ON COLUMN jobs.job_description IS 'JD (Job Description) - 직무에 대한 상세 설명';
COMMENT ON COLUMN jobs.required_experience IS '필요 경력 사항 - 구체적인 경력 요구사항';
COMMENT ON COLUMN jobs.required_skills IS '필요 스킬 - 기술 스택 배열';

-- 인덱스 추가 (스킬 검색 최적화)
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN(required_skills);