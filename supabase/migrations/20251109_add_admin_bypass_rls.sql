-- =====================================================
-- 관리자 RLS 우회 정책 추가
-- 날짜: 2025-11-09
-- 목적: 관리자 이메일을 가진 사용자는 모든 데이터에 접근 가능
-- =====================================================

-- =====================================================
-- 1. JOBS 테이블 - 기존 정책 삭제 후 재생성
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies can manage own jobs" ON jobs;

-- 새 정책: 기업은 자신의 공고만, 관리자는 모든 공고 조회 가능
CREATE POLICY "Companies and admins can manage jobs"
  ON jobs FOR ALL
  USING (
    -- 기존 정책: 자신의 공고
    company_id = auth.uid()
    OR
    -- 새 정책: 관리자 이메일
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- =====================================================
-- 2. COMPANIES 테이블 - 기존 정책 삭제 후 재생성
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies can view own data" ON companies;
DROP POLICY IF EXISTS "Companies can update own data" ON companies;

-- 새 정책: 기업은 자신의 데이터만, 관리자는 모든 데이터 조회 가능
CREATE POLICY "Companies and admins can view companies"
  ON companies FOR SELECT
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

CREATE POLICY "Companies and admins can update companies"
  ON companies FOR UPDATE
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- =====================================================
-- 3. USERS 테이블 - 기존 정책 삭제 후 재생성
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 새 정책: 사용자는 자신의 프로필만, 관리자는 모든 프로필 조회 가능
CREATE POLICY "Users and admins can view profiles"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

CREATE POLICY "Users and admins can update profiles"
  ON users FOR UPDATE
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );

-- =====================================================
-- 설명
-- =====================================================
-- 
-- 관리자 이메일을 가진 사용자는 RLS 정책을 우회하여
-- 모든 데이터에 접근할 수 있습니다.
-- 
-- auth.jwt() ->> 'email'은 현재 로그인한 사용자의 이메일을 가져옵니다.
-- =====================================================

