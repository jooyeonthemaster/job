'use client';

import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext_Supabase';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  jobTitle: string;
  companyName: string;
}

export default function JobApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  companyName
}: JobApplicationModalProps) {
  const { user, userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 🔍 디버깅: 사용자 정보 확인
  if (isOpen && process.env.NODE_ENV === 'development') {
    console.log('[JobApplicationModal] 사용자 정보:', {
      user_email: user?.email,
      user_metadata_email: user?.user_metadata?.email,
      userProfile_email: userProfile?.email,
      userProfile_full_name: userProfile?.full_name,
      user_metadata_full_name: user?.user_metadata?.full_name
    });
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!message.trim()) {
      setError('지원 메시지를 입력해주세요.');
      return;
    }

    if (message.trim().length < 10) {
      setError('지원 메시지는 최소 10자 이상 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(message.trim());
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || '지원서 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">채용 공고 지원</h2>
            <p className="text-sm text-gray-600 mt-1">
              {companyName} - {jobTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 지원자 정보 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-medium text-gray-900">지원자 정보</h3>
            <div className="text-sm text-gray-700">
              <p><span className="font-medium">이름:</span> {userProfile?.full_name || user?.user_metadata?.full_name || '이름 없음'}</p>
              <p><span className="font-medium">이메일:</span> {userProfile?.email || user?.email || user?.user_metadata?.email || '이메일 없음'}</p>
            </div>
          </div>

          {/* 지원 메시지 */}
          <div>
            <label htmlFor="application-message" className="block text-sm font-medium text-gray-900 mb-2">
              지원 메시지 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="application-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="간단한 자기소개와 지원 동기를 작성해주세요. (최소 10자)"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}자 / 최소 10자
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 안내 사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">📌 안내사항</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 지원서 제출 후 관리자 검토를 거쳐 담당자에게 전달됩니다.</li>
              <li>• 프로필 정보가 함께 전달되니 프로필을 미리 완성해주세요.</li>
              <li>• 담당자 연락을 기다려주시기 바랍니다.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || message.trim().length < 10}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  제출중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  지원하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

