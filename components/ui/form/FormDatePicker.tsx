'use client';

import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { BaseFormFieldProps } from '@/types/form-ui.types';

interface FormDatePickerProps extends BaseFormFieldProps {
  value: string; // "YYYY-MM-DD" 형식
  onChange: (dateString: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  name?: string;
}

/**
 * 재사용 가능한 폼 DatePicker 컴포넌트
 *
 * @사용처
 * - 기업 온보딩: 개업일자
 * - 채용공고 작성: 모집 마감일
 *
 * @특징
 * - react-datepicker 기반
 * - "YYYY-MM-DD" 형식 자동 변환
 * - 년/월 드롭다운 지원
 * - Calendar 아이콘
 */
export default function FormDatePicker({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  helperText,
  disabled,
  minDate,
  maxDate,
  name,
  className = '',
}: FormDatePickerProps) {
  const hasError = !!error;

  // 문자열을 Date 객체로 변환
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  // Date 객체를 "YYYY-MM-DD" 문자열로 변환
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date: Date | null) => {
    onChange(formatDate(date));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Calendar 아이콘 */}
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />

        {/* DatePicker */}
        <DatePicker
          selected={parseDate(value)}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText={placeholder || '날짜를 선택하세요'}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          name={name}
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            outline-none transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
        />
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
