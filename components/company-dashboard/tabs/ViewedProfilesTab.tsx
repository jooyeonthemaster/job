// 열람한 프로필 탭 컴포넌트
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Briefcase, Clock, Eye, CreditCard } from 'lucide-react';
import { ViewedProfile } from '@/types/company-dashboard.types';
import { supabase } from '@/lib/supabase/config';

export function ViewedProfilesTab() {
  const [profiles, setProfiles] = useState<ViewedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchViewedProfiles();
  }, []);

  const fetchViewedProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch('/api/payment/profile/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 목록을 불러올 수 없습니다.');
      }

      const data = await response.json();
      setProfiles(data.payments || []);
    } catch (err: any) {
      console.error('Fetch viewed profiles error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <p className="text-red-900 font-medium mb-2">오류 발생</p>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={fetchViewedProfiles}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-md p-12 shadow-sm text-center">
        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          아직 열람한 프로필이 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          인재풀에서 관심있는 구직자의 프로필을 열람해보세요
        </p>
        <Link
          href="/talent"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <User className="w-5 h-5" />
          인재풀 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">열람한 프로필</h2>
          <p className="text-gray-600 mt-1">
            결제하여 열람한 구직자 프로필 목록입니다 (총 {profiles.length}명)
          </p>
        </div>
        <Link
          href="/talent"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <User className="w-4 h-4" />
          인재풀 보기
        </Link>
      </div>

      {/* 프로필 목록 */}
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-md p-6 shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-6">
              {/* 프로필 이미지 */}
              <div className="shrink-0">
                {profile.users.profile_image_url ? (
                  <img
                    src={profile.users.profile_image_url}
                    alt={profile.users.full_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {profile.users.full_name}
                    </h3>
                    {profile.users.headline && (
                      <p className="text-gray-700 font-medium">
                        {profile.users.headline}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/talent/${profile.talent_id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    상세보기
                  </Link>
                </div>

                {/* 추가 정보 */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {profile.users.desired_position && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{profile.users.desired_position}</span>
                    </div>
                  )}
                  {profile.users.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.users.email}</span>
                    </div>
                  )}
                  {profile.users.experience_years !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>경력 {profile.users.experience_years}년</span>
                    </div>
                  )}
                  {profile.users.desired_salary && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>희망연봉 {profile.users.desired_salary}</span>
                    </div>
                  )}
                </div>

                {/* 스킬 */}
                {profile.users.skills && profile.users.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.users.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.users.skills.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{profile.users.skills.length - 5}개
                      </span>
                    )}
                  </div>
                )}

                {/* 결제 정보 */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">
                      {formatPrice(profile.payment_amount)} 결제 완료
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(profile.payment_paid_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5">
            i
          </div>
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-medium mb-1">프로필 열람 안내</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 결제한 프로필은 언제든지 다시 확인할 수 있습니다</li>
              <li>• 이메일 및 연락처를 포함한 모든 정보가 공개됩니다</li>
              <li>• 관심있는 인재에게 직접 연락하여 채용을 진행하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
