// 이메일 로그인 폼 컴포넌트
// app/login/page.tsx에서 분리 (기능 변경 없음)

import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

type EmailLoginFormProps = {
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  isPerson: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onRememberMeChange: (remember: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function EmailLoginForm({
  email,
  password,
  showPassword,
  rememberMe,
  isLoading,
  isPerson,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onRememberMeChange,
  onSubmit
}: EmailLoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={isPerson ? "your@email.com" : "company@example.com"}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          required
        />
      </div>

      <div className="mb-5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            required
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
          비밀번호 찾기
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '로그인 중...' : '로그인'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
