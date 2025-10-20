// 3개 입력칸 전화번호 컴포넌트 (010-1234-5678 형식)

'use client';

import { Phone } from 'lucide-react';
import { BaseFormFieldProps } from '@/types/form-ui.types';

export interface PhoneInputProps extends Omit<BaseFormFieldProps, 'helperText'> {
  value: string; // "01012345678" 형식 (숫자만, 11자리)
  onChange: (value: string) => void;
  placeholder1?: string;
  placeholder2?: string;
  placeholder3?: string;
}

export default function PhoneInput({
  label = '전화번호',
  value,
  onChange,
  placeholder1 = '010',
  placeholder2 = '1234',
  placeholder3 = '5678',
  error,
  required,
  disabled,
  className = '',
}: PhoneInputProps) {
  // 전화번호를 3부분으로 분리
  const getPhoneParts = () => {
    const phone = value || '';
    return {
      part1: phone.slice(0, 3),
      part2: phone.slice(3, 7),
      part3: phone.slice(7, 11),
    };
  };

  const phoneParts = getPhoneParts();

  // 각 부분 입력 처리
  const handlePhonePart1Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 3) {
      const newPhone = numbersOnly + phoneParts.part2 + phoneParts.part3;
      onChange(newPhone);
    }
  };

  const handlePhonePart2Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + numbersOnly + phoneParts.part3;
      onChange(newPhone);
    }
  };

  const handlePhonePart3Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + phoneParts.part2 + numbersOnly;
      onChange(newPhone);
    }
  };

  const hasError = !!error;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-2">
        {/* 첫 번째 입력칸 (010) */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
          <input
            type="tel"
            inputMode="numeric"
            value={phoneParts.part1}
            onChange={(e) => handlePhonePart1Change(e.target.value)}
            placeholder={placeholder1}
            disabled={disabled}
            maxLength={3}
            className={`
              w-full pl-10 pr-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors
              ${hasError ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
            `}
          />
        </div>

        <span className="text-gray-400 font-bold">-</span>

        {/* 두 번째 입력칸 (1234) */}
        <div className="flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={phoneParts.part2}
            onChange={(e) => handlePhonePart2Change(e.target.value)}
            placeholder={placeholder2}
            disabled={disabled}
            maxLength={4}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors
              ${hasError ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
            `}
          />
        </div>

        <span className="text-gray-400 font-bold">-</span>

        {/* 세 번째 입력칸 (5678) */}
        <div className="flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={phoneParts.part3}
            onChange={(e) => handlePhonePart3Change(e.target.value)}
            placeholder={placeholder3}
            disabled={disabled}
            maxLength={4}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors
              ${hasError ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
            `}
          />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
