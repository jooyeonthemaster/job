// 커리어 팁 컴포넌트

import { BookOpen } from 'lucide-react';

export default function CareerTip() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">오늘의 커리어 팁</h3>
      </div>
      <p className="text-sm text-gray-700 mb-3">
        프로필에 구체적인 프로젝트 경험과 성과를 추가하면 기업의 관심을 더 받을 수 있어요.
      </p>
      <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
        더 많은 팁 보기 →
      </button>
    </div>
  );
}
