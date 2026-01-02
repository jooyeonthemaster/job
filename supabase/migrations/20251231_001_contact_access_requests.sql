-- 연락처 열람 요청 테이블 생성
-- 기업이 구직자에게 이메일/전화번호 열람을 요청하고, 구직자가 승인/거절하는 시스템

CREATE TABLE IF NOT EXISTS contact_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  company_message TEXT, -- 기업에서 보내는 메시지 (선택)
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일한 기업-구직자 쌍에 대해 중복 요청 방지
  UNIQUE(requester_company_id, target_user_id)
);

-- 인덱스 생성
CREATE INDEX idx_contact_access_company ON contact_access_requests(requester_company_id);
CREATE INDEX idx_contact_access_user ON contact_access_requests(target_user_id);
CREATE INDEX idx_contact_access_status ON contact_access_requests(status);
CREATE INDEX idx_contact_access_requested_at ON contact_access_requests(requested_at DESC);

-- 업데이트 시 updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_contact_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contact_access_updated_at
  BEFORE UPDATE ON contact_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_access_updated_at();

-- RLS 활성화
ALTER TABLE contact_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 기업은 자신이 보낸 요청 조회 가능
-- 이 프로젝트에서 companies.id = auth.uid() 직접 매핑
CREATE POLICY "Companies can view their sent requests"
ON contact_access_requests FOR SELECT
TO authenticated
USING (requester_company_id = auth.uid());

-- RLS 정책: 구직자는 자신에게 온 요청 조회 가능
CREATE POLICY "Jobseekers can view their received requests"
ON contact_access_requests FOR SELECT
TO authenticated
USING (target_user_id = auth.uid());

-- RLS 정책: 기업은 요청 생성 가능
CREATE POLICY "Companies can create requests"
ON contact_access_requests FOR INSERT
TO authenticated
WITH CHECK (requester_company_id = auth.uid());

-- RLS 정책: 구직자는 자신에게 온 요청 상태 업데이트 가능
CREATE POLICY "Jobseekers can update their received requests"
ON contact_access_requests FOR UPDATE
TO authenticated
USING (target_user_id = auth.uid())
WITH CHECK (target_user_id = auth.uid());

-- 관리자 우회 정책 (admin_users 테이블 존재 시)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    EXECUTE 'CREATE POLICY "Admins can do anything on contact_access_requests"
    ON contact_access_requests FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users))';
  END IF;
END $$;

-- 코멘트 추가
COMMENT ON TABLE contact_access_requests IS '기업-구직자 연락처 열람 요청 테이블';
COMMENT ON COLUMN contact_access_requests.status IS '요청 상태: pending(대기중), approved(승인), rejected(거절)';
COMMENT ON COLUMN contact_access_requests.company_message IS '기업이 요청 시 보내는 메시지';
