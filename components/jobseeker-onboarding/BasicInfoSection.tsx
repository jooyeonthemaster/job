// 기본 정보 섹션 (전화번호, 한줄소개 - 필수 / 나머지 선택)
// 2026-01-09 간소화: 핵심 필수 항목만 표시

import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, User } from 'lucide-react';
import {
  type JobseekerOnboardingFormData,
  NATIONALITIES,
  KOREA_NATIONALITY_CODE,
} from '@/types/jobseeker-onboarding.types';
import InternationalPhoneInput from '@/components/ui/form/InternationalPhoneInput';
import { getCountryByIso2 } from '@/constants/country-phone-codes';

type BasicInfoSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: string | string[]) => void;
};

export default function BasicInfoSection({ formData, errors, onChange }: BasicInfoSectionProps) {
  const [showOptional, setShowOptional] = useState(false);
  const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

  // 국적 변경 시 기본 국가 코드 자동 설정
  const handleNationalityChange = (nationality: string) => {
    onChange('nationality', nationality);

    // 국적에 맞는 기본 국가 코드 설정
    const country = getCountryByIso2(nationality);
    if (country && country.code !== formData.phoneCountryCode) {
      onChange('phoneCountryCode', country.code);
    }
  };

  return (
    <div className="border-b pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">핵심 정보</h2>
          <p className="text-sm text-gray-600">
            채용 지원에 필요한 필수 정보입니다
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 전화번호 (필수) */}
        <div id="phone">
          <InternationalPhoneInput
            countryCode={formData.phoneCountryCode}
            phoneNumber={formData.phone}
            onCountryCodeChange={(code) => onChange('phoneCountryCode', code)}
            onPhoneNumberChange={(number) => onChange('phone', number)}
            label="전화번호"
            required
            error={errors.phone || errors.phoneCountryCode}
          />
          {!errors.phone && !errors.phoneCountryCode && (
            <p className="mt-1 text-xs text-gray-500">
              채용 담당자가 연락할 수 있는 번호를 입력해주세요
            </p>
          )}
        </div>

        {/* 한줄소개 (필수) - 신규 필수화 */}
        <div id="headline">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            한줄소개 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.headline || ''}
            onChange={(e) => onChange('headline', e.target.value)}
            placeholder="예: 5년차 프론트엔드 개발자, 물류 전문가 등"
            maxLength={100}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.headline ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.headline && <p className="mt-1 text-sm text-red-500">{errors.headline}</p>}
          <p className="mt-1 text-xs text-gray-500">
            나를 가장 잘 표현하는 한줄 소개를 작성해주세요 (최대 100자)
          </p>
        </div>
      </div>

      {/* 선택 정보 토글 */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          추가 정보 입력 (선택사항)
        </button>
        <p className="text-xs text-gray-500 mt-1">
          지금 입력하지 않아도 나중에 마이페이지에서 입력할 수 있습니다
        </p>
      </div>

      {/* 선택 정보 섹션 */}
      {showOptional && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          <p className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            📝 선택 항목 - 나중에 마이페이지에서 입력해도 됩니다
          </p>

          {/* 국적 (선택) */}
          <div id="nationality">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              국적 <span className="text-gray-400">(선택)</span>
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => handleNationalityChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            >
              <option value="">국적을 선택해주세요</option>
              {NATIONALITIES.map((nat) => (
                <option key={nat.value} value={nat.value}>
                  {nat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 이름 (선택) */}
          <div id="fullName">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-gray-400">(선택)</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>

          {/* 외국인등록번호 (선택 - 외국인만 표시) */}
          {formData.nationality && !isKorean && (
            <div id="foreignerNumber">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                외국인등록번호 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="text"
                value={formData.foreignerNumber}
                onChange={(e) => onChange('foreignerNumber', e.target.value)}
                placeholder="123456-1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">
                한국 체류 외국인등록번호를 입력해주세요
              </p>
            </div>
          )}

          {/* 희망 근무 직군 (선택) */}
          <div id="desiredJobCategory">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              희망 근무 직군 <span className="text-gray-400">(선택)</span>
            </label>
            <input
              type="text"
              value={formData.desiredJobCategory}
              onChange={(e) => onChange('desiredJobCategory', e.target.value)}
              placeholder="예: 개발, 디자인, 마케팅, 영업, 기획 등"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
