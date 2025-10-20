// 프로필 완성 축하 배너 컴포넌트

import Link from 'next/link';
import { CheckCircle, Search, Edit3 } from 'lucide-react';

export default function ProfileCompleteBanner() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900 mb-2">
            🎉 프로필이 완성되었습니다!
          </h3>
          <p className="text-sm text-green-700 mb-4">
            모든 프로필 항목을 작성하셨습니다. 이제 기업들이 당신의 프로필을 보고 스카우트 제안을 보낼 수 있어요.
          </p>
          <div className="flex gap-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              채용공고 둘러보기
            </Link>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              프로필 수정하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
