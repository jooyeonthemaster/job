// 로그인 필요 모달 컴포넌트
// app/talent/page.tsx에서 분리

'use client';

import { useRouter } from 'next/navigation';
import { Building2, UserPlus, LogIn, X } from 'lucide-react';

type LoginRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-slide-up">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              기업 회원 전용 서비스
            </h3>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 mb-2">
              인재 프로필은 기업 회원만 확인할 수 있습니다
            </p>
            <p className="text-sm text-gray-500">
              기업 회원으로 가입하고 우수한 글로벌 인재를 만나보세요!
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="space-y-3">
            {/* 기업 회원가입 (주요 CTA) */}
            <button
              onClick={() => router.push('/signup')}
              className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] font-semibold transition-all flex items-center justify-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              <span>회원가입</span>
            </button>

            {/* 구분선 */}
            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-400 bg-white">이미 회원이신가요?</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* 로그인 / 취소 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => router.push('/login')}
                className="flex-1 px-4 py-3 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
