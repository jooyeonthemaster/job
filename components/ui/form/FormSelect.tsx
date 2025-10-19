'use client';

import type { BaseFormFieldProps, SelectOption } from '@/types/form-ui.types';

interface FormSelectProps extends BaseFormFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  name?: string;
}

/**
 * 재사용 가능한 폼 Select 컴포넌트
 *
 * @사용처
 * - 기업 온보딩: 기업 형태, 기업 규모, 업태, 업종 등
 * - 개인 회원 온보딩: 언어 능력, 카테고리 선택, 고용형태 등
 * - 채용공고 작성: 한국어/영어 수준, 직무, 고용 형태 등
 *
 * @특징
 * - 왼쪽 아이콘 지원
 * - 에러 상태 스타일
 * - 필수 필드 표시
 * - placeholder 옵션 자동 추가
 */
export default function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  error,
  required,
  helperText,
  disabled,
  name,
  className = '',
}: FormSelectProps) {
  const hasError = !!error;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* 왼쪽 아이콘 */}
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
        )}

        {/* Select */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          name={name}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            outline-none transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            appearance-none bg-white
            ${Icon ? 'pl-10' : ''}
            ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
        >
          {/* Placeholder 옵션 */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* 옵션 목록 */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* 드롭다운 화살표 (커스텀) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
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
