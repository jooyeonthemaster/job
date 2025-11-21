// 소셜 로그인 버튼 컴포넌트
// app/login/page.tsx에서 분리 (기능 변경 없음)

import type { LoginTab } from '@/hooks/useLoginForm';
import { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } from '@/hooks/useOAuthLogin';

type SocialLoginButtonsProps = {
  activeTab: LoginTab;
  isLoading: boolean;
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
};

export default function SocialLoginButtons({
  activeTab,
  isLoading,
  setError,
  setIsLoading
}: SocialLoginButtonsProps) {
  return (
    <div className="mb-6">
      <p className="text-center text-sm text-gray-600 mb-4">소셜 계정으로 간편 로그인</p>
      <div className="flex items-center justify-center gap-3">
        {/* 네이버 */}
        <button
          type="button"
          onClick={() => handleNaverLogin(activeTab, setError, setIsLoading)}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-[#03C75A] hover:bg-[#02b350] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="네이버로 로그인"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z" fill="white"/>
          </svg>
        </button>

        {/* 카카오 */}
        <button
          type="button"
          onClick={() => handleKakaoLogin(activeTab, setError, setIsLoading)}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-[#FEE500] hover:bg-[#f5dc00] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="카카오로 로그인"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.477 2 10.8C2 13.425 3.636 15.742 6.154 17.136L5.154 20.854C5.052 21.223 5.471 21.508 5.783 21.284L10.285 18.167C10.848 18.236 11.42 18.271 12 18.271C17.523 18.271 22 14.794 22 10.8C22 6.477 17.523 3 12 3Z" fill="#3C1E1E"/>
          </svg>
        </button>

        {/* 구글 */}
        <button
          type="button"
          onClick={() => handleGoogleLogin(activeTab, setError, setIsLoading)}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="Google로 로그인"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
