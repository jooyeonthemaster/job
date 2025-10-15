'use client';

import { useState } from 'react';
import { COMPANY_TERMS, REQUIRED_TERMS, OPTIONAL_TERMS } from '@/constants/company-terms';
import { CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  agreements: {
    agreeAll: boolean;
    agreeServiceTerms: boolean;
    agreePrivacyTerms: boolean;
    agreeCompanyInfoTerms: boolean;
    agreePublicInfoTerms: boolean;
    agreeAdminInfoTerms: boolean;
    agreeMarketingTerms: boolean;
  };
  onChange: (field: string, value: boolean) => void;
  errors: Record<string, string>;
}

export default function TermsAgreement({ agreements, onChange, errors }: Props) {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // 전체 동의 처리
  const handleAgreeAll = (checked: boolean) => {
    onChange('agreeAll', checked);
    onChange('agreeServiceTerms', checked);
    onChange('agreePrivacyTerms', checked);
    onChange('agreeCompanyInfoTerms', checked);
    onChange('agreePublicInfoTerms', checked);
    onChange('agreeAdminInfoTerms', checked);
    onChange('agreeMarketingTerms', checked);
  };

  // 개별 약관 클릭 시 전체 동의 체크 업데이트
  const handleIndividualChange = (field: string, checked: boolean) => {
    onChange(field, checked);

    // 모든 필수 약관이 체크되었는지 확인
    const allRequired = REQUIRED_TERMS.every(termId => {
      const fieldName = `agree${termId.charAt(0).toUpperCase() + termId.slice(1)}`;
      if (fieldName === field) return checked;
      return agreements[fieldName as keyof typeof agreements];
    });

    // 선택 약관 포함
    const marketing = field === 'agreeMarketingTerms' ? checked : agreements.agreeMarketingTerms;

    if (allRequired && marketing) {
      onChange('agreeAll', true);
    } else {
      onChange('agreeAll', false);
    }
  };

  // 약관 전체 보기 모달 열기
  const openTermModal = (termId: string) => {
    const term = COMPANY_TERMS[termId];
    setModalContent({
      title: term.title,
      content: term.content
    });
    setModalOpen(true);
  };

  // 약관 요약 토글
  const toggleTermExpand = (termId: string) => {
    setExpandedTerm(expandedTerm === termId ? null : termId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">약관 동의</h3>
        {errors.terms && (
          <span className="text-sm text-red-600 flex items-center gap-1">
            <X className="w-4 h-4" />
            {errors.terms}
          </span>
        )}
      </div>

      {/* 전체 동의 */}
      <label className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-xl bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors">
        <input
          type="checkbox"
          checked={agreements.agreeAll}
          onChange={(e) => handleAgreeAll(e.target.checked)}
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
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 px-1">필수 약관</p>

        {REQUIRED_TERMS.map(termId => {
          const term = COMPANY_TERMS[termId];
          const fieldName = `agree${termId.charAt(0).toUpperCase() + termId.slice(1)}` as keyof typeof agreements;
          const isExpanded = expandedTerm === termId;

          return (
            <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
              {/* 약관 체크박스 및 제목 */}
              <div className="flex items-start gap-3 p-4 bg-white">
                <input
                  type="checkbox"
                  checked={agreements[fieldName]}
                  onChange={(e) => handleIndividualChange(fieldName, e.target.checked)}
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
                        onClick={() => openTermModal(termId)}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        전문보기
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTermExpand(termId)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {term.summary && (
                    <p className="text-sm text-gray-600 mt-1">{term.summary}</p>
                  )}
                </div>
              </div>

              {/* 약관 요약 내용 (펼쳐졌을 때) */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                    {term.content.substring(0, 500)}...
                    <button
                      type="button"
                      onClick={() => openTermModal(termId)}
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
      <div className="space-y-3 pt-4">
        <p className="text-sm font-medium text-gray-700 px-1">선택 약관</p>

        {OPTIONAL_TERMS.map(termId => {
          const term = COMPANY_TERMS[termId];
          const fieldName = `agree${termId.charAt(0).toUpperCase() + termId.slice(1)}` as keyof typeof agreements;
          const isExpanded = expandedTerm === termId;

          return (
            <div key={termId} className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-white">
                <input
                  type="checkbox"
                  checked={agreements[fieldName]}
                  onChange={(e) => handleIndividualChange(fieldName, e.target.checked)}
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
                        onClick={() => openTermModal(termId)}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        전문보기
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTermExpand(termId)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
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
                      onClick={() => openTermModal(termId)}
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

      {/* 약관 전문 보기 모달 */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] z-50 flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                {modalContent?.title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {modalContent?.content}
                </pre>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <Dialog.Close asChild>
                <button className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  확인
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
