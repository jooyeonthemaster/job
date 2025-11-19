// 기업 채용공고 관리 Custom Hook

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Job } from '@/types/company-dashboard.types';

interface UseCompanyJobsResult {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
}

/**
 * 기업 채용공고 관리 훅
 * @param companyId 기업 ID
 * @param enabled 데이터 로드 활성화 여부
 */
export const useCompanyJobs = (
  companyId: string | null,
  enabled: boolean = true
): UseCompanyJobsResult => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!companyId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('[useCompanyJobs] Error fetching jobs:', jobsError);
        setError('채용공고를 불러오는데 실패했습니다.');
        return;
      }

      setJobs((jobsData || []) as Job[]);
    } catch (err: unknown) {
      console.error('[useCompanyJobs] Error:', err);
      setError((err as Error).message || '채용공고를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (deleteError) {
        console.error('[useCompanyJobs] Delete error:', deleteError);
        throw new Error('채용공고 삭제에 실패했습니다.');
      }

      // 로컬 상태에서도 제거
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err: unknown) {
      console.error('[useCompanyJobs] Delete error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyId, enabled]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    deleteJob
  };
};

