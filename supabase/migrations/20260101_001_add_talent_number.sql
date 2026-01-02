-- 인재 고유번호 컬럼 추가
-- 형식: YYMM-XX-NNN (예: 2501-01-001)
-- YY: 연도 마지막 2자리
-- MM: 월
-- XX: 타입 코드 (01: 일반 구직자)
-- NNN: 순번 (001부터 시작)

-- 1. 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS talent_number TEXT UNIQUE;

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_talent_number ON users(talent_number);

-- 3. 시퀀스 테이블 생성 (월별 순번 관리)
CREATE TABLE IF NOT EXISTS talent_number_sequences (
  year_month TEXT PRIMARY KEY,  -- 'YYMM' 형식 (예: '2501')
  last_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인재 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_talent_number()
RETURNS TEXT AS $$
DECLARE
  v_year_month TEXT;
  v_next_number INTEGER;
  v_talent_number TEXT;
BEGIN
  -- 현재 년월 가져오기 (YYMM 형식)
  v_year_month := TO_CHAR(NOW(), 'YYMM');

  -- 시퀀스 테이블에서 다음 번호 가져오기 (없으면 생성)
  INSERT INTO talent_number_sequences (year_month, last_number)
  VALUES (v_year_month, 1)
  ON CONFLICT (year_month)
  DO UPDATE SET
    last_number = talent_number_sequences.last_number + 1,
    updated_at = NOW()
  RETURNING last_number INTO v_next_number;

  -- 인재 번호 생성 (YYMM-01-NNN)
  v_talent_number := v_year_month || '-01-' || LPAD(v_next_number::TEXT, 3, '0');

  RETURN v_talent_number;
END;
$$ LANGUAGE plpgsql;

-- 5. 신규 사용자 등록 시 자동으로 인재 번호 부여하는 트리거
CREATE OR REPLACE FUNCTION set_talent_number_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- 구직자(jobseeker)인 경우에만 인재 번호 부여
  IF NEW.user_type = 'jobseeker' AND NEW.talent_number IS NULL THEN
    NEW.talent_number := generate_talent_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS trigger_set_talent_number ON users;
CREATE TRIGGER trigger_set_talent_number
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_talent_number_on_insert();

-- 6. 기존 사용자들에게 인재 번호 부여 (가입 순서대로)
-- 각 사용자의 created_at 기준 년월로 번호 부여
DO $$
DECLARE
  r RECORD;
  v_year_month TEXT;
  v_next_number INTEGER;
  v_talent_number TEXT;
BEGIN
  -- 인재 번호가 없는 구직자들을 가입일 순으로 처리
  FOR r IN
    SELECT id, created_at
    FROM users
    WHERE user_type = 'jobseeker'
      AND talent_number IS NULL
    ORDER BY created_at ASC
  LOOP
    -- 해당 사용자의 가입 년월
    v_year_month := TO_CHAR(r.created_at, 'YYMM');

    -- 시퀀스에서 다음 번호 가져오기
    INSERT INTO talent_number_sequences (year_month, last_number)
    VALUES (v_year_month, 1)
    ON CONFLICT (year_month)
    DO UPDATE SET
      last_number = talent_number_sequences.last_number + 1,
      updated_at = NOW()
    RETURNING last_number INTO v_next_number;

    -- 인재 번호 생성 및 업데이트
    v_talent_number := v_year_month || '-01-' || LPAD(v_next_number::TEXT, 3, '0');

    UPDATE users
    SET talent_number = v_talent_number
    WHERE id = r.id;
  END LOOP;
END $$;

-- 7. 코멘트 추가
COMMENT ON COLUMN users.talent_number IS '인재 고유번호 (YYMM-XX-NNN 형식)';
COMMENT ON TABLE talent_number_sequences IS '인재 번호 월별 시퀀스 관리 테이블';
COMMENT ON FUNCTION generate_talent_number() IS '인재 고유번호 자동 생성 함수';
