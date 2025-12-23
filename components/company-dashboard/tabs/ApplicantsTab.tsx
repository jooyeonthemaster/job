// 지원자 관리 탭 컴포넌트 - 실제 구현

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  XCircle
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  // 지원자 목록 조회
  useEffect(() => {
    const fetchApplications = async () => {
      // userProfile은 companies 테이블에서 가져오므로 .id를 사용
      const companyId = userProfile?.id || userProfile?.company_id;

      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({
          companyId: companyId,
        });

        const response = await fetch(`/api/company-applications?${params}`);
        const data = await response.json();

        if (response.ok) {
          setApplications(data.data || []);
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
  }, [userProfile?.company_id]);

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
    return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지원자 관리</h1>
          <p className="text-gray-600 mt-1">총 <span className="font-semibold text-primary-600">{applications.length}명</span>의 지원자</p>
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            검색
          </label>
          <input
            type="text"
            placeholder="이름, 이메일, 공고 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 지원자 테이블 */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
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
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedApplicant(application)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
