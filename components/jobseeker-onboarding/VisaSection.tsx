// 비자 정보 섹션 (외국인만 표시)

import {
  type JobseekerOnboardingFormData,
  VISA_TYPES,
  KOREA_NATIONALITY_CODE,
} from '@/types/jobseeker-onboarding.types';

type VisaSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
};

export default function VisaSection({ formData, errors, onChange }: VisaSectionProps) {
  // 한국인이면 이 섹션을 렌더링하지 않음
  if (!formData.nationality || formData.nationality === KOREA_NATIONALITY_CODE) {
    return null;
  }

  return (
    <div className="border-b pb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">비자 정보</h2>
      <div id="visaType">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          비자 유형 (복수 선택 가능) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VISA_TYPES.map((visa) => (
            <label
              key={visa.value}
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                value={visa.value}
                checked={formData.visaType.includes(visa.value)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (e.target.checked) {
                    onChange('visaType', [...formData.visaType, value]);
                  } else {
                    onChange(
                      'visaType',
                      formData.visaType.filter((v) => v !== value)
                    );
                  }
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700">{visa.label}</span>
            </label>
          ))}
        </div>
        {errors.visaType && <p className="mt-2 text-sm text-red-500">{errors.visaType}</p>}
      </div>
    </div>
  );
}
