// 약관 동의 섹션 (필수 + 선택 약관)

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  type JobseekerOnboardingFormData,
} from '@/types/jobseeker-onboarding.types';
import {
  JOBSEEKER_TERMS,
  JOBSEEKER_REQUIRED_TERMS,
  JOBSEEKER_OPTIONAL_TERMS,
} from '@/constants/jobseeker-terms';

type TermsSectionProps = {
  formData: JobseekerOnboardingFormData;
  errors: Record<string, string>;
  onAgreeAll: (checked: boolean) => void;
  onIndividualAgree: (field: keyof JobseekerOnboardingFormData, checked: boolean) => void;
  onOpenTermModal: (termId: string) => void;
};

export default function TermsSection({
  formData,
  errors,
  onAgreeAll,
  onIndividualAgree,
  onOpenTermModal,
}: TermsSectionProps) {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // 약관 ID를 필드명으로 매핑
  const termFieldMap: Record<string, keyof JobseekerOnboardingFormData> = {
    privacy: 'agreePrivacyTerms',
    service: 'agreeServiceTerms',
    emailReceive: 'agreeEmailReceive',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">약관 동의</h2>
        {errors.terms && (
          <span className="text-sm text-red-600 flex items-center gap-1">
            <X className="w-4 h-4" />
            {errors.terms}
          </span>
        )}
      </div>

      {/* 전체 동의 */}
      <label className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-md bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors mb-4">
        <input
          type="checkbox"
          checked={formData.agreeAll}
          onChange={(e) => onAgreeAll(e.target.checked)}
          className="w-5 h-5 accent-primary-600"
        />
        <div className="flex items-center gap-2 flex-1">
          <CheckCircle2 className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">
            전체 동의 (필수 약관 및 선택 약관 모두 동의)
          </span>
        </div>
      </label>

      {/* 필수 약관 */}
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-gray-700 px-1">필수 약관</p>
        {JOBSEEKER_REQUIRED_TERMS.map((termId) => {
          const term = JOBSEEKER_TERMS[termId];
          const fieldName = termFieldMap[termId];
          const isExpanded = expandedTerm === termId;

          return (
            <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-white">
                <input
                  type="checkbox"
                  checked={formData[fieldName] as boolean}
                  onChange={(e) => onIndividualAgree(fieldName, e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-primary-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      <span className="text-red-500">(필수)</span> {term.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTermModal(termId)}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        전문보기
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedTerm(isExpanded ? null : termId)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {term.summary && (
                    <p className="text-sm text-gray-600 mt-1">{term.summary}</p>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                    {term.content.substring(0, 500)}...
                    <button
                      type="button"
                      onClick={() => onOpenTermModal(termId)}
                      className="text-primary-600 hover:text-primary-700 underline ml-2"
                    >
                      전체 보기
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택 약관 */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 px-1">선택 약관</p>
        {JOBSEEKER_OPTIONAL_TERMS.map((termId) => {
          const term = JOBSEEKER_TERMS[termId];
          const fieldName = termFieldMap[termId];
          const isExpanded = expandedTerm === termId;

          return (
            <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-white">
                <input
                  type="checkbox"
                  checked={formData[fieldName] as boolean}
                  onChange={(e) => onIndividualAgree(fieldName, e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-primary-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      <span className="text-gray-500">(선택)</span> {term.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTermModal(termId)}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        전문보기
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedTerm(isExpanded ? null : termId)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {term.summary && (
                    <p className="text-sm text-gray-600 mt-1">{term.summary}</p>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                    {term.content.substring(0, 500)}...
                    <button
                      type="button"
                      onClick={() => onOpenTermModal(termId)}
                      className="text-primary-600 hover:text-primary-700 underline ml-2"
                    >
                      전체 보기
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
