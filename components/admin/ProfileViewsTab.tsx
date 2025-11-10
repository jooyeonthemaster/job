'use client';

import { useState, useEffect } from 'react';
import { Eye, Building2, User, DollarSign, Calendar, Filter, Download, RefreshCw } from 'lucide-react';

interface ProfileView {
  id: string;
  // 기업 정보
  companyId: string;
  companyName: string;
  companyNameEn?: string;
  companyLogo?: string;
  companyIndustry?: string;
  companyLocation?: string;
  // 구직자 정보
  talentId: string;
  talentName: string;
  talentEmail?: string;
  talentNationality?: string;
  talentProfileImage?: string;
  // 결제 정보
  paymentStatus: string;
  paymentAmount: number;
  paymentId?: string;
  paymentTransactionId?: string;
  paymentMethod?: string;
  paymentPaidAt?: string;
  // 날짜 정보
  createdAt: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  totalRevenue: number;
}

export default function ProfileViewsTab() {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [filteredViews, setFilteredViews] = useState<ProfileView[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfileViews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [views, statusFilter, searchQuery]);

  const fetchProfileViews = async () => {
    try {
      setLoading(true);
      setError(null);

      // 세션 토큰 가져오기
      const { data: { session } } = await import('@/lib/supabase/config').then(m => m.supabase.auth.getSession());

      if (!session) {
        throw new Error('세션이 없습니다. 로그인이 필요합니다.');
      }

      const response = await fetch('/api/admin/profile-views', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 에러 상세:', errorData);
        throw new Error(errorData.error || '프로필 열람 내역을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setViews(data.views || []);
        setStats(data.stats || {
          total: 0,
          paid: 0,
          pending: 0,
          failed: 0,
          totalRevenue: 0
        });
      } else {
        throw new Error(data.error || '알 수 없는 오류');
      }
    } catch (err) {
      console.error('프로필 열람 내역 조회 실패:', err);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = views;

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(view => view.paymentStatus === statusFilter);
    }

    // 검색어 필터 (기업명, 구직자명, 이메일)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(view =>
        view.companyName.toLowerCase().includes(query) ||
        view.talentName.toLowerCase().includes(query) ||
        (view.talentEmail && view.talentEmail.toLowerCase().includes(query))
      );
    }

    setFilteredViews(filtered);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '결제 완료';
      case 'pending':
        return '대기 중';
      case 'failed':
        return '실패';
      case 'refunded':
        return '환불됨';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['결제일시', '기업명', '구직자명', '구직자 이메일', '결제 상태', '금액', '결제ID', '거래ID'];
    const rows = filteredViews.map(view => [
      formatDate(view.paymentPaidAt || view.createdAt),
      view.companyName,
      view.talentName,
      view.talentEmail || '-',
      getStatusLabel(view.paymentStatus),
      `${view.paymentAmount.toLocaleString()}원`,
      view.paymentId || '-',
      view.paymentTransactionId || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `profile-views-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 열람 내역 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchProfileViews}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">전체 열람</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">결제 완료</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">대기 중</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">실패</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalRevenue / 10000).toFixed(0)}만원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              상태 필터
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="paid">결제 완료</option>
              <option value="pending">대기 중</option>
              <option value="failed">실패</option>
              <option value="refunded">환불됨</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명, 구직자명, 이메일 검색..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchProfileViews}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              새로고침
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4 inline mr-1" />
              CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기업
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구직자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제 정보
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredViews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    프로필 열람 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredViews.map((view) => (
                  <tr key={view.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(view.paymentPaidAt || view.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {view.companyLogo ? (
                            <img
                              src={view.companyLogo}
                              alt={view.companyName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {view.companyName}
                          </p>
                          {view.companyIndustry && (
                            <p className="text-xs text-gray-500">{view.companyIndustry}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {view.talentProfileImage ? (
                            <img
                              src={view.talentProfileImage}
                              alt={view.talentName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {view.talentName}
                          </p>
                          {view.talentEmail && (
                            <p className="text-xs text-gray-500">{view.talentEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(view.paymentStatus)}`}>
                        {getStatusLabel(view.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {view.paymentAmount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {view.paymentMethod && (
                          <p className="text-xs">방식: {view.paymentMethod}</p>
                        )}
                        {view.paymentTransactionId && (
                          <p className="text-xs truncate max-w-xs" title={view.paymentTransactionId}>
                            거래ID: {view.paymentTransactionId}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 (향후 추가 가능) */}
        {filteredViews.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold">{filteredViews.length}</span>건의 결과
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
