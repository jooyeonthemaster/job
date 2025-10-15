-- =====================================================
-- Migration: Update phone and foreigner_number comments
-- Created: 2025-10-15
-- Description: 한국인/외국인 구분을 위한 필드 설명 업데이트
-- =====================================================

-- 컬럼 코멘트 업데이트
COMMENT ON COLUMN users.phone IS '휴대폰 번호 (한국 국적 선택 시 필수, 하이픈 제외 11자리)';
COMMENT ON COLUMN users.foreigner_number IS '외국인등록번호 (외국 국적 선택 시 필수, 6-7자리)';
COMMENT ON COLUMN users.nationality IS '국적 (KR=한국, 기타=외국)';

-- 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('phone', 'foreigner_number', 'nationality')
ORDER BY ordinal_position;
