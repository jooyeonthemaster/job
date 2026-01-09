// 채용공고 비자 및 언어 요구사항 섹션 컴포넌트

import LanguageLevelSelect from '@/components/ui/form/LanguageLevelSelect';
import { JobFormData, LanguageLevel } from '@/types/job-form.types';

interface LanguageSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function LanguageSection({ formData, onUpdate }: LanguageSectionProps) {
  return (
    <div className="bg-white rounded-md p-6 shadow-sm">
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

        {/* 채용 대상 (국적) */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            채용 대상
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.forKorean}
                onChange={(e) => onUpdate('forKorean', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">내국인 채용</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.forForeigner}
                onChange={(e) => onUpdate('forForeigner', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">외국인 채용</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * 두 항목을 모두 선택하면 국적 무관으로 표시됩니다.
          </p>
        </div>

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















