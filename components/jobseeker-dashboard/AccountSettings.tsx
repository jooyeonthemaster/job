// 계정 설정 컴포넌트

import { UserX } from 'lucide-react';

type Props = {
  onDeleteClick: () => void;
};

export default function AccountSettings({ onDeleteClick }: Props) {
  return (
    <div className="bg-white rounded-md shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 설정</h3>
      <div className="space-y-3">
        <button
          onClick={onDeleteClick}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <UserX className="w-4 h-4" />
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
