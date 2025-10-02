// 관리자 공고 관리 탭 컴포넌트

import { useEffect } from 'react';
import { RefreshCw, Eye, Briefcase, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { type JobPosting } from '@/lib/firebase/admin-service';
import { updateJobPaymentStatus } from '@/lib/firebase/admin-service';
import { JobStats } from '@/types/admin.types';

interface JobsTabProps {
  jobPostings: JobPosting[];
  jobStats: JobStats;
  loading: boolean;
  onLoad: () => Promise<void>;
  onPositionAssign: (job: JobPosting) => void;
}

export default function JobsTab({
  jobPostings,
  jobStats,
  loading,
  onLoad,
  onPositionAssign
}: JobsTabProps) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const handlePaymentStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateJobPaymentStatus(jobId, newStatus as 'pending' | 'paid' | 'confirmed');
      await onLoad();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('결제 상태 업데이트에 실패했습니다');
    }
  };

  const getTierBadge = (job: JobPosting) => {
    if (!job.posting) {
      return <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">기존 공고</span>;
    }
    
    if (job.posting.tier === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-secondary-500 to-pink-500 text-white text-xs font-medium rounded-full">
          <Zap className="w-3 h-3" />
          프리미엄
        </span>
      );
    } else if (job.posting.tier === 'top') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
          <Star className="w-3 h-3" />
          최상단
        </span>
      );
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">일반</span>;
    }
  };

  const getPaymentStatusBadge = (job: JobPosting) => {
    if (!job.payment) {
      return <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">기존 공고</span>;
    }
    
    const status = job.payment.status;
    if (status === 'confirmed') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">결제 완료</span>;
    } else if (status === 'paid') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">입금 확인</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">입금 대기</span>;
    }
  };

  const getDisplayPositionBadge = (job: JobPosting) => {
    const pos = job.display?.position;
    if (pos === 'top') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">최상단 영역</span>;
    } else if (pos === 'middle') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">중단 영역</span>;
    } else if (pos === 'bottom') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">하단 영역</span>;
    } else {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">미할당</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">공고 관리</h2>
        <button 
          onClick={onLoad}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{jobStats.total}</p>
          <p className="text-xs text-gray-600">전체</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{jobStats.pendingPayment}</p>
          <p className="text-xs text-gray-600">입금대기</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{jobStats.paid}</p>
          <p className="text-xs text-gray-600">입금확인</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{jobStats.confirmed}</p>
          <p className="text-xs text-gray-600">결제완료</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{jobStats.active}</p>
          <p className="text-xs text-gray-600">활성</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{jobStats.pendingAssignment}</p>
          <p className="text-xs text-gray-600">위치미할당</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{jobStats.legacy}</p>
          <p className="text-xs text-gray-600">기존공고</p>
        </div>
      </div>

      {/* 공고 목록 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">공고 로딩 중...</p>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">등록된 공고가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공고 정보</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">노출 위치</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 정보</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UI 위치</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobPostings.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    {/* 공고 정보 */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {job.company?.logo && (
                          <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.company?.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* 노출 위치 */}
                    <td className="px-4 py-4">
                      {getTierBadge(job)}
                    </td>

                    {/* 결제 정보 */}
                    <td className="px-4 py-4">
                      {job.posting ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {job.posting.totalAmount?.toLocaleString()}원
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.posting.duration}일
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    {/* 결제 상태 */}
                    <td className="px-4 py-4">
                      {job.payment ? (
                        <select
                          value={job.payment.status}
                          onChange={(e) => handlePaymentStatusChange(job.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">입금 대기</option>
                          <option value="paid">입금 확인</option>
                          <option value="confirmed">결제 완료</option>
                        </select>
                      ) : (
                        getPaymentStatusBadge(job)
                      )}
                    </td>

                    {/* UI 위치 */}
                    <td className="px-4 py-4">
                      {job.display?.position ? (
                        <div>
                          {getDisplayPositionBadge(job)}
                          <button
                            onClick={() => onPositionAssign(job)}
                            className="mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                          >
                            위치 변경
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {job.payment?.status === 'confirmed' || !job.payment ? (
                            <button
                              onClick={() => onPositionAssign(job)}
                              className="w-full px-3 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              위치 할당하기
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">결제 완료 후 할당 가능</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 액션 */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                        title="공고 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

