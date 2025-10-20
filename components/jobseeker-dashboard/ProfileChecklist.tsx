// 프로필 완성 체크리스트 컴포넌트

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { TrendingUp, CheckCircle, ChevronRight, Edit3, Users, AlertCircle, X } from 'lucide-react';
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

  const eligibility = checkTalentPoolEligibility(profileData);
  const talentProfileUrl = user ? `/talent/${user.id}` : '/talent';

  const handleTalentPoolClick = (e: React.MouseEvent) => {
    if (!eligibility.eligible) {
      e.preventDefault();
      setShowEligibilityModal(true);
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
          <Link
            href={talentProfileUrl}
            onClick={handleTalentPoolClick}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              eligibility.eligible
                ? 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Users className="w-4 h-4" />
            내 프로필 보기
            {!eligibility.eligible && (
              <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                {eligibility.completionRate}%
              </span>
            )}
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
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">인재풀 등록 조건 미충족</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    프로필 완성도: {eligibility.completionRate}%
                  </p>
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
              <p className="text-gray-700 mb-4">
                기업이 인재 프로필을 제대로 확인할 수 있도록 아래 정보를 먼저 완성해주세요.
              </p>

              <div className="space-y-3">
                {eligibility.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 text-sm">{issue.field}</p>
                      <p className="text-red-700 text-sm mt-1">{issue.message}</p>
                    </div>
                    {issue.link && (
                      <Link
                        href={issue.link}
                        onClick={() => setShowEligibilityModal(false)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shrink-0"
                      >
                        입력하기
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 인재풀 등록 혜택
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 기업의 직접 스카우트 제안 수신</li>
                <li>• 프로필 노출로 채용 기회 증가</li>
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
              <Link
                href="/profile/edit"
                onClick={() => setShowEligibilityModal(false)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors text-center"
              >
                프로필 완성하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
