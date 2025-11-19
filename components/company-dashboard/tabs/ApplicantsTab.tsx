// 지원자 관리 탭 컴포넌트 - 실제 구현

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  Briefcase,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext_Supabase';

type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  jobs?: {
    id: string;
    title: string;
    location: string;
    employment_type: string;
    deadline: string;
  };
}

export const ApplicantsTab = () => {
  const { user, userProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  // 통계
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0
  });

  // 지원자 목록 조회
  useEffect(() => {
    const fetchApplications = async () => {
      if (!userProfile?.company_id) return;

      try {
        setLoading(true);
        const params = new URLSearchParams({
          companyId: userProfile.company_id,
        });

        if (selectedStatus !== 'all') {
          params.append('status', selectedStatus);
        }

        if (selectedJobId !== 'all') {
          params.append('jobId', selectedJobId);
        }

        const response = await fetch(`/api/company-applications?${params}`);
        const data = await response.json();

        if (response.ok) {
          setApplications(data.data || []);

          // 통계 계산
          const total = data.data.length;
          const pending = data.data.filter((app: Application) => app.status === 'pending').length;
          const reviewing = data.data.filter((app: Application) => app.status === 'reviewing').length;
          const accepted = data.data.filter((app: Application) => app.status === 'accepted').length;
          const rejected = data.data.filter((app: Application) => app.status === 'rejected').length;

          setStats({ total, pending, reviewing, accepted, rejected });
        } else {
          console.error('지원자 조회 실패:', data.error);
          setApplications([]);
        }
      } catch (error) {
        console.error('지원자 조회 오류:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userProfile?.company_id, selectedJobId, selectedStatus]);

  // 상태 변경
  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!confirm(`상태를 "${getStatusLabel(newStatus)}"로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/company-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ 상태가 변경되었습니다.');
        // 목록 새로고침
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
      } else {
        alert(`❌ ${data.error || '상태 변경에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('❌ 서버 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    const labels: Record<ApplicationStatus, string> = {
      pending: '지원 대기',
      reviewing: '검토 중',
      accepted: '합격',
      rejected: '불합격'
    };
    return labels[status];
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewing':
        return <Eye className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
    }
  };

  // 검색 필터링
  const filteredApplications = applications.filter(app => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.applicant_name.toLowerCase().includes(query) ||
        app.applicant_email.toLowerCase().includes(query) ||
        app.job_title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 공고 목록 (필터용)
  const uniqueJobs = Array.from(
    new Set(applications.map(app => app.job_id))
  ).map(jobId => {
    const app = applications.find(a => a.job_id === jobId);
    return app ? { id: jobId, title: app.job_title } : null;
  }).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">지원자 관리</h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">전체</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-yellow-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">지원 대기</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-blue-100">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">검토 중</p>
              <p className="text-2xl font-bold text-blue-700">{stats.reviewing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">합격</p>
              <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-red-100">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700">불합격</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* 채용공고 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              채용공고
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체 공고</option>
              {uniqueJobs.map(job => job && (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              지원 상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체 상태</option>
              <option value="pending">지원 대기</option>
              <option value="reviewing">검토 중</option>
              <option value="accepted">합격</option>
              <option value="rejected">불합격</option>
            </select>
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              검색
            </label>
            <input
              type="text"
              placeholder="이름, 이메일, 공고 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* 지원자 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">지원자가 없습니다</p>
            <p className="text-sm text-gray-500">채용공고를 등록하고 인재를 채용하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">지원자</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">채용공고</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">지원일</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{application.applicant_name}</p>
                        <p className="text-sm text-gray-500">{application.applicant_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{application.job_title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(application.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedApplicant(application)}
                          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                          상세보기
                        </button>
                        {application.status !== 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(application.id, 'accepted')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            합격
                          </button>
                        )}
                        {application.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            불합격
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세 모달 (간단 버전) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">지원자 상세 정보</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedApplicant.job_title}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">지원자 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">이름:</span> {selectedApplicant.applicant_name}</p>
                  <p><span className="font-medium">이메일:</span> {selectedApplicant.applicant_email}</p>
                  <p><span className="font-medium">지원일:</span> {new Date(selectedApplicant.created_at).toLocaleString('ko-KR')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">지원 메시지</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplicant.message}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">지원 상태</h3>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedApplicant.status)}`}>
                  {getStatusIcon(selectedApplicant.status)}
                  {getStatusLabel(selectedApplicant.status)}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">액션</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.open(`/talent/${selectedApplicant.applicant_id}`, '_blank');
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    인재 프로필 보기
                  </button>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
