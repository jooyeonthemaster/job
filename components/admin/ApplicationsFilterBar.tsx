// 지원 내역 필터 바 컴포넌트
'use client';

import {
  ApplicationsFilters,
  ApplicationsSortBy,
  JobApplicationStatus,
  APPLICATIONS_SORT_OPTIONS,
  CompanyOption,
} from '@/types/job-application.types';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';

interface ApplicationsFilterBarProps {
  filters: ApplicationsFilters;
  onFiltersChange: (filters: ApplicationsFilters) => void;
  sortBy: ApplicationsSortBy;
  onSortByChange: (sortBy: ApplicationsSortBy) => void;
  showFilters: boolean;
  onShowFiltersToggle: () => void;
  companies: CompanyOption[];
  activeFilterCount: number;
  onRefresh: () => void;
  onExportCSV: () => void;
  onClearFilters: () => void;
}

export default function ApplicationsFilterBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortByChange,
  showFilters,
  onShowFiltersToggle,
  companies,
  activeFilterCount,
  onRefresh,
  onExportCSV,
  onClearFilters,
}: ApplicationsFilterBarProps) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* 검색 */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="지원자명, 이메일, 기업명, 공고명 검색..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* 정렬 */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as ApplicationsSortBy)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {APPLICATIONS_SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        {/* 필터 토글 */}
        <button
          onClick={onShowFiltersToggle}
          className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          필터
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 새로고침 */}
        <button
          onClick={onRefresh}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* CSV 내보내기 */}
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV 내보내기
        </button>
      </div>

      {/* 확장된 필터 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as JobApplicationStatus | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">전체</option>
              <option value="pending">대기중</option>
              <option value="reviewing">검토중</option>
              <option value="accepted">합격</option>
              <option value="rejected">불합격</option>
            </select>
          </div>

          {/* 기업 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기업</label>
            <select
              value={filters.companyId}
              onChange={(e) => onFiltersChange({ ...filters, companyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">전체 기업</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <div className="col-span-full">
              <button
                onClick={onClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
