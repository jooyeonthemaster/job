interface OAuthButtonsProps {
  isLoading: boolean;
  onNaverSignup: () => void;
  onKakaoSignup: () => void;
  onGoogleSignup: () => void;
}

export default function OAuthButtons({
  isLoading,
  onNaverSignup,
  onKakaoSignup,
  onGoogleSignup
}: OAuthButtonsProps) {
  return (
    <div className="mb-6">
      <p className="text-center text-sm text-gray-600 mb-4">소셜 계정으로 간편 가입</p>
      <div className="flex items-center justify-center gap-3">
        {/* 네이버 */}
        <button
          type="button"
          onClick={onNaverSignup}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-[#03C75A] hover:bg-[#02b350] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="네이버로 가입"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z" fill="white"/>
          </svg>
        </button>

        {/* 카카오 */}
        <button
          type="button"
          onClick={onKakaoSignup}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-[#FEE500] hover:bg-[#f5dc00] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="카카오로 가입"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.477 2 10.8C2 13.425 3.636 15.742 6.154 17.136L5.154 20.854C5.052 21.223 5.471 21.508 5.783 21.284L10.285 18.167C10.848 18.236 11.42 18.271 12 18.271C17.523 18.271 22 14.794 22 10.8C22 6.477 17.523 3 12 3Z" fill="#3C1E1E"/>
          </svg>
        </button>

        {/* 구글 */}
        <button
          type="button"
          onClick={onGoogleSignup}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="Google로 가입"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>

        {/* 페이스북 */}
        <button
          type="button"
          onClick={() => console.log('Facebook signup - TODO')}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#0d66d9] transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="Facebook으로 가입"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
        </button>

        {/* 애플 */}
        <button
          type="button"
          onClick={() => console.log('Apple signup - TODO')}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md"
          title="Apple로 가입"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
