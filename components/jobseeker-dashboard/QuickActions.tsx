// 빠른 작업 컴포넌트

import Link from 'next/link';
import { Search, Edit3, ChevronRight } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
      <div className="space-y-2">
        <Link
          href="/jobs"
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">채용공고 검색</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/profile/edit"
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">프로필 편집</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
