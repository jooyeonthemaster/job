// 관리자 채용 신청 관리 탭 컴포넌트

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { type TalentApplication, type JobApplication } from '@/lib/firebase/application-service';
import { ApplicationStats } from '@/types/admin.types';
import JobApplicationsSection from './JobApplicationsSection';

interface ApplicationsTabProps {
  talentApplications: TalentApplication[];
  jobApplications: JobApplication[];
  applicationStats: ApplicationStats;
  loading: boolean;
  onLoad: () => Promise<void>;
  onStatusUpdate: (applicationId: string, newStatus: string) => Promise<void>;
  onJobApplicationStatusUpdate: (applicationId: string, newStatus: JobApplication['status']) => Promise<void>;
}

export default function ApplicationsTab({
  talentApplications,
  jobApplications,
  applicationStats,
  loading,
  onLoad,
  onStatusUpdate,
  onJobApplicationStatusUpdate
}: ApplicationsTabProps) {
  const [activeSection, setActiveSection] = useState<'job' | 'talent'>('job');
  
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">지원 관리</h2>
        <button 
          onClick={onLoad}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 섹션 선택 탭 */}
      <div className="bg-white rounded-xl shadow-sm p-1 flex gap-2">
        <button
          onClick={() => setActiveSection('job')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeSection === 'job'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📄 채용공고 지원 ({jobApplications.length})
        </button>
        <button
          onClick={() => setActiveSection('talent')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeSection === 'talent'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          👤 인재풀 제안 ({talentApplications.length})
        </button>
      </div>

      {/* 채용공고 지원 섹션 */}
      {activeSection === 'job' && (
        <JobApplicationsSection
          jobApplications={jobApplications}
          onStatusUpdate={onJobApplicationStatusUpdate}
        />
      )}

      {/* 인재풀 제안 섹션 */}
      {activeSection === 'talent' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">👤 인재풀 제안</h3>
            <p className="text-sm text-gray-600">기업이 인재풀에서 구직자에게 제안한 내역입니다.</p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{applicationStats.total}</p>
              <p className="text-sm text-gray-600">전체</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{applicationStats.pending}</p>
              <p className="text-sm text-gray-600">대기중</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{applicationStats.approved}</p>
              <p className="text-sm text-gray-600">승인</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{applicationStats.contacted}</p>
              <p className="text-sm text-gray-600">연락완료</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{applicationStats.rejected}</p>
              <p className="text-sm text-gray-600">거절</p>
            </div>
          </div>

          {/* 신청 목록 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">기업명</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">인재명</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">제안 직무</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">담당자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">상태</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">신청일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {talentApplications.length > 0 ? (
                talentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{app.companyName}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{app.talentName}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{app.position}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <a href={`mailto:${app.contactEmail}`} className="hover:text-primary-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {app.contactEmail}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status === 'pending' ? '대기중' :
                         app.status === 'approved' ? '승인됨' :
                         app.status === 'contacted' ? '연락완료' : '거절됨'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'approved')}
                              className="p-1.5 hover:bg-green-50 rounded text-green-600"
                              title="승인"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'rejected')}
                              className="p-1.5 hover:bg-red-50 rounded text-red-600"
                              title="거절"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <button
                            onClick={() => onStatusUpdate(app.id!, 'contacted')}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100"
                          >
                            연락완료 처리
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    신청 내역이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* 최근 신청 상세 정보 */}
        {talentApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 신청 상세 정보 (최근 5개)</h3>
          <div className="space-y-4">
            {talentApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{app.companyName} → {app.talentName}</p>
                    <p className="text-sm text-gray-600">{app.position}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status === 'pending' ? '대기중' :
                     app.status === 'approved' ? '승인됨' :
                     app.status === 'contacted' ? '연락완료' : '거절됨'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.message}</p>
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  담당자: {app.contactEmail} | {new Date(app.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

