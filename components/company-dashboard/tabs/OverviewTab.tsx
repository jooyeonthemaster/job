// 대시보드 Overview 탭 컴포넌트

'use client';

import Link from 'next/link';
import { TrendingUp, AlertCircle, Edit, Eye, PlusCircle, Users, ChevronRight, ShieldCheck } from 'lucide-react';
import { Company, Job, TabId } from '@/types/company-dashboard.types';
import { calculateProfileCompletion, getMissingFields } from '@/utils/company-profile';

interface OverviewTabProps {
  company: Company;
  jobs: Job[];
  onTabChange: (tab: TabId) => void;
}

export const OverviewTab = ({ company, jobs, onTabChange }: OverviewTabProps) => {
  const completion = calculateProfileCompletion(company);
  const missingFields = getMissingFields(company);
  const isIncomplete = completion < 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          안녕하세요, {company.name}님
        </h1>
        <p className="text-gray-600">오늘의 채용 현황을 확인하세요</p>
      </div>

      {/* 프로필 완성도 알림 - 온보딩 선택 항목 기준 */}
      {isIncomplete && (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 border-2 border-primary-200 rounded-2xl shadow-lg">
          {/* 장식용 배경 원 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative p-8">
            <div className="flex items-start gap-6">
              {/* 아이콘 */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  기업 정보를 완성해보세요!
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                    중요
                  </span>
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  기업 정보를 자세히 입력할수록 <strong className="text-primary-700">더 많은 채용 매칭</strong>을 기대할 수 있습니다!
                </p>

                {/* 미완성 항목 - 온보딩 선택 항목만 표시 */}
                {missingFields.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 mb-5 border border-white">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      아직 입력하지 않은 정보 (온보딩 선택 항목)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {missingFields.map(field => (
                        <div key={field.key} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {field.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA 버튼 */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    href="/company-dashboard/edit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Edit className="w-5 h-5" />
                    지금 바로 입력하기
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => onTabChange('profile')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all border border-gray-200 font-medium"
                  >
                    <Eye className="w-5 h-5" />
                    현재 정보 확인하기
                  </button>
                  <button
                    onClick={() => onTabChange('verification')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    기업 인증하기
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 프로그레스 바 - 온보딩 선택 항목 기준 (총 6개) */}
            <div className="mt-6 pt-6 border-t border-white/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">프로필 완성도 (선택 항목)</span>
                <span className="font-bold text-primary-700">{completion}%</span>
              </div>
              <div className="w-full h-3 bg-white/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 transition-all duration-500 rounded-full"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            href="/company-dashboard/jobs/create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <PlusCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">새 채용공고 등록</p>
          </Link>
          <button
            onClick={() => onTabChange('applicants')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">지원자 관리</p>
          </button>
          <Link
            href={`/company/${company.id}`}
            target="_blank"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">기업 정보 미리보기</p>
          </Link>
          <Link
            href="/company-dashboard/edit"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">기업 정보 수정</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

