// 채용공고 급여 정보 섹션 컴포넌트

import { JobFormData } from '@/types/job-form.types';

interface SalarySectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function SalarySection({ formData, onUpdate }: SalarySectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">급여 정보</h2>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 연봉 (만원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => onUpdate('salaryMin', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 6000"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 연봉 (만원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => onUpdate('salaryMax', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 9000"
              min="0"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.salaryNegotiable}
            onChange={(e) => onUpdate('salaryNegotiable', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-sm text-gray-700">협의 가능</span>
        </label>
      </div>
    </div>
  );
}






