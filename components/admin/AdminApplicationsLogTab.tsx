// 관리자 지원 내역 로그 탭 컴포넌트
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/config';
import {
  JobApplicationWithDetails,
  ApplicationsStats,
  ApplicationsFilters,
  ApplicationsSortBy,
  JobApplicationStatus,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  DEFAULT_APPLICATIONS_FILTERS,
  CompanyOption,
} from '@/types/job-application.types';
import ApplicationsStatsCards from './ApplicationsStatsCards';
import ApplicationDetailModal from './ApplicationDetailModal';
import ApplicationsFilterBar from './ApplicationsFilterBar';
import {
  ClipboardList,
  Eye,
  User,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface AdminApplicationsLogTabProps {
  isActive?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function AdminApplicationsLogTab({ isActive = true }: AdminApplicationsLogTabProps) {
  // 데이터 상태
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>([]);
  const [stats, setStats] = useState<ApplicationsStats>({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
    thisMonth: 0,
  });
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터/정렬 상태
  const [filters, setFilters] = useState<ApplicationsFilters>(DEFAULT_APPLICATIONS_FILTERS);
  const [sortBy, setSortBy] = useState<ApplicationsSortBy>('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  // 상세 모달
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationWithDetails | null>(null);

  // 데이터 로드
  useEffect(() => {
    if (isActive) {
      loadAllData();
    }
  }, [isActive]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadApplications(), loadCompanies()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!job_id (id, title, location, employment_type, status, deadline),
          companies!company_id (id, name, logo, industry),
          users!applicant_id (id, full_name, email, phone, profile_image_url, nationality, headline)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as JobApplicationWithDetails[];
      setApplications(typedData);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const statsData: ApplicationsStats = {
        total: typedData.length,
        pending: typedData.filter(a => a.status === 'pending').length,
        reviewing: typedData.filter(a => a.status === 'reviewing').length,
        accepted: typedData.filter(a => a.status === 'accepted').length,
        rejected: typedData.filter(a => a.status === 'rejected').length,
        thisMonth: typedData.filter(a => new Date(a.created_at) >= firstDayOfMonth).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  // 필터링 및 정렬
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // 검색 필터
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(app =>
        app.applicant_name.toLowerCase().includes(query) ||
        app.applicant_email.toLowerCase().includes(query) ||
        app.company_name.toLowerCase().includes(query) ||
        app.job_title.toLowerCase().includes(query)
      );
    }

    // 상태 필터
    if (filters.status !== 'all') {
      result = result.filter(app => app.status === filters.status);
    }

    // 기업 필터
    if (filters.companyId) {
      result = result.filter(app => app.company_id === filters.companyId);
    }

    // 날짜 필터
    if (filters.dateFrom) {
      result = result.filter(app => new Date(app.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      result = result.filter(app => new Date(app.created_at) <= dateTo);
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'applicant_name':
          return a.applicant_name.localeCompare(b.applicant_name, 'ko');
        case 'company_name':
          return a.company_name.localeCompare(b.company_name, 'ko');
        case 'date_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [applications, filters, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedApplications, currentPage]);

  // 페이지 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.companyId) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태 뱃지
  const getStatusBadge = (status: JobApplicationStatus) => (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${APPLICATION_STATUS_COLORS[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );

  // CSV 내보내기
  const exportToCSV = () => {
    const headers = ['지원일', '지원자명', '지원자 이메일', '기업명', '공고명', '상태', '지원 메시지'];
    const rows = filteredAndSortedApplications.map(app => [
      formatDate(app.created_at),
      app.applicant_name,
      app.applicant_email,
      app.company_name,
      app.job_title,
      APPLICATION_STATUS_LABELS[app.status],
      (app.message || '').replace(/"/g, '""').replace(/\n/g, ' '),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 필터 초기화
  const clearFilters = () => {
    setFilters(DEFAULT_APPLICATIONS_FILTERS);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">지원 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <ApplicationsStatsCards stats={stats} />

      {/* 필터 섹션 */}
      <ApplicationsFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        showFilters={showFilters}
        onShowFiltersToggle={() => setShowFilters(!showFilters)}
        companies={companies}
        activeFilterCount={activeFilterCount}
        onRefresh={loadAllData}
        onExportCSV={exportToCSV}
        onClearFilters={clearFilters}
      />

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {paginatedApplications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">지원 내역이 없습니다</p>
            <p className="text-sm">아직 등록된 지원 내역이 없거나 검색 조건에 맞는 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지원일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지원자</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">기업</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공고</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(app.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{app.applicant_name}</p>
                            <p className="text-xs text-gray-500">{app.applicant_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{app.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 max-w-[200px] truncate" title={app.job_title}>
                          {app.job_title}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="상세 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/talent/${app.applicant_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="프로필 보기"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedApplications.length)} / {filteredAndSortedApplications.length}개
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-sm rounded-lg ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}
