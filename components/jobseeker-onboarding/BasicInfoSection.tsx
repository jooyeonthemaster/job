// 기본 정보 섹션 (국적, 이름, 전화번호, 외국인등록번호, 헤드라인)

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
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
};

export default function BasicInfoSection({ formData, errors, onChange }: BasicInfoSectionProps) {
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>
      <div className="space-y-6">
        {/* 국적 - 제일 먼저! */}
        <div id="nationality">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            국적 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.nationality}
            onChange={(e) => handleNationalityChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.nationality ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">국적을 선택해주세요</option>
            {NATIONALITIES.map((nat) => (
              <option key={nat.value} value={nat.value}>
                {nat.label}
              </option>
            ))}
          </select>
          {errors.nationality && <p className="mt-1 text-sm text-red-500">{errors.nationality}</p>}
          <p className="mt-1 text-xs text-gray-500">
            국적에 따라 입력해야 할 정보가 달라집니다
          </p>
        </div>

        {/* 이름 */}
        <div id="fullName">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="홍길동"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
        </div>

        {/* 전화번호 (모든 사용자 필수) */}
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
              국적에 맞는 전화번호를 입력해주세요
            </p>
          )}
        </div>

        {/* 외국인등록번호 (외국인만 필수) */}
        {!isKorean && (
          <div id="foreignerNumber">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              외국인등록번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.foreignerNumber}
              onChange={(e) => onChange('foreignerNumber', e.target.value)}
              placeholder="123456-1234567"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.foreignerNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.foreignerNumber && <p className="mt-1 text-sm text-red-500">{errors.foreignerNumber}</p>}
            <p className="mt-1 text-xs text-gray-500">
              한국 체류 외국인등록번호를 입력해주세요
            </p>
          </div>
        )}

        {/* 희망 근무 직군 */}
        <div id="desiredJobCategory">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            희망 근무 직군 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.desiredJobCategory}
            onChange={(e) => onChange('desiredJobCategory', e.target.value)}
            placeholder="예: 개발, 디자인, 마케팅, 영업, 기획 등"
            maxLength={50}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.desiredJobCategory ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.desiredJobCategory && <p className="mt-1 text-sm text-red-500">{errors.desiredJobCategory}</p>}
          <p className="mt-1 text-xs text-gray-500">
            희망하시는 직군을 간단하게 입력해주세요 (최대 50자)
          </p>
        </div>
      </div>
    </div>
  );
}
