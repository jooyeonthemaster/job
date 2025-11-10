-- 프로필 열람 결제 테이블 생성
CREATE TABLE IF NOT EXISTS profile_view_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기업 및 인재 정보
  company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 결제 정보
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_amount INTEGER NOT NULL DEFAULT 5000,
  payment_id TEXT, -- PortOne payment ID
  payment_transaction_id TEXT, -- PortOne transaction ID
  payment_method TEXT, -- 결제 수단 (CARD, VBANK, etc.)

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  payment_paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- 결제 유효기간 (필요시)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,

  -- 중복 결제 방지: 동일 기업이 동일 프로필에 대해 여러 번 결제 가능하지만, 진행 중인 결제는 하나만
  UNIQUE(company_id, talent_id, payment_status)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profile_view_payments_company_id ON profile_view_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_payments_talent_id ON profile_view_payments(talent_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_payments_status ON profile_view_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_profile_view_payments_company_talent ON profile_view_payments(company_id, talent_id);

-- RLS 활성화
ALTER TABLE profile_view_payments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 기업은 자신의 결제 내역만 조회 가능
CREATE POLICY "Companies can view their own payment records"
  ON profile_view_payments
  FOR SELECT
  USING (auth.uid() = company_id);

-- RLS 정책: 기업은 자신의 결제 내역만 생성 가능
CREATE POLICY "Companies can create their own payment records"
  ON profile_view_payments
  FOR INSERT
  WITH CHECK (auth.uid() = company_id);

-- RLS 정책: 시스템(서버)은 결제 상태 업데이트 가능
CREATE POLICY "Service role can update payment status"
  ON profile_view_payments
  FOR UPDATE
  USING (true); -- 서버 측 API에서 service role key로 업데이트

-- RLS 정책: 관리자는 모든 결제 내역 조회 가능
CREATE POLICY "Admins can view all payment records"
  ON profile_view_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 함수: 기업이 특정 프로필에 대한 유효한 결제를 했는지 확인
CREATE OR REPLACE FUNCTION has_paid_for_profile(p_company_id UUID, p_talent_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profile_view_payments
    WHERE company_id = p_company_id
      AND talent_id = p_talent_id
      AND payment_status = 'paid'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 코멘트 추가
COMMENT ON TABLE profile_view_payments IS '기업의 구직자 프로필 열람 결제 내역';
COMMENT ON COLUMN profile_view_payments.company_id IS '결제한 기업 ID';
COMMENT ON COLUMN profile_view_payments.talent_id IS '열람할 구직자 프로필 ID';
COMMENT ON COLUMN profile_view_payments.payment_status IS '결제 상태 (pending, paid, failed, refunded, cancelled)';
COMMENT ON COLUMN profile_view_payments.payment_amount IS '결제 금액 (기본 5000원)';
COMMENT ON COLUMN profile_view_payments.payment_id IS 'PortOne 결제 ID';
COMMENT ON COLUMN profile_view_payments.payment_transaction_id IS 'PortOne 트랜잭션 ID';
COMMENT ON COLUMN profile_view_payments.expires_at IS '결제 유효기간 (선택적)';
