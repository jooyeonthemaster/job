// 계정 정보 섹션 (이메일, 비밀번호)
'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { type JobseekerOnboardingFormData } from '@/types/jobseeker-onboarding.types';
import { validateEmail, validatePassword } from '@/types/jobseeker-onboarding.types';

type AccountSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  isEmailSignup: boolean;
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
};

export default function AccountSection({ formData, errors, isEmailSignup, onChange }: AccountSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const isEmailValid = formData.email && validateEmail(formData.email);
  const isPasswordValid = formData.password && validatePassword(formData.password);
  const isPasswordMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm;
  return (
    <div className="space-y-6 border-b pb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">계정 정보</h3>
          <p className="text-sm text-gray-600">
            {isEmailSignup
              ? '이메일 가입 시 설정한 계정 정보입니다'
              : '로그인에 사용할 비밀번호를 설정해주세요'}
          </p>
        </div>
      </div>

      {/* 가입 방식 안내 */}
      <div className={`p-4 border rounded-md ${isEmailSignup ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start gap-3">
          <ShieldCheck className={`w-5 h-5 mt-0.5 ${isEmailSignup ? 'text-blue-600' : 'text-yellow-600'}`} />
          <div>
            <p className={`text-sm font-medium ${isEmailSignup ? 'text-blue-900' : 'text-yellow-900'}`}>
              {isEmailSignup ? '이메일 가입' : '소셜 로그인 가입'}
            </p>
            <p className={`text-xs mt-1 ${isEmailSignup ? 'text-blue-700' : 'text-yellow-700'}`}>
              {isEmailSignup
                ? '이메일과 비밀번호는 회원가입 시 설정되어 수정할 수 없습니다.'
                : '소셜 로그인으로 가입하셨습니다. 보안을 위해 비밀번호를 설정해주세요.'}
            </p>
          </div>
        </div>
      </div>

      {/* 이메일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이메일 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="example@email.com"
            disabled={isEmailSignup}
            className={`w-full pl-10 pr-10 py-3 border rounded-md outline-none transition-colors ${
              isEmailSignup ? 'bg-gray-50 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-primary-500'
            } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {isEmailValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {isEmailSignup
            ? '회원가입 시 설정한 이메일입니다'
            : '소셜 로그인 시 사용한 이메일입니다'}
        </p>
      </div>

      {/* 비밀번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 <span className="text-red-500">*</span>
          {isEmailSignup && <span className="ml-2 text-xs text-gray-500">(설정됨)</span>}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={isEmailSignup ? '••••••••' : formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder={isEmailSignup ? '설정된 비밀번호' : '8자 이상, 영문+숫자 조합'}
            disabled={isEmailSignup}
            className={`w-full pl-10 pr-12 py-3 border rounded-md outline-none transition-colors ${
              isEmailSignup
                ? 'bg-gray-50 cursor-not-allowed border-gray-300'
                : errors.password
                ? 'border-red-500 focus:ring-2 focus:ring-primary-500'
                : 'border-gray-300 focus:ring-2 focus:ring-primary-500'
            }`}
          />
          {!isEmailSignup && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}

        {/* 비밀번호 강도 표시 - 소셜 로그인 사용자만 */}
        {!isEmailSignup && formData.password && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              {isPasswordValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={isPasswordValid ? 'text-green-600' : 'text-red-600'}>
                8자 이상, 영문과 숫자 조합
              </span>
            </div>
          </div>
        )}

        {/* 이메일 가입자 안내 */}
        {isEmailSignup && (
          <p className="mt-1 text-xs text-gray-500">
            회원가입 시 설정한 비밀번호입니다 (수정 불가)
          </p>
        )}
      </div>

      {/* 비밀번호 확인 - 소셜 로그인 사용자만 */}
      {!isEmailSignup && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={formData.passwordConfirm}
              onChange={(e) => onChange('passwordConfirm', e.target.value)}
              placeholder="비밀번호 재입력"
              className={`w-full pl-10 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {isPasswordMatch && (
              <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {errors.passwordConfirm && (
            <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
          )}

          {/* 비밀번호 일치 여부 */}
          {formData.passwordConfirm && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {isPasswordMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">비밀번호가 일치합니다</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">비밀번호가 일치하지 않습니다</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 보안 안내 */}
      {!isEmailSignup && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            🔒 <strong>보안을 위해</strong> 다른 사이트에서 사용하지 않는 비밀번호를 설정해주세요.
            비밀번호는 암호화되어 안전하게 저장됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
