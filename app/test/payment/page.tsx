'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CreditCard, TestTube, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentTestPage() {
  const [processing, setProcessing] = useState(false);
  const [sdkError, setSdkError] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  // 테스트용 더미 데이터 (1000원 테스트)
  const testPaymentInfo = {
    paymentId: `test_payment_${Date.now()}`,
    orderName: '프론트엔드 개발자 채용공고 (1000원 테스트)',
    totalAmount: 1000,
    taxFreeAmount: 0,
    vatAmount: 0,
    currency: 'KRW',
    customer: {
      fullName: '테스트 담당자',
      phoneNumber: '010-1234-5678',
      email: 'test@company.com'
    },
    customData: {
      jobId: 'test-job-id',
      companyId: 'test-company-id',
      postingTier: 'standard',
      postingPrice: 1000
    }
  };

  const handleTestPayment = async () => {
    setProcessing(true);
    setSdkError('');
    setTestResult('');

    try {
      // 환경변수 확인
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      console.log('=== 결제 테스트 시작 ===');
      console.log('환경변수 확인:', {
        storeId: storeId ? '✅ 설정됨' : '❌ 없음',
        channelKey: channelKey ? '✅ 설정됨' : '❌ 없음',
        storeIdValue: storeId,
        channelKeyValue: channelKey
      });

      console.log('⚠️ 중요: storeId는 "INIpayTest" 같은 이름이 아니라');
      console.log('⚠️ "store-xxxxxxxx-xxxx-xxxx" 형식의 UUID여야 합니다!');
      console.log('⚠️ PortOne 콘솔(https://admin.portone.io)에서 확인하세요');

      // storeId 형식 검증
      if (storeId && !storeId.startsWith('store-')) {
        console.warn('⚠️⚠️⚠️ storeId 형식이 올바르지 않습니다!');
        console.warn(`현재 값: "${storeId}"`);
        console.warn('예상 형식: "store-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"');
        setTestResult('⚠️ storeId 형식 오류: "store-"로 시작해야 합니다');
      }

      if (!storeId || !channelKey) {
        throw new Error('결제 설정이 올바르지 않습니다. 환경변수를 확인해주세요.');
      }

      console.log('PortOne SDK 로딩 중...');
      setTestResult('SDK 로딩 중...');

      // PortOne SDK 동적 import
      const PortOne = await import('@portone/browser-sdk/v2');
      console.log('✅ PortOne SDK 로드 완료:', PortOne);
      setTestResult('SDK 로드 완료! 결제창 호출 중...');

      console.log('결제 요청 데이터:', {
        storeId,
        channelKey,
        paymentId: testPaymentInfo.paymentId,
        orderName: testPaymentInfo.orderName,
        totalAmount: testPaymentInfo.totalAmount,
        currency: testPaymentInfo.currency,
        payMethod: 'CARD',
        customer: testPaymentInfo.customer,
        customData: testPaymentInfo.customData,
        taxFreeAmount: testPaymentInfo.taxFreeAmount,
        vatAmount: testPaymentInfo.vatAmount,
      });

      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: testPaymentInfo.paymentId,
        orderName: testPaymentInfo.orderName,
        totalAmount: testPaymentInfo.totalAmount,
        currency: 'KRW' as const,
        payMethod: 'CARD',
        customer: testPaymentInfo.customer,
        customData: testPaymentInfo.customData,
        taxFreeAmount: testPaymentInfo.taxFreeAmount,
        vatAmount: testPaymentInfo.vatAmount,
      });

      console.log('✅ PortOne 응답:', response);

      // 결제 오류 처리
      if (response?.code) {
        const errorMsg = `결제 실패: ${response.message} (코드: ${response.code})`;
        console.error('❌', errorMsg);
        setTestResult(errorMsg);
        setSdkError(errorMsg);
        alert(errorMsg);
        setProcessing(false);
        return;
      }

      // 결제 성공
      const successMsg = `✅ 결제창 호출 성공! (테스트 모드이므로 실제 결제는 진행되지 않습니다)`;
      console.log(successMsg);
      setTestResult(successMsg);
      alert(successMsg);
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      const errorMessage = error.message || '결제 중 오류가 발생했습니다';
      setSdkError(errorMessage);
      setTestResult(`에러: ${errorMessage}`);
      alert(`결제 오류: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-md p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="w-8 h-8" />
            <h1 className="text-3xl font-bold">결제 시스템 테스트</h1>
          </div>
          <p className="text-purple-100">PortOne 결제 SDK 동작을 테스트합니다 (실제 결제 없음)</p>
        </div>

        {/* 환경변수 상태 */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">환경변수 상태</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-sm">NEXT_PUBLIC_PORTONE_STORE_ID</span>
              {process.env.NEXT_PUBLIC_PORTONE_STORE_ID ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  설정됨: {process.env.NEXT_PUBLIC_PORTONE_STORE_ID}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  없음
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-sm">NEXT_PUBLIC_PORTONE_CHANNEL_KEY</span>
              {process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  설정됨: {process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY.substring(0, 20)}...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  없음
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 테스트 결과 */}
        {testResult && (
          <div className={`rounded-md p-4 mb-6 ${
            testResult.includes('에러') || testResult.includes('실패')
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-green-50 border-2 border-green-200'
          }`}>
            <p className={`font-medium ${
              testResult.includes('에러') || testResult.includes('실패')
                ? 'text-red-900'
                : 'text-green-900'
            }`}>
              {testResult}
            </p>
          </div>
        )}

        {/* SDK 에러 메시지 */}
        {sdkError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">결제 오류</p>
                <p className="text-sm text-red-700 mt-1">{sdkError}</p>
                <p className="text-xs text-red-600 mt-2">브라우저 콘솔을 확인해주세요 (F12)</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* 테스트 결제 정보 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">테스트 주문 정보</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">상품명</p>
                <p className="font-medium text-gray-900">{testPaymentInfo.orderName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">결제 등급</p>
                <p className="font-medium text-gray-900">중상단 (일반)</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(testPaymentInfo.customData.postingPrice)}원</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">부가세</span>
                  <span className="font-medium">{formatPrice(testPaymentInfo.vatAmount)}원</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-lg font-bold text-gray-900">총 결제 금액</span>
                  <span className="text-2xl font-bold text-purple-600">{formatPrice(testPaymentInfo.totalAmount)}원</span>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">💡 1,000원 테스트 모드 - 최소 결제 금액으로 테스트합니다</p>
                </div>
              </div>
            </div>
          </div>

          {/* 구매자 정보 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">테스트 구매자 정보</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">담당자명</p>
                <p className="font-medium text-gray-900">{testPaymentInfo.customer.fullName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">연락처</p>
                <p className="font-medium text-gray-900">{testPaymentInfo.customer.phoneNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">이메일</p>
                <p className="font-medium text-gray-900">{testPaymentInfo.customer.email}</p>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <TestTube className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-900">
                  <p className="font-medium mb-1">테스트 모드</p>
                  <ul className="space-y-1 text-purple-700">
                    <li>• 실제 결제는 진행되지 않습니다</li>
                    <li>• SDK 로딩과 결제창 호출만 테스트</li>
                    <li>• 콘솔에서 상세 로그 확인 가능</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테스트 버튼 */}
        <div className="mt-8">
          <button
            onClick={handleTestPayment}
            disabled={processing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-md font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                결제 처리 중...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                {formatPrice(testPaymentInfo.totalAmount)}원 결제 테스트하기
              </span>
            )}
          </button>
        </div>

        {/* 결제 수단 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>KG이니시스 테스트 환경 (최소 결제 금액: 1,000원)</p>
          <p className="mt-1">테스트용 카드번호를 사용해주세요</p>
        </div>

        {/* 디버깅 정보 */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">💡 디버깅 팁</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• F12를 눌러 브라우저 콘솔을 확인하세요</li>
            <li>• 콘솔에서 PortOne SDK 로딩 과정을 확인할 수 있습니다</li>
            <li>• 에러 발생 시 전체 에러 메시지가 콘솔에 출력됩니다</li>
            <li>• 경로: <code className="bg-white px-2 py-1 rounded">/test/payment</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
