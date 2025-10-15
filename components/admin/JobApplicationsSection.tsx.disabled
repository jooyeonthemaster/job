// 채용공고 지원 관리 섹션

import { CheckCircle, XCircle, Mail, Phone, User, Briefcase, Eye } from 'lucide-react';
import { JobApplication } from '@/lib/firebase/application-service';
import Link from 'next/link';

interface JobApplicationsSectionProps {
  jobApplications: JobApplication[];
  onStatusUpdate: (applicationId: string, newStatus: JobApplication['status']) => Promise<void>;
}

export default function JobApplicationsSection({
  jobApplications,
  onStatusUpdate
}: JobApplicationsSectionProps) {
  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'reviewing':
        return '검토중';
      case 'accepted':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">📄 채용공고 지원</h3>
        <p className="text-sm text-gray-600">구직자가 채용공고에 지원한 내역입니다.</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{jobApplications.length}</p>
          <p className="text-sm text-gray-600">전체</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {jobApplications.filter(a => a.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-600">대기중</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {jobApplications.filter(a => a.status === 'reviewing').length}
          </p>
          <p className="text-sm text-gray-600">검토중</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {jobApplications.filter(a => a.status === 'accepted').length}
          </p>
          <p className="text-sm text-gray-600">승인</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {jobApplications.filter(a => a.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-600">거절</p>
        </div>
      </div>

      {/* 지원 목록 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">지원자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">채용공고</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">회사</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">담당자 연락처</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">상태</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">지원일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobApplications.length > 0 ? (
                jobApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    {/* 지원자 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.applicantName}</p>
                          <p className="text-xs text-gray-500">{app.applicantEmail}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 채용공고 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <div>
                          <Link 
                            href={`/jobs/${app.jobId}`}
                            className="text-sm font-medium text-primary-600 hover:underline"
                          >
                            {app.jobTitle}
                          </Link>
                          <p className="text-xs text-gray-500">ID: {app.jobId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 회사 */}
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {app.companyName}
                    </td>
                    
                    {/* 담당자 연락처 */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {app.managerName && (
                          <p className="text-xs text-gray-700 font-medium">{app.managerName}</p>
                        )}
                        {app.managerEmail && (
                          <a 
                            href={`mailto:${app.managerEmail}`}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                          >
                            <Mail className="w-3 h-3" />
                            {app.managerEmail}
                          </a>
                        )}
                        {app.managerPhone && (
                          <p className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            {app.managerPhone}
                          </p>
                        )}
                        {!app.managerName && !app.managerEmail && !app.managerPhone && (
                          <p className="text-xs text-gray-400">정보 없음</p>
                        )}
                      </div>
                    </td>
                    
                    {/* 상태 */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    
                    {/* 지원일 */}
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    
                    {/* 액션 */}
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'reviewing')}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100"
                              title="검토중으로 변경"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'accepted')}
                              className="p-1 hover:bg-green-50 rounded text-green-600"
                              title="승인"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'rejected')}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="거절"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {app.status === 'reviewing' && (
                          <>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'accepted')}
                              className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => onStatusUpdate(app.id!, 'rejected')}
                              className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                            >
                              거절
                            </button>
                          </>
                        )}
                        {(app.status === 'accepted' || app.status === 'rejected') && (
                          <span className="text-xs text-gray-400">완료됨</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    지원 내역이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 최근 지원 상세 정보 */}
      {jobApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 지원 상세 정보 (최근 5개)</h3>
          <div className="space-y-4">
            {jobApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.applicantName} → {app.jobTitle}
                    </p>
                    <p className="text-sm text-gray-600">{app.companyName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>
                
                {/* 지원 메시지 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">지원 메시지:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.message}</p>
                </div>
                
                {/* 담당자 정보 */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-2">📞 담당자 연락처:</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    {app.managerName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {app.managerName}
                      </span>
                    )}
                    {app.managerEmail && (
                      <a 
                        href={`mailto:${app.managerEmail}`}
                        className="flex items-center gap-1 text-primary-600 hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        {app.managerEmail}
                      </a>
                    )}
                    {app.managerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {app.managerPhone}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  지원자: {app.applicantEmail} | {new Date(app.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

