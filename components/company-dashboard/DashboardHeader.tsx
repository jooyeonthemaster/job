// 기업 대시보드 헤더 컴포넌트

'use client';

import Link from 'next/link';
import { Building2, Bell, LogOut } from 'lucide-react';
import { Company } from '@/types/company-dashboard.types';

interface DashboardHeaderProps {
  company: Company;
  onSignOut: () => void;
}

export const DashboardHeader = ({ company, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">기업 대시보드</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 알림 */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* 프로필 메뉴 */}
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{company.name}</p>
                <p className="text-xs text-gray-500">{company.email}</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-gray-600 hover:text-red-600"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

