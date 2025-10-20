-- =====================================================
-- RLS 정책 완전 수정: 모든 테이블 firebase_uid → id 직접 비교
-- 날짜: 2025-10-20
-- 이유: Supabase에서 id = auth.uid() 직접 사용 (firebase_uid 사용 안 함)
-- =====================================================

-- =====================================================
-- 1. USERS 테이블 RLS 정책 수정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 새 정책 생성 (id 직접 비교)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- =====================================================
-- 2. COMPANIES 테이블 RLS 정책 수정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies can view own data" ON companies;
DROP POLICY IF EXISTS "Companies can update own data" ON companies;

-- 새 정책 생성 (id 직접 비교)
CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  USING (id = auth.uid());

-- =====================================================
-- 3. JOBS 테이블 RLS 정책 수정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies can manage own jobs" ON jobs;

-- 새 정책 생성 (company_id = auth.uid() 직접 비교)
CREATE POLICY "Companies can manage own jobs"
  ON jobs FOR ALL
  USING (company_id = auth.uid());

-- =====================================================
-- 설명
-- =====================================================
-- 
-- Supabase에서는 테이블의 id가 auth.uid()와 직접 같습니다:
-- - users.id = auth.uid()
-- - companies.id = auth.uid()
-- - jobs.company_id = companies.id = auth.uid()
--
-- firebase_uid는 Firebase에서 마이그레이션할 때만 사용하는 필드이며
-- 현재 Supabase 네이티브 회원가입에서는 사용하지 않습니다.
--
-- 따라서 모든 RLS 정책을 id 직접 비교로 변경했습니다.
-- =====================================================

