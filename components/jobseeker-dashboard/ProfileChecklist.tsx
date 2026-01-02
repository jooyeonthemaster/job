// 프로필 완성 체크리스트 컴포넌트
// 2026-01-02 간소화: 필수 6개, 선택 4개 구분 표시

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { TrendingUp, CheckCircle, ChevronRight, Users, AlertCircle, X, Eye, Star, Sparkles } from 'lucide-react';
import type { UserProfile } from '@/types/jobseeker-dashboard.types';
import type { ExtendedChecklistItem } from '@/lib/utils/profile-checklist';
import { checkTalentPoolEligibility } from '@/lib/utils/talent-pool-eligibility';

type Props = {
  checklist: ExtendedChecklistItem[];
  checklistPercentage: number;
  profileData: UserProfile | null;
};

export default function ProfileChecklist({ checklist, checklistPercentage, profileData }: Props) {
  const { user } = useAuth();
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // 필수/선택 항목 분리
  const requiredItems = checklist.filter(item => item.isRequired);
  const optionalItems = checklist.filter(item => !item.isRequired);

  const requiredCompleted = requiredItems.filter(item => item.completed).length;
  const optionalCompleted = optionalItems.filter(item => item.completed).length;

  const eligibility = checkTalentPoolEligibility(profileData);
  const talentProfileUrl = user ? `/talent/${user.id}` : '/talent';

  // 필수 항목 완성율 (인재풀 등록 기준)
  const requiredPercentage = Math.round((requiredCompleted / requiredItems.length) * 100);

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
    <div className="bg-white rounded-md shadow-sm p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            프로필 완성하기
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-rose-400" />
              필수 {requiredCompleted}/{requiredItems.length}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              선택 {optionalCompleted}/{optionalItems.length}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          eligibility.eligible
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-500'
        }`}>
          {eligibility.eligible ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {eligibility.eligible ? '등록 가능!' : `필수 ${requiredPercentage}%`}
          </span>
        </div>
      </div>

      {/* Progress Bar - 필수 항목 기준 */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${
            eligibility.eligible
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-rose-300 to-rose-400'
          }`}
          style={{ width: `${requiredPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {eligibility.eligible
          ? '✅ 인재풀 등록 조건을 충족했습니다!'
          : `⭐ 필수 항목 ${requiredItems.length - requiredCompleted}개를 더 완성하면 인재풀에 등록할 수 있습니다.`}
      </p>

      {/* ⭐ 필수 항목 섹션 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-rose-400" />
          필수 항목 ({requiredCompleted}/{requiredItems.length})
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {requiredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200 hover:border-rose-300 hover:bg-rose-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      item.completed ? 'text-emerald-800' : 'text-rose-700'
                    }`}
                  >
                    {item.title}
                    {!item.completed && <span className="text-rose-500 ml-1">*</span>}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
                {!item.completed && (
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 📋 선택 항목 섹션 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sky-400" />
          선택 항목 ({optionalCompleted}/{optionalItems.length})
          <span className="text-xs font-normal text-gray-500 ml-1">- 권장</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {optionalItems.map((item) => {
            const Icon = item.icon;
            const isWideItem = item.id === 'basic-extra';
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isWideItem ? 'md:col-span-2' : ''
                } ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-sky-50 border-sky-200 hover:border-sky-300 hover:bg-sky-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-sky-100 text-sky-500'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      item.completed ? 'text-emerald-800' : 'text-gray-700'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
                {!item.completed && (
                  <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-700 mb-3">
          <strong>💡 인재풀 등록 혜택:</strong> 필수 항목만 완성하면 기업의 스카우트 제안을 받을 수 있습니다!
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleTalentPoolClick}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              eligibility.eligible
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                : 'bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Users className="w-4 h-4" />
            {eligibility.eligible ? '인재풀 등록하기' : '등록 조건 확인하기'}
            {!eligibility.eligible && (
              <span className="ml-1 px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full text-xs font-semibold">
                {requiredCompleted}/{requiredItems.length}
              </span>
            )}
          </button>
          <Link
            href={talentProfileUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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
            className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
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
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                  <p className="text-sm text-emerald-800 font-medium mb-2">
                    ✅ 필수 항목 완료!
                  </p>
                  <p className="text-sm text-emerald-700">
                    인재풀 등록 조건을 충족했습니다. 아래 버튼을 눌러 기업들에게 프로필을 노출시키세요.
                  </p>
                </div>
              ) : (
                <>
                  {/* 필수 항목 미완료 안내 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-rose-400" />
                      <p className="font-semibold text-rose-700 text-sm">
                        필수 항목 ({eligibility.requiredCompleted}/{eligibility.requiredTotal})
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      아래 <strong className="text-rose-600">{eligibility.requiredTotal - eligibility.requiredCompleted}개 항목</strong>을 완성하면 인재풀에 등록할 수 있습니다.
                    </p>
                    <div className="space-y-2">
                      {eligibility.issues.filter(issue => issue.isRequired).map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-rose-700 text-sm flex items-center gap-1">
                              {issue.field}
                              <span className="text-rose-500">*</span>
                            </p>
                            <p className="text-rose-600 text-sm mt-1">{issue.message}</p>
                          </div>
                          {issue.link && (
                            <Link
                              href={issue.link}
                              onClick={() => setShowEligibilityModal(false)}
                              className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 transition-colors shrink-0"
                            >
                              입력하기
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 선택 항목 안내 (있는 경우만) */}
                  {eligibility.issues.filter(issue => !issue.isRequired).length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <p className="font-semibold text-gray-700 text-sm">
                          선택 항목 - 권장
                        </p>
                      </div>
                      <div className="space-y-2">
                        {eligibility.issues.filter(issue => !issue.isRequired).map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-700 text-sm">{issue.field}</p>
                              <p className="text-gray-600 text-sm mt-1">{issue.message}</p>
                            </div>
                            {issue.link && (
                              <Link
                                href={issue.link}
                                onClick={() => setShowEligibilityModal(false)}
                                className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-medium hover:bg-sky-600 transition-colors shrink-0"
                              >
                                추가하기
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 border border-gray-200 rounded-lg mb-4">
              <p className="text-sm text-gray-800 font-medium mb-2">
                💡 인재풀 등록 혜택
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 인재 검색 페이지에 노출 → 기업 유입 증가</li>
                <li>• 기업의 직접 스카우트 제안 수신 가능</li>
                <li>• 프로필 노출로 채용 기회 대폭 증가</li>
                <li>• AI 매칭 정확도 향상</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600 transition-colors"
              >
                닫기
              </button>
              {eligibility.eligible ? (
                <button
                  onClick={handlePublishTalentPool}
                  disabled={isPublishing}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? '등록 중...' : '인재풀에 등록하기'}
                </button>
              ) : (
                <Link
                  href="/profile/edit"
                  onClick={() => setShowEligibilityModal(false)}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium transition-colors text-center"
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
