-- =====================================================
-- Migration: Add talent pool public columns to users table
-- Created: 2025-11-09
-- Description: 인재풀 공개 기능을 위한 컬럼 추가
-- =====================================================

-- 1. users 테이블에 인재풀 공개 관련 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 2. 컬럼 코멘트 추가
COMMENT ON COLUMN users.is_public IS '인재풀 공개 여부 (true: 기업들이 검색 가능, false: 비공개)';
COMMENT ON COLUMN users.profile_completed IS '프로필 완성 여부 (true: 100% 완성, false: 미완성)';
COMMENT ON COLUMN users.published_at IS '인재풀 공개 시점 (처음 공개한 날짜/시간)';

-- 3. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_is_public ON users(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed) WHERE profile_completed = true;
CREATE INDEX IF NOT EXISTS idx_users_published_at ON users(published_at DESC) WHERE is_public = true;

-- 4. RLS (Row-Level Security) 정책 추가
-- 공개된 인재는 모든 인증된 사용자가 조회 가능
CREATE POLICY "Public talent profiles are viewable by authenticated users"
ON users FOR SELECT
TO authenticated
USING (
  is_public = true
  AND profile_completed = true
  AND user_type = 'jobseeker'
);

-- 비공개 인재는 본인만 조회 가능 (기존 정책과 병합)
CREATE POLICY "Users can view their own profile even if private"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 5. 기존 데이터 마이그레이션 (필요한 경우)
-- 이미 프로필이 완성된 사용자는 profile_completed = true로 설정
-- (경력 또는 학력이 있고, 스킬이 3개 이상, 언어가 1개 이상인 경우)
UPDATE users
SET profile_completed = true
WHERE user_type = 'jobseeker'
  AND profile_image_url IS NOT NULL
  AND headline IS NOT NULL
  AND introduction IS NOT NULL
  AND LENGTH(introduction) >= 50
  AND (
    -- 경력이 있거나
    EXISTS (
      SELECT 1 FROM user_experiences
      WHERE user_experiences.user_id = users.id
    )
    OR
    -- 학력이 있는 경우
    EXISTS (
      SELECT 1 FROM user_educations
      WHERE user_educations.user_id = users.id
    )
  )
  AND (
    -- 스킬이 3개 이상
    SELECT COUNT(*) FROM user_skills
    WHERE user_skills.user_id = users.id
  ) >= 3
  AND (
    -- 언어가 1개 이상 (한국어 또는 기타 언어)
    korean_level IS NOT NULL
    OR EXISTS (
      SELECT 1 FROM user_languages
      WHERE user_languages.user_id = users.id
    )
  )
  AND (
    -- 희망 직무가 있는 경우
    EXISTS (
      SELECT 1 FROM user_desired_positions
      WHERE user_desired_positions.user_id = users.id
    )
  );

-- 6. 확인 쿼리
SELECT
  id,
  full_name,
  email,
  is_public,
  profile_completed,
  published_at,
  created_at
FROM users
WHERE user_type = 'jobseeker'
ORDER BY created_at DESC
LIMIT 5;

-- 7. 통계 확인
SELECT
  COUNT(*) FILTER (WHERE is_public = true) as public_profiles,
  COUNT(*) FILTER (WHERE profile_completed = true) as completed_profiles,
  COUNT(*) as total_jobseekers
FROM users
WHERE user_type = 'jobseeker';
