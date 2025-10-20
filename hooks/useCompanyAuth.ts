// 기업 인증 및 정보 로드 Custom Hook

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { Company } from '@/types/company-dashboard.types';

interface UseCompanyAuthResult {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

/**
 * 기업 인증 및 정보 로드 훅
 * Supabase 인증을 확인하고 기업 정보를 가져옵니다
 */
export const useCompanyAuth = (): UseCompanyAuthResult => {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[useCompanyAuth] 인증 확인 시작');

        // 1. 현재 로그인된 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[useCompanyAuth] 사용자 정보:', user ? `ID: ${user.id}, Email: ${user.email}` : '없음');
        console.log('[useCompanyAuth] 인증 에러:', authError);

        if (authError || !user) {
          console.log('[useCompanyAuth] 인증 실패 -> /login으로 리다이렉트');
          router.push('/login');
          return;
        }

        // 2. Companies 테이블에서 기업 정보 가져오기
        console.log('[useCompanyAuth] Companies 테이블에서 정보 조회 중...');
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('[useCompanyAuth] 기업 데이터:', companyData);
        console.log('[useCompanyAuth] 기업 데이터 에러:', companyError);

        if (companyError || !companyData) {
          // 기업 정보가 없으면 온보딩으로
          console.log('[useCompanyAuth] 기업 정보 없음 -> /signup/company로 리다이렉트');
          router.push('/signup/company');
          return;
        }

        console.log('[useCompanyAuth] 로딩 완료! 기업명:', companyData.name);
        setCompany(companyData as Company);
      } catch (err: any) {
        console.error('[useCompanyAuth] 예외 발생:', err);
        setError(err.message || '인증 처리 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { company, loading, error };
};

