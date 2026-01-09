// 지원 내역 통계 카드 컴포넌트
'use client';

import { ApplicationsStats } from '@/types/job-application.types';
import {
  ClipboardList,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

interface ApplicationsStatsCardsProps {
  stats: ApplicationsStats;
}

export default function ApplicationsStatsCards({ stats }: ApplicationsStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-gray-200 hover:border-primary-600 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">전체 지원</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-gray-200 hover:border-yellow-500 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">대기중</p>
            <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-gray-200 hover:border-blue-500 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">검토중</p>
            <p className="text-xl font-bold text-gray-900">{stats.reviewing}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-gray-200 hover:border-green-500 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">합격</p>
            <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-gray-200 hover:border-red-500 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">불합격</p>
            <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 border-2 border-primary-600 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">이번 달</p>
            <p className="text-xl font-bold text-primary-600">{stats.thisMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
