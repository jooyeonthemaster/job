// 채용공고 노출 위치 및 과금 섹션 컴포넌트

import { Check, TrendingUp, Star, Zap, CreditCard, Info } from 'lucide-react';
import { JobFormData, PostingTier } from '@/types/job-form.types';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT } from '@/constants/job-posting';

interface PostingTierSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function PostingTierSection({ formData, onUpdate }: PostingTierSectionProps) {
  const selectedPrice = POSTING_PRICES[formData.postingTier];
  const vatAmount = selectedPrice.price * VAT_RATE;
  const totalAmount = selectedPrice.price + vatAmount;

  return (
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
        {/* 중상단 (일반) */}
        <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
          formData.postingTier === 'standard'
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="postingTier"
            value="standard"
            checked={formData.postingTier === 'standard'}
            onChange={(e) => onUpdate('postingTier', e.target.value as PostingTier)}
            className="sr-only"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.postingTier === 'standard' ? 'border-primary-600' : 'border-gray-300'
              }`}>
                {formData.postingTier === 'standard' && (
                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">중상단 (일반)</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                1개월
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-8 mb-3">
              일반 채용공고 목록에 노출됩니다
            </p>
            <div className="flex items-baseline gap-2 ml-8">
              <span className="text-3xl font-bold text-primary-600">10만원</span>
              <span className="text-sm text-gray-500">(부가세 별도)</span>
            </div>
          </div>
          {formData.postingTier === 'standard' && (
            <div className="absolute top-5 right-5">
              <div className="p-1 bg-primary-600 rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </label>

        {/* 최상단 */}
        <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
          formData.postingTier === 'top'
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="postingTier"
            value="top"
            checked={formData.postingTier === 'top'}
            onChange={(e) => onUpdate('postingTier', e.target.value as PostingTier)}
            className="sr-only"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.postingTier === 'top' ? 'border-primary-600' : 'border-gray-300'
              }`}>
                {formData.postingTier === 'top' && (
                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">최상단</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                인기
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                1개월
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-8 mb-3">
              채용공고 목록 최상단에 고정 노출됩니다
            </p>
            <div className="flex items-baseline gap-2 ml-8">
              <span className="text-3xl font-bold text-primary-600">100만원</span>
              <span className="text-sm text-gray-500">(부가세 별도)</span>
            </div>
          </div>
          {formData.postingTier === 'top' && (
            <div className="absolute top-5 right-5">
              <div className="p-1 bg-primary-600 rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </label>

        {/* 첫 페이지 최상단 (프리미엄) */}
        <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
          formData.postingTier === 'premium'
            ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-pink-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-secondary-200 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="postingTier"
            value="premium"
            checked={formData.postingTier === 'premium'}
            onChange={(e) => onUpdate('postingTier', e.target.value as PostingTier)}
            className="sr-only"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.postingTier === 'premium' ? 'border-secondary-600' : 'border-gray-300'
              }`}>
                {formData.postingTier === 'premium' && (
                  <div className="w-3 h-3 rounded-full bg-secondary-600"></div>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">첫 페이지 최상단</span>
              <span className="px-3 py-1 bg-gradient-to-r from-secondary-500 to-pink-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                프리미엄
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                2개월
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-8 mb-3">
              메인 페이지 + 채용공고 목록 최상단에 고정 노출됩니다
            </p>
            <div className="flex items-baseline gap-2 ml-8">
              <span className="text-3xl font-bold text-secondary-600">130만원</span>
              <span className="text-sm text-gray-500">(부가세 별도)</span>
            </div>
          </div>
          {formData.postingTier === 'premium' && (
            <div className="absolute top-5 right-5">
              <div className="p-1 bg-secondary-600 rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </label>
      </div>

      {/* 비용 요약 */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">결제 정보</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">선택한 위치</span>
            <span className="font-medium text-gray-900">{selectedPrice.label}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">공고 비용</span>
            <span className="font-medium text-gray-900">
              {selectedPrice.price.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">부가세 (10%)</span>
            <span className="font-medium text-gray-900">
              {vatAmount.toLocaleString()}원
            </span>
          </div>
          <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">총 결제 금액</span>
            <span className="text-2xl font-bold text-primary-600">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 결제 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">결제 안내</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 공고 등록 후 담당자가 연락드립니다</li>
                <li>• 세금계산서 발행 후 결제를 진행합니다</li>
                <li>• 결제 확인 후 공고가 활성화됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 담당자 정보 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">결제 담당자</p>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>{BILLING_CONTACT.name}</span>
            <span className="text-gray-400">•</span>
            <span>{BILLING_CONTACT.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}






