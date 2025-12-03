-- =====================================================
-- 관리자 계정 추가: yjpark@ssmhr.com
-- 날짜: 2025-12-03
-- 목적: yjpark@ssmhr.com을 관리자로 추가하여 모든 데이터 접근 권한 부여
-- =====================================================

-- =====================================================
-- 1. JOBS 테이블 - 관리자 이메일 추가
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies and admins can manage jobs" ON jobs;

-- 새 정책: yjpark@ssmhr.com 추가
CREATE POLICY "Companies and admins can manage jobs"
  ON jobs FOR ALL
  USING (
    -- 기존 정책: 자신의 공고
    company_id = auth.uid()
    OR
    -- 새 정책: 관리자 이메일 (yjpark@ssmhr.com 추가)
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
    )
  );

-- =====================================================
-- 2. COMPANIES 테이블 - 관리자 이메일 추가
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies and admins can view companies" ON companies;
DROP POLICY IF EXISTS "Companies and admins can update companies" ON companies;

-- 새 정책: yjpark@ssmhr.com 추가
CREATE POLICY "Companies and admins can view companies"
  ON companies FOR SELECT
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
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
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
    )
  );

-- =====================================================
-- 3. USERS 테이블 - 관리자 이메일 추가
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users and admins can view profiles" ON users;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON users;

-- 새 정책: yjpark@ssmhr.com 추가
CREATE POLICY "Users and admins can view profiles"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
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
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
    )
  );

-- =====================================================
-- 4. is_admin() 함수 업데이트 (있는 경우)
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'yjpark@ssmhr.com'
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 설명
-- =====================================================
-- 
-- yjpark@ssmhr.com이 관리자 권한을 가지도록 추가했습니다.
-- 이제 이 이메일로 로그인한 사용자는:
-- - 모든 채용공고 관리 가능
-- - 모든 회사 정보 조회/수정 가능
-- - 모든 사용자 프로필 조회/수정 가능
-- 
-- =====================================================

