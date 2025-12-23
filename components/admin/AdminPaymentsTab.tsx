// 관리자 결제 내역 탭 컴포넌트
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/config';
import {
  AdminPaymentHistoryItem,
  AdminPaymentFilters,
  PaymentSortBy,
  PaymentType,
  PaymentStatus,
  PAYMENT_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_SORT_LABELS,
  POSTING_TIER_LABELS,
  POSTING_TIER_COLORS,
  PaymentStats,
} from '@/types/payment.types';
import {
  CreditCard,
  FileText,
  User,
  Calendar,
  DollarSign,
  Filter,
  Download,
  TrendingUp,
  Search,
  X,
  ChevronDown,
  Building2,
} from 'lucide-react';

interface AdminPaymentsTabProps {
  isActive?: boolean;
}

export default function AdminPaymentsTab({ isActive = true }: AdminPaymentsTabProps) {
  const [payments, setPayments] = useState<AdminPaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

  // 필터 상태
  const [filters, setFilters] = useState<AdminPaymentFilters>({
    type: 'all',
    status: 'all',
    search: '',
    companyId: 'all',
    companySearch: '',
  });

  // 정렬 상태
  const [sortBy, setSortBy] = useState<PaymentSortBy>('date_desc');

  // 필터 및 정렬 UI 표시 상태
  const [showFilters, setShowFilters] = useState(false);

  // 선택된 결제 내역 (상세 모달용)
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentHistoryItem | null>(null);

  // 데이터 로드
  useEffect(() => {
    if (isActive) {
      loadAllData();
    }
  }, [isActive]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 순차적 로딩으로 변경 (Race Condition 방지)
      await loadPayments();
      // 결제 내역 로드 후 통계 및 기업 목록 로드
      await Promise.all([loadStats(), loadCompanies()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 기업 목록 조회
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

  // 결제 내역 조회 (전체)
  const loadPayments = async () => {
    // setLoading(true); // 상위에서 제어
    try {
      // 1. 채용 공고 결제 내역
      const { data: jobPayments, error: jobError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_id,
          posting_tier,
          posting_price,
          posting_vat_amount,
          posting_total_amount,
          payment_status,
          payment_paid_at,
          created_at,
          companies!inner (
            id,
            name,
            email
          )
        `)
        .in('payment_status', ['paid', 'confirmed'])
        .order('payment_paid_at', { ascending: false });

      if (jobError) throw jobError;

      // 2. 인재풀 열람 결제 내역
      const { data: profilePayments, error: profileError } = await supabase
        .from('profile_view_payments')
        .select(`
          id,
          talent_id,
          company_id,
          payment_status,
          payment_amount,
          payment_paid_at,
          created_at,
          users!talent_id (
            full_name,
            email,
            headline
          ),
          companies!inner (
            id,
            name,
            email
          )
        `)
        .in('payment_status', ['paid', 'confirmed'])
        .order('payment_paid_at', { ascending: false });

      if (profileError) throw profileError;

      // 3. 통합 결제 내역 생성
      const jobHistoryItems: AdminPaymentHistoryItem[] = (jobPayments || []).map((job: any) => ({
        id: job.id,
        type: 'job_posting' as PaymentType,
        title: job.title || '제목 없음',
        subtitle: POSTING_TIER_LABELS[job.posting_tier as keyof typeof POSTING_TIER_LABELS] || job.posting_tier,
        payment_status: job.payment_status,
        payment_amount: job.posting_price || 0,
        payment_vat: job.posting_vat_amount || 0,
        payment_total: job.posting_total_amount || 0,
        payment_date: job.payment_paid_at || job.created_at,
        created_at: job.created_at,
        posting_tier: job.posting_tier,
        company_id: job.companies.id,
        company_name: job.companies.name,
        company_email: job.companies.email,
      }));

      const profileHistoryItems: AdminPaymentHistoryItem[] = (profilePayments || []).map((payment: any) => ({
        id: payment.id,
        type: 'profile_view' as PaymentType,
        title: payment.users?.full_name || '이름 없음',
        subtitle: payment.users?.email || '',
        payment_status: payment.payment_status,
        payment_amount: payment.payment_amount || 0,
        payment_vat: 0,
        payment_total: payment.payment_amount || 0,
        payment_date: payment.payment_paid_at || payment.created_at,
        created_at: payment.created_at,
        talent_headline: payment.users?.headline,
        company_id: payment.companies.id,
        company_name: payment.companies.name,
        company_email: payment.companies.email,
      }));

      // 통합 및 정렬
      const allPayments = [...jobHistoryItems, ...profileHistoryItems];
      setPayments(allPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
    // finally {
    //   setLoading(false);
    // }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      const { data: jobPayments } = await supabase
        .from('jobs')
        .select('posting_total_amount, payment_paid_at')
        .in('payment_status', ['paid', 'confirmed']);

      const { data: profilePayments } = await supabase
        .from('profile_view_payments')
        .select('payment_amount, payment_paid_at')
        .in('payment_status', ['paid', 'confirmed']);

      const jobTotal = (jobPayments || []).reduce((sum, p) => sum + (p.posting_total_amount || 0), 0);
      const profileTotal = (profilePayments || []).reduce((sum, p) => sum + (p.payment_amount || 0), 0);

      // 이번 달 금액 계산
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

      const monthlyJobs = (jobPayments || []).filter(p =>
        new Date(p.payment_paid_at) >= firstDayOfMonth
      );
      const monthlyProfiles = (profilePayments || []).filter(p =>
        new Date(p.payment_paid_at) >= firstDayOfMonth
      );

      const yearlyJobs = (jobPayments || []).filter(p =>
        new Date(p.payment_paid_at) >= firstDayOfYear
      );
      const yearlyProfiles = (profilePayments || []).filter(p =>
        new Date(p.payment_paid_at) >= firstDayOfYear
      );

      const monthlyAmount =
        monthlyJobs.reduce((sum, p) => sum + (p.posting_total_amount || 0), 0) +
        monthlyProfiles.reduce((sum, p) => sum + (p.payment_amount || 0), 0);

      const yearlyAmount =
        yearlyJobs.reduce((sum, p) => sum + (p.posting_total_amount || 0), 0) +
        yearlyProfiles.reduce((sum, p) => sum + (p.payment_amount || 0), 0);

      setStats({
        totalPayments: (jobPayments?.length || 0) + (profilePayments?.length || 0),
        totalAmount: jobTotal + profileTotal,
        jobPostingCount: jobPayments?.length || 0,
        jobPostingAmount: jobTotal,
        profileViewCount: profilePayments?.length || 0,
        profileViewAmount: profileTotal,
        monthlyAmount,
        yearlyAmount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // 필터링 및 정렬된 결제 내역
  const filteredAndSortedPayments = useMemo(() => {
    let result = [...payments];

    // 필터 적용
    if (filters.type && filters.type !== 'all') {
      result = result.filter(p => p.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(p => p.payment_status === filters.status);
    }

    if (filters.companyId && filters.companyId !== 'all') {
      result = result.filter(p => p.company_id === filters.companyId);
    }

    if (filters.companySearch && filters.companySearch.trim()) {
      const searchLower = filters.companySearch.toLowerCase();
      result = result.filter(p =>
        p.company_name.toLowerCase().includes(searchLower) ||
        (p.company_email && p.company_email.toLowerCase().includes(searchLower))
      );
    }

    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(searchLower))
      );
    }

    if (filters.dateFrom) {
      result = result.filter(p => new Date(p.payment_date) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      result = result.filter(p => new Date(p.payment_date) <= new Date(filters.dateTo!));
    }

    // 정렬 적용
    switch (sortBy) {
      case 'date_desc':
        result.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
        break;
      case 'amount_desc':
        result.sort((a, b) => b.payment_total - a.payment_total);
        break;
      case 'amount_asc':
        result.sort((a, b) => a.payment_total - b.payment_total);
        break;
    }

    return result;
  }, [payments, filters, sortBy]);

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      search: '',
      companyId: 'all',
      companySearch: '',
    });
  };

  // 금액 포맷
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결제 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-md p-6 border-2 border-gray-200 hover:border-primary-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">총 결제 건수</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}건</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-6 border-2 border-primary-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">총 결제 금액</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-6 border-2 border-gray-200 hover:border-primary-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">이번 달 결제</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-6 border-2 border-gray-200 hover:border-primary-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">올해 결제</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.yearlyAmount)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 필터 및 정렬 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 검색 */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색 (제목, 이메일 등)"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 필터 토글 버튼 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>필터</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* 다운로드 버튼 */}
            <button
              onClick={() => alert('Excel 다운로드 기능 (추후 구현)')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Excel 다운로드</span>
            </button>
          </div>

          {/* 필터 옵션 (펼쳐진 상태) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 기업 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기업 검색</label>
                <input
                  type="text"
                  placeholder="기업명 또는 이메일"
                  value={filters.companySearch || ''}
                  onChange={(e) => setFilters({ ...filters, companySearch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 결제 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">결제 유형</label>
                <select
                  value={filters.type || 'all'}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="job_posting">채용 공고 등록</option>
                  <option value="profile_view">인재풀 열람</option>
                </select>
              </div>

              {/* 결제 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">결제 상태</label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="pending">결제 대기</option>
                  <option value="paid">결제 완료</option>
                  <option value="confirmed">결제 확인</option>
                  <option value="failed">결제 실패</option>
                  <option value="refunded">환불 완료</option>
                </select>
              </div>

              {/* 시작 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 종료 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 필터 초기화 버튼 */}
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 정렬 및 결과 수 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredAndSortedPayments.length}</span>건의 결제 내역
          </p>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">정렬:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PaymentSortBy)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(PAYMENT_SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 결제 내역 리스트 */}
        <div className="divide-y divide-gray-200">
          {filteredAndSortedPayments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">결제 내역이 없습니다</p>
              <p className="text-sm">필터 조건을 변경하거나 새로운 결제를 진행해주세요.</p>
            </div>
          ) : (
            filteredAndSortedPayments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* 아이콘 */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {payment.type === 'job_posting' ? (
                        <FileText className="w-6 h-6 text-gray-600" />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{payment.title}</h3>
                        {payment.posting_tier && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${POSTING_TIER_COLORS[payment.posting_tier]
                            }`}>
                            {POSTING_TIER_LABELS[payment.posting_tier]}
                          </span>
                        )}
                      </div>
                      {payment.subtitle && (
                        <p className="text-sm text-gray-500 truncate mb-2">{payment.subtitle}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {payment.company_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {PAYMENT_TYPE_LABELS[payment.type]}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.payment_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 금액 및 상태 */}
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {formatCurrency(payment.payment_total)}
                    </p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${PAYMENT_STATUS_COLORS[payment.payment_status]
                      }`}>
                      {PAYMENT_STATUS_LABELS[payment.payment_status]}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">결제 상세 내역</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 기업 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">기업 정보</p>
                <p className="text-lg font-semibold mb-1">{selectedPayment.company_name}</p>
                {selectedPayment.company_email && (
                  <p className="text-sm text-gray-600">{selectedPayment.company_email}</p>
                )}
              </div>

              {/* 결제 유형 및 상태 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">결제 유형</p>
                  <p className="text-lg font-semibold">{PAYMENT_TYPE_LABELS[selectedPayment.type]}</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-medium border ${PAYMENT_STATUS_COLORS[selectedPayment.payment_status]
                  }`}>
                  {PAYMENT_STATUS_LABELS[selectedPayment.payment_status]}
                </span>
              </div>

              {/* 제목/이름 */}
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {selectedPayment.type === 'job_posting' ? '채용 공고 제목' : '인재 이름'}
                </p>
                <p className="text-lg font-semibold">{selectedPayment.title}</p>
                {selectedPayment.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{selectedPayment.subtitle}</p>
                )}
              </div>

              {/* 결제 금액 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {selectedPayment.payment_vat !== undefined && selectedPayment.payment_vat > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">공급가액</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.payment_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">부가세 (10%)</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.payment_vat)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2"></div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">총 결제 금액</span>
                  <span className="font-bold text-xl text-primary-600">
                    {formatCurrency(selectedPayment.payment_total)}
                  </span>
                </div>
              </div>

              {/* 결제 날짜 */}
              <div>
                <p className="text-sm text-gray-500 mb-1">결제 일시</p>
                <p className="text-lg">{formatDate(selectedPayment.payment_date)}</p>
              </div>

              {/* 등급 (채용 공고인 경우) */}
              {selectedPayment.posting_tier && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">등록 등급</p>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${POSTING_TIER_COLORS[selectedPayment.posting_tier]
                    }`}>
                    {POSTING_TIER_LABELS[selectedPayment.posting_tier]}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
