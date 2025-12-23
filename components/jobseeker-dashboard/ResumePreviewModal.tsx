// 이력서 미리보기 모달 컴포넌트

import PDFImageViewer from '@/components/PDFImageViewer';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  resumeFileUrl: string | null | undefined;
  resumeFileName: string | null | undefined;
  userId?: string;
};

export default function ResumePreviewModal({
  isOpen,
  onClose,
  resumeFileUrl,
  resumeFileName,
  userId
}: Props) {
  if (!isOpen || !resumeFileUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">이력서 미리보기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <PDFImageViewer
            pdfUrl={resumeFileUrl}
            fileName={resumeFileName || 'Resume'}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
