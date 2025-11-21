// 로그인 에러 처리 훅
// app/login/page.tsx에서 분리 (기능 변경 없음)

import { useEffect } from 'react';
import type { LoginTab } from './useLoginForm';

type UseLoginErrorsProps = {
  setError: (error: string) => void;
  setActiveTab: (tab: LoginTab) => void;
};

export function useLoginErrors({ setError, setActiveTab }: UseLoginErrorsProps) {
  useEffect(() => {
    // URL 파라미터 체크
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam === 'already_registered_as_jobseeker') {
      setError('이미 개인 회원으로 가입된 계정입니다. 개인 회원 탭에서 로그인해주세요.');
      setActiveTab('jobseeker');
    } else if (errorParam === 'already_registered_as_company') {
      setError('이미 기업 회원으로 가입된 계정입니다. 기업 회원 탭에서 로그인해주세요.');
      setActiveTab('company');
    }

    // localStorage 체크 (회원가입 및 로그인 에러 모두)
    const signupError = localStorage.getItem('signup_error');
    const loginError = localStorage.getItem('login_error');

    if (signupError && !errorParam) {
      setError(signupError);
      localStorage.removeItem('signup_error');
    } else if (loginError && !errorParam) {
      setError(loginError);
      localStorage.removeItem('login_error');
    }

    // URL 정리 (에러 파라미터 제거)
    if (errorParam) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [setError, setActiveTab]);
}
