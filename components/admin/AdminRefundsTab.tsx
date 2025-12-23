// 관리자 환불 관리 탭 컴포넌트
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import {
  RefundStatus,
  REFUND_STATUS_LABELS,
  REFUND_STATUS_COLORS,
  REFUND_REASON_LABELS,
  RefundReasonType,
  PaymentType,
  PAYMENT_TYPE_LABELS,
} from '@/types/payment.types';
import {
  RotateCcw,
  Search,
  X,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface RefundRequest {
  id: string;
  payment_id: string;
  payment_type: PaymentType;
  company_id: string;
  original_amount: number;
  refund_amount: number;
  refund_rate: number;
  reason_type: RefundReasonType;
  reason_detail: string | null;
  status: RefundStatus;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  companies: {
    id: string;
    name: string;
    email: string;
  };
  paymentDetails?: {
    title?: string;
    status?: string;
    published_at?: string;
  };
}

interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalRefundedAmount: number;
}

interface AdminRefundsTabProps {
  isActive?: boolean;
}

export default function AdminRefundsTab({ isActive = true }: AdminRefundsTabProps) {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RefundStats | null>(null);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 선택된 환불 요청 (상세/처리 모달용)
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 데이터 로드
  useEffect(() => {
    if (isActive) {
      loadRefundRequests();
      loadStats();
    }
  }, [isActive, statusFilter]);

  // 환불 요청 목록 조회
  const loadRefundRequests = async () => {
    const TIMEOUT_MS = 10000; // 10초 타임아웃
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    setLoading(true);
    try {
      console.log('[AdminRefundsTab] 데이터 로드 시작...');

      // 세션 토큰 가져오기 (타임아웃 적용)
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('세션 조회 타임아웃 (10초)')), TIMEOUT_MS)
        )
      ]);

      const { data: { session } } = sessionResult;
      if (!session?.access_token) {
        console.error('No session');
        return;
      }

      console.log('[AdminRefundsTab] 세션 확인 완료, API 호출 중...');

      let url = '/api/payment/refund/process?';
      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`;
      }

      // fetch에 AbortController signal 추가
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to load refund requests:', error);
        return;
      }

      const data = await response.json();
      setRefundRequests(data.refundRequests || []);
      console.log('[AdminRefundsTab] 데이터 로드 완료:', data.refundRequests?.length || 0, '건');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[AdminRefundsTab] 요청 타임아웃 (10초 초과)');
      } else {
        console.error('Error loading refund requests:', error);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('refund_requests')
        .select('status, refund_amount');

      if (error) throw error;

      const stats: RefundStats = {
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        approved: requests?.filter(r => r.status === 'approved').length || 0,
        completed: requests?.filter(r => r.status === 'completed').length || 0,
        rejected: requests?.filter(r => r.status === 'rejected').length || 0,
        totalRefundedAmount: requests
          ?.filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // 환불 처리 (승인/거절)
  const processRefund = async (requestId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    setProcessingId(requestId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/payment/refund/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          refundRequestId: requestId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '처리 중 오류가 발생했습니다.');
        return;
      }

      alert(data.message);
      setSelectedRequest(null);
      setRejectionReason('');
      loadRefundRequests();
      loadStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  // 필터링된 결과
  const filteredRequests = refundRequests.filter(req => {
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return (
        req.companies?.name?.toLowerCase().includes(search) ||
        req.companies?.email?.toLowerCase().includes(search) ||
        req.paymentDetails?.title?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // 금액 포맷
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">환불 요청을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-md p-5 border-2 border-gray-200 hover:border-primary-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">전체 요청</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}건</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-5 border-2 border-yellow-400 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">대기 중</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}건</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-5 border-2 border-green-400 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">환불 완료</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}건</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-5 border-2 border-red-400 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">거절됨</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}건</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-5 border-2 border-primary-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">총 환불액</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(stats.totalRefundedAmount)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 검색 */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="기업명, 이메일, 공고 제목 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RefundStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="pending">대기 중</option>
                <option value="approved">승인됨</option>
                <option value="completed">환불 완료</option>
                <option value="rejected">거절됨</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>
          </div>
        </div>

        {/* 환불 요청 리스트 */}
        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">환불 요청이 없습니다</p>
              <p className="text-sm">조건에 맞는 환불 요청이 없습니다.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* 상태 아이콘 */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      request.status === 'pending' ? 'bg-yellow-50' :
                      request.status === 'completed' ? 'bg-green-50' :
                      request.status === 'rejected' ? 'bg-red-50' :
                      'bg-gray-100'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      ) : request.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : request.status === 'rejected' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <RotateCcw className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {request.paymentDetails?.title || PAYMENT_TYPE_LABELS[request.payment_type]}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                          REFUND_STATUS_COLORS[request.status]
                        }`}>
                          {REFUND_STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {request.companies?.name || '기업 정보 없음'}
                        </span>
                        <span>•</span>
                        <span>{PAYMENT_TYPE_LABELS[request.payment_type]}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.requested_at)}
                        </span>
                        <span>•</span>
                        <span>{REFUND_REASON_LABELS[request.reason_type]}</span>
                      </div>
                    </div>
                  </div>

                  {/* 금액 */}
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500 mb-1">환불 요청액</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(request.refund_amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ({Math.round(request.refund_rate * 100)}% 환불)
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 상세/처리 모달 */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">환불 요청 상세</h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 상태 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">환불 상태</p>
                  <span className={`inline-flex px-4 py-2 rounded-lg font-medium border ${
                    REFUND_STATUS_COLORS[selectedRequest.status]
                  }`}>
                    {REFUND_STATUS_LABELS[selectedRequest.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">결제 유형</p>
                  <p className="font-medium">{PAYMENT_TYPE_LABELS[selectedRequest.payment_type]}</p>
                </div>
              </div>

              {/* 기업 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">기업 정보</p>
                <p className="text-lg font-semibold mb-1">{selectedRequest.companies?.name}</p>
                <p className="text-sm text-gray-600">{selectedRequest.companies?.email}</p>
              </div>

              {/* 결제/환불 금액 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">원래 결제 금액</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedRequest.original_amount)}
                  </p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-primary-700 mb-1">환불 요청 금액</p>
                  <p className="text-xl font-bold text-primary-700">
                    {formatCurrency(selectedRequest.refund_amount)}
                    <span className="text-sm font-normal ml-2">
                      ({Math.round(selectedRequest.refund_rate * 100)}%)
                    </span>
                  </p>
                </div>
              </div>

              {/* 환불 사유 */}
              <div>
                <p className="text-sm text-gray-500 mb-1">환불 사유</p>
                <p className="font-medium">{REFUND_REASON_LABELS[selectedRequest.reason_type]}</p>
                {selectedRequest.reason_detail && (
                  <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                    {selectedRequest.reason_detail}
                  </p>
                )}
              </div>

              {/* 요청 일시 */}
              <div>
                <p className="text-sm text-gray-500 mb-1">요청 일시</p>
                <p>{formatDate(selectedRequest.requested_at)}</p>
              </div>

              {/* 거절 사유 (거절된 경우) */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-medium mb-1">거절 사유</p>
                  <p className="text-red-800">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {/* 처리 (대기 중인 경우) */}
              {selectedRequest.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">처리 대기 중</p>
                      <p className="text-sm text-yellow-700">
                        이 환불 요청을 검토하고 승인 또는 거절해주세요.
                      </p>
                    </div>
                  </div>

                  {/* 거절 사유 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 시 사유 입력
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="거절할 경우 사유를 입력해주세요."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* 처리 버튼 */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => processRefund(selectedRequest.id, 'approve')}
                      disabled={processingId === selectedRequest.id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processingId === selectedRequest.id ? '처리 중...' : '환불 승인'}
                    </button>
                    <button
                      onClick={() => processRefund(selectedRequest.id, 'reject')}
                      disabled={processingId === selectedRequest.id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      {processingId === selectedRequest.id ? '처리 중...' : '환불 거절'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
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
