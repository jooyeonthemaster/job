// 계정 설정 탭 컴포넌트

'use client';

import { UserX } from 'lucide-react';

interface SettingsTabProps {
  onDeleteAccountClick: () => void;
}

export const SettingsTab = ({ onDeleteAccountClick }: SettingsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">계정 설정</h2>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">위험 영역</h3>
          <button
            onClick={onDeleteAccountClick}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <UserX className="w-4 h-4" />
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

