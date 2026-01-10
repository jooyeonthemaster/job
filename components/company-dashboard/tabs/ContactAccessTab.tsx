// 연락처 열람 요청 탭 컴포넌트 (기업용)
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Briefcase, Clock, Eye, CheckCircle2, XCircle, AlertCircle, Send, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/config';

interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  phone_country_code: string;
  headline: string | null;
  profile_image_url: string | null;
  experience_years: number | null;
  desired_position: string | null;
  skills: string[] | null;
}

interface ContactAccessRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  company_message: string | null;
  requested_at: string;
  responded_at: string | null;
  target_user_id: string;
  users: UserInfo | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function ContactAccessTab() {
  const [requests, setRequests] = useState<ContactAccessRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/contact-access/sent${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '요청 목록을 불러올 수 없습니다.');
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('Fetch contact access requests error:', err);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (dateString: string) => {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">요청 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-900 font-medium">오류 발생</p>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">연락처 열람 요청</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
            구직자에게 보낸 연락처 열람 요청 목록입니다 (총 {stats.total}건)
          </p>
        </div>
        <Link
          href="/talent"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <User className="w-4 h-4" />
          인재풀 보기
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 sm:p-4 rounded-lg text-center transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          <div className="text-xs sm:text-sm mt-0.5 sm:mt-1">전체</div>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`p-3 sm:p-4 rounded-lg text-center transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
          <div className="text-xs sm:text-sm mt-0.5 sm:mt-1">대기 중</div>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`p-3 sm:p-4 rounded-lg text-center transition-all ${
            filter === 'approved'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold">{stats.approved}</div>
          <div className="text-xs sm:text-sm mt-0.5 sm:mt-1">승인됨</div>
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`p-3 sm:p-4 rounded-lg text-center transition-all ${
            filter === 'rejected'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold">{stats.rejected}</div>
          <div className="text-xs sm:text-sm mt-0.5 sm:mt-1">거절됨</div>
        </button>
      </div>

      {/* 요청 목록 */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-md p-6 sm:p-12 shadow-sm text-center">
          <Send className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">
            {filter === 'all'
              ? '아직 보낸 연락처 열람 요청이 없습니다'
              : `${filter === 'pending' ? '대기 중인' : filter === 'approved' ? '승인된' : '거절된'} 요청이 없습니다`}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            인재풀에서 관심있는 구직자에게 연락처 열람을 요청해보세요
          </p>
          <Link
            href="/talent"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base font-medium"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            인재풀 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {requests.map((request) => {
            const user = request.users;
            const isApproved = request.status === 'approved';

            return (
              <div
                key={request.id}
                className={`bg-white rounded-md p-4 sm:p-6 shadow-sm border transition-all ${
                  isApproved
                    ? 'border-green-200 hover:border-green-300'
                    : 'border-gray-200 hover:border-primary-300'
                } hover:shadow-md`}
              >
                {/* 모바일 레이아웃 */}
                <div className="sm:hidden">
                  {/* 상단: 프로필 이미지 + 이름 + 상태 */}
                  <div className="flex items-start gap-3 mb-3">
                    <Link
                      href={user ? `/talent/${request.target_user_id}` : '#'}
                      className="shrink-0"
                    >
                      {user?.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center border-2 border-gray-200">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          href={user ? `/talent/${request.target_user_id}` : '#'}
                          className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors truncate"
                        >
                          {user?.full_name || '알 수 없는 사용자'}
                        </Link>
                        {renderStatusBadge(request.status)}
                      </div>
                      {user?.headline && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {user.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 연락처 정보 (승인된 경우만 표시) */}
                  {isApproved && user && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800 text-sm">연락처 정보</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <a
                            href={`mailto:${user.email}`}
                            className="text-green-800 hover:underline truncate"
                          >
                            {user.email}
                          </a>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            <a
                              href={`tel:${user.phone_country_code || '+82'}${user.phone}`}
                              className="text-green-800 hover:underline"
                            >
                              {user.phone_country_code || '+82'} {user.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 추가 정보 */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-600">
                    {user?.desired_position && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span>{user.desired_position}</span>
                      </div>
                    )}
                    {user?.experience_years !== null && user?.experience_years !== undefined && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>경력 {user.experience_years}년</span>
                      </div>
                    )}
                  </div>

                  {/* 스킬 */}
                  {user?.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {user.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{user.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 요청 정보 */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-gray-200 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      <span>{formatDate(request.requested_at)}</span>
                    </div>
                    {request.responded_at && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatDate(request.responded_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* 프로필 보기 버튼 */}
                  <Link
                    href={user ? `/talent/${request.target_user_id}` : '#'}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    프로필 보기
                  </Link>
                </div>

                {/* PC/태블릿 레이아웃 */}
                <div className="hidden sm:flex items-start gap-6">
                  {/* 프로필 이미지 */}
                  <Link
                    href={user ? `/talent/${request.target_user_id}` : '#'}
                    className="shrink-0"
                  >
                    {user?.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 hover:border-primary-300 transition-colors"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center border-2 border-gray-200 hover:border-primary-300 transition-colors">
                        <User className="w-10 h-10 text-primary-600" />
                      </div>
                    )}
                  </Link>

                  {/* 프로필 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={user ? `/talent/${request.target_user_id}` : '#'}
                            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {user?.full_name || '알 수 없는 사용자'}
                          </Link>
                          {renderStatusBadge(request.status)}
                        </div>
                        {user?.headline && (
                          <p className="text-gray-700 font-medium">
                            {user.headline}
                          </p>
                        )}
                      </div>
                      <Link
                        href={user ? `/talent/${request.target_user_id}` : '#'}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        프로필 보기
                      </Link>
                    </div>

                    {/* 연락처 정보 (승인된 경우만 표시) */}
                    {isApproved && user && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">연락처 정보</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-green-600" />
                            <a
                              href={`mailto:${user.email}`}
                              className="text-green-800 hover:underline"
                            >
                              {user.email}
                            </a>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-green-600" />
                              <a
                                href={`tel:${user.phone_country_code || '+82'}${user.phone}`}
                                className="text-green-800 hover:underline"
                              >
                                {user.phone_country_code || '+82'} {user.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 추가 정보 */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {user?.desired_position && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{user.desired_position}</span>
                        </div>
                      )}
                      {user?.experience_years !== null && user?.experience_years !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>경력 {user.experience_years}년</span>
                        </div>
                      )}
                    </div>

                    {/* 스킬 */}
                    {user?.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {user.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{user.skills.length - 5}개
                          </span>
                        )}
                      </div>
                    )}

                    {/* 요청 메시지 */}
                    {request.company_message && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-1">보낸 메시지</p>
                        <p className="text-sm text-gray-700 italic">
                          &ldquo;{request.company_message}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* 요청 정보 */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Send className="w-4 h-4" />
                        <span>{formatDate(request.requested_at)} 요청</span>
                      </div>
                      {request.responded_at && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{formatDate(request.responded_at)} 응답</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5">
            i
          </div>
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-medium mb-1">연락처 열람 요청 안내</p>
            <ul className="space-y-1 text-blue-700">
              <li>구직자가 요청을 승인하면 이메일과 전화번호를 확인할 수 있습니다</li>
              <li>거절된 요청은 일정 시간 후 다시 요청할 수 있습니다</li>
              <li>승인된 연락처 정보는 언제든지 다시 확인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
