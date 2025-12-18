// =====================================================
// Payment History Types
// 결제 내역 관리 타입 정의
// =====================================================

/**
 * 결제 유형
 */
export type PaymentType = 'job_posting' | 'profile_view';

/**
 * 결제 상태
 */
export type PaymentStatus = 'pending' | 'paid' | 'confirmed' | 'failed' | 'refunded';

/**
 * 채용 공고 등급 (결제 유형)
 */
export type PostingTier = 'standard' | 'premium' | 'top';

/**
 * 결제 상태 라벨 (UI용)
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  confirmed: '결제 확인',
  failed: '결제 실패',
  refunded: '환불 완료',
};

/**
 * 결제 상태 색상 (UI용)
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  paid: 'bg-primary-50 text-primary-700 border-primary-300',
  confirmed: 'bg-primary-100 text-primary-800 border-primary-400',
  failed: 'bg-gray-100 text-gray-600 border-gray-300',
  refunded: 'bg-gray-100 text-gray-600 border-gray-300',
};

/**
 * 결제 유형 라벨 (UI용)
 */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  job_posting: '채용 공고 등록',
  profile_view: '인재풀 열람',
};

/**
 * 채용 공고 등급 라벨 (UI용)
 */
export const POSTING_TIER_LABELS: Record<PostingTier, string> = {
  standard: '일반',
  premium: '프리미엄',
  top: 'TOP',
};

/**
 * 채용 공고 등급 색상 (UI용)
 */
export const POSTING_TIER_COLORS: Record<PostingTier, string> = {
  standard: 'bg-gray-100 text-gray-700',
  premium: 'bg-gray-200 text-gray-800',
  top: 'bg-primary-100 text-primary-800',
};

/**
 * 채용 공고 결제 내역
 */
export interface JobPostingPayment {
  id: string;
  job_id: string;
  job_title: string;
  posting_tier: PostingTier;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_vat: number;
  payment_total: number;
  payment_date: string;
  created_at: string;
}

/**
 * 인재풀 열람 결제 내역
 */
export interface ProfileViewPayment {
  id: string;
  talent_id: string;
  talent_name: string;
  talent_email: string;
  talent_headline: string | null;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_date: string;
  created_at: string;
}

/**
 * 통합 결제 내역 (UI 표시용)
 */
export interface PaymentHistoryItem {
  id: string;
  type: PaymentType;
  title: string; // 채용 공고 제목 or 인재 이름
  subtitle?: string; // 인재 이메일, 채용 공고 등급 등
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_vat?: number;
  payment_total: number;
  payment_date: string;
  created_at: string;
  // 추가 데이터 (선택적)
  posting_tier?: PostingTier;
  talent_headline?: string | null;
}

/**
 * 결제 내역 필터 옵션
 */
export interface PaymentFilters {
  type?: PaymentType | 'all';
  status?: PaymentStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * 결제 내역 정렬 옵션
 */
export type PaymentSortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

/**
 * 정렬 옵션 라벨 (UI용)
 */
export const PAYMENT_SORT_LABELS: Record<PaymentSortBy, string> = {
  date_desc: '최신순',
  date_asc: '오래된순',
  amount_desc: '금액 높은순',
  amount_asc: '금액 낮은순',
};

/**
 * 결제 내역 조회 결과
 */
export interface PaymentHistoryResult {
  payments: PaymentHistoryItem[];
  total: number;
  totalAmount: number;
  totalVat: number;
  totalWithVat: number;
}

/**
 * 결제 통계
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  jobPostingCount: number;
  jobPostingAmount: number;
  profileViewCount: number;
  profileViewAmount: number;
  monthlyAmount: number;
  yearlyAmount: number;
}

/**
 * 관리자용 결제 내역 (기업 정보 포함)
 */
export interface AdminPaymentHistoryItem extends PaymentHistoryItem {
  company_id: string;
  company_name: string;
  company_email?: string;
}

/**
 * 관리자용 결제 필터 (기업 필터 추가)
 */
export interface AdminPaymentFilters extends PaymentFilters {
  companyId?: string | 'all';
  companySearch?: string;
}

// =====================================================
// Refund Types - 환불 관련 타입 정의
// =====================================================

/**
 * 환불 상태
 */
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

/**
 * 환불 상태 라벨 (UI용)
 */
export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: '환불 요청',
  approved: '환불 승인',
  rejected: '환불 거절',
  completed: '환불 완료',
  cancelled: '요청 취소',
};

