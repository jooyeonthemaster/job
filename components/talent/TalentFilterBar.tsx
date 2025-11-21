// 인재풀 상단 필터 바 컴포넌트
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { Filter } from 'lucide-react';

type TalentFilterBarProps = {
  selectedNationality: string;
  selectedExperience: string;
  selectedAvailability: string;
  nationalities: string[];
  onNationalityChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
};

export default function TalentFilterBar({
  selectedNationality,
  selectedExperience,
  selectedAvailability,
  nationalities,
  onNationalityChange,
  onExperienceChange,
  onAvailabilityChange
}: TalentFilterBarProps) {
  return (
    <section className="bg-white border-b sticky top-16 z-40">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center gap-6 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">국적</span>
            <select
              value={selectedNationality}
              onChange={(e) => onNationalityChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">모든 국적</option>
              {nationalities.map(nat => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">경력</span>
            <select
              value={selectedExperience}
              onChange={(e) => onExperienceChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">모든 경력</option>
              <option value="0-2">0-2년</option>
              <option value="3-5">3-5년</option>
              <option value="6+">6년 이상</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">가용성</span>
            <select
              value={selectedAvailability}
              onChange={(e) => onAvailabilityChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">모두</option>
              <option value="immediate">즉시 가능</option>
              <option value="2weeks">2주 이내</option>
              <option value="1month">1개월 이내</option>
            </select>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            상세조건
          </button>
        </div>
      </div>
    </section>
  );
}
