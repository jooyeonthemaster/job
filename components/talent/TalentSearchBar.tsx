// 인재풀 검색 바 컴포넌트
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { Search } from 'lucide-react';

type TalentSearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export default function TalentSearchBar({ searchTerm, onSearchChange }: TalentSearchBarProps) {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
          글로벌 인재 풀
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          전 세계의 검증된 전문가들과 함께하세요
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-2 flex items-center max-w-3xl">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="이름, 직무, 기술로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 py-3"
            />
          </div>
          <button className="btn-primary">
            검색하기
          </button>
        </div>
      </div>
    </section>
  );
}
