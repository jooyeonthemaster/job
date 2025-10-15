'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface ForeignerNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  verified: boolean;
  onVerify: () => void;
  error?: string;
  disabled?: boolean;
}

export default function ForeignerNumberInput({
  value,
  onChange,
  verified,
  onVerify,
  error,
  disabled = false,
}: ForeignerNumberInputProps) {
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');

  // value prop이 변경될 때 parts 업데이트
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 2) {
        setPart1(parts[0]);
        setPart2(parts[1]);
      } else if (parts.length === 1) {
        const numbers = value.replace(/-/g, '');
        if (numbers.length > 6) {
          setPart1(numbers.substring(0, 6));
          setPart2(numbers.substring(6, 13));
        } else {
          setPart1(numbers);
          setPart2('');
        }
      }
    }
  }, [value]);

  // parts가 변경될 때 전체 값 업데이트
  const updateNumber = (p1: string, p2: string) => {
    if (p1 && p2) {
      onChange(`${p1}-${p2}`);
    } else {
      onChange(p1);
    }
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 6);
    setPart1(newValue);
    updateNumber(newValue, part2);

    // 자동으로 다음 필드로 포커스 이동
    if (newValue.length === 6) {
      const nextInput = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 7);
    setPart2(newValue);
    updateNumber(part1, newValue);
  };

  const isNumberComplete = part1.length === 6 && part2.length === 7;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        외국인등록번호 <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Part 1: 앞 6자리 (생년월일) */}
        <input
          type="text"
          inputMode="numeric"
          value={part1}
          onChange={handlePart1Change}
          disabled={disabled || verified}
          placeholder="123456"
          maxLength={6}
          className={`w-32 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        />

        <span className="text-gray-400">-</span>

        {/* Part 2: 뒤 7자리 */}
        <input
          type="text"
          inputMode="numeric"
          value={part2}
          onChange={handlePart2Change}
          disabled={disabled || verified}
          placeholder="1234567"
          maxLength={7}
          className={`w-36 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        />

        {/* 외국인 실명인증 버튼 */}
        <button
          type="button"
          onClick={onVerify}
          disabled={!isNumberComplete || verified || disabled}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2
            ${
              verified
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
            }`}
        >
          {verified ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              인증완료
            </>
          ) : (
            '외국인 실명인증'
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {!verified && !error && (
        <p className="mt-2 text-sm text-gray-500">외국인등록번호 13자리를 입력해주세요.</p>
      )}

      {verified && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          외국인 실명인증이 완료되었습니다.
        </p>
      )}
    </div>
  );
}
