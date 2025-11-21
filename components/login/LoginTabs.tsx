// 로그인 탭 네비게이션 컴포넌트
// app/login/page.tsx에서 분리 (기능 변경 없음)

import type { LoginTab } from '@/hooks/useLoginForm';

type LoginTabsProps = {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
};

export default function LoginTabs({ activeTab, onTabChange }: LoginTabsProps) {
  return (
    <ul className="flex border-b border-gray-200 mb-8" role="tablist">
      <li className="flex-1">
        <button
          type="button"
          onClick={() => onTabChange('jobseeker')}
          className={`w-full pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'jobseeker'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          개인회원
        </button>
      </li>
      <li className="flex-1">
        <button
          type="button"
          onClick={() => onTabChange('company')}
          className={`w-full pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'company'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          기업회원
        </button>
      </li>
    </ul>
  );
}
