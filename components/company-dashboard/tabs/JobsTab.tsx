// 채용 관리 탭 컴포넌트

'use client';

import Link from 'next/link';
import { Building2, Globe, Calendar, Eye, Edit, Trash2, PlusCircle, Briefcase } from 'lucide-react';
import { Job } from '@/types/company-dashboard.types';
import { formatDeadline } from '@/utils/jobFormatters';

interface JobsTabProps {
  jobs: Job[];
  loading: boolean;
  onDeleteJob: (jobId: string) => Promise<void>;
}

export const JobsTab = ({ jobs, loading, onDeleteJob }: JobsTabProps) => {
  const handleDelete = async (job: Job) => {
    if (confirm('정말 이 채용공고를 삭제하시겠습니까?')) {
      try {
        await onDeleteJob(job.id);
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('삭제에 실패했습니다');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">채용 관리</h1>
          <p className="text-gray-600">진행 중인 채용공고를 관리하세요</p>
        </div>
        <Link
          href="/company-dashboard/jobs/create"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          새 공고 등록
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">채용공고를 불러오는 중...</p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">아직 등록된 채용공고가 없습니다</p>
            <Link
              href="/company-dashboard/jobs/create"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              첫 채용공고 등록하기
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-700'
                        : job.status === 'draft'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {job.status === 'active' ? '모집중' : 
                       job.status === 'pending_approval' ? '승인대기' :
                       job.status === 'draft' ? '임시저장' : '마감'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      마감: {formatDeadline(job.deadline)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags?.slice(0, 5).map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="상세보기"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/company-dashboard/jobs/edit/${job.id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="수정하기"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(job)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제하기"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

