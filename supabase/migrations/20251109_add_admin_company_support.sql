-- 관리자가 회사를 생성할 수 있도록 companies 테이블 수정
-- 관리자가 만든 회사는 실제 Auth 유저와 연결되지 않음

-- 1. companies 테이블에 필드 추가
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. created_by_admin이 TRUE인 경우, id가 Auth 유저와 연결 안 되어도 OK
-- (기존 회사는 id = auth.uid()로 연결되어 있음)

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_companies_created_by_admin ON companies(created_by_admin);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);

-- 4. 기존 회사 데이터에 대한 처리
-- 기존 회사는 created_by_admin = FALSE, created_by는 NULL (기본값)
UPDATE companies
SET
  created_by_admin = FALSE,
  created_by = id  -- 기존 회사는 id = auth user id
WHERE created_by_admin IS NULL;

-- 5. RLS 정책 업데이트 (관리자는 모든 회사 CRUD 가능)
-- 기존 정책 확인 후 필요시 수정
