// 자기소개 카드 컴포넌트

import { User } from 'lucide-react';

type Props = {
  introduction: string | null | undefined;
};

export default function IntroductionCard({ introduction }: Props) {
  if (!introduction) return null;

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary-600" />
        자기소개
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {introduction}
      </p>
    </div>
  );
}
