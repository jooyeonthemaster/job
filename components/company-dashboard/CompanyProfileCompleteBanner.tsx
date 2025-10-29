// 기업 프로필 완성 축하 배너 컴포넌트

'use client';

import Link from 'next/link';
import { CheckCircle, Users, Edit3 } from 'lucide-react';

type Props = {
  companyId: string;
};

export default function CompanyProfileCompleteBanner({ companyId }: Props) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900 mb-2">
            🎉 기업 정보가 완성되었습니다!
          </h3>
          <p className="text-sm text-green-700 mb-4">
            모든 기업 정보를 작성하셨습니다. 이제 구직자들이 귀사의 정보를 보고 지원할 수 있어요.
          </p>
          <div className="flex gap-2">
            <Link
              href="/companies"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-center"
            >
              기업 목록 보기
            </Link>
            <Link
              href="/company-dashboard/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              정보 수정하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



