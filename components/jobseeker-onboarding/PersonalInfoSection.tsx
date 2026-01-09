// 개인 정보 섹션 (성별 - 선택)
// 2026-01-09 간소화: 필수 → 선택 변경

import { type JobseekerOnboardingFormData } from '@/types/jobseeker-onboarding.types';

type PersonalInfoSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: string) => void;
};

export default function PersonalInfoSection({ formData, errors, onChange }: PersonalInfoSectionProps) {
  return (
    <div className="pb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">개인 정보</h3>
      <div>
        {/* 성별 (선택) */}
        <div id="gender">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별 <span className="text-gray-400">(선택)</span>
          </label>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-gray-700">남성</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-gray-700">여성</span>
            </label>
          </div>
          {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
        </div>
      </div>
    </div>
  );
}
