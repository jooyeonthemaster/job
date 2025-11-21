'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { updateJob } from '@/lib/supabase/job-service';
import { supabase } from '@/lib/supabase/config';
import JobMetadataForm from '@/components/job-create/metadata/JobMetadataForm';
import JobContentEditor from '@/components/job-create/editor/JobContentEditor';
import JobPreviewModal from '@/components/job-create/JobPreviewModal';
import {
  ChevronLeft,
  Save,
  Eye,
  Send,
  CreditCard,
  TrendingUp,
  Star,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT } from '@/constants/job-posting';
import { PostingTier } from '@/types/job-form.types';

export default function JobCreatePage() {
  const router = useRouter();
  const { formData, updateField, resetForm } = useJobForm();

  const [editorContent, setEditorContent] = useState<string>('');
  const { errors, isValid } = useJobFormValidation(formData, editorContent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'metadata' | 'content'>('metadata');
  const [showPreview, setShowPreview] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [stage, setStage] = useState<'payment' | 'form'>('payment');
  const [selectedTier, setSelectedTier] = useState<PostingTier>('standard');
  const [jobId, setJobId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const tierOrder: PostingTier[] = ['standard', 'top', 'premium']; // 'test' 제거 - 테스트 상품 숨김 처리

  const tierDetails: Record<PostingTier, { label: string; duration: string; description: string; badge?: '인기' | '프리미엄'; highlight?: string }> = {
    standard: {
      label: '중상단 (일반)',
      duration: '1개월',
      description: '일반 채용공고 목록에 노출됩니다'
    },
    top: {
      label: '최상단',
      duration: '1개월',
      description: '채용공고 목록 최상단에 고정 노출됩니다',
      badge: '인기'
    },
    premium: {
      label: '첫 페이지 최상단',
      duration: '2개월',
      description: '메인 페이지 + 채용공고 목록 최상단에 고정 노출됩니다',
      badge: '프리미엄'
    },
    test: {
      label: '테스트 상품',
      duration: '7일',
      description: '내부 QA/개발용 1,000원 상품입니다',
      badge: undefined
    }
  };

  const currentTierInfo = POSTING_PRICES[selectedTier];
  const vatAmount = currentTierInfo.vatIncluded
    ? 0
    : Math.floor(currentTierInfo.price * VAT_RATE);
  const totalAmount = currentTierInfo.vatIncluded
    ? currentTierInfo.price
    : currentTierInfo.price + vatAmount;

  const formatPrice = (value: number) => value.toLocaleString('ko-KR');
  const formatWonLabel = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toLocaleString('ko-KR')}만원`;
    }
    return `${price.toLocaleString('ko-KR')}원`;
  };

  // 기업 정보 로드
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: company } = await supabase
          .from('companies')
          .select('name, logo')
          .eq('id', user.id)
          .single();

        if (company) {
          setCompanyData(company);
        }
      } catch (error) {
        console.error('Failed to load company data:', error);
      }
    };
    loadCompanyData();
  }, []);

  const handleTierChange = (tier: PostingTier) => {
    setSelectedTier(tier);
    updateField('postingTier', tier);
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleStartPayment = async () => {
    if (paymentProcessing) return;

    setPaymentProcessing(true);
    setPaymentError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('로그인이 필요합니다.');
      }

      let currentJobId = jobId;

      if (!currentJobId) {
        const initiateResponse = await fetch('/api/jobs/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ postingTier: selectedTier })
        });

        if (!initiateResponse.ok) {
          const errorBody = await initiateResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || '공고 초기화에 실패했습니다.');
        }

        const initiateData = await initiateResponse.json();
        currentJobId = initiateData.jobId;
        setJobId(initiateData.jobId);
      }

      const prepareResponse = await fetch('/api/payment/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ jobId: currentJobId })
      });

      if (!prepareResponse.ok) {
        const errorBody = await prepareResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || '결제 정보를 불러올 수 없습니다.');
      }

      const paymentInfo = await prepareResponse.json();

      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        throw new Error('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.');
      }

      const PortOne = await import('@portone/browser-sdk/v2');

      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: paymentInfo.paymentId,
        orderName: paymentInfo.orderName,
        totalAmount: paymentInfo.totalAmount,
        currency: paymentInfo.currency,
        payMethod: 'CARD',
        customer: paymentInfo.customer,
        taxFreeAmount: paymentInfo.taxFreeAmount,
        vatAmount: paymentInfo.vatAmount,
        customData: paymentInfo.customData
      });

      if (response?.code) {
        throw new Error(response.message || '결제가 취소되었습니다.');
      }

      const verifyResponse = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentInfo.paymentId, jobId: currentJobId })
      });

      if (!verifyResponse.ok) {
        const errorBody = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || '결제 검증에 실패했습니다.');
      }

      setStage('form');
      setIsPaymentCompleted(true);
      setCurrentStep('metadata');
      resetForm();
      updateField('postingTier', selectedTier);
      setEditorContent('');
      setError('');

      alert('결제가 완료되었습니다. 채용공고를 작성해주세요.');
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setPaymentError(err.message || '결제 과정에서 오류가 발생했습니다.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!jobId) {
      setError('결제를 완료한 후 공고를 작성할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateJob(jobId, formData, editorContent);

      if (!result.success) {
        throw new Error(result.error);
      }

      await supabase
        .from('jobs')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      alert('임시저장이 완료되었습니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Save draft error:', err);
      setError(err.message || '임시저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError('필수 항목을 모두 입력해주세요.');
      setCurrentStep('metadata');
      return;
    }

    if (!editorContent.trim()) {
      setError('채용공고 상세 내용을 작성해주세요.');
      setCurrentStep('content');
      return;
    }

    if (!jobId) {
      setError('결제를 완료한 후 공고를 작성할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateJob(jobId, formData, editorContent);

      if (!result.success) {
        throw new Error(result.error);
      }

      const { error: statusError } = await supabase
        .from('jobs')
        .update({
          status: 'pending_approval',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (statusError) {
        throw new Error(statusError.message);
      }

      alert('채용공고가 등록되었습니다. 관리자 검수 후 노출됩니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || '채용공고 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <JobPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        editorContent={editorContent}
        companyName={companyData?.name}
        companyLogo={companyData?.logo}
      />

      <div className="min-h-screen bg-gray-50">
        {stage === 'payment' ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-xl p-6 shadow-lg border-2 border-primary-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">공고 노출 위치 선택</h2>
                  <p className="text-sm text-gray-600">공고의 노출 위치를 선택해주세요</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {tierOrder.map((tier) => {
                  const meta = tierDetails[tier];
                  const isSelected = selectedTier === tier;

                  return (
                    <label
                      key={tier}
                      className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        value={tier}
                        name="postingTier"
                        checked={isSelected}
                        onChange={() => handleTierChange(tier)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-3 h-3 rounded-full bg-primary-600"></div>}
                          </div>
                          <span className="text-lg font-bold text-gray-900">{meta.label}</span>
                          {meta.badge === '인기' && (
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              인기
                            </span>
                          )}
                          {meta.badge === '프리미엄' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-secondary-500 to-pink-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              프리미엄
                            </span>
                          )}
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            {meta.duration}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 ml-8 mb-3">{meta.description}</p>
                        <div className="flex items-baseline gap-2 ml-8">
                          <span
                            className={`text-3xl font-bold ${
                              tier === 'premium' ? 'text-secondary-600' : 'text-primary-600'
                            }`}
                          >
                            {formatWonLabel(POSTING_PRICES[tier].price)}
                          </span>
                          <span className="text-sm text-gray-500">(부가세 별도)</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-5 right-5">
                          <div className="p-1 bg-primary-600 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-gray-900">결제 정보</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">선택한 위치</span>
                      <span className="font-medium text-gray-900">{tierDetails[selectedTier].label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">공고 비용</span>
                      <span className="font-medium text-gray-900">{formatPrice(currentTierInfo.price)}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">부가세 (10%)</span>
                      <span className="font-medium text-gray-900">{formatPrice(vatAmount)}원</span>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">총 결제 금액</span>
                      <span className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)}원</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 text-sm text-blue-900">
                        <p className="font-medium">결제 안내</p>
                        <ul className="text-blue-700 space-y-1">
                          <li>• 공고 등록 후 담당자가 연락드립니다</li>
                          <li>• 세금계산서 발행 후 결제를 진행합니다</li>
                          <li>• 결제 확인 후 공고가 활성화됩니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">결제 담당자</p>
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      <span>{BILLING_CONTACT.name}</span>
                      <span className="text-gray-400">•</span>
                      <span>{BILLING_CONTACT.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-full p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                    <h4 className="text-base font-bold text-gray-900 mb-3">결제 전 꼭 확인하세요</h4>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                      <li>결제가 완료되면 즉시 공고 작성이 가능합니다.</li>
                      <li>작성 중 언제든 임시저장을 통해 안전하게 보관됩니다.</li>
                      <li>관리자 검수 후 노출 위치가 확정됩니다.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {paymentError}
                </div>
              )}

              <button
                onClick={handleStartPayment}
                disabled={paymentProcessing}
                className="w-full mt-6 py-4 px-6 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {paymentProcessing ? '결제 요청 중...' : `${formatPrice(totalAmount)}원 결제하기`}
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                PortOne 안전결제 시스템을 통해 신용카드 결제가 진행됩니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => router.back()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">채용공고 작성</h1>
                      <p className="text-sm text-gray-600 mt-1">
                        결제 완료된 공고 정보를 입력하세요
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      임시저장
                    </button>
                    <button
                      onClick={handlePreview}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      미리보기
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? (
                        <>처리중...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 inline mr-2" />
                          등록하기
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isPaymentCompleted && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm text-green-900">
                    <span>선택한 상품: <strong>{tierDetails[selectedTier].label}</strong></span>
                    <span>총 결제 금액: <strong>{formatPrice(totalAmount)}원</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 border-b border-gray-200">
                  <button
                    onClick={() => setCurrentStep('metadata')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                      currentStep === 'metadata'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    1. 정형 정보 입력
                    {errors.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentStep('content')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                      currentStep === 'content'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    2. 상세 내용 작성
                    {!editorContent.trim() && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                  {errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {errors.map((err, idx) => (
                        <li key={idx} className="text-sm text-red-600">• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {currentStep === 'metadata' ? (
                <JobMetadataForm
                  formData={formData}
                  onUpdate={updateField}
                  showPostingTier={false}
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-secondary-50 to-pink-50 rounded-xl p-6 border-2 border-secondary-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">상세 내용 작성</h2>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      블로그 에디터처럼 자유롭게 작성하세요. 텍스트, 이미지, 표 등을 활용할 수 있습니다.
                    </p>
                  </div>

                  <JobContentEditor
                    content={editorContent}
                    onChange={handleEditorChange}
                    placeholder="채용공고 상세 내용을 작성하세요. 주요 업무, 자격 요건, 복지 혜택 등을 자유롭게 작성할 수 있습니다..."
                  />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                {currentStep === 'content' && (
                  <button
                    onClick={() => setCurrentStep('metadata')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ChevronLeft className="w-4 h-4 inline mr-2" />
                    이전 단계
                  </button>
                )}
                {currentStep === 'metadata' && <div></div>}
                <button
                  onClick={() => {
                    if (currentStep === 'metadata') {
                      setCurrentStep('content');
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-auto"
                >
                  {currentStep === 'metadata' ? (
                    <>
                      다음 단계
                      <ChevronLeft className="w-4 h-4 inline ml-2 rotate-180" />
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      등록하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
