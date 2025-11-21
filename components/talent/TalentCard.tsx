// 인재 카드 컴포넌트
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { useRouter } from 'next/navigation';
import {
  Globe,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Languages,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase/config';
import type { TalentProfile } from '@/lib/supabase/talent-service';
import { formatSalary, getLanguageColor } from '@/lib/utils/talent';

type TalentCardProps = {
  profile: TalentProfile;
  checkingAuth: boolean;
  isCompany: boolean;
  onLoginRequired: () => void;
};

export default function TalentCard({
  profile,
  checkingAuth,
  isCompany,
  onLoginRequired
}: TalentCardProps) {
  const router = useRouter();

  const handleViewProfile = async (e: React.MouseEvent) => {
    e.preventDefault();

    // 인증 확인 중이면 대기
    if (checkingAuth) {
      return;
    }

    // 기업이 아니면 로그인 모달 표시
    if (!isCompany) {
      onLoginRequired();
      return;
    }

    // 기업이면 결제 여부 확인
    try {
      // 현재 사용자의 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onLoginRequired();
        return;
      }

      const response = await fetch('/api/payment/profile/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ talentId: profile.id })
      });

      const data = await response.json();

      if (data.hasPaid) {
        // 이미 결제했으면 상세 페이지로
        router.push(`/talent/${profile.id}`);
      } else {
        // 결제 안 했으면 결제 페이지로
        router.push(`/payment/profile/${profile.id}`);
      }
    } catch (error) {
      console.error('Failed to check payment:', error);
      alert('결제 확인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Profile Avatar */}
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700 shrink-0">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.name}
                </h3>
                <p className="text-gray-600">{profile.title}</p>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {profile.rating}
                  </span>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-gray-400" />
                {profile.nationality}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {profile.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {profile.experience}년 경력
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                {formatSalary(profile.expectedSalary?.min, profile.expectedSalary?.max)}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.slice(0, 6).map(skill => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
              {profile.skills.length > 6 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                  +{profile.skills.length - 6} more
                </span>
              )}
            </div>

            {/* Languages */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm">
                <Languages className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">언어:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map(lang => (
                  <span key={lang.language} className={`px-2 py-0.5 rounded text-xs ${getLanguageColor(lang.level)}`}>
                    {lang.language} ({lang.level})
                  </span>
                )) || <span className="text-xs text-gray-400">언어 정보 없음</span>}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline text-gray-400 mr-1" />
                {profile.availability}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleViewProfile}
                  disabled={checkingAuth}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors ${
                    checkingAuth ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {checkingAuth ? '확인 중...' : '프로필 보기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
