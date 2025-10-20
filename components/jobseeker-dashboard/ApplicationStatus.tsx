// 지원 현황 컴포넌트

import Link from 'next/link';
import { Briefcase, Building, Calendar, ChevronRight } from 'lucide-react';

export default function ApplicationStatus() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          지원 현황
        </h2>
        <Link href="/applications" className="text-sm text-primary-600 hover:text-primary-700">
          모두 보기 →
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">테크노바 코리아</p>
              <p className="text-xs text-gray-600">프론트엔드 개발자 • 서류 검토 중</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">2일 전</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">글로벌테크</p>
              <p className="text-xs text-green-600 font-medium">1차 면접 예정 • 12월 5일 14:00</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
