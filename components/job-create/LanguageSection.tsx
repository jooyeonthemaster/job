// 채용공고 비자 및 언어 요구사항 섹션 컴포넌트

import LanguageLevelSelect from '@/components/ui/form/LanguageLevelSelect';
import { JobFormData, LanguageLevel } from '@/types/job-form.types';

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
          <LanguageLevelSelect
            language="korean"
            level={formData.koreanLevel as any}
            onLevelChange={(level) => onUpdate('koreanLevel', level as LanguageLevel)}
            label="한국어 수준"
          />

          <LanguageLevelSelect
            language="english"
            level={formData.englishLevel as any}
            onLevelChange={(level) => onUpdate('englishLevel', level as LanguageLevel)}
            label="영어 수준"
          />
        </div>
      </div>
    </div>
  );
}















