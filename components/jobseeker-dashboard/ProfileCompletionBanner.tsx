// 프로필 완성도 배너 컴포넌트

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

type Props = {
  profileCompletion: number;
};

export default function ProfileCompletionBanner({ profileCompletion }: Props) {
  return (
    <section className="bg-yellow-50 border-b border-yellow-100">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                프로필 완성도: {profileCompletion}%
              </p>
              <p className="text-xs text-yellow-700">
                프로필을 완성하면 기업의 관심을 더 많이 받을 수 있어요
              </p>
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="text-sm font-medium text-yellow-900 hover:text-yellow-800"
          >
            프로필 완성하기 →
          </Link>
        </div>
        <div className="mt-2 h-2 bg-yellow-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>
    </section>
  );
}
