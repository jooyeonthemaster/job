// =====================================================
// Advertisement Banner Types
// 광고 배너 시스템 타입 정의
// =====================================================

/**
 * 배너 위치 (3곳)
 */
export type BannerPosition = 'header' | 'jobs-sidebar-1' | 'jobs-sidebar-2';

/**
 * 결제/입금 상태
 */
export type PaymentStatus = 'pending' | 'paid' | 'confirmed';

/**
 * 배너 크기 설정
 */
export interface BannerSize {
  width: number;
  height: number;
}

/**
 * 배너 위치별 크기 매핑
 */
export const BANNER_SIZES: Record<BannerPosition, BannerSize> = {
  header: { width: 400, height: 50 },
  'jobs-sidebar-1': { width: 160, height: 600 },
  'jobs-sidebar-2': { width: 160, height: 600 },
};

/**
 * 배너 위치 설명 (관리자 UI용)
 */
export const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  header: '헤더 우측 배너',
  'jobs-sidebar-1': '채용공고 우측 사이드바 (상단)',
  'jobs-sidebar-2': '채용공고 우측 사이드바 (하단)',
};

/**
 * 결제 상태 라벨 (관리자 UI용)
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: '입금 대기',
  paid: '입금 확인',
  confirmed: '결제 완료',
};

/**
 * 결제 상태 색상 (UI용)
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
};

/**
 * 광고 배너 (DB 스키마)
 */
export interface AdvertisementBanner {
  // 기본 정보
  id: string;
  name: string;
  image_url: string;
  link_url: string | null;
  alt_text: string | null;

  // 위치 및 크기
  position: BannerPosition;
  width: number;
  height: number;

  // 활성화 상태
  is_active: boolean;

  // 노출 기간
  start_date: string | null;
  end_date: string | null;

  // 결제/입금 정보
  payment_status: PaymentStatus;
  payment_amount: number | null;
  payment_note: string | null;
  payment_confirmed_at: string | null;

  // 광고주 정보
  advertiser_name: string | null;
  advertiser_contact: string | null;

  // 통계
  views: number;
  clicks: number;

  // 메타 정보
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * 배너 생성 요청 데이터
 */
export interface CreateBannerData {
  name: string;
  image_url: string;
  link_url?: string;
  alt_text?: string;
  position: BannerPosition;
  width?: number;
  height?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_note?: string;
  advertiser_name?: string;
  advertiser_contact?: string;
}

/**
 * 배너 수정 요청 데이터
 */
export interface UpdateBannerData extends Partial<CreateBannerData> {
  id: string;
}

/**
 * 배너 통계 (CTR 포함)
 */
export interface BannerStats {
  views: number;
  clicks: number;
  ctr: number; // Click-Through Rate (%)
}

/**
 * 배너 필터 옵션 (관리자 UI용)
 */
export interface BannerFilters {
  position?: BannerPosition;
  is_active?: boolean;
  payment_status?: PaymentStatus;
}

/**
 * 배너 조회 결과 (위치별)
 */
export interface BannersByPosition {
  header: AdvertisementBanner | null;
  'jobs-sidebar-1': AdvertisementBanner | null;
  'jobs-sidebar-2': AdvertisementBanner | null;
}
