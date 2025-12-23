'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { DollarSign, FileText, Building2, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/config';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [sdkError, setSdkError] = useState<string>('');

  useEffect(() => {
    // 결제 정보 불러오기
    const fetchPaymentInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          alert('로그인이 필요합니다.');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/payment/prepare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ jobId })
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '결제 정보를 불러올 수 없습니다.');
          router.push(`/company-dashboard/jobs/edit/${jobId}`);
          return;
        }

        const data = await response.json();
        setPaymentInfo(data);
      } catch (error) {
        console.error('Payment info fetch error:', error);
        alert('결제 정보를 불러오는 중 오류가 발생했습니다.');
        router.push(`/company-dashboard`);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [jobId, router]);

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
        customData: paymentInfo.customData,
      });

      console.log('PortOne 응답:', response);

      // 결제 오류 처리
      if (response?.code) {
        alert(`결제 실패: ${response.message}`);
        setProcessing(false);
        return;
      }

      // 결제 완료 - 서버에서 검증
      const verifyResponse = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentInfo.paymentId, jobId })
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
      router.push(`/company-dashboard`);
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
              onClick={() => router.push('/company-dashboard')}
              className="text-primary-600 hover:text-primary-700"
            >
              대시보드로 돌아가기
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary-600 to-cyan-600 rounded-md p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8" />
            <h1 className="text-3xl font-bold">채용공고 결제</h1>
          </div>
          <p className="text-primary-100">채용공고 게시를 위한 결제를 진행합니다</p>
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* 결제 정보 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">주문 정보</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">상품명</p>
                <p className="font-medium text-gray-900">{paymentInfo.orderName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">결제 등급</p>
                <p className="font-medium text-gray-900">
                  {paymentInfo.customData.postingTier === 'standard' && '중상단 (일반)'}
                  {paymentInfo.customData.postingTier === 'top' && '최상단'}
                  {paymentInfo.customData.postingTier === 'premium' && '첫 페이지 최상단 (프리미엄)'}
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(paymentInfo.customData.postingPrice)}원</span>
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

          {/* 구매자 정보 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">구매자 정보</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">담당자명</p>
                <p className="font-medium text-gray-900">{paymentInfo.customer.fullName}</p>
              </div>

              {paymentInfo.customer.phoneNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">연락처</p>
                  <p className="font-medium text-gray-900">{paymentInfo.customer.phoneNumber}</p>
                </div>
              )}

              {paymentInfo.customer.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">이메일</p>
                  <p className="font-medium text-gray-900">{paymentInfo.customer.email}</p>
                </div>
              )}
            </div>

            {/* 안내 사항 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">결제 안내</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 결제 후 즉시 공고가 게시됩니다</li>
                    <li>• 관리자 승인 후 공개됩니다</li>
                    <li>• 영수증은 이메일로 발송됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="mt-8 flex gap-4">
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
