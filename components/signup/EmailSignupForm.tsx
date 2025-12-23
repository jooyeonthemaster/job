import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import type { SignupTab, SignupFormData } from '@/types/signup.types';

interface EmailSignupFormProps {
  activeTab: SignupTab;
  formData: SignupFormData;
  showPassword: boolean;
  isLoading: boolean;
  onFieldChange: (field: keyof SignupFormData, value: string | boolean) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenTermsModal: (type: 'terms' | 'privacy') => void;
}

export default function EmailSignupForm({
  activeTab,
  formData,
  showPassword,
  isLoading,
  onFieldChange,
  onTogglePassword,
  onSubmit,
  onOpenTermsModal
}: EmailSignupFormProps) {
  const isPerson = activeTab === 'jobseeker';

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          placeholder={isPerson ? "your@email.com" : "company@example.com"}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
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
            value={formData.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
          placeholder="비밀번호 재입력"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          required
        />
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={(e) => onFieldChange('agreeTerms', e.target.checked)}
            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => onOpenTermsModal('terms')}
              className="text-primary-600 hover:underline"
            >
              이용약관
            </button> 및{' '}
            <button
              type="button"
              onClick={() => onOpenTermsModal('privacy')}
              className="text-primary-600 hover:underline"
            >
              개인정보처리방침
            </button>에 동의합니다.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '가입 중...' : '회원가입'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
