'use client';

import { Gift, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  formData: {
    basicBenefits: string[];
  };
  onChange: (field: string, value: string[]) => void;
  errors: Record<string, string>;
}

// 자주 사용되는 복지 태그
const COMMON_BENEFITS = [
  '자율 출퇴근',
  '재택근무',
  '유연근무제',
  '식대 지원',
  '간식 제공',
  '야근 식대',
  '4대보험',
  '퇴직금',
  '연차',
  '반차',
  '경조사 휴가',
  '생일 휴가',
  '건강검진',
  '의료비 지원',
  '체력단련비',
  '헬스장',
  '교육비 지원',
  '도서 구입비',
  '자격증 취득 지원',
  '어학 교육',
  '사내 동호회',
  '워크숍',
  '야유회',
  '송년회',
  '명절 선물',
  '생일 선물',
  '경조사 지원',
  '출산 지원',
  '육아 휴직',
  '주차 지원',
  '통근 버스',
  '교통비 지원',
  '우수사원 포상',
  '성과급',
  '인센티브',
  '스톡옵션',
];

export default function Section4Benefits({ formData, onChange, errors }: Props) {
  const [customBenefit, setCustomBenefit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 복지 토글
  const toggleBenefit = (benefit: string) => {
    const current = formData.basicBenefits || [];
    if (current.includes(benefit)) {
      onChange('basicBenefits', current.filter((b) => b !== benefit));
    } else {
      onChange('basicBenefits', [...current, benefit]);
    }
  };

  // 커스텀 복지 추가
  const handleAddCustomBenefit = () => {
    const trimmed = customBenefit.trim();
    if (!trimmed) {
      alert('복지 내용을 입력해주세요.');
      return;
    }

    if (trimmed.length > 20) {
      alert('복지는 20자 이내로 입력해주세요.');
      return;
    }

    const current = formData.basicBenefits || [];
    if (current.includes(trimmed)) {
      alert('이미 추가된 복지입니다.');
      return;
    }

    onChange('basicBenefits', [...current, trimmed]);
    setCustomBenefit('');
    setShowCustomInput(false);
  };

  // 복지 삭제
  const removeBenefit = (benefit: string) => {
    const current = formData.basicBenefits || [];
    onChange('basicBenefits', current.filter((b) => b !== benefit));
  };

  const selectedCount = formData.basicBenefits?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">복지 정보</h3>
              <p className="text-sm text-gray-600">제공하는 복지를 선택해주세요 (선택사항)</p>
            </div>
            <div className="text-sm font-medium text-primary-600">
              선택됨: {selectedCount}개
            </div>
          </div>
        </div>
      </div>

      {errors.basicBenefits && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.basicBenefits}</p>
        </div>
      )}

      {/* 선택된 복지 (상단에 표시) */}
      {selectedCount > 0 && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-3">선택된 복지</p>
          <div className="flex flex-wrap gap-2">
            {formData.basicBenefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium"
              >
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(benefit)}
                  className="hover:bg-primary-700 rounded-full p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 자주 사용되는 복지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          자주 사용되는 복지 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_BENEFITS.map((benefit) => {
            const isSelected = formData.basicBenefits?.includes(benefit);
            return (
              <button
                key={benefit}
                type="button"
                onClick={() => toggleBenefit(benefit)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {benefit}
              </button>
            );
          })}
        </div>
      </div>

      {/* 직접 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          복지 직접 추가
        </label>

        {showCustomInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customBenefit}
              onChange={(e) => setCustomBenefit(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomBenefit();
                }
              }}
              placeholder="복지 내용 입력 (최대 20자)"
              maxLength={20}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomBenefit}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomBenefit('');
              }}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            복지 직접 추가하기
          </button>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 복지 정보는 선택사항입니다. 제공하는 복지를 입력하면 구직자들이 더 관심을 가질 수 있습니다.
        </p>
      </div>
    </div>
  );
}
