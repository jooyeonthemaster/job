-- =====================================================
-- Advertisement Banners Table
-- 광고 배너 관리 시스템
-- 생성일: 2025-01-11
-- =====================================================

-- 광고 배너 테이블 생성
CREATE TABLE advertisement_banners (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 배너 정보
  name TEXT NOT NULL,                           -- 광고 배너 이름 (관리용, 예: "메인 헤더 배너 - 삼성전자")
  image_url TEXT NOT NULL,                      -- Cloudinary 이미지 URL
  link_url TEXT,                                -- 클릭 시 이동할 URL (선택, 예: "https://company.com/careers")
  alt_text TEXT,                                -- 이미지 대체 텍스트 (접근성)

  -- 위치 및 크기 (UI 가이드용)
  position TEXT NOT NULL CHECK (position IN ('header', 'jobs-sidebar-1', 'jobs-sidebar-2')),
  width INTEGER NOT NULL,                       -- 픽셀 단위 (400 or 160)
  height INTEGER NOT NULL,                      -- 픽셀 단위 (50 or 600)

  -- 활성화 상태
  is_active BOOLEAN DEFAULT true,               -- 활성화 여부 (ON/OFF 스위치)

  -- 노출 기간 (선택)
  start_date TIMESTAMPTZ,                       -- 노출 시작일 (NULL = 즉시 노출)
  end_date TIMESTAMPTZ,                         -- 노출 종료일 (NULL = 무제한)

  -- 결제/입금 정보
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'confirmed')),
  payment_amount INTEGER,                       -- 광고비 (원)
  payment_note TEXT,                            -- 결제 메모 (입금자명, 입금일 등)
  payment_confirmed_at TIMESTAMPTZ,             -- 입금 확인 일시

  -- 광고주 정보
  advertiser_name TEXT,                         -- 광고주 이름 (회사명/개인명)
  advertiser_contact TEXT,                      -- 연락처 (이메일 또는 전화번호)

  -- 통계
  views INTEGER DEFAULT 0,                      -- 노출 횟수 (자동 증가)
  clicks INTEGER DEFAULT 0,                     -- 클릭 횟수 (자동 증가)

  -- 메타 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT                               -- 관리자 이메일
);

-- 인덱스 생성 (조회 성능 최적화)
CREATE INDEX idx_advertisement_banners_position ON advertisement_banners(position);
CREATE INDEX idx_advertisement_banners_is_active ON advertisement_banners(is_active);
CREATE INDEX idx_advertisement_banners_dates ON advertisement_banners(start_date, end_date);
CREATE INDEX idx_advertisement_banners_payment_status ON advertisement_banners(payment_status);

-- 자동 업데이트 트리거 (updated_at 필드)
CREATE OR REPLACE FUNCTION update_advertisement_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER advertisement_banners_updated_at
  BEFORE UPDATE ON advertisement_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_advertisement_banners_updated_at();

-- Row Level Security (RLS) 활성화
ALTER TABLE advertisement_banners ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모두 조회 가능 (활성화된 배너만, 노출 기간 내)
CREATE POLICY "Anyone can view active banners"
  ON advertisement_banners FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- 정책 2: 관리자만 모든 배너 조회 가능 (비활성화 포함)
CREATE POLICY "Admins can view all banners"
  ON advertisement_banners FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    )
  );

-- 정책 3: 관리자만 배너 생성 가능
CREATE POLICY "Admins can insert banners"
  ON advertisement_banners FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    )
  );

-- 정책 4: 관리자만 배너 수정 가능
CREATE POLICY "Admins can update banners"
  ON advertisement_banners FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    )
  );

-- 정책 5: 관리자만 배너 삭제 가능
CREATE POLICY "Admins can delete banners"
  ON advertisement_banners FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    )
  );

-- RPC 함수: 조회수 증가
CREATE OR REPLACE FUNCTION increment_banner_views(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisement_banners
  SET views = views + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 함수: 클릭수 증가
CREATE OR REPLACE FUNCTION increment_banner_clicks(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisement_banners
  SET clicks = clicks + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 초기 샘플 데이터 (테스트용)
INSERT INTO advertisement_banners (
  name,
  image_url,
  link_url,
  alt_text,
  position,
  width,
  height,
  is_active,
  payment_status,
  advertiser_name
) VALUES (
  '헤더 배너 - 샘플 광고',
  'https://via.placeholder.com/400x50/4F46E5/FFFFFF?text=Sample+Ad+Banner',
  'https://example.com',
  '샘플 광고 배너',
  'header',
  400,
  50,
  false,  -- 비활성화 상태로 생성
  'pending',
  '샘플 광고주'
);

-- =====================================================
-- 완료!
-- =====================================================

-- 생성된 테이블 확인
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'advertisement_banners'
ORDER BY ordinal_position;

-- 생성된 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'advertisement_banners';
