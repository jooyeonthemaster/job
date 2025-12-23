// 계정 삭제 모달 컴포넌트

'use client';

import * as Dialog from '@radix-ui/react-dialog';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: string;
}

export const DeleteAccountModal = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  error
}: DeleteAccountModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[90vw] max-w-md z-50 p-6">
          <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
            정말 탈퇴하시겠습니까?
          </Dialog.Title>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ 주의사항</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>모든 기업 정보가 영구 삭제됩니다</li>
                <li>등록한 채용공고가 모두 삭제됩니다</li>
                <li>지원자 데이터 및 활동 기록이 삭제됩니다</li>
                <li>삭제된 데이터는 복구할 수 없습니다</li>
              </ul>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Dialog.Close asChild>
              <button
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                취소
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  삭제 중...
                </>
              ) : (
                '탈퇴하기'
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

