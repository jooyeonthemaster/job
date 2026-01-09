-- =====================================================
-- 채용공고 국적별 채용 유형 필드 추가
-- 생성일: 2026-01-09
-- 요청: 클라이언트 미팅노트 #10
-- =====================================================

-- jobs 테이블에 2개 컬럼 추가
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS for_korean BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS for_foreigner BOOLEAN DEFAULT true;

-- 코멘트 추가
COMMENT ON COLUMN jobs.for_korean IS '내국인 채용 여부 - true이면 한국인 채용';
COMMENT ON COLUMN jobs.for_foreigner IS '외국인 채용 여부 - true이면 외국인 채용';
