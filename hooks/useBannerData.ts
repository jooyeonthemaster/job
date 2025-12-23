// 배너 데이터 로딩 훅
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import { useState, useEffect, useCallback } from 'react';
import { getAllBanners, getTotalStats } from '@/lib/supabase/banner-service';
import type { AdvertisementBanner } from '@/types/banner.types';

export function useBannerData(isActive: boolean = true) {
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bannersData, statsData] = await Promise.all([
        getAllBanners(),
        getTotalStats()
      ]);
      setBanners(bannersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load banners:', error);
      alert('데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive, loadData]);

  return { banners, stats, loading, loadData };
}
