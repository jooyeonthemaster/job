// 배너 통계 컴포넌트
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import { Plus, RefreshCw, ImageIcon, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

type BannerStatsProps = {
  stats: any;
  onRefresh: () => void;
  onCreate: () => void;
};

export default function BannerStats({ stats, onRefresh, onCreate }: BannerStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">광고 배너 관리</h2>
          <p className="text-gray-600 mt-1">
            사이트에 노출되는 광고 배너를 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            배너 추가
          </button>
        </div>
      </div>

      {/* 전체 통계 */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">전체 배너</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalBanners}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">활성 배너</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats.activeBanners}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">총 노출</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.totalViews.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <MousePointerClick className="w-4 h-4" />
              <span className="text-sm font-medium">총 클릭</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {stats.totalClicks.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-pink-700 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">평균 CTR</span>
            </div>
            <div className="text-2xl font-bold text-pink-900">
              {stats.averageCTR}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
