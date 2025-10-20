// 카카오 주소 검색 컴포넌트 (Daum Postcode API)

'use client';

import { MapPin, Search } from 'lucide-react';
import { BaseFormFieldProps } from '@/types/form-ui.types';

export interface AddressSearchInputProps extends Omit<BaseFormFieldProps, 'helperText'> {
  value: string;
  detailValue?: string;
  onChange: (address: string) => void;
  onDetailChange?: (detail: string) => void;
  placeholder?: string;
  detailPlaceholder?: string;
  showDetailInput?: boolean;
  showPreview?: boolean;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress?: string;
          jibunAddress?: string;
        }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export default function AddressSearchInput({
  label = '주소',
  value,
  detailValue = '',
  onChange,
  onDetailChange,
  placeholder = '주소 검색 버튼을 클릭하세요',
  detailPlaceholder = '동, 호수 등 상세 주소를 입력하세요',
  error,
  required,
  disabled,
  showDetailInput = true,
  showPreview = true,
  className = '',
}: AddressSearchInputProps) {
  const handleSearchAddress = () => {
    if (typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: { roadAddress?: string; jibunAddress?: string }) {
          // 도로명 주소 우선, 없으면 지번 주소
          const fullAddress = data.roadAddress || data.jibunAddress || '';
          onChange(fullAddress);
        },
      }).open();
    } else {
      alert('주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const hasError = !!error;

  return (
    <div className={className}>
      {/* 기본 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              value={value}
              readOnly
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                bg-gray-50 cursor-not-allowed
                ${hasError ? 'border-red-500' : 'border-gray-300'}
                ${disabled ? 'opacity-50' : ''}
              `}
            />
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={disabled}
            className={`
              px-6 py-2 bg-primary-600 text-white rounded-lg
              hover:bg-primary-700 transition-colors font-medium
              whitespace-nowrap flex items-center gap-2
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Search className="w-5 h-5" />
            주소 검색
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* 상세 주소 (선택적) */}
      {showDetailInput && onDetailChange && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 주소 <span className="text-gray-500">(선택)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={detailValue}
              onChange={(e) => onDetailChange(e.target.value)}
              placeholder={detailPlaceholder}
              disabled={disabled}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'}
              `}
            />
          </div>
        </div>
      )}

      {/* 전체 주소 미리보기 (선택적) */}
      {showPreview && value && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">입력된 전체 주소</p>
          <p className="text-sm text-blue-800">
            {value}
            {detailValue && ` ${detailValue}`}
          </p>
        </div>
      )}
    </div>
  );
}
