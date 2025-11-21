'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FileText, Building2, Calendar, User, Upload, CheckCircle2 } from 'lucide-react';
import { validateBusinessNumber } from '@/lib/supabase/company-types';

interface Props {
  formData: {
    registrationNumber: string;
    registrationDocument?: File;
    name: string;
    nameEn?: string;
    establishmentYear: string;
    ceoName: string;
  };
  onChange: (field: string, value: string | File | undefined) => void;
  errors: Record<string, string>;
}

export default function Section1BusinessInfo({ formData, onChange, errors }: Props) {
  const [registrationDocumentName, setRegistrationDocumentName] = useState<string>('');

  // 사업자등록번호 입력 처리 (숫자만)
  const handleRegistrationNumberChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 10) {
      onChange('registrationNumber', numbersOnly);
    }
  };

  // 사업자등록증 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      // 파일 형식 체크 (PDF, JPG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('PDF, JPG, PNG 파일만 업로드 가능합니다.');
        return;
      }

      onChange('registrationDocument', file);
      setRegistrationDocumentName(file.name);
    }
  };

  // 개업일자 선택 처리
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      onChange('establishmentYear', formatted);
    } else {
      onChange('establishmentYear', '');
    }
  };

  // 문자열을 Date 객체로 변환
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const isBusinessNumberValid = formData.registrationNumber.length === 10 && validateBusinessNumber(formData.registrationNumber);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">사업자 정보</h3>
          <p className="text-sm text-gray-600">기업의 기본 사업자 정보를 입력해주세요</p>
        </div>
      </div>

      {/* 사업자등록번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사업자등록번호 (세금계산 발행시 기록 및 등록증 필요) <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            inputMode="numeric"
            value={formData.registrationNumber}
            onChange={(e) => handleRegistrationNumberChange(e.target.value)}
            placeholder="1234567890"
            className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={10}
          />
          {isBusinessNumberValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
        {errors.registrationNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 숫자만 입력 가능 (하이픈 없이 10자리)
          </p>
          <p className={`text-xs font-medium ${
            formData.registrationNumber.length === 10 ? 'text-green-600' : 'text-gray-400'
          }`}>
            {formData.registrationNumber.length}/10
          </p>
        </div>
      </div>

      {/* 사업자등록증 업로드 (선택) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사업자등록증 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <input
            type="file"
            id="registrationDocument"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="registrationDocument"
            className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer ${
              errors.registrationDocument ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              {registrationDocumentName ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-900 font-medium">{registrationDocumentName}</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">사업자등록증을 업로드해주세요</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG 파일 (최대 10MB)</p>
                </>
              )}
            </div>
          </label>
        </div>
        {errors.registrationDocument && (
          <p className="mt-1 text-sm text-red-600">{errors.registrationDocument}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">💡 세금계산서 발행 시 필요합니다</p>
      </div>

      {/* 기업명 (한글) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기업명 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="주식회사 글로벌탤런트"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* 기업명 (영문) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기업명 (영문) <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.nameEn || ''}
            onChange={(e) => onChange('nameEn', e.target.value)}
            placeholder="Bridge World Inc."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* 개업일자 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          개업일자 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <DatePicker
            selected={parseDate(formData.establishmentYear)}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            maxDate={new Date()}
            minDate={new Date(1900, 0, 1)}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={150}
            scrollableYearDropdown
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.establishmentYear ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.establishmentYear && (
          <p className="mt-1 text-sm text-red-600">{errors.establishmentYear}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">사업자등록증상의 개업년월일을 입력해주세요.</p>
      </div>

      {/* 대표자명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대표자명 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.ceoName}
            onChange={(e) => onChange('ceoName', e.target.value)}
            placeholder="홍길동"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.ceoName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.ceoName && (
          <p className="mt-1 text-sm text-red-600">{errors.ceoName}</p>
        )}
      </div>
    </div>
  );
}
