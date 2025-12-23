// =====================================================
// 국제 전화번호 입력 컴포넌트 (3개 분리 입력 필드)
// 작성일: 2025-01-20
// 기존 PhoneInput UI 구조 유지 + 국가 코드 선택 추가
// =====================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, ChevronDown, Search, Check } from 'lucide-react';
import {
  COUNTRY_PHONE_CODES,
  getCountryByCode,
  validatePhoneNumber,
  type CountryPhoneCode,
} from '@/constants/country-phone-codes';

export interface InternationalPhoneInputProps {
  countryCode: string;          // 국가 코드 (+82, +86 등)
  phoneNumber: string;          // 전화번호 (숫자만, 전체)
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function InternationalPhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  label = '전화번호',
  error,
  required = false,
  disabled = false,
  className = '',
}: InternationalPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 한국 전화번호 분리 (010-1234-5678)
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCountry = getCountryByCode(countryCode);
  const isKorea = countryCode === '+82';

  // phoneNumber prop이 변경될 때 parts 업데이트
  useEffect(() => {
    if (phoneNumber) {
      const numbers = phoneNumber.replace(/\D/g, '');
      if (isKorea) {
        // 한국: 3-4-4 분리
        setPart1(numbers.substring(0, 3) || '');
        setPart2(numbers.substring(3, 7) || '');
        setPart3(numbers.substring(7, 11) || '');
      } else {
        // 다른 국가: 전체 번호를 part1에만 저장
        setPart1(numbers);
        setPart2('');
        setPart3('');
      }
    } else {
      setPart1('');
      setPart2('');
      setPart3('');
    }
  }, [phoneNumber, isKorea]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 국가 선택 핸들러
  const handleCountrySelect = (country: CountryPhoneCode) => {
    onCountryCodeChange(country.code);
    onPhoneNumberChange(''); // 국가 변경 시 전화번호 초기화
    setIsOpen(false);
    setSearchQuery('');
  };

  // 한국 전화번호 입력 핸들러 (3개 분리)
  const handleKoreaPart1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPart1 = e.target.value;
    setPart1(newPart1);
    onPhoneNumberChange(newPart1 + part2 + part3);
  };

  const handleKoreaPart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPart2(newValue);
    onPhoneNumberChange(part1 + newValue + part3);
  };

  const handleKoreaPart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPart3(newValue);
    onPhoneNumberChange(part1 + part2 + newValue);
  };

  // 다른 국가 전화번호 입력 핸들러 (통합)
  const handleOtherCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, '');

    // 최대 길이 체크
    if (selectedCountry && numbers.length <= selectedCountry.maxLength) {
      onPhoneNumberChange(numbers);
    }
  };

  // 국가 목록 필터링
  const filteredCountries = COUNTRY_PHONE_CODES.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.nameEn.toLowerCase().includes(query) ||
      country.code.includes(query) ||
      country.iso2.toLowerCase().includes(query)
    );
  });

  return (
    <div className={className}>
      {/* 라벨 */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 국가 선택 (위에 배치) */}
      <div className="mb-3 relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-2.5 border rounded-lg
            hover:border-primary-400 transition-colors
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedCountry?.flag || '🌐'}</span>
            <span className="font-medium text-gray-900">
              {selectedCountry?.name || '국가 선택'}
            </span>
            <span className="text-sm text-gray-500">
              {selectedCountry?.code || '+82'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* 검색 */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="국가 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* 국가 목록 */}
            <div className="overflow-y-auto max-h-64">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.iso2}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
                      ${country.code === countryCode ? 'bg-primary-50' : ''}
                    `}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{country.name}</div>
                      <div className="text-sm text-gray-500">{country.nameEn}</div>
                    </div>
                    <span className="font-medium text-gray-600">{country.code}</span>
                    {country.code === countryCode && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 전화번호 입력 영역 */}
      {isKorea ? (
        // 한국: 3개 분리 입력 (010-1234-5678) - 기존 UI 유지
        <div className="flex items-center gap-2">
          <select
            value={part1}
            onChange={handleKoreaPart1Change}
            disabled={disabled}
            className={`px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">선택</option>
            <option value="010">010</option>
            <option value="011">011</option>
            <option value="016">016</option>
            <option value="017">017</option>
            <option value="018">018</option>
            <option value="019">019</option>
          </select>

          <span className="text-gray-400 font-bold">-</span>

          <input
            type="text"
            inputMode="numeric"
            value={part2}
            onChange={handleKoreaPart2Change}
            disabled={disabled}
            placeholder="1234"
            maxLength={4}
            className={`flex-1 px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}`}
          />

          <span className="text-gray-400 font-bold">-</span>

          <input
            type="text"
            inputMode="numeric"
            value={part3}
            onChange={handleKoreaPart3Change}
            disabled={disabled}
            placeholder="5678"
            maxLength={4}
            className={`flex-1 px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
      ) : (
        // 다른 국가: 단일 입력 필드 (국가별 형식 다름)
        <div className="w-full">
          <input
            type="tel"
            inputMode="numeric"
            value={phoneNumber}
            onChange={handleOtherCountryChange}
            placeholder={selectedCountry?.placeholder || '전화번호 입력'}
            disabled={disabled}
            className={`
              w-full px-4 py-3 border rounded-md
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              outline-none transition-colors
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
            `}
          />
        </div>
      )}

      {/* 전화번호 형식 안내 */}
      {selectedCountry && !error && !isKorea && (
        <p className="mt-1 text-xs text-gray-500">
          형식 예시: {selectedCountry.placeholder}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

