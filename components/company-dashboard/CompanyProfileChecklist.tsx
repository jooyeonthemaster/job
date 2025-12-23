// 기업 프로필 완성 체크리스트 컴포넌트

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronRight, Edit3, Eye, AlertCircle, X, Users } from 'lucide-react';
import type { Company } from '@/types/company-dashboard.types';
import type { CompanyChecklistItem } from '@/lib/utils/company-profile-checklist';
import { checkCompanyPublicEligibility, type CompanyEligibilityIssue } from '@/lib/utils/company-public-eligibility';

type Props = {
  checklist: CompanyChecklistItem[];
  checklistPercentage: number;
  requiredPercentage: number;
  optionalPercentage: number;
  company: Company;
};

export default function CompanyProfileChecklist({
  checklist,
  checklistPercentage,
  requiredPercentage,
  optionalPercentage,
  company
}: Props) {
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const eligibility = checkCompanyPublicEligibility(company);
  const companyPublicUrl = `/companies/${company.id}`;

  const requiredItems = checklist.filter(item => item.isRequired);
  const optionalItems = checklist.filter(item => !item.isRequired);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const completedOptional = optionalItems.filter(item => item.completed).length;

  // 디버깅
  console.log('[CompanyProfileChecklist] Company:', company);
  console.log('[CompanyProfileChecklist] Eligibility:', eligibility);
  console.log('[CompanyProfileChecklist] Optional Percentage:', optionalPercentage);

  const handlePublicProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[CompanyProfileChecklist] 기업 공개하기 클릭');
    console.log('[CompanyProfileChecklist] Eligible:', eligibility.eligible);
    console.log('[CompanyProfileChecklist] Completion Rate:', eligibility.completionRate);
    setShowEligibilityModal(true);
  };

  const handlePublishCompany = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/companies/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      if (!response.ok) {
        throw new Error('기업 공개에 실패했습니다.');
      }

      const data = await response.json();
      console.log('[CompanyProfileChecklist] 기업 공개 성공:', data);

      // 성공 메시지 표시
      alert('기업이 성공적으로 공개되었습니다!');

      // 기업 목록 페이지로 이동
      window.location.href = '/companies';
    } catch (error: any) {
      console.error('[CompanyProfileChecklist] 기업 공개 실패:', error);
      alert(error.message || '기업 공개 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg shadow-sm p-8 border border-primary-100">
        <div className="relative">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                기업 정보를 완성해보세요!
                {requiredPercentage < 100 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                    중요
                  </span>
                )}
              </h3>
              <p className="text-gray-700 mb-4 text-lg">
                기업 정보를 자세히 입력할수록{' '}
                <strong className="text-primary-700">더 많은 채용 매칭</strong>을 기대할 수 있습니다!
              </p>

              {/* 미완성 선택 항목 안내 */}
              {optionalPercentage < 100 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-md p-5 mb-5 border border-white">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    아직 입력하지 않은 정보 (온보딩 선택 항목)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {optionalItems
                      .filter(item => !item.completed)
                      .map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {item.title}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/company-dashboard/edit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <Edit3 className="w-5 h-5" />
                  지금 바로 입력하기
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <Link
                  href={companyPublicUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-md hover:bg-white transition-all border-2 border-gray-200 font-medium"
                >
                  <Eye className="w-5 h-5" />
                  현재 정보 확인하기
                </Link>

                <button
                  onClick={handlePublicProfileClick}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-md transition-all shadow-lg hover:shadow-xl font-semibold ${
                    eligibility.eligible
                      ? 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  기업 공개하기
                  {!eligibility.eligible && (
                    <span className="ml-1 px-2 py-0.5 bg-gray-400 text-white rounded-full text-xs">
                      {eligibility.completionRate}%
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress - 선택 항목만 */}
          <div className="mt-6 pt-6 border-t border-white/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">프로필 완성도 (선택 항목)</span>
              <span className="font-bold text-primary-700">{optionalPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 transition-all duration-500 rounded-full"
                style={{ width: `${optionalPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 기업 공개하기 안내 모달 */}
      {showEligibilityModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEligibilityModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">기업 공개 조건 안내</h3>
                </div>
              </div>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  🎯 기업 공개하기란?
                </p>
                <p className="text-sm text-blue-800">
                  기업 정보를 <strong>기업 목록 페이지</strong>에 공개하여 구직자들이 찾을 수 있게 합니다.
                  채용공고와 별개로 기업 브랜딩을 강화할 수 있습니다.
                </p>
              </div>

              {eligibility.eligible ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-900 font-medium mb-2">
                    ✅ 공개 조건 충족!
                  </p>
                  <p className="text-sm text-green-800">
                    기업 정보를 공개할 준비가 되었습니다. "기업 목록에 등록하기" 버튼을 눌러 구직자들에게 노출시키세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    구직자들이 기업 정보를 제대로 확인할 수 있도록 아래 정보를 먼저 완성해주세요.
                    <strong className="text-primary-600"> (최소 60% 이상 완성 필요)</strong>
                  </p>

                  <div className="space-y-3">
                    {eligibility.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-orange-900 text-sm">{issue.field}</p>
                          <p className="text-orange-700 text-sm mt-1">{issue.message}</p>
                        </div>
                        {issue.link && (
                          <Link
                            href={issue.link}
                            onClick={() => setShowEligibilityModal(false)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors shrink-0"
                          >
                            입력하기
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg mb-4">
              <p className="text-sm text-gray-900 font-medium mb-2">
                💡 기업 공개 혜택
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li>• 기업 목록 페이지에 노출 → 구직자 유입 증가</li>
                <li>• 우수 인재의 지원 가능성 향상</li>
                <li>• 채용 브랜딩 강화 및 신뢰도 상승</li>
                <li>• 채용공고와 별개로 기업 홍보 가능</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                닫기
              </button>
              {eligibility.eligible ? (
                <button
                  onClick={handlePublishCompany}
                  disabled={isPublishing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? '등록 중...' : '기업 목록에 등록하기'}
                </button>
              ) : (
                <Link
                  href="/company-dashboard/edit"
                  onClick={() => setShowEligibilityModal(false)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors text-center"
                >
                  지금 완성하기
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

