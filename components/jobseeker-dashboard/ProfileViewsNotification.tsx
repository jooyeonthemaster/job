'use client';

import { useState, useEffect } from 'react';
import { Eye, Building2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ProfileView {
  id: string;
  companyId: string;
  companyName: string;
  companyNameEn?: string;
  companyLogo?: string;
  companyIndustry?: string;
  companyLocation?: string;
  amount: number;
  viewedAt: string;
  status: string;
}

interface ProfileViewsNotificationProps {
  userId?: string;
}

export default function ProfileViewsNotification({ userId }: ProfileViewsNotificationProps) {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfileViews();
    }
  }, [userId]);

  const fetchProfileViews = async () => {
    try {
      setLoading(true);
      setError(null);

      // 세션 토큰 가져오기
      const { data: { session } } = await import('@/lib/supabase/config').then(m => m.supabase.auth.getSession());

      if (!session) {
        console.error('세션이 없습니다');
        setError('로그인이 필요합니다');
        return;
      }

      const response = await fetch('/api/jobseeker/profile-views', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('프로필 열람 내역을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setViews(data.views || []);
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

  // 7일 이내 열람 여부 확인
  const isRecent = (viewedAt: string): boolean => {
    const viewDate = new Date(viewedAt);
    const now = new Date();
    const diffInDays = (now.getTime() - viewDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 0 ? '방금 전' : `${hours}시간 전`;
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">프로필 열람 알림</h3>
            <p className="text-sm text-gray-600">기업이 내 이력서를 확인했습니다</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded-lg"></div>
          <div className="h-20 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">프로필 열람 알림</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">프로필 열람 알림</h3>
            <p className="text-sm text-gray-600">아직 프로필을 열람한 기업이 없습니다</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">
            프로필을 완성하고 공개 설정하면 기업들이 내 이력서를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">프로필 열람 알림</h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{views.length}개</span> 기업이 내 이력서를 확인했습니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          관심 급상승
        </div>
      </div>

      {/* 프로필 열람 목록 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {views.map((view) => (
          <Link
            key={view.id}
            href={`/companies/${view.companyId}`}
            className="block group"
          >
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
              <div className="flex items-start gap-3">
                {/* 회사 로고 */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {view.companyLogo ? (
                    <img
                      src={view.companyLogo}
                      alt={view.companyName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* 회사 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {view.companyName}
                    </h4>
                    {isRecent(view.viewedAt) && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                    {view.companyIndustry && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {view.companyIndustry}
                      </span>
                    )}
                    {view.companyLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {view.companyLocation}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(view.viewedAt)} 열람</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-blue-600 font-medium">
                      {view.amount.toLocaleString()}원 결제
                    </span>
                  </div>
                </div>

                {/* 화살표 아이콘 */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 푸터 안내 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 기업이 프로필 열람 권한을 구매하면 자동으로 알림이 표시됩니다.
        </p>
      </div>
    </div>
  );
}
