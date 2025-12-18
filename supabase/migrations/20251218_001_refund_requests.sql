-- =====================================================
-- 환불 요청 테이블 마이그레이션
-- 생성일: 2025-12-18
-- 설명: 결제 환불 요청 관리를 위한 테이블
-- =====================================================

-- 환불 상태 ENUM 생성
DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 결제 유형 ENUM 생성
DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('job_posting', 'profile_view');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 환불 사유 유형 ENUM 생성
DO $$ BEGIN
    CREATE TYPE refund_reason_type AS ENUM (
        'before_publish',      -- 채용공고: 게시 전 (100%)
        'within_3days',        -- 채용공고: 게시 후 3일 이내 (70%)
        'before_view',         -- 프로필: 열람 전 (100%)
        'service_error',       -- 서비스 오류 (100%)
        'duplicate_payment',   -- 중복 결제 (100%)
        'other'                -- 기타
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 환불 요청 테이블 생성
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 결제 정보
    payment_id UUID NOT NULL,                        -- jobs.id 또는 profile_view_payments.id
    payment_type payment_type NOT NULL,              -- 결제 유형

    -- 요청자 정보
    company_id UUID NOT NULL REFERENCES auth.users(id),  -- 요청 기업

    -- 금액 정보
    original_amount INTEGER NOT NULL,                -- 원래 결제 금액
    refund_amount INTEGER NOT NULL,                  -- 환불 금액
    refund_rate DECIMAL(3, 2) NOT NULL,              -- 환불 비율 (0.00 ~ 1.00)

    -- 환불 사유
    reason_type refund_reason_type NOT NULL,         -- 환불 사유 유형
    reason_detail TEXT,                              -- 상세 사유 (사용자 입력)

    -- 상태
    status refund_status NOT NULL DEFAULT 'pending', -- 환불 상태

    -- 처리 정보
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 요청 시간
    processed_at TIMESTAMPTZ,                        -- 처리 시간
    processed_by UUID REFERENCES auth.users(id),     -- 처리한 관리자
    rejection_reason TEXT,                           -- 거절 사유

    -- 포트원 정보
    portone_cancellation_id TEXT,                    -- 포트원 취소 ID

    -- 타임스탬프
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_refund_requests_company_id ON refund_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_payment_id ON refund_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_payment_type ON refund_requests(payment_type);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at DESC);

-- RLS 정책 설정
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- 기업 회원: 자신의 환불 요청만 조회 가능
CREATE POLICY "Companies can view their own refund requests"
    ON refund_requests
    FOR SELECT
    USING (auth.uid() = company_id);

-- 기업 회원: 자신의 환불 요청 생성 가능
CREATE POLICY "Companies can create refund requests"
    ON refund_requests
    FOR INSERT
    WITH CHECK (auth.uid() = company_id);

-- 관리자: 모든 환불 요청 조회 가능 (service_role로 접근)
-- 관리자: 환불 요청 처리 가능 (service_role로 접근)

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_refund_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_refund_requests_updated_at ON refund_requests;
CREATE TRIGGER trigger_update_refund_requests_updated_at
    BEFORE UPDATE ON refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_refund_requests_updated_at();

-- jobs 테이블에 payment_status 컬럼에 'refunded' 값 허용 확인
-- (이미 VARCHAR나 TEXT로 되어 있으면 추가 작업 불필요)

-- profile_view_payments 테이블에 payment_status 컬럼에 'refunded' 값 허용 확인
-- (이미 VARCHAR나 TEXT로 되어 있으면 추가 작업 불필요)

-- 코멘트 추가
COMMENT ON TABLE refund_requests IS '결제 환불 요청 테이블';
COMMENT ON COLUMN refund_requests.payment_id IS '관련 결제 ID (jobs.id 또는 profile_view_payments.id)';
COMMENT ON COLUMN refund_requests.payment_type IS '결제 유형 (job_posting: 채용공고, profile_view: 프로필 열람)';
COMMENT ON COLUMN refund_requests.refund_rate IS '환불 비율 (0.00 ~ 1.00)';
COMMENT ON COLUMN refund_requests.status IS '환불 상태 (pending: 대기, approved: 승인, rejected: 거절, completed: 완료, cancelled: 취소)';
