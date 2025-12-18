'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase/config';
import {
  PaymentType,
  RefundReasonType,
  REFUND_REASON_LABELS,
  REFUND_POLICY
} from '@/types/payment.types';

interface RefundEligibility {
  canRefund: boolean;
  refundRate: number;
  refundAmount: number;
  reason: RefundReasonType | null;
  message: string;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  paymentType: PaymentType;
  paymentTitle: string;
  paymentAmount: number;
  onSuccess: () => void;
}

export default function RefundRequestModal({
  isOpen,
  onClose,
  paymentId,
  paymentType,
  paymentTitle,
  paymentAmount,
  onSuccess
}: RefundRequestModalProps) {
  const [eligibility, setEligibility] = useState<RefundEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonType, setReasonType] = useState<RefundReasonType | ''>('');
  const [reasonDetail, setReasonDetail] = useState('');

  // 환불 가능 여부 확인
  useEffect(() => {
    if (!isOpen) return;

    const checkEligibility = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await fetch(
          `/api/payment/refund/request?paymentId=${paymentId}&paymentType=${paymentType}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '환불 가능 여부 확인에 실패했습니다.');
          return;
        }

        setEligibility(data.eligibility);

        // 자동으로 환불 사유 설정
        if (data.eligibility.reason) {
          setReasonType(data.eligibility.reason);
        }
      } catch (err) {
        console.error('Eligibility check error:', err);
        setError('환불 가능 여부 확인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [isOpen, paymentId, paymentType]);

  // 환불 요청 제출
  const handleSubmit = async () => {
    if (!reasonType) {
      setError('환불 사유를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/payment/refund/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          paymentId,
          paymentType,
          reasonType,
          reasonDetail: reasonDetail.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '환불 요청에 실패했습니다.');
        return;
      }

      alert('환불 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Refund request error:', err);
      setError('환불 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 사용 가능한 환불 사유 목록
  const getAvailableReasons = (): RefundReasonType[] => {
    const reasons: RefundReasonType[] = [];

    if (paymentType === 'job_posting') {
      if (eligibility?.reason === 'before_publish') {
        reasons.push('before_publish');
      }
      if (eligibility?.reason === 'within_3days') {
        reasons.push('within_3days');
      }
    } else {
      if (eligibility?.reason === 'before_view') {
        reasons.push('before_view');
      }
    }

    // 공통 사유는 항상 선택 가능 (관리자가 판단)
    reasons.push('service_error', 'duplicate_payment', 'other');

    return reasons;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">환불 요청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">환불 가능 여부 확인 중...</span>
            </div>
          ) : error && !eligibility ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {/* 결제 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">결제 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 항목</span>
                    <span className="font-medium text-gray-900">{paymentTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 유형</span>
                    <span className="font-medium text-gray-900">
                      {paymentType === 'job_posting' ? '채용공고 등록' : '인재풀 열람'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-medium text-gray-900">
                      {paymentAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 환불 가능 여부 */}
              {eligibility && (
                <div className={`rounded-lg p-4 ${
                  eligibility.canRefund ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h3 className={`font-medium mb-2 ${
                    eligibility.canRefund ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {eligibility.canRefund ? '환불 가능' : '환불 제한'}
                  </h3>
                  <p className={`text-sm ${
                    eligibility.canRefund ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {eligibility.message}
                  </p>
                  {eligibility.canRefund && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">환불 예정 금액</span>
                        <span className="font-bold text-green-800">
                          {eligibility.refundAmount.toLocaleString()}원
                          <span className="text-xs ml-1">
                            ({Math.round(eligibility.refundRate * 100)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 환불 정책 안내 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">환불 정책 안내</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  {paymentType === 'job_posting' ? (
                    <>
                      <p>• {REFUND_POLICY.JOB_POSTING.BEFORE_PUBLISH.description}</p>
                      <p>• {REFUND_POLICY.JOB_POSTING.WITHIN_3_DAYS.description}</p>
                      <p>• {REFUND_POLICY.JOB_POSTING.AFTER_3_DAYS.description}</p>
                    </>
                  ) : (
                    <>
                      <p>• {REFUND_POLICY.PROFILE_VIEW.BEFORE_VIEW.description}</p>
                      <p>• {REFUND_POLICY.PROFILE_VIEW.AFTER_VIEW.description}</p>
                    </>
                  )}
                  <p className="pt-2 border-t border-blue-200">
                    • 환불 처리 기간: {REFUND_POLICY.PROCESSING_DAYS}
                  </p>
                </div>
              </div>

              {/* 환불 사유 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 사유 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(e.target.value as RefundReasonType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">환불 사유를 선택하세요</option>
                  {getAvailableReasons().map((reason) => (
                    <option key={reason} value={reason}>
                      {REFUND_REASON_LABELS[reason]}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상세 사유 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 사유 (선택)
                </label>
                <textarea
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="환불 요청 사유를 상세히 입력해주세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* 안내 문구 */}
              <div className="text-sm text-gray-500">
                <p>※ 환불 요청 후 관리자 검토를 거쳐 처리됩니다.</p>
                <p>※ 서비스 오류나 중복 결제의 경우 관리자가 확인 후 전액 환불 처리됩니다.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || submitting || !reasonType}
            className="px-6 py-2.5 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '요청 중...' : '환불 요청'}
          </button>
        </div>
      </div>
    </div>
  );

  // Portal로 body에 렌더링
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
