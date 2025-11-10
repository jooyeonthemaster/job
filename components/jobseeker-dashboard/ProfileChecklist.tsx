// 프로필 완성 체크리스트 컴포넌트

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { TrendingUp, CheckCircle, ChevronRight, Edit3, Users, AlertCircle, X, Eye } from 'lucide-react';
import type { ChecklistItem, UserProfile } from '@/types/jobseeker-dashboard.types';
import { checkTalentPoolEligibility, type EligibilityIssue } from '@/lib/utils/talent-pool-eligibility';

type Props = {
  checklist: ChecklistItem[];
  checklistPercentage: number;
  profileData: UserProfile | null;
};

export default function ProfileChecklist({ checklist, checklistPercentage, profileData }: Props) {
  const { user } = useAuth();
  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const eligibility = checkTalentPoolEligibility(profileData);
  const talentProfileUrl = user ? `/talent/${user.id}` : '/talent';

  // 디버깅
  console.log('[ProfileChecklist] User:', user);
  console.log('[ProfileChecklist] Eligibility:', eligibility);
  console.log('[ProfileChecklist] Profile Data:', profileData);

  const handleTalentPoolClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[ProfileChecklist] 인재풀 등록하기 클릭');
    console.log('[ProfileChecklist] Eligible:', eligibility.eligible);
    console.log('[ProfileChecklist] Completion Rate:', eligibility.completionRate);
    setShowEligibilityModal(true);
  };

  const handlePublishTalentPool = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/talent/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 서버에서 반환한 에러 메시지 표시
        if (data.missingFields && data.missingFields.length > 0) {
          alert(`프로필 완성이 필요합니다:\n\n${data.missingFields.join('\n')}`);
        } else {
          throw new Error(data.error || '인재풀 등록에 실패했습니다.');
        }
        return;
      }

      console.log('[ProfileChecklist] 인재풀 등록 성공:', data);

      // 성공 메시지 표시
      alert('🎉 인재풀에 성공적으로 등록되었습니다!\n\n이제 기업들이 당신의 프로필을 보고 스카우트 제안을 보낼 수 있습니다.');

      // 인재 목록 페이지로 이동
      window.location.href = '/talent';
    } catch (error: any) {
      console.error('[ProfileChecklist] 인재풀 등록 실패:', error);
      alert(error.message || '인재풀 등록 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            프로필 완성하기
          </h2>
          <p className="text-sm text-gray-600">
            {completedItems} / {totalItems} 항목 완료 ({checklistPercentage}%)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-600">
            {100 - checklistPercentage}% 남음
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
          style={{ width: `${checklistPercentage}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="grid md:grid-cols-2 gap-3">
        {checklist.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.link}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.completed
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    item.completed ? 'text-green-900' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              {!item.completed && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-3">
          <strong>💡 프로필 완성 혜택:</strong> 프로필이 완성되면 기업의 스카우트 제안을 받을 확률이 높아지고, AI 매칭 정확도도 향상됩니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            지금 프로필 완성하기
          </Link>
          <button
            onClick={handleTalentPoolClick}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              eligibility.eligible
                ? 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Users className="w-4 h-4" />
            인재풀 등록하기
            {!eligibility.eligible && (
              <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                {eligibility.completionRate}%
              </span>
            )}
          </button>
          <Link
            href={talentProfileUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            내 프로필 미리보기
          </Link>
        </div>
      </div>

      {/* 인재풀 등록 자격 안내 모달 */}
      {showEligibilityModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEligibilityModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">인재풀 등록 조건 안내</h3>
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
                  🎯 인재풀 등록이란?
                </p>
                <p className="text-sm text-blue-800">
                  프로필을 <strong>인재 검색 페이지</strong>에 공개하여 기업들이 찾을 수 있게 합니다.
                  채용공고 지원과 별개로 기업의 직접 스카우트를 받을 수 있습니다.
                </p>
              </div>

              {eligibility.eligible ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-900 font-medium mb-2">
                    ✅ 등록 조건 충족!
                  </p>
                  <p className="text-sm text-green-800">
                    프로필이 100% 완성되었습니다. "인재풀에 등록하기" 버튼을 눌러 기업들에게 노출시키세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    기업이 인재 프로필을 제대로 확인할 수 있도록 아래 정보를 먼저 완성해주세요.
                    <strong className="text-primary-600"> (100% 완성 필수)</strong>
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
                💡 인재풀 등록 혜택
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li>• 인재 검색 페이지에 노출 → 기업 유입 증가</li>
                <li>• 기업의 직접 스카우트 제안 수신 가능</li>
                <li>• 프로필 노출로 채용 기회 대폭 증가</li>
                <li>• AI 매칭 정확도 향상</li>
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
                  onClick={handlePublishTalentPool}
                  disabled={isPublishing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? '등록 중...' : '인재풀에 등록하기'}
                </button>
              ) : (
                <Link
                  href="/profile/edit"
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
    </div>
    </>
  );
}
