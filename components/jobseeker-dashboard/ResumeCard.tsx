// 이력서 카드 컴포넌트

import Link from 'next/link';
import { FileText, Eye, Download, Edit3 } from 'lucide-react';

type Props = {
  resumeFileUrl: string | null | undefined;
  resumeFileName: string | null | undefined;
  resumeUploadedAt: string | null | undefined;
  onPreview: () => void;
};

export default function ResumeCard({
  resumeFileUrl,
  resumeFileName,
  resumeUploadedAt,
  onPreview
}: Props) {
  if (!resumeFileUrl) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          이력서
        </h3>
        <div className="flex items-center gap-2">
          {resumeFileUrl.endsWith('.pdf') && (
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </button>
          )}
          <a
            href={resumeFileUrl}
            download={resumeFileName || 'Resume'}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            다운로드
          </a>
          <Link
            href="/profile/edit/resume"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            수정
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <FileText className="w-8 h-8 text-red-500" />
        <div>
          <p className="font-medium text-gray-900">
            {resumeFileName || 'Resume.pdf'}
          </p>
          <p className="text-sm text-gray-500">
            업로드: {resumeUploadedAt ? new Date(resumeUploadedAt).toLocaleDateString('ko-KR') : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
