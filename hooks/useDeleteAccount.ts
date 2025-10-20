// 계정 삭제 Custom Hook

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from '@/contexts/AuthContext_Supabase';

interface UseDeleteAccountResult {
  isDeleting: boolean;
  error: string;
  deleteAccount: () => Promise<void>;
}

/**
 * 계정 삭제 훅
 */
export const useDeleteAccount = (): UseDeleteAccountResult => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const deleteAccount = async () => {
    setIsDeleting(true);
    setError('');

    try {
      console.log('[useDeleteAccount] 계정 삭제 시작');

      // 현재 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      // API 호출
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '계정 삭제에 실패했습니다.');
      }

      console.log('[useDeleteAccount] 계정 삭제 성공');

      // 로그아웃 및 홈으로 이동
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      console.error('[useDeleteAccount] 에러:', err);
      setError(err.message || '계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    error,
    deleteAccount
  };
};

