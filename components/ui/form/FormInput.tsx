'use client';

import { CheckCircle2 } from 'lucide-react';
import type { BaseFormFieldProps, InputType, InputMode } from '@/types/form-ui.types';

interface FormInputProps extends BaseFormFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: InputType;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  maxLength?: number;
  inputMode?: InputMode;
  showValidation?: boolean; // 검증 성공 시 CheckCircle 표시
  name?: string;
}

/**
 * 재사용 가능한 폼 Input 컴포넌트
 *
 * @사용처
 * - 기업 온보딩: 사업자등록번호, 기업명, 대표번호, 홈페이지 등
 * - 개인 회원 온보딩: 이름, 한 줄 소개, 희망 직무 등
 * - 채용공고 작성: 공고 제목, 담당자 정보 등
 *
 * @특징
 * - 왼쪽 아이콘 지원
 * - 에러 상태 스타일
 * - 검증 성공 표시
 * - 필수 필드 표시
 */
export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  required,
  helperText,
  disabled,
  maxLength,
  inputMode,
  showValidation,
  name,
  className = '',
}: FormInputProps) {
  const hasError = !!error;
  const isValid = showValidation && value && !hasError;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* 왼쪽 아이콘 */}
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}

        {/* Input */}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          name={name}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            outline-none transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${Icon ? 'pl-10' : ''}
            ${isValid ? 'pr-10' : ''}
            ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
        />

        {/* 검증 성공 아이콘 */}
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
        )}
      </div>

      {/* 에러 메시지 */}
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* 도움말 텍스트 */}
      {helperText && !hasError && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
