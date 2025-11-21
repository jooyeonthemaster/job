// 로그인 프로모션 패널 컴포넌트 (왼쪽 사이드)
// app/login/page.tsx에서 분리 (기능 변경 없음)

import Link from 'next/link';
import { ArrowRight, User, Building2 } from 'lucide-react';

type LoginPromoPanelProps = {
  isPerson: boolean;
};

export default function LoginPromoPanel({ isPerson }: LoginPromoPanelProps) {
  return (
    <div className="hidden lg:flex bg-white rounded-2xl shadow-md p-16 h-full flex-col justify-center items-start">
      <div className="inline-flex p-5 rounded-2xl mb-8 bg-primary-50">
        {isPerson ? (
          <User className="w-12 h-12 text-primary-600" />
        ) : (
          <Building2 className="w-12 h-12 text-primary-600" />
        )}
      </div>

      <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
        {isPerson ? (
          <>아직 계정이<br />없으신가요?</>
        ) : (
          <>아직 계정이<br />없으신가요?</>
        )}
      </h2>

      <p className="text-base text-gray-600 mb-12 leading-relaxed">
        {isPerson
          ? '지금 가입하고 글로벌 인재로서의 커리어를 시작하세요'
          : '지금 가입하고 우수한 글로벌 인재를 채용하세요'
        }
      </p>

      <Link
        href="/signup"
        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
      >
        회원가입 하러가기
        <ArrowRight className="w-6 h-6" />
      </Link>
    </div>
  );
}
