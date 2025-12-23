// 인재풀 검색 바 컴포넌트
// app/talent/page.tsx에서 분리

'use client';

import { Search, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type TalentSearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export default function TalentSearchBar({ searchTerm, onSearchChange }: TalentSearchBarProps) {
  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* 헤더 영역 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            글로벌 인재 풀
          </h1>
          <p className="text-gray-500">
            전 세계의 검증된 전문가들과 함께하세요
          </p>
        </div>

        {/* 헤더 영역에 검색바 추가 */}
        <div className="mb-6 mt-4">
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 직무, 기술로 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <button className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shrink-0">
              검색하기
            </button>

            {/* 이력서 등록 CTA - Desktop */}
            <Link
              href="/signup"
              className="hidden md:flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-4 rounded-xl transition-all shadow-md hover:shadow-lg group min-w-[160px]"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm">나의 이력서 등록하기</span>
              <div className="flex items-center gap-1 text-xs text-white/80">
                <span>지금 시작하기</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 검색 영역 + CTA Container - Mobile only now mostly */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Mobile Button will be here, desktop one moved up */}


          {/* 모바일용 이력서 등록 버튼 */}
          <Link
            href="/signup"
            className="md:hidden flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-semibold">나의 이력서 등록하기</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
