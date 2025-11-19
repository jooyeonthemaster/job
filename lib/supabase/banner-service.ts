// =====================================================
// Advertisement Banner Service
// 광고 배너 CRUD 및 통계 관리
// =====================================================

import { supabase } from './config';
import type {
  AdvertisementBanner,
  BannerPosition,
  CreateBannerData,
  UpdateBannerData,
  BannerStats,
  PaymentStatus
} from '@/types/banner.types';

/**
 * 위치별 활성화된 배너 1개 가져오기 (공개용)
 * - 활성화된 배너만
 * - 노출 기간 내 배너만
 * - 조회수 자동 증가
 */
export async function getBannerByPosition(
  position: BannerPosition
): Promise<AdvertisementBanner | null> {
  try {
    const now = new Date().toISOString();

    // 활성화되고 노출 기간 내인 배너 1개 조회
    const { data, error } = await supabase
      .from('advertisement_banners')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 배너 없음 (정상)
        return null;
      }
      throw error;
    }

    if (data) {
      // 조회수 증가 (비동기, await 없이)
      incrementViews(data.id);
    }

    return data;
  } catch (error) {
    console.error('Failed to get banner by position:', {
      position,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code,
      errorDetails: (error as any)?.details,
      errorHint: (error as any)?.hint,
    });
    return null;
  }
}

/**
 * 모든 배너 가져오기 (관리자용)
 */
export async function getAllBanners(): Promise<AdvertisementBanner[]> {
  try {
    const { data, error } = await supabase
      .from('advertisement_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get all banners:', error);
    throw error;
  }
}

/**
 * 위치별 배너 목록 가져오기 (관리자용)
 */
export async function getBannersByPosition(
  position: BannerPosition
): Promise<AdvertisementBanner[]> {
  try {
    const { data, error } = await supabase
      .from('advertisement_banners')
      .select('*')
      .eq('position', position)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get banners by position:', error);
    throw error;
  }
}

/**
 * 배너 상세 조회 (관리자용)
 */
export async function getBannerById(
  id: string
): Promise<AdvertisementBanner | null> {
  try {
    const { data, error } = await supabase
      .from('advertisement_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to get banner by id:', error);
    throw error;
  }
}

/**
 * 배너 생성 (관리자용)
 */
export async function createBanner(
  bannerData: CreateBannerData
): Promise<AdvertisementBanner> {
  try {
    // 현재 로그인한 관리자 이메일 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    const createdBy = user?.email || null;

    console.log('Creating banner with data:', {
      ...bannerData,
      created_by: createdBy,
    });

    const { data, error } = await supabase
      .from('advertisement_banners')
      .insert([
        {
          ...bannerData,
          created_by: createdBy,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log('Banner created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create banner:', error);
    throw error;
  }
}

/**
 * 배너 수정 (관리자용)
 */
export async function updateBanner(
  id: string,
  bannerData: Partial<UpdateBannerData>
): Promise<AdvertisementBanner> {
  try {
    const { data, error } = await supabase
      .from('advertisement_banners')
      .update(bannerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to update banner:', error);
    throw error;
  }
}

/**
 * 배너 삭제 (관리자용)
 */
export async function deleteBanner(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('advertisement_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete banner:', error);
    throw error;
  }
}

/**
 * 배너 활성화/비활성화 (관리자용)
 */
export async function toggleBannerActive(
  id: string,
  isActive: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('advertisement_banners')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to toggle banner active:', error);
    throw error;
  }
}

/**
 * 결제 상태 변경 (관리자용)
 */
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  note?: string
): Promise<void> {
  try {
    const updateData: any = { payment_status: status };

    if (note) {
      updateData.payment_note = note;
    }

    // '결제 완료'로 변경 시 확인 일시 기록
    if (status === 'confirmed') {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('advertisement_banners')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
}

/**
 * 조회수 증가 (내부용)
 */
async function incrementViews(id: string): Promise<void> {
  try {
    await supabase.rpc('increment_banner_views', { banner_id: id });
  } catch (error) {
    // 조회수 증가 실패는 무시 (중요하지 않음)
    console.warn('Failed to increment banner views:', error);
  }
}

/**
 * 클릭수 증가 (공개용)
 */
export async function recordBannerClick(id: string): Promise<void> {
  try {
    await supabase.rpc('increment_banner_clicks', { banner_id: id });
  } catch (error) {
    console.warn('Failed to record banner click:', error);
  }
}

/**
 * 배너 통계 계산 (관리자용)
 */
export function calculateBannerStats(banner: AdvertisementBanner): BannerStats {
  const { views, clicks } = banner;
  const ctr = views > 0 ? (clicks / views) * 100 : 0;

  return {
    views,
    clicks,
    ctr: parseFloat(ctr.toFixed(2)), // 소수점 2자리
  };
}

/**
 * 전체 통계 가져오기 (관리자용)
 */
export async function getTotalStats(): Promise<{
  totalBanners: number;
  activeBanners: number;
  totalViews: number;
  totalClicks: number;
  averageCTR: number;
}> {
  try {
    const { data, error } = await supabase
      .from('advertisement_banners')
      .select('id, is_active, views, clicks');

    if (error) throw error;

    const totalBanners = data?.length || 0;
    const activeBanners = data?.filter((b) => b.is_active).length || 0;
    const totalViews = data?.reduce((sum, b) => sum + (b.views || 0), 0) || 0;
    const totalClicks = data?.reduce((sum, b) => sum + (b.clicks || 0), 0) || 0;
    const averageCTR =
      totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(2)) : 0;

    return {
      totalBanners,
      activeBanners,
      totalViews,
      totalClicks,
      averageCTR,
    };
  } catch (error) {
    console.error('Failed to get total stats:', error);
    throw error;
  }
}
