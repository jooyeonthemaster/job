'use client';

import { useState, useEffect } from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  verified: boolean;
  onVerify: () => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  verified,
  onVerify,
  error,
  disabled = false,
}: PhoneInputProps) {
  const [part1, setPart1] = useState('010');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');

  // value prop이 변경될 때 parts 업데이트
  useEffect(() => {
    if (value) {
      const numbers = value.replace(/-/g, '');
      if (numbers.length >= 3) {
        setPart1(numbers.substring(0, 3));
      }
      if (numbers.length >= 7) {
        setPart2(numbers.substring(3, 7));
        setPart3(numbers.substring(7, 11));
      } else if (numbers.length > 3) {
        setPart2(numbers.substring(3));
        setPart3('');
      }
    }
  }, [value]);

  // parts가 변경될 때 전체 값 업데이트
  const updatePhone = (p1: string, p2: string, p3: string) => {
    const full = `${p1}${p2}${p3}`;
    onChange(full);
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPart1 = e.target.value;
    setPart1(newPart1);
    updatePhone(newPart1, part2, part3);
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPart2(newValue);
    updatePhone(part1, newValue, part3);
  };

  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPart3(newValue);
    updatePhone(part1, part2, newValue);
  };

  const isPhoneComplete = part1.length === 3 && part2.length === 4 && part3.length === 4;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Phone className="w-4 h-4" />
        휴대폰 번호 <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Part 1: 010, 011, 016, 017, 018, 019 선택 */}
        <select
          value={part1}
          onChange={handlePart1Change}
          disabled={disabled || verified}
          className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="010">010</option>
          <option value="011">011</option>
          <option value="016">016</option>
          <option value="017">017</option>
          <option value="018">018</option>
          <option value="019">019</option>
        </select>

        <span className="text-gray-400">-</span>

        {/* Part 2: 중간 4자리 */}
        <input
          type="text"
          inputMode="numeric"
          value={part2}
          onChange={handlePart2Change}
          disabled={disabled || verified}
          placeholder="1234"
          maxLength={4}
          className={`w-24 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        />

        <span className="text-gray-400">-</span>

        {/* Part 3: 마지막 4자리 */}
        <input
          type="text"
          inputMode="numeric"
          value={part3}
          onChange={handlePart3Change}
          disabled={disabled || verified}
          placeholder="5678"
          maxLength={4}
          className={`w-24 px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        />

        {/* 본인인증 버튼 */}
        <button
          type="button"
          onClick={onVerify}
          disabled={!isPhoneComplete || verified || disabled}
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
            '본인인증'
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {!verified && !error && (
        <p className="mt-2 text-sm text-gray-500">※ 본인인증이 필요합니다.</p>
      )}

      {verified && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          본인인증이 완료되었습니다.
        </p>
      )}
    </div>
  );
}
