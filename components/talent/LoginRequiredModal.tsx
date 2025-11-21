// 로그인 필요 모달 컴포넌트
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { useRouter } from 'next/navigation';

type LoginRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-600 to-cyan-600 px-6 py-8">
          <h3 className="text-2xl font-bold text-white text-center">
            기업 회원 전용
          </h3>
        </div>

        {/* 본문 */}
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 mb-2">
              프로필 확인은 기업 회원만 가능합니다
            </p>
            <p className="text-sm text-gray-500">
              기업 회원으로 로그인하시면 인재 프로필을 확인할 수 있습니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                router.push('/login');
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-cyan-600 text-white rounded-lg hover:shadow-lg font-medium transition-all"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
