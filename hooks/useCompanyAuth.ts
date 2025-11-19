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

        // 2. Companies 테이블에서 기업 정보 가져오기 (온보딩과 동일하게)
        console.log('[useCompanyAuth] Companies 테이블에서 정보 조회 중...');
        
        // 먼저 기업 정보 조회
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        if (companyError || !companyData) {
          console.log('[useCompanyAuth] 기업 정보 없음 -> /signup/company로 리다이렉트');
          router.push('/signup/company');
          return;
        }

        // 복지 정보 조회 (company_benefits 테이블, category = 'basic')
        const { data: benefitsData } = await supabase
          .from('company_benefits')
          .select('title')
          .eq('company_id', user.id)
          .eq('category', 'basic');

        // 복지 정보 합치기
        const companyWithBenefits = {
          ...companyData,
          basic_benefits: benefitsData || []
        };

        console.log('[useCompanyAuth] 로딩 완료! 기업명:', companyData.name);
        console.log('[useCompanyAuth] 복지 정보:', benefitsData?.length || 0, '개');
        setCompany(companyWithBenefits as Company);
      } catch (err: unknown) {
        console.error('[useCompanyAuth] 예외 발생:', err);
        setError((err as Error).message || '인증 처리 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { company, loading, error };
};

