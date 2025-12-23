// 3개 입력칸 전화번호 컴포넌트 (010-1234-5678 형식)

'use client';

import { useState, useEffect, useRef } from 'react';
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
  // ✅ 내부 상태 관리 - value prop에서 초기값 계산
  const [part1, setPart1] = useState(() => (value || '').slice(0, 3));
  const [part2, setPart2] = useState(() => (value || '').slice(3, 7));
  const [part3, setPart3] = useState(() => (value || '').slice(7, 11));

  // ✅ 이전 value를 추적하여 외부 변경 감지
  const prevValueRef = useRef<string>('');
  const isInitialMount = useRef(true);

  // 🔍 디버깅: 렌더링 시 값 확인
  console.log('🔍 [PhoneInput] render:', {
    value,
    part1,
    part2,
    part3,
    isInitialMount: isInitialMount.current,
    prevValue: prevValueRef.current
  });

  // 외부 value 변경 시 내부 상태 동기화
  useEffect(() => {
    const phone = value || '';

    // 🔍 디버깅: useEffect 실행 확인
    console.log('🔍 [PhoneInput] useEffect:', {
      value,
      phone,
      isInitialMount: isInitialMount.current,
      prevValue: prevValueRef.current,
      willSync: isInitialMount.current || phone !== prevValueRef.current
    });

    // 초기 마운트이거나, 외부에서 value가 변경되었을 때만 동기화
    if (isInitialMount.current || phone !== prevValueRef.current) {
      console.log('🔍 [PhoneInput] 동기화 실행:', {
        newPart1: phone.slice(0, 3),
        newPart2: phone.slice(3, 7),
        newPart3: phone.slice(7, 11)
      });
      setPart1(phone.slice(0, 3));
      setPart2(phone.slice(3, 7));
      setPart3(phone.slice(7, 11));
      prevValueRef.current = phone;
      isInitialMount.current = false;
    }
  }, [value]);

  // 각 부분 입력 처리 (내부 입력 시 prevValueRef도 업데이트하여 useEffect 동기화 방지)
  const handlePhonePart1Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 3) {
      setPart1(numbersOnly);
      const newCombined = numbersOnly + part2 + part3;
      prevValueRef.current = newCombined;
      onChange(newCombined);
    }
  };

  const handlePhonePart2Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      setPart2(numbersOnly);
      const newCombined = part1 + numbersOnly + part3;
      prevValueRef.current = newCombined;
      onChange(newCombined);
    }
  };

  const handlePhonePart3Change = (inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      setPart3(numbersOnly);
      const newCombined = part1 + part2 + numbersOnly;
      prevValueRef.current = newCombined;
      onChange(newCombined);
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
            value={part1}
            onChange={(e) => handlePhonePart1Change(e.target.value)}
            placeholder={placeholder1}
            disabled={disabled}
            maxLength={3}
            className={`
              w-full pl-10 pr-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors text-gray-900
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
            value={part2}
            onChange={(e) => handlePhonePart2Change(e.target.value)}
            placeholder={placeholder2}
            disabled={disabled}
            maxLength={4}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors text-gray-900
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
            value={part3}
            onChange={(e) => handlePhonePart3Change(e.target.value)}
            placeholder={placeholder3}
            disabled={disabled}
            maxLength={4}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors text-gray-900
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
