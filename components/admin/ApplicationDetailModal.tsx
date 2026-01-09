// 지원 상세 모달 컴포넌트
'use client';

import {
  JobApplicationWithDetails,
  JobApplicationStatus,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/types/job-application.types';
import {
  X,
  User,
  Building2,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: JobApplicationWithDetails;
  onClose: () => void;
}

export default function ApplicationDetailModal({
  application,
  onClose,
}: ApplicationDetailModalProps) {
  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태 뱃지
  const getStatusBadge = (status: JobApplicationStatus) => (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${APPLICATION_STATUS_COLORS[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">지원 상세 내역</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 지원자 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              지원자 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm font-medium text-gray-900">{application.applicant_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm text-gray-900">{application.applicant_email}</p>
              </div>
            </div>
            <a
              href={`/talent/${application.applicant_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              프로필 보기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 기업/공고 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              지원 공고 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">기업명</p>
                <p className="text-sm font-medium text-gray-900">{application.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">공고명</p>
                <p className="text-sm text-gray-900">{application.job_title}</p>
              </div>
            </div>
          </div>

          {/* 지원 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              지원 정보
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">지원일</p>
                <p className="text-sm text-gray-900">{formatDate(application.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">상태</p>
                {getStatusBadge(application.status)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">지원 메시지</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                {application.message || '(메시지 없음)'}
              </p>
            </div>
          </div>

          {/* 노트 (있는 경우) */}
          {application.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-700 mb-2">기업 노트</h3>
              <p className="text-sm text-yellow-800">{application.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
