-- =====================================================
-- jobs 테이블에 payment_transaction_id 컬럼 추가
-- 생성일: 2025-12-18
-- 설명: 환불 처리를 위해 PortOne 결제 ID 저장
-- =====================================================

-- payment_transaction_id 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'payment_transaction_id'
    ) THEN
        ALTER TABLE jobs ADD COLUMN payment_transaction_id TEXT;
        COMMENT ON COLUMN jobs.payment_transaction_id IS 'PortOne 결제 트랜잭션 ID (환불 시 필요)';
    END IF;
END $$;

-- 인덱스 추가 (환불 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_jobs_payment_transaction_id ON jobs(payment_transaction_id) WHERE payment_transaction_id IS NOT NULL;
