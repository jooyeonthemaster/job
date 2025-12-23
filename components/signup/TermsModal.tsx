import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { COMPANY_TERMS } from '@/constants/company-terms';
import type { ModalType } from '@/types/signup.types';

interface TermsModalProps {
  open: boolean;
  modalType: ModalType;
  onOpenChange: (open: boolean) => void;
}

export default function TermsModal({ open, modalType, onOpenChange }: TermsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] z-50 flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              {modalType === 'terms' ? '서비스 이용약관' : '개인정보처리방침'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* 모달 내용 */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {modalType === 'terms'
                  ? COMPANY_TERMS.serviceTerms.content
                  : COMPANY_TERMS.privacyTerms.content}
              </pre>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <Dialog.Close asChild>
              <button className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                확인
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
