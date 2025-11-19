// 계정 삭제 기능 훅

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const deleteAccount = async (user: User | null, logout: () => Promise<void>) => {
    if (!user) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      console.log('[Delete Account] 계정 삭제 시작:', user.id);

      // 현재 세션 토큰 가져오기
      const { supabase: supabaseClient } = await import('@/lib/supabase/config');
      const { data: { session } } = await supabaseClient.auth.getSession();

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

      console.log('[Delete Account] 계정 삭제 성공');

      // 로그아웃 및 홈으로 이동
      await logout();
      window.location.href = '/';
    } catch (error: unknown) {
      console.error('[Delete Account] 에러:', error);
      setDeleteError((error as Error).message || '계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting,
    deleteError
  };
};
