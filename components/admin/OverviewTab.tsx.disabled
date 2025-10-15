// 관리자 개요 탭 컴포넌트

import { Users, Building2, FileText, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminStats } from '@/types/admin.types';
import { type RecentActivity } from '@/lib/firebase/admin-service';

interface OverviewTabProps {
  loading: boolean;
  stats: AdminStats;
  recentActivities: RecentActivity[];
  onTabChange: (tab: 'talent-applications' | 'jobseekers') => void;
}

export default function OverviewTab({ loading, stats, recentActivities, onTabChange }: OverviewTabProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobseekers}</p>
              <p className="text-sm text-gray-600">전체 구직자</p>
              <p className="text-xs text-blue-600 mt-1">
                온보딩 완료: {stats.completedJobseekers}명
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              <p className="text-sm text-gray-600">등록 기업</p>
              <p className="text-xs text-purple-600 mt-1">
                활성: {stats.activeCompanies}개
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-sm text-gray-600">채용 신청</p>
              <p className="text-xs text-orange-600 mt-1">
                대기중: {stats.pendingApplications}건
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          최근 활동
        </h2>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'jobseeker_signup' ? 'bg-blue-100' :
                  activity.type === 'company_signup' ? 'bg-purple-100' :
                  'bg-green-100'
                }`}>
                  {activity.type === 'jobseeker_signup' && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'company_signup' && <Building2 className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'application' && <FileText className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>
        )}
      </div>

      {/* 빠른 액션 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="#"
          onClick={(e) => { e.preventDefault(); onTabChange('talent-applications'); }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">채용 신청 확인</p>
              <p className="text-sm text-gray-600 mt-1">
                대기중인 신청 {stats.pendingApplications}건
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Link>

        <Link
          href="#"
          onClick={(e) => { e.preventDefault(); onTabChange('jobseekers'); }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">신규 구직자</p>
              <p className="text-sm text-gray-600 mt-1">
                온보딩 완료: {stats.completedJobseekers}명
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

