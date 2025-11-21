import { useState, useEffect, useCallback } from 'react';

/**
 * 자동 새로고침 + Visibility API 적용 데이터 페칭 훅
 * 
 * 기능:
 * 1. 컴포넌트 마운트 시 데이터 로드
 * 2. 페이지가 백그라운드→포그라운드 전환 시 자동 새로고침
 * 3. 수동 새로고침 가능
 * 
 * @example
 * const { data, loading, error, refresh } = useAutoRefreshData(
 *   async () => await getActiveJobs(),
 *   []
 * );
 */
export function useAutoRefreshData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true); // 새로고침은 기존 데이터 유지하면서 백그라운드 로딩
      } else {
        setLoading(true); // 최초 로드는 로딩 화면
      }
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      console.error('❌ 데이터 로드 실패:', err);
      setError(err.message || '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchFn]);

  // 최초 로드
  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  // ✅ Visibility API: 페이지 활성화 시 자동 새로고침 (일단 비활성화)
  // TODO: 무한 루프 이슈 해결 후 재활성화
  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout | null = null;
  //   let lastRefreshTime = Date.now();

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        
  //       // 마지막 새로고침 후 30초 이상 경과했을 때만 새로고침
  //       if (timeSinceLastRefresh > 30000) {
  //         if (timeoutId) clearTimeout(timeoutId);
  //         timeoutId = setTimeout(() => {
  //           lastRefreshTime = Date.now();
  //           loadData(true);
  //         }, 500);
  //       }
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
    
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [loadData]);

  return { 
    data, 
    loading, 
    refreshing,
    error, 
    refresh: () => loadData(true)
  };
}

