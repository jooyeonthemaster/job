// 언어 능력 섹션 (한국어 + 기타 언어)

import { Plus, X } from 'lucide-react';
import {
  type JobseekerOnboardingFormData,
  KOREAN_LEVELS,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY,
} from '@/types/jobseeker-onboarding.types';

type LanguageSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onChange: (field: keyof JobseekerOnboardingFormData, value: any) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
  onUpdateLanguage: (index: number, field: 'language' | 'proficiency', value: string) => void;
};

export default function LanguageSection({
  formData,
  errors,
  onChange,
  onAddLanguage,
  onRemoveLanguage,
  onUpdateLanguage,
}: LanguageSectionProps) {
  return (
    <div className="border-b pb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">언어 능력</h2>

      {/* 한국어 */}
      <div id="koreanLevel" className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          한국어 능력 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.koreanLevel}
          onChange={(e) => onChange('koreanLevel', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.koreanLevel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">선택하세요</option>
          {KOREAN_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.koreanLevel && <p className="mt-1 text-sm text-red-500">{errors.koreanLevel}</p>}
      </div>

      {/* 한국어 외 어학 능력 */}
      <div id="otherLanguages">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          한국어 외 구사 가능 언어 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.otherLanguages.map((lang, index) => (
            <div key={index} className="flex gap-3">
              <select
                value={lang.language}
                onChange={(e) => onUpdateLanguage(index, 'language', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">언어 선택</option>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={lang.proficiency}
                onChange={(e) => onUpdateLanguage(index, 'proficiency', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">숙련도 선택</option>
                {LANGUAGE_PROFICIENCY.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.otherLanguages.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveLanguage(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddLanguage}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            언어 추가
          </button>
        </div>
        {errors.otherLanguages && <p className="mt-2 text-sm text-red-500">{errors.otherLanguages}</p>}
      </div>
    </div>
  );
}
