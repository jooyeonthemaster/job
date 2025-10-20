// 기본 정보 섹션 (국적, 이름, 전화번호/외국인등록번호, 헤드라인)

import {
  type JobseekerOnboardingFormData,
  NATIONALITIES,
  KOREA_NATIONALITY_CODE,
} from '@/types/jobseeker-onboarding.types';

type BasicInfoSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
};

export default function BasicInfoSection({ formData, errors, onChange }: BasicInfoSectionProps) {
  const isKorean = formData.nationality === KOREA_NATIONALITY_CODE;

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
            onChange={(e) => onChange('nationality', e.target.value)}
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

        <div className="grid lg:grid-cols-2 gap-6">
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

          {/* 한국인/외국인 구분 입력 */}
          {isKorean ? (
            // 한국인: 휴대폰 번호만 (3-4-4 형식)
            <div id="phone">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone.slice(0, 3)}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      if (numbersOnly.length <= 3) {
                        const newPhone = numbersOnly + formData.phone.slice(3);
                        onChange('phone', newPhone);
                      }
                    }}
                    placeholder="010"
                    maxLength={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone.slice(3, 7)}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      if (numbersOnly.length <= 4) {
                        const newPhone = formData.phone.slice(0, 3) + numbersOnly + formData.phone.slice(7);
                        onChange('phone', newPhone);
                      }
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone.slice(7, 11)}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      if (numbersOnly.length <= 4) {
                        const newPhone = formData.phone.slice(0, 7) + numbersOnly;
                        onChange('phone', newPhone);
                      }
                    }}
                    placeholder="5678"
                    maxLength={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              <p className="mt-1 text-xs text-gray-500">
                나중에 휴대폰 본인인증을 진행합니다
              </p>
            </div>
          ) : (
            // 외국인: 외국인등록번호만
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
            </div>
          )}
        </div>

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
