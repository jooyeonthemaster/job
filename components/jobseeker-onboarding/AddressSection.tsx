// 주소 섹션 (주소 검색 + 상세주소)

import { type JobseekerOnboardingFormData } from '@/types/jobseeker-onboarding.types';

type AddressSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
  onAddressSearch: () => void;
};

export default function AddressSection({ formData, errors, onChange, onAddressSearch }: AddressSectionProps) {
  return (
    <div className="border-b pb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">주소</h2>
      <div className="space-y-4">
        <div id="address">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.address}
              readOnly
              placeholder="주소를 검색하세요"
              className={`flex-1 px-4 py-2 border rounded-lg bg-gray-50 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={onAddressSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium whitespace-nowrap"
            >
              주소검색
            </button>
          </div>
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>

        <div>
          <input
            type="text"
            value={formData.addressDetail}
            onChange={(e) => onChange('addressDetail', e.target.value)}
            placeholder="나머지 주소를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
