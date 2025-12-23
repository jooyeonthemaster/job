'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { User, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/config';

export default function ProfilePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const talentId = params.talentId as string;

  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [sdkError, setSdkError] = useState<string>('');

  useEffect(() => {
    // 결제 정보 불러오기
    const fetchPaymentInfo = async () => {
      try {
        // 현재 사용자의 세션 토큰 가져오기
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert('로그인이 필요합니다.');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/payment/profile/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ talentId })
        });

        if (!response.ok) {
          const error = await response.json();

          // 이미 결제한 경우
          if (error.alreadyPaid) {
            alert('이미 열람 권한이 있는 프로필입니다.');
            router.push(`/talent/${talentId}`);
            return;
          }

          alert(error.error || '결제 정보를 불러올 수 없습니다.');
          router.push('/talent');
          return;
        }

        const data = await response.json();
        setPaymentInfo(data);
      } catch (error) {
        console.error('Payment info fetch error:', error);
        alert('결제 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/talent');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [talentId, router]);

  const handlePayment = async () => {
    if (!paymentInfo) return;

    setProcessing(true);
    setSdkError('');

    try {
      // 환경변수 확인
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        throw new Error('결제 설정이 올바르지 않습니다. 환경변수를 확인해주세요.');
      }

      console.log('PortOne 결제 시작:', {
        storeId,
        channelKey,
        paymentId: paymentInfo.paymentId,
        amount: paymentInfo.totalAmount
      });

      // PortOne SDK 동적 import
      const PortOne = await import('@portone/browser-sdk/v2');

      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: paymentInfo.paymentId,
        orderName: paymentInfo.orderName,
        totalAmount: paymentInfo.totalAmount,
        currency: paymentInfo.currency,
        payMethod: 'CARD', // 카드 결제
        customer: paymentInfo.customer,
        // customData 제거: 이니시스 V2는 merchantData 사용 오류 발생
        taxFreeAmount: paymentInfo.taxFreeAmount,
        vatAmount: paymentInfo.vatAmount,
      });

      console.log('PortOne 응답:', response);

      // 결제 오류 처리
      if (response?.code) {
        alert(`결제 실패: ${response.message}`);
        setProcessing(false);
        return;
      }

      // 결제 완료 - 서버에서 검증
      const verifyResponse = await fetch('/api/payment/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentInfo.paymentId,
          talentId: paymentInfo.customData.talentId,
          companyId: paymentInfo.customData.companyId
        })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        alert(`결제 검증 실패: ${error.error}`);
        setProcessing(false);
        return;
      }

      const verifyData = await verifyResponse.json();

      // 결제 성공
      alert('결제가 완료되었습니다!');
      router.push(`/talent/${talentId}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || '결제 중 오류가 발생했습니다';
      setSdkError(errorMessage);
      alert(`결제 오류: ${errorMessage}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">결제 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 정보를 찾을 수 없습니다</h1>
            <button
              onClick={() => router.push('/talent')}
              className="text-primary-600 hover:text-primary-700"
            >
              인재풀로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-600 to-cyan-600 rounded-md p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-8 h-8" />
            <h1 className="text-3xl font-bold">프로필 열람 결제</h1>
          </div>
          <p className="text-primary-100">구직자 프로필 상세 정보를 확인하기 위한 결제입니다</p>
        </div>

        {/* SDK 에러 메시지 */}
        {sdkError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-900">결제 오류</p>
                <p className="text-sm text-red-700 mt-1">{sdkError}</p>
                <p className="text-xs text-red-600 mt-2">브라우저 콘솔을 확인해주세요 (F12)</p>
              </div>
            </div>
          </div>
        )}

        {/* 결제 정보 */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">프로필 정보</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">구직자</p>
              <p className="font-medium text-gray-900">{paymentInfo.customData.talentName}</p>
              {paymentInfo.customData.talentHeadline && (
                <p className="text-sm text-gray-600 mt-1">{paymentInfo.customData.talentHeadline}</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">열람 금액</span>
                <span className="font-medium">{formatPrice(paymentInfo.taxFreeAmount)}원</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">부가세 (10%)</span>
                <span className="font-medium">{formatPrice(paymentInfo.vatAmount)}원</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-lg font-bold text-gray-900">총 결제 금액</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(paymentInfo.totalAmount)}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 rounded-md p-4 mb-6 border border-blue-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">결제 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 결제 후 즉시 프로필 상세 정보를 확인할 수 있습니다</li>
                <li>• 이메일 및 연락처를 포함한 모든 정보가 공개됩니다</li>
                <li>• 한 번 결제하면 언제든지 다시 확인 가능합니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 py-4 px-6 rounded-md border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            disabled={processing}
          >
            이전으로
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-primary-600 to-cyan-600 text-white py-4 px-6 rounded-md font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '결제 처리 중...' : `${formatPrice(paymentInfo.totalAmount)}원 결제하기`}
          </button>
        </div>

        {/* 결제 수단 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>한국결제네트웍스(KPN) 안전결제 시스템을 통해 결제됩니다</p>
          <p className="mt-1">신용카드 결제가 지원됩니다</p>
        </div>
      </div>
    </div>
  );
}
