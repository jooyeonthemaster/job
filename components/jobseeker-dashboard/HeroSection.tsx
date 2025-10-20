// 대시보드 Hero 섹션 컴포넌트

import { MapPin, DollarSign, Shield } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import type { ProfileData } from '@/types/jobseeker-dashboard.types';

type Props = {
  profileData: ProfileData | null;
};

export default function HeroSection({ profileData }: Props) {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {profileData?.profileImageUrl ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <OptimizedImage
                  src={profileData.profileImageUrl}
                  alt={profileData.fullName}
                  width={80}
                  height={80}
                  type="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                {profileData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                환영합니다, {profileData?.fullName}님!
              </h1>
              <p className="text-gray-600">{profileData?.headline || '프로필을 완성해주세요'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profileData?.preferredLocations && profileData.preferredLocations.length > 0
                    ? profileData.preferredLocations.join(', ')
                    : '희망 근무지 미설정'}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {profileData?.salaryRange?.min && profileData?.salaryRange?.max
                    ? `${profileData.salaryRange.min}~${profileData.salaryRange.max}만원`
                    : '희망 연봉 미설정'}
                </span>
                {profileData?.visaSponsorship && (
                  <span className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    비자 후원 필요
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
