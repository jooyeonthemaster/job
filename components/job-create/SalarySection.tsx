// 채용공고 급여 정보 섹션 컴포넌트

import { Info } from 'lucide-react';
import { JobFormData } from '@/types/job-form.types';

interface SalarySectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function SalarySection({ formData, onUpdate }: SalarySectionProps) {
  return (
    <div className="bg-white rounded-md p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">급여 정보</h2>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 연봉 (만원)
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
              최대 연봉 (만원)
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

        {/* 최저임금 안내 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              주 40시간 기준 최저연봉 약 25,155,240원 (2025년 최저시급 10,030원)
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2 ml-6">
            당사는 최저 임금법을 준수하며, 최저임금 미만의 공고는 강제 마감 및 행정 처분을 받을 수 있습니다.
          </p>
          <a
            href="https://www.minimumwage.go.kr/index.jsp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 hover:underline ml-6"
          >
            최저임금제도 안내
          </a>
        </div>
      </div>
    </div>
  );
}















