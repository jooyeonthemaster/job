'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Building2, MapPin, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  logo: string | null;
  industry: string | null;
  location: string | null;
  employee_count: string | null;
}

interface ContactAccessRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  company_message: string | null;
  requested_at: string;
  responded_at: string | null;
  requester_company_id: string;
  companies: Company | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ContactAccessRequestsProps {
  userId?: string;
}

export default function ContactAccessRequests({ userId }: ContactAccessRequestsProps) {
  const [requests, setRequests] = useState<ContactAccessRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await import('@/lib/supabase/config').then(m => m.supabase.auth.getSession());

      if (!session) {
        setError('로그인이 필요합니다');
        return;
      }

      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/contact-access/received${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('열람 요청 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('열람 요청 목록 조회 실패:', err);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId, fetchRequests]);

  const handleRespond = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setRespondingId(requestId);

      const { data: { session } } = await import('@/lib/supabase/config').then(m => m.supabase.auth.getSession());

      if (!session) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`/api/contact-access/${requestId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '요청 처리에 실패했습니다.');
      }

      // 목록 새로고침
      await fetchRequests();

      // 성공 알림
      alert(data.message);
    } catch (err) {
      console.error('요청 응답 실패:', err);
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setRespondingId(null);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}시간 전`;
    } else if (diffInHours < 48) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // 7일 이내 확인
  const isRecent = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            대기 중
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            승인됨
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            거절됨
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">연락처 열람 요청</h3>
            <p className="text-sm text-gray-600">기업들의 연락처 열람 요청을 관리합니다</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-gray-100 rounded-lg"></div>
          <div className="h-24 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">연락처 열람 요청</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">연락처 열람 요청</h3>
            <p className="text-sm text-gray-600">
              {stats.pending > 0 ? (
                <>
                  <span className="font-semibold text-blue-600">{stats.pending}개</span> 승인 대기 중
                </>
              ) : (
                '연락처 열람 요청을 관리합니다'
              )}
            </p>
          </div>
        </div>
        {stats.pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium animate-pulse">
            <AlertCircle className="w-4 h-4" />
            응답 필요
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-lg text-center transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="text-lg font-bold">{stats.total}</div>
          <div className="text-xs">전체</div>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`p-3 rounded-lg text-center transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          <div className="text-lg font-bold">{stats.pending}</div>
          <div className="text-xs">대기</div>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`p-3 rounded-lg text-center transition-all ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <div className="text-lg font-bold">{stats.approved}</div>
          <div className="text-xs">승인</div>
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`p-3 rounded-lg text-center transition-all ${
            filter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <div className="text-lg font-bold">{stats.rejected}</div>
          <div className="text-xs">거절</div>
        </button>
      </div>

      {/* 요청 목록 */}
      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? '아직 받은 연락처 열람 요청이 없습니다.'
              : `${filter === 'pending' ? '대기 중인' : filter === 'approved' ? '승인한' : '거절한'} 요청이 없습니다.`}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            기업이 연락처 열람을 요청하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {requests.map((request) => {
            const company = request.companies;
            const isPending = request.status === 'pending';
            const isResponding = respondingId === request.id;

            return (
              <div
                key={request.id}
                className={`border rounded-lg p-4 transition-all ${
                  isPending
                    ? 'border-yellow-200 bg-yellow-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 회사 로고 */}
                  <Link
                    href={company?.id ? `/companies/${company.id}` : '#'}
                    className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                  </Link>

                  {/* 요청 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={company?.id ? `/companies/${company.id}` : '#'}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {company?.name || '알 수 없는 기업'}
                      </Link>
                      {isRecent(request.requested_at) && isPending && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium animate-pulse">
                          NEW
                        </span>
                      )}
                      {renderStatusBadge(request.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      {company?.industry && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {company.industry}
                        </span>
                      )}
                      {company?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {company.location}
                        </span>
                      )}
                    </div>

                    {/* 요청 메시지 */}
                    {request.company_message && (
                      <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
                        <p className="text-sm text-gray-700 italic">
                          &ldquo;{request.company_message}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(request.requested_at)} 요청</span>
                      {request.responded_at && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span>{formatDate(request.responded_at)} 응답</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 승인/거절 버튼 */}
                {isPending && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleRespond(request.id, 'approve')}
                      disabled={isResponding}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResponding ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      승인하기
                    </button>
                    <button
                      onClick={() => handleRespond(request.id, 'reject')}
                      disabled={isResponding}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResponding ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      거절하기
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 푸터 안내 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          연락처 열람을 승인하면 해당 기업에게 이메일과 전화번호가 공개됩니다.
        </p>
      </div>
    </div>
  );
}
