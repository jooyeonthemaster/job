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
