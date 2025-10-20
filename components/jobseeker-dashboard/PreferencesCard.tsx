// 선호 조건 카드 컴포넌트

import { Target, Briefcase, Building, Home } from 'lucide-react';
import type { ProfileData } from '@/types/jobseeker-dashboard.types';

type Props = {
  profileData: ProfileData | null;
};

export default function PreferencesCard({ profileData }: Props) {
  const hasAnyPreferences = profileData?.desiredJobCategory ||
    profileData?.desiredPositions ||
    profileData?.workType ||
    profileData?.companySize ||
    profileData?.remoteWork;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">선호 조건</h3>
      <div className="space-y-4">
        {/* 희망 직군 */}
        {profileData?.desiredJobCategory && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              희망 직군
            </p>
            <p className="text-sm text-gray-600">{profileData.desiredJobCategory}</p>
          </div>
        )}

        {/* 희망 직무 */}
        {profileData?.desiredPositions && profileData.desiredPositions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Target className="w-4 h-4" />
              희망 직무
            </p>
            <div className="flex flex-wrap gap-2">
              {profileData.desiredPositions.map((pos) => (
                <span key={pos} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 고용 형태 */}
        {profileData?.workType && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              고용 형태
            </p>
            <p className="text-sm text-gray-600">{profileData.workType}</p>
          </div>
        )}

        {/* 회사 규모 */}
        {profileData?.companySize && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Building className="w-4 h-4" />
              선호 회사 규모
            </p>
            <p className="text-sm text-gray-600">{profileData.companySize}</p>
          </div>
        )}

        {/* 재택근무 */}
        {profileData?.remoteWork && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Home className="w-4 h-4" />
              재택근무
            </p>
            <p className="text-sm text-gray-600">
              {profileData.remoteWork === '완전' ? '완전 재택근무' :
               profileData.remoteWork === '부분' ? '부분 재택근무' : '재택근무 불가'}
            </p>
          </div>
        )}

        {/* 프로필 미완성 안내 */}
        {!hasAnyPreferences && (
          <p className="text-sm text-gray-500">프로필에서 선호 조건을 추가해주세요</p>
        )}
      </div>
    </div>
  );
}
