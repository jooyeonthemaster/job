// 채용공고 근무 조건 섹션 컴포넌트

import { JobFormData } from '@/types/job-form.types';

interface WorkConditionsSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function WorkConditionsSection({ formData, onUpdate }: WorkConditionsSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">근무 조건</h2>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">수습 기간</label>
            <input
              type="text"
              value={formData.probation}
              onChange={(e) => onUpdate('probation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 3개월"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">입사 예정일</label>
            <input
              type="text"
              value={formData.startDate}
              onChange={(e) => onUpdate('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 즉시 가능"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">근무 시간</label>
          <input
            type="text"
            value={formData.workHours}
            onChange={(e) => onUpdate('workHours', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="예: 자율 출퇴근제 (코어타임 10:00-16:00)"
          />
        </div>
      </div>
    </div>
  );
}






