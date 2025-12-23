// 기업 대시보드 사이드바 컴포넌트

'use client';

import { MenuItem, TabId } from '@/types/company-dashboard.types';
import { ChevronRight, Eye } from 'lucide-react';

interface DashboardSidebarProps {
  menuItems: MenuItem[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const DashboardSidebar = ({ menuItems, activeTab, onTabChange }: DashboardSidebarProps) => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            // 기업 인증 탭은 특별한 스타일 적용
            if (item.id === 'verification') {
              return (
                <li key={item.id} className="pt-2">
                  <button
                    onClick={() => onTabChange(item.id as TabId)}
                    className={`w-full group ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md shadow-lg'
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* 추가 액션 버튼 */}
                  {activeTab === 'verification' && (
                    <div className="mt-2 px-2 space-y-2">
                      <button
                        onClick={() => onTabChange('profile')}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all border border-gray-200 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>현재 정보 확인하기</span>
                      </button>
                    </div>
                  )}
                </li>
              );
            }

            // 일반 탭
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id as TabId)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                    ${activeTab === item.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