/**
 * 환불 상태 색상 (UI용)
 */
export const REFUND_STATUS_COLORS: Record<RefundStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  approved: 'bg-blue-50 text-blue-700 border-blue-300',
  rejected: 'bg-red-50 text-red-700 border-red-300',
  completed: 'bg-green-50 text-green-700 border-green-300',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-300',
};

/**
 * 환불 사유 유형
 */
export type RefundReasonType =
  | 'before_publish'      // 채용공고: 게시 전 (100%)
  | 'within_3days'        // 채용공고: 게시 후 3일 이내 (70%)
  | 'before_view'         // 프로필: 열람 전 (100%)
  | 'service_error'       // 서비스 오류 (100%)
  | 'duplicate_payment'   // 중복 결제 (100%)
  | 'other';              // 기타

/**
 * 환불 사유 라벨
 */
export const REFUND_REASON_LABELS: Record<RefundReasonType, string> = {
  before_publish: '채용공고 게시 전 취소',
  within_3days: '채용공고 게시 후 3일 이내 취소',
  before_view: '프로필 열람 전 취소',
  service_error: '서비스 오류',
  duplicate_payment: '중복 결제',
  other: '기타',
};

/**
 * 환불 가능 여부 체크 결과
 */
export interface RefundEligibility {
  canRefund: boolean;
  refundRate: number;        // 환불 비율 (0 ~ 1)
  refundAmount: number;      // 환불 금액
  reason: RefundReasonType | null;
  message: string;           // 사용자에게 표시할 메시지
}

/**
 * 환불 요청 데이터
 */
export interface RefundRequest {
  id: string;
  payment_id: string;
  payment_type: PaymentType;
  company_id: string;
  original_amount: number;
  refund_amount: number;
  refund_rate: number;
  reason_type: RefundReasonType;
  reason_detail?: string;
  status: RefundStatus;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;     // 처리한 관리자 ID
  rejection_reason?: string; // 거절 사유
  portone_cancellation_id?: string; // 포트원 취소 ID
}

/**
 * 환불 요청 생성 DTO
 */
export interface CreateRefundRequestDTO {
  payment_id: string;
  payment_type: PaymentType;
  reason_type: RefundReasonType;
  reason_detail?: string;
}

/**
 * 환불 처리 DTO (관리자용)
 */
export interface ProcessRefundDTO {
  refund_request_id: string;
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

/**
 * 환불 정책 상수
 */
export const REFUND_POLICY = {
  // 채용공고 환불 정책
  JOB_POSTING: {
    BEFORE_PUBLISH: {
      rate: 1.0,           // 100% 환불
      description: '게시 전(관리자 승인 대기 중): 100% 환불',
    },
    WITHIN_3_DAYS: {
      rate: 0.7,           // 70% 환불
      daysLimit: 3,
      description: '게시 후 3일 이내: 70% 환불',
    },
    AFTER_3_DAYS: {
      rate: 0,             // 환불 불가
      description: '게시 후 3일 초과: 환불 불가',
    },
  },
  // 프로필 열람 환불 정책
  PROFILE_VIEW: {
    BEFORE_VIEW: {
      rate: 1.0,           // 100% 환불
      description: '프로필 열람 전: 100% 환불',
    },
    AFTER_VIEW: {
      rate: 0,             // 환불 불가
      description: '프로필 열람 완료 후: 환불 불가 (디지털 콘텐츠 특성)',
    },
  },
  // 공통 환불 정책
  COMMON: {
    SERVICE_ERROR: {
      rate: 1.0,           // 100% 환불
      description: '회사 귀책사유로 서비스 제공 불가 시: 100% 환불',
    },
    DUPLICATE_PAYMENT: {
      rate: 1.0,           // 100% 환불
      description: '중복 결제 시: 100% 환불',
    },
  },
  // 환불 처리 기간
  PROCESSING_DAYS: '영업일 기준 3~5일',
} as const;
