'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Eye, Briefcase, Star, Zap, CheckCircle, XCircle, Grid3x3, Plus, Trash2, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import {
  getAllJobs,
  getJobStats,
  updateJobStatus,
  updatePaymentStatus,
  type JobWithCompany,
  type JobStats
} from '@/lib/supabase/admin-service';
import { supabase } from '@/lib/supabase/config';
import JobGridLayoutEditor from './JobGridLayoutEditor';

const ITEMS_PER_PAGE = 10;

interface Filters {
  search: string;
  status: string;
  paymentStatus: string;
  postingTier: string;
  displayPosition: string;
}

interface JobsTabProps {
  isActive?: boolean;
}

export default function JobsTab({ isActive = true }: JobsTabProps) {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    pending_approval: 0,
    active: 0,
    draft: 0,
    closed: 0,
    pendingPayment: 0,
    paid: 0,
    confirmed: 0,
    pendingAssignment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showGridEditor, setShowGridEditor] = useState(false);
  const [preselectedJobId, setPreselectedJobId] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    paymentStatus: '',
    postingTier: '',
    displayPosition: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, statsData] = await Promise.all([
        getAllJobs(),
        getJobStats()
      ]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      alert('데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive]);

  // 필터링된 공고 목록
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 검색어 필터
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(searchLower);
        const companyMatch = job.companies?.name.toLowerCase().includes(searchLower);
        if (!titleMatch && !companyMatch) return false;
      }

      // 상태 필터
      if (filters.status && job.status !== filters.status) return false;

      // 결제 상태 필터
      if (filters.paymentStatus && job.payment_status !== filters.paymentStatus) return false;

      // 노출 위치(티어) 필터
      if (filters.postingTier && job.posting_tier !== filters.postingTier) return false;

      // UI 위치 필터
      if (filters.displayPosition) {
        if (filters.displayPosition === 'unassigned') {
          if (job.display_position) return false;
        } else {
          if (job.display_position !== filters.displayPosition) return false;
        }
      }

      return true;
    });
  }, [jobs, filters]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      paymentStatus: '',
      postingTier: '',
      displayPosition: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const handlePaymentStatusChange = async (jobId: string, newStatus: 'pending' | 'paid' | 'confirmed') => {
    try {
      await updatePaymentStatus(jobId, newStatus);
      await loadData();
      alert(`결제 상태가 "${newStatus === 'pending' ? '입금 대기' : newStatus === 'paid' ? '입금 확인' : '결제 완료'}"로 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('결제 상태 업데이트에 실패했습니다: ' + (error as Error).message);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    if (!confirm('이 공고를 승인하시겠습니까?')) return;

    try {
      await updateJobStatus(jobId, 'active');
      alert('공고가 승인되었습니다.');
      await loadData();
    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('공고 승인에 실패했습니다.');
    }
  };

  const handleRejectJob = async (jobId: string) => {
    if (!confirm('이 공고를 반려하시겠습니까?')) return;

    try {
      await updateJobStatus(jobId, 'closed');
      alert('공고가 반려되었습니다.');
      await loadData();
    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('공고 반려에 실패했습니다.');
    }
  };

  const handlePositionAssign = (jobId: string) => {
    setPreselectedJobId(jobId);
    setShowGridEditor(true);
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`"${jobTitle}" 공고를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      alert('공고가 삭제되었습니다.');
      await loadData();
    } catch (error: unknown) {
      console.error('공고 삭제 실패:', error);
      alert(`삭제 실패: ${(error as Error).message}`);
    }
  };

  const handleCloseGridEditor = () => {
    setShowGridEditor(false);
    setPreselectedJobId(null);
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-secondary-500 to-pink-500 text-white text-xs font-medium rounded-full">
          <Zap className="w-3 h-3" />
          프리미엄
        </span>
      );
    } else if (tier === 'top') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
          <Star className="w-3 h-3" />
          최상단
        </span>
      );
    } else if (tier === 'test') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          테스트
        </span>
      );
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">일반</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      active: { label: '활성', color: 'green' },
      pending_approval: { label: '승인대기', color: 'yellow' },
      draft: { label: '임시저장', color: 'gray' },
      closed: { label: '마감', color: 'red' }
    };

    const config = statusConfig[status] || { label: status, color: 'gray' };

    return (
      <span className={`px-2 py-1 bg-${config.color}-100 text-${config.color}-700 text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getDisplayPositionBadge = (position: string | null) => {
    if (position === 'top') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">최상단 영역</span>;
    } else if (position === 'middle') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">중단 영역</span>;
    } else if (position === 'bottom') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">하단 영역</span>;
    } else {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">미할당</span>;
    }
  };

  return (
    <>
      <JobGridLayoutEditor
        isOpen={showGridEditor}
        onClose={handleCloseGridEditor}
        onSuccess={loadData}
        preselectedJobId={preselectedJobId}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">공고 관리</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs/create"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              공고 등록
            </Link>
            <button
              onClick={() => setShowGridEditor(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 text-sm font-medium flex items-center gap-2 shadow-md transition-all"
            >
              <Grid3x3 className="w-4 h-4" />
              그리드 레이아웃 편집
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <button onClick={() => handleFilterChange('status', '')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.status === '' ? 'ring-2 ring-primary-500' : ''}`}>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">전체</p>
          </button>
          <button onClick={() => handleFilterChange('status', 'pending_approval')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.status === 'pending_approval' ? 'ring-2 ring-yellow-500' : ''}`}>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending_approval}</p>
            <p className="text-xs text-gray-600">승인대기</p>
          </button>
          <button onClick={() => handleFilterChange('status', 'active')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.status === 'active' ? 'ring-2 ring-green-500' : ''}`}>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-gray-600">활성</p>
          </button>
          <button onClick={() => handleFilterChange('status', 'draft')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.status === 'draft' ? 'ring-2 ring-gray-500' : ''}`}>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            <p className="text-xs text-gray-600">임시저장</p>
          </button>
          <button onClick={() => handleFilterChange('paymentStatus', 'pending')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.paymentStatus === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayment}</p>
            <p className="text-xs text-gray-600">입금대기</p>
          </button>
          <button onClick={() => handleFilterChange('paymentStatus', 'paid')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.paymentStatus === 'paid' ? 'ring-2 ring-blue-500' : ''}`}>
            <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            <p className="text-xs text-gray-600">입금확인</p>
          </button>
          <button onClick={() => handleFilterChange('paymentStatus', 'confirmed')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.paymentStatus === 'confirmed' ? 'ring-2 ring-green-500' : ''}`}>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-gray-600">결제완료</p>
          </button>
          <button onClick={() => handleFilterChange('displayPosition', 'unassigned')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.displayPosition === 'unassigned' ? 'ring-2 ring-orange-500' : ''}`}>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingAssignment}</p>
            <p className="text-xs text-gray-600">위치미할당</p>
          </button>
          <button onClick={() => handleFilterChange('status', 'closed')} className={`bg-white rounded-md shadow-sm p-4 text-center hover:shadow-md transition-shadow ${filters.status === 'closed' ? 'ring-2 ring-red-500' : ''}`}>
            <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
            <p className="text-xs text-gray-600">마감</p>
          </button>
        </div>

        {/* 필터 영역 */}
        <div className="bg-white rounded-md shadow-sm p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 검색 */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="공고명, 회사명 검색..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* 필터 토글 버튼 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
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

            {/* 필터 초기화 */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                초기화
              </button>
            )}

            {/* 결과 수 표시 */}
            <div className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{filteredJobs.length}</span>개 공고
            </div>
          </div>

          {/* 상세 필터 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 상태 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">공고 상태</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">전체</option>
                  <option value="active">활성</option>
                  <option value="pending_approval">승인대기</option>
                  <option value="draft">임시저장</option>
                  <option value="closed">마감</option>
                </select>
              </div>

              {/* 결제 상태 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">결제 상태</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">전체</option>
                  <option value="pending">입금대기</option>
                  <option value="paid">입금확인</option>
                  <option value="confirmed">결제완료</option>
                </select>
              </div>

              {/* 노출 위치(티어) 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">노출 위치</label>
                <select
                  value={filters.postingTier}
                  onChange={(e) => handleFilterChange('postingTier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">전체</option>
                  <option value="premium">프리미엄</option>
                  <option value="top">최상단</option>
                  <option value="standard">일반</option>
                  <option value="test">테스트</option>
                </select>
              </div>

              {/* UI 위치 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">UI 위치</label>
                <select
                  value={filters.displayPosition}
                  onChange={(e) => handleFilterChange('displayPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">전체</option>
                  <option value="top">최상단 영역</option>
                  <option value="middle">중단 영역</option>
                  <option value="bottom">하단 영역</option>
                  <option value="unassigned">미할당</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 공고 목록 */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">공고 로딩 중...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {activeFilterCount > 0 ? '필터 조건에 맞는 공고가 없습니다' : '등록된 공고가 없습니다'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  필터 초기화
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공고 정보</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">노출 위치</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 정보</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UI 위치</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        {/* 공고 정보 */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {job.companies?.logo && (
                              <img
                                src={job.companies.logo}
                                alt={job.companies.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{job.title}</p>
                              <p className="text-sm text-gray-500">{job.companies?.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* 상태 */}
                        <td className="px-4 py-4">
                          {getStatusBadge(job.status)}
                        </td>

                        {/* 노출 위치 */}
                        <td className="px-4 py-4">
                          {getTierBadge(job.posting_tier)}
                        </td>

                        {/* 결제 정보 */}
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {job.posting_total_amount?.toLocaleString()}원
                            </p>
                            <p className="text-xs text-gray-500">
                              {job.posting_duration}일
                            </p>
                          </div>
                        </td>

                        {/* 결제 상태 */}
                        <td className="px-4 py-4">
                          <select
                            value={job.payment_status}
                            onChange={(e) => handlePaymentStatusChange(job.id, e.target.value as 'pending' | 'paid' | 'confirmed')}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">입금 대기</option>
                            <option value="paid">입금 확인</option>
                            <option value="confirmed">결제 완료</option>
                          </select>
                        </td>

                        {/* UI 위치 */}
                        <td className="px-4 py-4">
                          {job.display_position ? (
                            <div className="space-y-2">
                              {getDisplayPositionBadge(job.display_position)}
                              <div className="text-xs text-gray-500">
                                우선순위: {job.display_priority}
                              </div>
                              <button
                                onClick={() => handlePositionAssign(job.id)}
                                className="mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                              >
                                위치 변경
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {job.payment_status === 'confirmed' ? (
                                <button
                                  onClick={() => handlePositionAssign(job.id)}
                                  className="w-full px-3 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  위치 할당하기
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">결제 완료 후 할당 가능</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 액션 */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/jobs/${job.id}`}
                              target="_blank"
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                              title="공고 보기"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="공고 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {job.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveJob(job.id)}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 font-medium text-sm"
                                  title="승인"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  승인
                                </button>
                                <button
                                  onClick={() => handleRejectJob(job.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 font-medium text-sm"
                                  title="반려"
                                >
                                  <XCircle className="w-4 h-4" />
                                  반려
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} / {filteredJobs.length}개
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      처음
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* 페이지 번호 */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, arr) => {
                          const prevPage = arr[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-sm rounded-lg ${
                                  currentPage === page
                                    ? 'bg-primary-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      마지막
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
