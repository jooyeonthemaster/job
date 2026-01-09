// 프로필 완성 체크리스트 컴포넌트
// 2026-01-09 통합: 핵심 3가지 + (이력서 OR 프로필 6개) 구조
//
// 📋 새로운 통합 기준:
// 🔵 핵심 정보 (3가지 필수): 이메일, 전화번호, 한줄소개
// 📄 이력서 파일 OR 프로필 6개 정보

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { TrendingUp, CheckCircle, ChevronRight, Users, AlertCircle, X, Eye, FileText, Upload, Sparkles } from 'lucide-react';
import type { UserProfile } from '@/types/jobseeker-dashboard.types';
import type { ExtendedChecklistItem } from '@/lib/utils/profile-checklist';
import { checkProfileEligibility } from '@/lib/utils/profile-eligibility';

type Props = {
  checklist: ExtendedChecklistItem[];
  checklistPercentage: number;
  profileData: UserProfile | null;
};

export default function ProfileChecklist({ checklist, checklistPercentage, profileData }: Props) {
  const { user } = useAuth();
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // 카테고리별 분류 (core, resume, profile, optional)
  const coreItems = checklist.filter(item => item.category === 'core');
  const resumeItem = checklist.find(item => item.category === 'resume');
  const profileItems = checklist.filter(item => item.category === 'profile');
  const optionalItems = checklist.filter(item => item.category === 'optional');

  const coreCompleted = coreItems.filter(item => item.completed).length;
  const profileCompleted = profileItems.filter(item => item.completed).length;
  const optionalCompleted = optionalItems.filter(item => item.completed).length;

  const eligibility = checkProfileEligibility(profileData);
  const talentProfileUrl = user ? `/talent/${user.id}` : '/talent';

  // 완성율 (통합 기준)
  const completionRate = eligibility.completionRate;

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
    } catch (error: unknown) {
      console.error('[ProfileChecklist] 인재풀 등록 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '인재풀 등록 중 오류가 발생했습니다.';
      alert(errorMessage);
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
              <FileText className="w-4 h-4 text-primary-400" />
              핵심 {coreCompleted}/{coreItems.length}
            </span>
            {eligibility.hasResume ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Upload className="w-4 h-4" />
                이력서 ✓
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-sky-400" />
                프로필 {profileCompleted}/{profileItems.length}
              </span>
            )}
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
            {eligibility.eligible ? '등록 가능!' : `${completionRate}%`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${
            eligibility.eligible
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-primary-300 to-primary-400'
          }`}
          style={{ width: `${completionRate}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {eligibility.eligible
          ? '✅ 인재풀 등록 조건을 충족했습니다!'
          : eligibility.hasResume
            ? `🔵 핵심 정보 ${coreItems.length - coreCompleted}개를 더 완성해주세요.`
            : `📄 이력서 업로드 또는 프로필 정보를 완성해주세요.`}
      </p>

      {/* 🔵 핵심 정보 섹션 (3가지: 이메일, 전화번호, 한줄소개) */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary-400" />
          핵심 정보 ({coreCompleted}/{coreItems.length})
          <span className="text-xs font-normal text-gray-500 ml-1">- 필수</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-2">
          {coreItems.map((item) => {
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
                </div>
                {!item.completed && (
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 📄 이력서 OR 프로필 정보 섹션 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-sky-400" />
          이력서 또는 프로필 정보
          <span className="text-xs font-normal text-gray-500 ml-1">- 둘 중 하나 필수</span>
        </h3>

        {/* 이력서 업로드 카드 */}
        {resumeItem && (
          <Link
            href={resumeItem.link}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all mb-3 ${
              eligibility.hasResume
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-sky-50 border-sky-300 border-dashed hover:border-sky-400 hover:bg-sky-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                eligibility.hasResume
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-sky-100 text-sky-500'
              }`}
            >
              {eligibility.hasResume ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${eligibility.hasResume ? 'text-emerald-800' : 'text-sky-700'}`}>
                {eligibility.hasResume ? '✅ 이력서 등록됨' : '이력서 파일 업로드'}
              </p>
              <p className="text-xs text-gray-500">
                {eligibility.hasResume
                  ? '이력서가 있으면 바로 지원 가능!'
                  : 'PDF, Word 파일 업로드 (이력서가 있으면 프로필 정보 생략 가능)'}
              </p>
            </div>
            {!eligibility.hasResume && (
              <ChevronRight className="w-5 h-5 text-sky-400 shrink-0" />
            )}
          </Link>
        )}

        {/* OR 구분선 */}
        {!eligibility.hasResume && (
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* 프로필 6개 정보 (이력서 없을 때만 활성화) */}
        <div className={`${eligibility.hasResume ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">
              프로필 정보 ({profileCompleted}/{profileItems.length})
              {eligibility.hasResume && ' - 이력서가 있어 선택사항'}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-emerald-50 border-emerald-200'
                      : eligibility.hasResume
                        ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        : 'bg-sky-50 border-sky-200 hover:border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : eligibility.hasResume
                          ? 'bg-gray-100 text-gray-400'
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
                        item.completed
                          ? 'text-emerald-800'
                          : eligibility.hasResume
                            ? 'text-gray-500'
                            : 'text-gray-700'
                      }`}
                    >
                      {item.title}
                      {!item.completed && !eligibility.hasResume && (
                        <span className="text-sky-500 ml-1">*</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  {!item.completed && (
                    <ChevronRight className={`w-4 h-4 shrink-0 ${
                      eligibility.hasResume ? 'text-gray-300' : 'text-sky-400'
                    }`} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⭐ 선택 항목 - 매칭률 UP */}
      {optionalItems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            매칭률 UP ({optionalCompleted}/{optionalItems.length})
            <span className="text-xs font-normal text-amber-600 ml-1">- 선택 (완성하면 매칭률 향상!)</span>
          </h3>
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg mb-3">
            <p className="text-xs text-amber-800">
              ✨ 아래 정보를 추가하면 기업들이 더 쉽게 찾을 수 있고, AI 매칭 정확도가 높아집니다!
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {optionalItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
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
                        item.completed ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                    >
                      {item.title}
                      {item.completed && <span className="ml-1 text-emerald-600">✓</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  {!item.completed && (
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
          {optionalCompleted === optionalItems.length && optionalItems.length > 0 && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                🎉 모든 선택 정보 완성! 최고의 매칭률을 기대하세요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-700 mb-3">
          <strong>💡 인재풀 등록 혜택:</strong> 핵심 정보 + (이력서 또는 프로필 정보)를 완성하면 기업의 스카우트 제안을 받을 수 있습니다!
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleTalentPoolClick}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              eligibility.eligible
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                : 'bg-primary-50 border border-primary-300 text-primary-700 hover:bg-primary-100'
            }`}
          >
            <Users className="w-4 h-4" />
            {eligibility.eligible ? '인재풀 등록하기' : '등록 조건 확인하기'}
            {!eligibility.eligible && (
              <span className="ml-1 px-2 py-0.5 bg-primary-200 text-primary-800 rounded-full text-xs font-semibold">
                {completionRate}%
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
                    ✅ 등록 조건 충족!
                  </p>
                  <p className="text-sm text-emerald-700">
                    인재풀 등록 조건을 충족했습니다. 아래 버튼을 눌러 기업들에게 프로필을 노출시키세요.
                  </p>
                </div>
              ) : (
                <>
                  {/* 🔵 핵심 정보 미완료 안내 */}
                  {eligibility.coreFields.filter(f => !f.completed).length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary-400" />
                        <p className="font-semibold text-primary-700 text-sm">
                          핵심 정보 ({eligibility.coreCompleted}/{eligibility.coreTotal})
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        아래 <strong className="text-primary-600">{eligibility.coreTotal - eligibility.coreCompleted}개 항목</strong>을 완성해주세요.
                      </p>
                      <div className="space-y-2">
                        {eligibility.coreFields.filter(f => !f.completed).map((field, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-rose-700 text-sm flex items-center gap-1">
                                {field.field}
                                <span className="text-rose-500">*</span>
                              </p>
                              <p className="text-rose-600 text-sm mt-1">{field.message}</p>
                            </div>
                            {field.link && (
                              <Link
                                href={field.link}
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
                  )}

                  {/* 📄 이력서 OR 프로필 정보 안내 */}
                  {!eligibility.hasResume && eligibility.profileFields.filter(f => !f.completed).length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4 text-sky-400" />
                        <p className="font-semibold text-gray-700 text-sm">
                          이력서 또는 프로필 정보
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        <strong className="text-sky-600">이력서를 업로드</strong>하거나 아래 <strong className="text-sky-600">{eligibility.profileTotal - eligibility.profileCompleted}개 정보</strong>를 모두 입력해주세요.
                      </p>

                      {/* 이력서 업로드 옵션 */}
                      <Link
                        href="/profile/edit/resume"
                        onClick={() => setShowEligibilityModal(false)}
                        className="flex items-center gap-3 p-3 bg-sky-50 border-2 border-dashed border-sky-300 rounded-lg mb-3 hover:bg-sky-100 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-sky-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sky-700 text-sm">이력서 파일 업로드 (권장)</p>
                          <p className="text-xs text-gray-500">이력서가 있으면 프로필 정보 입력이 필요 없습니다</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-sky-400" />
                      </Link>

                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">또는</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <div className="space-y-2">
                        {eligibility.profileFields.filter(f => !f.completed).map((field, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-700 text-sm">{field.field}</p>
                              <p className="text-gray-500 text-sm mt-1">{field.message}</p>
                            </div>
                            {field.link && (
                              <Link
                                href={field.link}
                                onClick={() => setShowEligibilityModal(false)}
                                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors shrink-0"
                              >
                                입력하기
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
