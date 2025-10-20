-- =====================================================
-- 어드민 RLS 정책 추가
-- 날짜: 2025-10-20
-- 이유: 어드민이 모든 공고를 관리할 수 있도록 권한 추가
-- =====================================================

-- =====================================================
-- JOBS 테이블: 어드민 전체 권한 정책 추가
-- =====================================================

-- 어드민 이메일 체크 함수 생성
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 정책은 유지하고, 어드민 정책 추가
CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (is_admin());

-- =====================================================
-- 설명
-- =====================================================
--
-- 이제 RLS 정책이 2개입니다:
-- 1. "Companies can manage own jobs" - 회사는 자기 공고만 관리
-- 2. "Admins can manage all jobs" - 어드민은 모든 공고 관리
--
-- is_admin() 함수는 현재 로그인한 사용자의 이메일이
-- 어드민 이메일 리스트에 있는지 확인합니다.
-- =====================================================
