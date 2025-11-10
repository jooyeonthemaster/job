'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/config';
import { TabId } from '@/types/company-dashboard.types';
import { DASHBOARD_MENU_ITEMS } from '@/constants/dashboard-menu';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { DashboardHeader } from '@/components/company-dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/company-dashboard/DashboardSidebar';
import { DeleteAccountModal } from '@/components/company-dashboard/DeleteAccountModal';
import { OverviewTab } from '@/components/company-dashboard/tabs/OverviewTab';
import { ProfileTab } from '@/components/company-dashboard/tabs/ProfileTab';
import { JobsTab } from '@/components/company-dashboard/tabs/JobsTab';
import { ApplicantsTab } from '@/components/company-dashboard/tabs/ApplicantsTab';
import { ViewedProfilesTab } from '@/components/company-dashboard/tabs/ViewedProfilesTab';
import { VerificationTab } from '@/components/company-dashboard/tabs/VerificationTab';
import { SettingsTab } from '@/components/company-dashboard/tabs/SettingsTab';

function CompanyDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Custom Hooks
  const { company, loading: authLoading } = useCompanyAuth();
  const { jobs, loading: jobsLoading, deleteJob } = useCompanyJobs(
    company?.id || null,
    activeTab === 'jobs'
  );
  const { isDeleting, error: deleteError, deleteAccount } = useDeleteAccount();

  // URL 파라미터에서 탭 확인
  useEffect(() => {
    const tab = searchParams.get('tab') as TabId;
    if (tab && ['overview', 'profile', 'jobs', 'applicants', 'viewed-profiles', 'verification', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  // 로딩 상태
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  // 기업 정보 없음
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">기업 정보를 불러올 수 없습니다.</p>
          <Link href="/login" className="text-primary-600 hover:underline mt-2">
            다시 로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader company={company} onSignOut={handleSignOut} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          menuItems={DASHBOARD_MENU_ITEMS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              company={company}
              jobs={jobs}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab company={company} />
          )}

          {activeTab === 'jobs' && (
            <JobsTab
              jobs={jobs}
              loading={jobsLoading}
              onDeleteJob={deleteJob}
            />
          )}

          {activeTab === 'applicants' && (
            <ApplicantsTab />
          )}

          {activeTab === 'viewed-profiles' && (
            <ViewedProfilesTab />
          )}

          {activeTab === 'verification' && (
            <VerificationTab companyId={company.id} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab onDeleteAccountClick={() => setDeleteModalOpen(true)} />
          )}
        </main>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

export default function CompanyDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CompanyDashboardContent />
    </Suspense>
  );
}
