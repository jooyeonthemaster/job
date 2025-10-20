import { User, Building2, Check } from 'lucide-react';
import type { SignupTab } from '@/types/signup.types';

interface BenefitsSectionProps {
  activeTab: SignupTab;
}

export default function BenefitsSection({ activeTab }: BenefitsSectionProps) {
  const isPerson = activeTab === 'jobseeker';

  return (
    <div className="bg-white rounded-2xl shadow-md p-10 h-full flex flex-col justify-between">
      <div>
        <div className="inline-flex p-4 rounded-xl mb-6 bg-primary-50">
          {isPerson ? (
            <User className="w-8 h-8 text-primary-600" />
          ) : (
            <Building2 className="w-8 h-8 text-primary-600" />
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {isPerson ? (
            <>글로벌 인재로서<br />커리어를 시작하세요</>
          ) : (
            <>최고의 글로벌<br />인재를 찾으세요</>
          )}
        </h2>

        <p className="text-gray-600 mb-8">
          {isPerson
            ? '한국에서의 새로운 기회를 발견하세요'
            : '우수한 글로벌 인재를 채용하세요'
          }
        </p>

        {isPerson ? (
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">AI 맞춤 채용공고</p>
                <p className="text-sm text-gray-600">나에게 딱 맞는 포지션 추천</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">비자 스폰서십 지원</p>
                <p className="text-sm text-gray-600">워크퍼밋 & 비자 지원 기업</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">간편한 지원 프로세스</p>
                <p className="text-sm text-gray-600">원클릭으로 빠른 지원</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">실시간 채용 알림</p>
                <p className="text-sm text-gray-600">새로운 기회를 놓치지 마세요</p>
              </div>
            </li>
          </ul>
        ) : (
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">검증된 글로벌 인재풀</p>
                <p className="text-sm text-gray-600">우수한 해외 인재 데이터베이스</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">효율적인 채용 관리</p>
                <p className="text-sm text-gray-600">지원자 관리 대시보드 제공</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">AI 인재 매칭</p>
                <p className="text-sm text-gray-600">최적의 후보자 자동 추천</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">프리미엄 채용공고</p>
                <p className="text-sm text-gray-600">최상단 노출과 3배 높은 조회수</p>
              </div>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
