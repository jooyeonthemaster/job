'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Users, Building2, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { type JobPosting } from '@/lib/firebase/admin-service';
import JobPositionAssignModal from '@/components/JobPositionAssignModal';
import { updateJobDisplayPosition } from '@/lib/firebase/admin-service';

// 커스텀 훅
import { 
  useAdminData,
  useAdminApplications,
  useAdminJobseekers,
  useAdminCompanies,
  useAdminJobs
} from '@/hooks/useAdminData';

// 탭 컴포넌트
import OverviewTab from '@/components/admin/OverviewTab';
import ApplicationsTab from '@/components/admin/ApplicationsTab';
import JobseekersTab from '@/components/admin/JobseekersTab';
import CompaniesTab from '@/components/admin/CompaniesTab';
import JobsTab from '@/components/admin/JobsTab';

// 타입
import { AdminTab } from '@/types/admin.types';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedJobForAssignment, setSelectedJobForAssignment] = useState<JobPosting | null>(null);

  // 커스텀 훅 사용
  const { loading, stats, recentActivities } = useAdminData();
  const { 
    talentApplications,
    jobApplications,
    applicationStats, 
    applicationsLoading,
    loadApplications, 
    handleStatusUpdate,
    handleJobApplicationStatusUpdate
  } = useAdminApplications();
  const { jobseekers, jobseekersLoading, loadJobseekers } = useAdminJobseekers();
  const { companies, companiesLoading, loadCompanies } = useAdminCompanies();
  const { jobPostings, jobStats, jobsLoading, loadJobs } = useAdminJobs();

  // 탭 설정
  const tabs = [
    { id: 'overview' as AdminTab, label: '대시보드', icon: TrendingUp },
    { id: 'talent-applications' as AdminTab, label: '채용 신청', icon: FileText, count: stats.pendingApplications },
    { id: 'jobseekers' as AdminTab, label: '구직자', icon: Users, count: stats.completedJobseekers },
    { id: 'companies' as AdminTab, label: '기업', icon: Building2, count: stats.activeCompanies },
    { id: 'job-postings' as AdminTab, label: '공고 관리', icon: Briefcase }
  ];

  const handlePositionAssign = (job: JobPosting) => {
    setSelectedJobForAssignment(job);
  };

  const handleAssignPosition = async (position: 'top' | 'middle' | 'bottom', priority: number) => {
    if (!selectedJobForAssignment) return;

    try {
      await updateJobDisplayPosition(selectedJobForAssignment.id, position, priority);
      await loadJobs(); // 목록 새로고침
      setSelectedJobForAssignment(null);
      alert('위치가 성공적으로 할당되었습니다!');
    } catch (error) {
      console.error('Failed to assign position:', error);
      alert('위치 할당에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">플랫폼 전반을 관리하고 모니터링하세요</p>
        </div>

        {/* 가로 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <nav className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 font-semibold bg-primary-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="space-y-6">
            {activeTab === 'overview' && (
              <OverviewTab
                loading={loading}
                stats={stats}
                recentActivities={recentActivities}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === 'talent-applications' && (
              <ApplicationsTab
                talentApplications={talentApplications}
                jobApplications={jobApplications}
                applicationStats={applicationStats}
                loading={applicationsLoading}
                onLoad={loadApplications}
                onStatusUpdate={handleStatusUpdate}
                onJobApplicationStatusUpdate={handleJobApplicationStatusUpdate}
              />
            )}

            {activeTab === 'jobseekers' && (
              <JobseekersTab
                jobseekers={jobseekers}
                loading={jobseekersLoading}
                onLoad={loadJobseekers}
              />
            )}

            {activeTab === 'companies' && (
              <CompaniesTab
                companies={companies}
                loading={companiesLoading}
                onLoad={loadCompanies}
              />
            )}

            {activeTab === 'job-postings' && (
              <JobsTab
                jobPostings={jobPostings}
                jobStats={jobStats}
                loading={jobsLoading}
                onLoad={loadJobs}
                onPositionAssign={handlePositionAssign}
              />
            )}
        </div>
      </main>

      {/* 위치 할당 모달 */}
      {selectedJobForAssignment && (
        <JobPositionAssignModal
          isOpen={!!selectedJobForAssignment}
          onClose={() => setSelectedJobForAssignment(null)}
          jobTitle={selectedJobForAssignment.title}
          jobCompany={selectedJobForAssignment.company?.name || ''}
          postingTier={selectedJobForAssignment.posting?.tier || 'standard'}
          currentJobs={jobPostings}
          onAssign={handleAssignPosition}
        />
      )}
    </div>
  );
}

