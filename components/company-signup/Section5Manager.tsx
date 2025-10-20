'use client';

import { useState } from 'react';
import { UserCircle, Briefcase, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { validateEmail, validatePassword } from '@/lib/supabase/company-types';

interface Props {
  formData: {
    managerDepartment: string;
    managerName: string;
    managerEmail: string; // ❌ 사용 안 함 (삭제 예정)
    managerPosition: string;
    managerPhone?: string;
    email: string; // ✅ 계정 이메일 (= 담당자 이메일)
    password?: string; // ✅ 비밀번호
    passwordConfirm?: string; // ✅ 비밀번호 확인
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  isEmailSignup: boolean; // ✅ 이메일 가입인지 소셜 로그인인지
}

export default function Section5Manager({ formData, onChange, errors, isEmailSignup }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 전화번호를 3부분으로 분리
  const getPhoneParts = () => {
    const phone = formData.managerPhone || '';
    return {
      part1: phone.slice(0, 3),
      part2: phone.slice(3, 7),
      part3: phone.slice(7, 11),
    };
  };

  const phoneParts = getPhoneParts();

  // 각 부분 입력 처리
  const handlePhonePart1Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 3) {
      const newPhone = numbersOnly + phoneParts.part2 + phoneParts.part3;
      onChange('managerPhone', newPhone);
    }
  };

  const handlePhonePart2Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + numbersOnly + phoneParts.part3;
      onChange('managerPhone', newPhone);
    }
  };

  const handlePhonePart3Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + phoneParts.part2 + numbersOnly;
      onChange('managerPhone', newPhone);
    }
  };

  // 검증 상태
  const isEmailValid = formData.email && validateEmail(formData.email);
  const isPasswordValid = formData.password && validatePassword(formData.password);
  const isPasswordMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">담당자 정보</h3>
          <p className="text-sm text-gray-600">채용 담당자 정보를 입력해주세요</p>
        </div>
      </div>

      {/* ✅ 가입 방식 안내 */}
      <div className={`p-4 border rounded-xl ${isEmailSignup ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
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

      {/* ✅ 담당자 이메일 (= 계정 이메일) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자 이메일 (로그인 계정) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="manager@company.com"
            disabled={isEmailSignup} // 이메일 가입은 disabled, 소셜 로그인은 editable
            className={`w-full pl-10 pr-10 py-3 border rounded-xl outline-none transition-colors ${
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
            ? '회원가입 시 설정한 이메일 (로그인 및 채용 문의용)'
            : '소셜 로그인 이메일 (로그인 및 채용 문의용)'}
        </p>
      </div>

      {/* ✅ 비밀번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 <span className="text-red-500">*</span>
          {isEmailSignup && <span className="ml-2 text-xs text-gray-500">(설정됨)</span>}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={isEmailSignup ? '••••••••' : formData.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder={isEmailSignup ? '설정된 비밀번호' : '8자 이상, 영문+숫자 조합'}
            disabled={isEmailSignup}
            className={`w-full pl-10 pr-12 py-3 border rounded-xl outline-none transition-colors ${
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

        {/* 비밀번호 강도 표시 - 소셜 로그인만 */}
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

      {/* ✅ 비밀번호 확인 - 소셜 로그인만 */}
      {!isEmailSignup && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={formData.passwordConfirm || ''}
              onChange={(e) => onChange('passwordConfirm', e.target.value)}
              placeholder="비밀번호 재입력"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
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

      {/* ✅ 보안 안내 - 소셜 로그인만 */}
      {!isEmailSignup && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            🔒 <strong>보안을 위해</strong> 다른 사이트에서 사용하지 않는 비밀번호를 설정해주세요.
            비밀번호는 암호화되어 안전하게 저장됩니다.
          </p>
        </div>
      )}

      {/* 담당 부서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당 부서 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerDepartment}
            onChange={(e) => onChange('managerDepartment', e.target.value)}
            placeholder="예: 인사팀, HR팀"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerDepartment ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerDepartment && (
          <p className="mt-1 text-sm text-red-600">{errors.managerDepartment}</p>
        )}
      </div>

      {/* 담당자명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자명 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => onChange('managerName', e.target.value)}
            placeholder="홍길동"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerName && (
          <p className="mt-1 text-sm text-red-600">{errors.managerName}</p>
        )}
      </div>

      {/* 직급/직책 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          직급/직책 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerPosition || ''}
            onChange={(e) => onChange('managerPosition', e.target.value)}
            placeholder="예: 과장, 매니저"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerPosition ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerPosition && (
          <p className="mt-1 text-sm text-red-600">{errors.managerPosition}</p>
        )}
      </div>

      {/* 담당자 연락처 (3개 입력칸) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자 연락처 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part1}
              onChange={(e) => handlePhonePart1Change(e.target.value)}
              placeholder="010"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={3}
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part2}
              onChange={(e) => handlePhonePart2Change(e.target.value)}
              placeholder="1234"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part3}
              onChange={(e) => handlePhonePart3Change(e.target.value)}
              placeholder="5678"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
          </div>
        </div>
        {errors.managerPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.managerPhone}</p>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-700">
          <strong>담당자 정보</strong>는 채용 공고와 관련된 문의 시 사용됩니다. 정확한 정보를 입력해주세요.
        </p>
      </div>
    </div>
  );
}
