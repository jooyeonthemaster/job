-- =====================================================
-- 국제 전화번호 지원 마이그레이션
-- 작성일: 2025-01-20
-- 목적: 외국인 구직자 전화번호 저장을 위한 국가 코드 지원
-- =====================================================

-- 1. 새로운 컬럼 추가
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+82';

-- 2. NOT NULL 제약 조건 제거 (먼저 제거해야 함!)
ALTER TABLE users 
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE users 
  ALTER COLUMN foreigner_number DROP NOT NULL;

-- 3. 기존 데이터 정리 (제약 조건 제거 후 실행)
-- 한국인: 빈 전화번호를 NULL로 변경
UPDATE users 
SET phone = NULL 
WHERE phone = '';

-- 외국인등록번호: 빈 값을 NULL로 변경
UPDATE users 
SET foreigner_number = NULL 
WHERE foreigner_number = '';

-- 4. 기존 한국 전화번호에 국가 코드 설정
UPDATE users 
SET phone_country_code = '+82' 
WHERE phone IS NOT NULL AND phone_country_code IS NULL;

-- 5. 인덱스 추가 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_phone_country_code ON users(phone_country_code);

-- 6. 코멘트 추가
COMMENT ON COLUMN users.phone IS '전화번호 (국가 코드 제외, 숫자만)';
COMMENT ON COLUMN users.phone_country_code IS '전화번호 국가 코드 (+82, +86 등)';
COMMENT ON COLUMN users.foreigner_number IS '외국인등록번호 (외국인만, 123456-1234567)';

-- =====================================================
-- 검증 쿼리
-- =====================================================

-- 전화번호 데이터 확인
-- SELECT 
--   nationality,
--   phone_country_code,
--   phone,
--   foreigner_number,
--   COUNT(*) as count
-- FROM users
-- GROUP BY nationality, phone_country_code, phone, foreigner_number;

-- =====================================================
-- 롤백 스크립트 (필요시)
-- =====================================================

-- -- 1. 인덱스 삭제
-- DROP INDEX IF EXISTS idx_users_phone;
-- DROP INDEX IF EXISTS idx_users_phone_country_code;
-- 
-- -- 2. 빈 문자열로 복원
-- UPDATE users SET phone = '' WHERE phone IS NULL;
-- UPDATE users SET foreigner_number = '' WHERE foreigner_number IS NULL;
-- 
-- -- 3. NOT NULL 제약 조건 복원
-- ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN foreigner_number SET NOT NULL;
-- 
-- -- 4. 새 컬럼 삭제
-- ALTER TABLE users DROP COLUMN IF EXISTS phone_country_code;

