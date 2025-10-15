// 채용공고 비자 및 언어 요구사항 섹션 컴포넌트

import { JobFormData, LanguageLevel } from '@/types/job-form.types';
import { LANGUAGE_LEVEL_LABELS } from '@/constants/job-posting';

interface LanguageSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function LanguageSection({ formData, onUpdate }: LanguageSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">비자 및 언어 요구사항</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visaSponsorship}
            onChange={(e) => onUpdate('visaSponsorship', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">비자 스폰서십 가능</span>
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">한국어 수준</label>
            <select
              value={formData.koreanLevel}
              onChange={(e) => onUpdate('koreanLevel', e.target.value as LanguageLevel)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">영어 수준</label>
            <select
              value={formData.englishLevel}
              onChange={(e) => onUpdate('englishLevel', e.target.value as LanguageLevel)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}













