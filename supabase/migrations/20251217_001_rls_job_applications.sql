-- ============================================
-- Migration: job_applications 테이블 RLS 활성화
-- Date: 2025-12-17
-- Issue: Supabase Linter 보안 경고 해결
-- ============================================

-- 1. RLS 활성화
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Applicants can view own applications" ON job_applications;
DROP POLICY IF EXISTS "Applicants can create applications" ON job_applications;
DROP POLICY IF EXISTS "Companies can view applications to their jobs" ON job_applications;
DROP POLICY IF EXISTS "Companies can update applications to their jobs" ON job_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON job_applications;

-- 3. 지원자 본인: 자기 지원 내역 조회
CREATE POLICY "Applicants can view own applications"
  ON job_applications FOR SELECT
  USING (applicant_id = auth.uid());

-- 4. 지원자 본인: 지원서 생성
CREATE POLICY "Applicants can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

-- 5. 기업: 자기 회사에 온 지원서 조회
CREATE POLICY "Companies can view applications to their jobs"
  ON job_applications FOR SELECT
  USING (company_id = auth.uid());

-- 6. 기업: 자기 회사에 온 지원서 상태 변경
CREATE POLICY "Companies can update applications to their jobs"
  ON job_applications FOR UPDATE
  USING (company_id = auth.uid());

-- 7. 관리자: 전체 접근
CREATE POLICY "Admins can manage all applications"
  ON job_applications FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com'
    )
  );
