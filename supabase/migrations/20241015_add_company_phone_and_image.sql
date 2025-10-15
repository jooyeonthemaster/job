-- =====================================================
-- Migration: Add company_phone and company_image columns
-- Created: 2025-10-15
-- Description: 기업 대표번호와 회사 전경 이미지 필드 추가
-- =====================================================

-- 1. 컬럼 추가 (IF NOT EXISTS로 안전하게)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_image TEXT;

-- 2. 컬럼 코멘트 추가
COMMENT ON COLUMN companies.company_phone IS '기업 대표번호 (선택, 하이픈 포함)';
COMMENT ON COLUMN companies.company_image IS '회사 전경 이미지 URL (Cloudinary, 선택)';

-- 3. 기존 phone 필드 코멘트 업데이트 (명확성)
COMMENT ON COLUMN companies.phone IS '담당자 전화번호 (구형, 하위 호환용)';

-- 4. 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('phone', 'company_phone', 'company_image')
ORDER BY ordinal_position;
