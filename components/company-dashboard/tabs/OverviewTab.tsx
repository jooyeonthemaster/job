// 대시보드 Overview 탭 컴포넌트

'use client';

import Link from 'next/link';
import { PlusCircle, Users, Eye, Edit } from 'lucide-react';
import { Company, Job, TabId } from '@/types/company-dashboard.types';
import { 
  getCompanyProfileChecklist, 
  calculateCompanyChecklistPercentage,
  calculateRequiredItemsPercentage,
  calculateOptionalItemsPercentage
} from '@/lib/utils/company-profile-checklist';
import CompanyProfileChecklist from '@/components/company-dashboard/CompanyProfileChecklist';
import CompanyProfileCompleteBanner from '@/components/company-dashboard/CompanyProfileCompleteBanner';

interface OverviewTabProps {
  company: Company;
  jobs: Job[];
  onTabChange: (tab: TabId) => void;
}

export const OverviewTab = ({ company, jobs, onTabChange }: OverviewTabProps) => {
  const checklist = getCompanyProfileChecklist(company);
  const checklistPercentage = calculateCompanyChecklistPercentage(checklist);
  const requiredPercentage = calculateRequiredItemsPercentage(checklist);
  const optionalPercentage = calculateOptionalItemsPercentage(checklist);
  const isComplete = optionalPercentage >= 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          안녕하세요, {company.name}님
        </h1>
        <p className="text-gray-600">오늘의 채용 현황을 확인하세요</p>
      </div>

      {/* 프로필 완성 축하 배너 (선택 항목 100%일 때만) */}
      {isComplete && <CompanyProfileCompleteBanner companyId={company.id} />}

      {/* 프로필 완성도 알림 (선택 항목 100% 미만일 때) */}
      {!isComplete && (
        <CompanyProfileChecklist
          checklist={checklist}
          checklistPercentage={checklistPercentage}
          requiredPercentage={requiredPercentage}
          optionalPercentage={optionalPercentage}
          company={company}
        />
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-md p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            href="/company-dashboard/jobs/create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <PlusCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">새 채용공고 등록</p>
          </Link>
          <button
            onClick={() => onTabChange('applicants')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">지원자 관리</p>
          </button>
          <Link
            href={`/companies/${company.id}`}
            target="_blank"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">기업 정보 미리보기</p>
          </Link>
          <Link
            href="/company-dashboard/edit"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">기업 정보 수정</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

