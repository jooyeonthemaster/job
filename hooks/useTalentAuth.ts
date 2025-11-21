// 인재풀 페이지 인증 체크 훅
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';

export function useTalentAuth() {
  const [isCompany, setIsCompany] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      setCheckingAuth(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsCompany(false);
          setCheckingAuth(false);
          return;
        }

        // 1. user_metadata에서 먼저 확인 (AuthContext와 동일한 방식)
        let userType = user.user_metadata?.user_type;

        // 2. metadata에 없으면 DB에서 조회
        if (!userType) {
          const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single();

          userType = userData?.user_type;
        }

        console.log('[TalentPage] 사용자 타입 확인:', userType);
        setIsCompany(userType === 'company');
      } catch (error) {
        console.error('Failed to check user type:', error);
        setIsCompany(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserType();
  }, []);

  return { isCompany, checkingAuth };
}
